"use client";

import { useRef, useState } from "react";
import { upload, ImageKitAbortError } from "@imagekit/next";
import type { UploadAuthParams, UploadedImage } from "@/lib/storage/media";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/storage/media";

type Props = {
  folderId: string;
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
};

export function ImageUploadField({ folderId, value, onChange }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value?.url ?? null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setError("Only JPEG, PNG and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Image must be smaller than 10 MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);
    try {
      const res = await fetch(`/api/upload-auth?folderId=${encodeURIComponent(folderId)}`);
      if (!res.ok) throw new Error("Could not create upload session");
      const { data } = (await res.json()) as { data: UploadAuthParams };

      abortRef.current = new AbortController();
      const result = await upload({
        file,
        fileName: file.name,
        token: data.token,
        expire: data.expire,
        signature: data.signature,
        publicKey: data.publicKey,
        folder: data.folder,
        useUniqueFileName: true,
        abortSignal: abortRef.current.signal,
        onProgress: (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });

      onChange({
        url: result.url ?? "",
        key: result.filePath ?? "",
        width: result.metadata?.width,
        height: result.metadata?.height,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      setProgress(null);
    } catch (err) {
      if (err instanceof ImageKitAbortError) {
        setError("Upload cancelled.");
      } else {
        setError("Upload failed. Please try again.");
      }
      setProgress(null);
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Product preview" className="h-40 w-40 rounded-md object-cover" />
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          onClick={() => cameraInputRef.current?.click()}
        >
          Take photo
        </button>
        <button
          type="button"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          onClick={() => galleryInputRef.current?.click()}
        >
          Choose from gallery
        </button>
        {uploading && (
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            onClick={() => abortRef.current?.abort()}
          >
            Cancel
          </button>
        )}
        {value && !uploading && (
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            onClick={() => {
              onChange(null);
              setPreviewUrl(null);
            }}
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {progress !== null && (
        <p className="text-sm text-neutral-500">Uploading… {progress}%</p>
      )}
      {error && (
        <p className="text-sm text-red-600">
          {error}{" "}
          <button type="button" className="underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}
    </div>
  );
}
