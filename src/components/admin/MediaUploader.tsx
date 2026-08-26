"use client";

import { useRef, useState } from "react";
import { FileText, LoaderCircle, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { formatTypography } from "@/utils/typography";

type SignResponse = {
  cacheControl?: string;
  contentType?: string;
  error?: string;
  publicUrl?: string;
  uploadUrl?: string;
};

export type BatchMediaItem = {
  mediaType: "image" | "video";
  name: string;
  url: string;
};

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (progress: number) => void,
  cacheControl?: string,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);
    if (cacheControl) request.setRequestHeader("Cache-Control", cacheControl);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("Cloudflare R2 отклонил прямой файл."));
    });
    request.addEventListener("error", () => reject(new Error("CORS / Сетевая ошибка Cloudflare R2.")));
    request.send(file);
  });
}

function uploadViaProxyWithProgress(
  file: File,
  folder: string,
  caseSlug: string | undefined,
  onProgress: (progress: number) => void,
): Promise<{ contentType: string; publicUrl: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (caseSlug) formData.append("caseSlug", caseSlug);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/media/upload");
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        try {
          const response = JSON.parse(request.responseText);
          if (response.publicUrl) resolve(response);
          else reject(new Error(response.error || "Не удалось сохранить файл."));
        } catch {
          reject(new Error("Некорректный ответ сервера."));
        }
      } else {
        try {
          const response = JSON.parse(request.responseText);
          reject(new Error(response.error || `Ошибка сервера ${request.status}.`));
        } catch {
          reject(new Error(`Ошибка сервера ${request.status}.`));
        }
      }
    });
    request.addEventListener("error", () => reject(new Error("Ошибка сети при загрузке.")));
    request.send(formData);
  });
}

function looksLikeVideo(url: string, mediaType?: string) {
  return mediaType === "video" || /\.(mp4|mov|m4v|webm)(?:\?|$)/i.test(url);
}

function looksLikePdf(url: string) {
  return /\.pdf(?:\?|$)/i.test(url);
}

