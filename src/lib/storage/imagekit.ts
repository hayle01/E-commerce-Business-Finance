import crypto from "node:crypto";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MediaStorage,
  ImageUploadMeta,
  UploadAuthParams,
} from "./media";

const urlEndpoint = () => process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";
const publicKey = () => process.env.IMAGEKIT_PUBLIC_KEY ?? "";
const privateKey = () => process.env.IMAGEKIT_PRIVATE_KEY ?? "";

export const imagekitStorage: MediaStorage = {
  validateUpload(file: ImageUploadMeta) {
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return { ok: false, error: "Only JPEG, PNG and WebP images are allowed." };
    }
    if (file.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return { ok: false, error: "Image must be smaller than 10 MB." };
    }
    if (
      (file.width && file.width > 8000) ||
      (file.height && file.height > 8000)
    ) {
      return { ok: false, error: "Image dimensions are too large." };
    }
    return { ok: true };
  },

  getUploadAuth(folder: string): UploadAuthParams {
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 30 * 60;
    const signature = crypto
      .createHmac("sha1", privateKey())
      .update(`${token}${expire}`)
      .digest("hex");
    return { token, expire, signature, publicKey: publicKey(), folder };
  },

  async deleteAsset(fileId: string) {
    // Best-effort cleanup of the previous asset on replacement/deletion.
    const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey()}:`).toString("base64")}`,
      },
    });
    if (!res.ok && res.status !== 404) {
      console.error(`ImageKit asset deletion failed with status ${res.status}`);
    }
  },

  getDeliveryUrl(key: string) {
    return `${urlEndpoint().replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
  },

  buildTransformedUrl(url: string, { width, height }) {
    const transforms: string[] = [];
    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (transforms.length === 0) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tr=${transforms.join(",")}`;
  },
};
