import { API_URL } from "./api";
import { ScannedResult } from "../types";

const MAX_DIMENSION = 1568;
const JPEG_QUALITY = 0.8;

const resizeImage = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = image;
      const scale = Math.min(
        1,
        MAX_DIMENSION / Math.max(width, height)
      );
      if (scale >= 1) {
        resolve(file);
        return;
      }

      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(file);
        return;
      }
      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const resized = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(resized);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    image.src = url;
  });

interface ExtractOptions {
  existingCategoryNames?: string[];
}

const extractTransactionsFromImage = async (
  userId: string,
  file: File,
  token: string | null,
  options: ExtractOptions = {}
): Promise<{ result: ScannedResult | null; error: string | null }> => {
  let upload = file;
  try {
    upload = await resizeImage(file);
  } catch {
    upload = file;
  }

  const formData = new FormData();
  formData.append("image", upload);
  if (options.existingCategoryNames?.length) {
    formData.append(
      "existingCategories",
      JSON.stringify(options.existingCategoryNames)
    );
  }

  try {
    const response = await fetch(`${API_URL}/transactions/scan/${userId}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { result: null, error: data?.error || `Scan failed (status ${response.status})` };
    }

const transactions: unknown[] = Array.isArray(data?.transactions)
      ? data.transactions
      : [];
    const sanitized: ScannedResult = {
      date: typeof data?.date === "string" ? data.date : null,
      transactions: transactions
        .filter(
          (t): t is Record<string, unknown> =>
            t !== null && typeof t === "object"
        )
        .map((t) => ({
          date: typeof t.date === "string" ? t.date : undefined,
          amount: typeof t.amount === "number" ? t.amount : Number(t.amount) || 0,
          description:
            typeof t.description === "string" ? t.description : "",
          categoryName:
            typeof t.categoryName === "string" ? t.categoryName : "Uncategorized",
          categoryType:
            t.categoryType === "Income" || t.categoryType === "Expense"
              ? t.categoryType
              : "Expense",
          color: typeof t.color === "string" ? t.color : "#5b8cff",
        })),
    };

    return { result: sanitized, error: null };
  } catch (err) {
    return {
      result: null,
      error: err instanceof Error ? err.message : "Network error during scan.",
    };
  }
};

const normalizeRowsForBulk = (
  rows: Array<{
    date: string;
    amount: number;
    description: string;
    categoryId: string | null;
    categoryName: string;
    categoryType: "Income" | "Expense";
    color: string;
  }>
) => {
  const categories: Array<{
    _id?: string;
    name: string;
    type: string;
    color: string;
  }> = [];
  const newCategoryByName: { [name: string]: string } = {};
  const transactions: Array<{
    date: Date;
    amount: number;
    description: string;
    category: string;
  }> = [];

  for (const row of rows) {
    const [y, m, d] = row.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    let category = row.categoryId;
    const trimmedName = row.categoryName.trim();
    if (!category && trimmedName) {
      const key = trimmedName.toLowerCase();
      if (!newCategoryByName[key]) {
        newCategoryByName[key] = trimmedName;
        categories.push({
          name: trimmedName,
          type: row.categoryType,
          color: row.color || "#5b8cff",
        });
      }
      category = newCategoryByName[key];
    }

    if (!category) continue;

    transactions.push({
      date,
      amount: row.amount,
      description: row.description,
      category,
    });
  }

  return { categories, transactions };
};

export {
  resizeImage,
  extractTransactionsFromImage,
  normalizeRowsForBulk,
};