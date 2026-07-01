/// <reference types="vite/client" />

declare module "heic-decode" {
  interface HeicDecodedImage {
    width: number;
    height: number;
    data: Uint8Array;
  }
  function decodeHeicImage(options: {
    buffer: ArrayBuffer;
  }): Promise<HeicDecodedImage>;
  export default decodeHeicImage;
}