export default function MediaUploader({
  accept = "image/*,video/*,application/pdf,.pdf",
  caseSlug,
  folder = "pages",
  mediaType,
  multiple = false,
  onBatchChange,
  onChange,
  value,
}: {
  accept?: string;
  caseSlug?: string;
  folder?: "pages" | "cases";
  mediaType?: string;
  multiple?: boolean;
  onBatchChange?: (items: BatchMediaItem[]) => void;
  onChange: (url: string, mediaType: "image" | "video") => void;
  value: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [batchStatus, setBatchStatus] = useState<{ current: number; total: number; name: string } | null>(null);
  const [error, setError] = useState("");

  async function uploadSingleFile(file: File, updateProgress: (pct: number) => void): Promise<BatchMediaItem> {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && file.type !== "application/pdf") {
      throw new Error(`Файл "${file.name}" имеет недопустимый тип. Разрешены фото, видео и PDF.`);
    }
    if (file.size > 500 * 1024 * 1024) {
      throw new Error(`Файл "${file.name}" превышает лимит 500 МБ.`);
    }

    const type: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";

    if (file.type.startsWith("image/")) {
      const proxyResult = await uploadViaProxyWithProgress(file, folder, caseSlug, updateProgress);
      return { mediaType: type, name: file.name, url: proxyResult.publicUrl };
    }

    try {
      const response = await fetch("/api/admin/media/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size, folder, caseSlug }),
      });
      const signed = (await response.json()) as SignResponse;
      if (response.ok && signed.uploadUrl && signed.publicUrl) {
        await uploadWithProgress(signed.uploadUrl, file, updateProgress, signed.cacheControl);
        return { url: signed.publicUrl, mediaType: type, name: file.name };
      }
    } catch {
      // Fallback to proxy
    }

    const uploaded = await uploadViaProxyWithProgress(file, folder, caseSlug, updateProgress);
    return { url: uploaded.publicUrl, mediaType: type, name: file.name };
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setError("");

    if (fileArray.length === 1) {
      const file = fileArray[0];
      setProgress(0);
      try {
        const result = await uploadSingleFile(file, setProgress);
        onChange(result.url, result.mediaType);
      } catch (uploadErr) {
        setError(uploadErr instanceof Error ? uploadErr.message : "Ошибка загрузки файла.");
      } finally {
        setProgress(null);
      }
      return;
    }

    const total = fileArray.length;
    const uploadedItems: BatchMediaItem[] = [];

    setProgress(0);
    for (let i = 0; i < total; i++) {
      const file = fileArray[i];
      setBatchStatus({ current: i + 1, total, name: file.name });
      try {
        const item = await uploadSingleFile(file, (filePct) => {
          const overallPct = Math.round(((i + filePct / 100) / total) * 100);
          setProgress(overallPct);
        });
        uploadedItems.push(item);
      } catch (fileErr) {
        setError(fileErr instanceof Error ? fileErr.message : `Ошибка при загрузке ${file.name}`);
      }
    }

    setProgress(null);
    setBatchStatus(null);

    if (uploadedItems.length > 0) {
      if (onBatchChange) {
        onBatchChange(uploadedItems);
      } else {
        const last = uploadedItems[uploadedItems.length - 1];
        onChange(last.url, last.mediaType);
      }
    }
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          void handleFiles(event.dataTransfer.files);
        }
      }}
      className={`relative rounded-xl border-2 transition-all overflow-hidden ${
        dragging
          ? "border-orange-500 bg-orange-50/50"
          : "border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60"
      }`}
    >
      {value ? (
        <div className="relative group bg-white">
          {/* Превью медиа */}
          <div className="relative bg-slate-100 flex items-center justify-center min-h-[160px] max-h-[300px] overflow-hidden">
            {looksLikePdf(value) ? (
              <div className="flex flex-col items-center justify-center p-6 text-slate-800">
                <FileText className="size-10 text-orange-600 mb-2" />
                <span className="text-xs font-semibold truncate max-w-full font-mono">
                  {decodeURIComponent(value.split("/").pop() || "Документ PDF")}
                </span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-slate-900 underline mt-1.5"
                >
                  Открыть PDF
                </a>
              </div>
            ) : looksLikeVideo(value, mediaType) ? (
              <video src={value} controls playsInline preload="metadata" className="max-h-[300px] w-full object-contain" />
            ) : (
              <img src={value} alt="Превью" className="max-h-[300px] w-full object-contain" />
            )}

            {/* Оверлей загрузки */}
            {progress !== null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 text-slate-800 p-4">
                <LoaderCircle className="size-8 animate-spin text-orange-600 mb-2" aria-hidden="true" />
                <span className="text-xs font-semibold">
                  {batchStatus
                    ? `Загрузка: ${batchStatus.current}/${batchStatus.total} (${progress}%)`
                    : `Загрузка… ${progress}%`}
                </span>
              </div>
            )}
          </div>

          {/* Плавающий тулбар действий над превью */}
          <div className="flex items-center justify-between p-2.5 bg-white border-t border-slate-200">
            <span className="text-[11px] font-mono text-slate-600 truncate max-w-[60%]">
              {decodeURIComponent(value.split("/").pop() || value)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="peak-admin__button peak-admin__button--outline !h-7 !text-xs !px-2.5"
                title="Заменить файл"
              >
                <RefreshCw className="size-3" />
                <span>Заменить</span>
              </button>
              <button
                type="button"
                onClick={() => onChange("", "image")}
                className="peak-admin__button peak-admin__button--danger !h-7 !text-xs !px-2.5"
                title="Удалить файл"
              >
                <Trash2 className="size-3" />
                <span>Удалить</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Дропзона — Light */
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 sm:p-10 cursor-pointer text-center group"
        >
          <div className="flex items-center justify-center size-12 rounded-2xl bg-white border border-slate-200 text-slate-500 group-hover:text-orange-600 group-hover:border-orange-300 transition-all mb-3 shadow-xs">
            {progress !== null ? (
              <LoaderCircle className="size-6 animate-spin text-orange-600" />
            ) : (
              <UploadCloud className="size-6" />
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 block">
              {progress !== null
                ? `Загрузка… ${progress}%`
                : "Нажмите для выбора или перетащите файл сюда"}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {formatTypography(
                multiple
                  ? "WebP, JPG, PNG, MP4 или PDF · До 500 МБ"
                  : "WebP (рекомендуется), JPG, PNG, MP4, PDF до 500 МБ",
              )}
            </span>
          </div>
        </div>
      )}

      {/* Скрытый инпут */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            void handleFiles(event.target.files);
            event.target.value = "";
          }
        }}
      />

      {error && (
        <div className="p-2.5 text-xs text-red-600 bg-red-50 border-t border-red-200">
          {formatTypography(error)}
        </div>
      )}
    </div>
  );
}
