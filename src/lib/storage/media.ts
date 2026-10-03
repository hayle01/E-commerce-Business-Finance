export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export type ImageUploadMeta = {
  sizeBytes: number;
  type: string;
  width?: number;
  height?: number;
};

export type UploadedImage = {
  url: string;
  key: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
};

export type UploadAuthParams = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  folder: string;
};

export interface MediaStorage {
  validateUpload(file: ImageUploadMeta): { ok: true } | { ok: false; error: string };
  getUploadAuth(folder: string): UploadAuthParams;
  deleteAsset(fileId: string): Promise<void>;
  getDeliveryUrl(key: string): string;
  buildTransformedUrl(url: string, options: { width?: number; height?: number }): string;
}
