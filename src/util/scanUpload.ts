export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_MAX_BYTES = 10 * 1024 * 1024;
export const MIN_LONG_EDGE = 200;
export const MAX_ASPECT = 6;

export type ScanValidationError =
  | "empty"
  | "type"
  | "size"
  | "heic"
  | "pdf"
  | "dimensions";

export interface ScanValidationFailure {
  ok: false;
  reason: ScanValidationError;
  message: string;
}

export interface ScanValidationSuccess {
  ok: true;
  file: File;
  warnings: string[];
}

export type ScanValidationResult = ScanValidationSuccess | ScanValidationFailure;

const HEIC_EXT = /\.(heic|heif)$/i;
const HEIC_MIME = new Set(["image/heic", "image/heif"]);

const isHeic = (file: File): boolean =>
  HEIC_MIME.has(file.type) || HEIC_EXT.test(file.name);

const isPdf = (file: File): boolean =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };
    img.src = url;
  });

let heicDecoderPromise: Promise<typeof import("heic-decode")> | null = null;

const loadHeicDecoder = () => {
  if (!heicDecoderPromise) {
    heicDecoderPromise = import("heic-decode");
  }
  return heicDecoderPromise;
};

const decodeHeicToJpeg = async (file: File): Promise<File> => {
  const { default: decodeHeic } = await loadHeicDecoder();
  const buffer = await file.arrayBuffer();
  const result = await decodeHeic({ buffer });
  const { width, height, data } = result;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available to decode HEIC.");
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(data);
  ctx.putImageData(imageData, 0, 0);
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("HEIC encode failed."))),
      "image/jpeg",
      0.85
    );
  });
  const name = file.name.replace(HEIC_EXT, ".jpg") || "receipt.jpg";
  return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
};

const validateAfterDecode = async (
  file: File
): Promise<ScanValidationResult> => {
  if (!file) {
    return { ok: false, reason: "empty", message: "No file provided." };
  }
  if (isPdf(file)) {
    return {
      ok: false,
      reason: "pdf",
      message: "PDFs aren't supported yet. Convert to an image first.",
    };
  }
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      reason: "type",
      message: "Use a JPEG, PNG, or WebP image.",
    };
  }
  if (file.size > ALLOWED_MAX_BYTES) {
    return {
      ok: false,
      reason: "size",
      message: "Image is over 10 MB. Try a smaller photo.",
    };
  }
  try {
    const { width, height } = await loadImageDimensions(file);
    const longEdge = Math.max(width, height);
    const shortEdge = Math.min(width, height);
    const warnings: string[] = [];
    if (longEdge < MIN_LONG_EDGE) {
      return {
        ok: false,
        reason: "dimensions",
        message: "Image is too small to read. Try a higher resolution photo.",
      };
    }
    const aspect = longEdge / shortEdge;
    if (aspect > MAX_ASPECT) {
      warnings.push(
        "This image is very long and thin. Receipts are usually wider than tall — try recropping."
      );
    }
    return { ok: true, file, warnings };
  } catch {
    return {
      ok: false,
      reason: "dimensions",
      message: "Could not read this image. Try a different file.",
    };
  }
};

export const prepareScanFile = async (
  file: File
): Promise<ScanValidationResult> => {
  if (!file) {
    return { ok: false, reason: "empty", message: "No file provided." };
  }
  if (isPdf(file)) {
    return {
      ok: false,
      reason: "pdf",
      message: "PDFs aren't supported yet. Convert to an image first.",
    };
  }
  if (isHeic(file)) {
    try {
      const decoded = await decodeHeicToJpeg(file);
      return validateAfterDecode(decoded);
    } catch (err) {
      console.error("HEIC decode failed:", err);
      return {
        ok: false,
        reason: "heic",
        message:
          "Couldn't decode this HEIC photo. Try changing Settings → Camera → Most Compatible on your iPhone, or upload a JPEG.",
      };
    }
  }
  return validateAfterDecode(file);
};
