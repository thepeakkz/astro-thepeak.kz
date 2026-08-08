"use client";

import { useRef, useState } from "react";
import { FileText, FileVideo, ImageIcon, LoaderCircle, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { formatTypography } from "@/utils/typography";

type SignResponse = {
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

function uploadWithProgress(url: string, file: File, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);
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

    // 1. Прямой presigned URL
    try {
      const response = await fetch("/api/admin/media/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size, folder, caseSlug }),
      });
      const signed = (await response.json()) as SignResponse;
      if (response.ok && signed.uploadUrl && signed.publicUrl) {
        await uploadWithProgress(signed.uploadUrl, file, updateProgress);
        return { url: signed.publicUrl, mediaType: type, name: file.name };
      }
    } catch {
      // Игнорируем CORS и идем в прокси
    }

    // 2. Серверный прокси аплоад
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

    // Пакетная загрузка нескольких файлов
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
      className={`peak-admin__uploader ${dragging ? "peak-admin__uploader--dragging" : ""}`}
    >
      {value ? (
        <div>
          <div className="peak-admin__media-preview">
            {looksLikePdf(value) ? (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white min-h-[140px]">
                <FileText className="size-10 text-[#FD4B32] mb-2" />
                <span className="text-xs font-semibold truncate max-w-full">
                  {decodeURIComponent(value.split("/").pop() || "Документ PDF")}
                </span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white underline mt-1"
                >
                  Открыть документ
                </a>
              </div>
            ) : looksLikeVideo(value, mediaType) ? (
              <video src={value} controls playsInline preload="metadata" />
            ) : (
              <img src={value} alt="Превью загруженного файла" />
            )}
            {progress !== null && (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/75 text-center text-white p-4">
                <span>
                  <LoaderCircle className="mx-auto size-8 animate-spin text-[#FD4B32]" aria-hidden="true" />
                  {batchStatus ? (
                    <span className="mt-3 block text-sm font-semibold">
                      Пакетная загрузка: файл {batchStatus.current} из {batchStatus.total} ({batchStatus.name})… {progress}%
                    </span>
                  ) : (
                    <span className="mt-3 block text-sm font-semibold">Загружаем файл… {progress}%</span>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={progress !== null}
              className="peak-admin__button peak-admin__button--dark flex-1"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Заменить файл
            </button>
            <button
              type="button"
              onClick={() => onChange("", "image")}
              disabled={progress !== null}
              className="peak-admin__button peak-admin__button--outline"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Убрать
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="peak-admin__drop-zone"
        >
          {progress !== null ? (
            <span>
              <LoaderCircle className="mx-auto size-8 animate-spin text-[#FD4B32]" aria-hidden="true" />
              {batchStatus ? (
                <>
                  <span className="peak-admin__block-title mt-3 block">
                    Пакетная загрузка ({batchStatus.current} из {batchStatus.total})
                  </span>
                  <span className="text-xs text-slate-500 truncate max-w-xs block mt-1">
                    {batchStatus.name}
                  </span>
                </>
              ) : (
                <span className="peak-admin__block-title mt-3 block">Загружаем… {progress}%</span>
              )}
              <span className="mt-3 block h-2 w-56 mx-auto overflow-hidden rounded-full bg-slate-200">
                <span className="block h-full bg-[#FD4B32] transition-[width] duration-200" style={{ width: `${progress}%` }} />
              </span>
            </span>
          ) : (
            <span>
              <UploadCloud className="mx-auto size-8 text-slate-400" aria-hidden="true" />
              <span className="peak-admin__block-title mt-3 block">
                {multiple ? "Перетащите файлы сюда (пакетная загрузка)" : "Перетащите файл сюда"}
              </span>
              <span className="peak-admin__section-description block">или нажмите, чтобы выбрать файл</span>
              <span className="mt-3 inline-flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1"><ImageIcon className="size-3.5" /> Фото</span>
                <span className="inline-flex items-center gap-1"><FileVideo className="size-3.5" /> Видео</span>
                <span className="inline-flex items-center gap-1"><FileText className="size-3.5" /> PDF</span>
              </span>
            </span>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            void handleFiles(event.target.files);
          }
          event.currentTarget.value = "";
        }}
      />
      {error && <p role="alert" className="peak-admin__notice peak-admin__notice--error">{formatTypography(error)}</p>}
    </div>
  );
}
