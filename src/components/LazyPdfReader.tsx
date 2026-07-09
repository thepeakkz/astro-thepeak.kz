"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatTypography } from "@/utils/typography";

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (context: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<void> };
  }>;
  destroy?: () => Promise<void>;
};

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (url: string) => { promise: Promise<PdfDocument> };
};

declare global {
  interface Window {
    pdfjsLib?: PdfJs;
  }
}

function PdfPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "350px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "4px",
        background: "rgba(255, 255, 255, 0.02)",
        color: "rgba(255, 255, 255, 0.4)",
      }}
    >
      <Loader2 className="animate-spin text-[#FD4B32]" size={32} style={{ marginBottom: "12px" }} />
      <span
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {formatTypography(label)}
      </span>
    </div>
  );
}

function PdfReader({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let active = true;
    let loadedPdf: PdfDocument | null = null;

    const loadPdf = async () => {
      try {
        if (!window.pdfjsLib) {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.async = true;
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) throw new Error("pdfjsLib is not defined");

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        loadedPdf = await pdfjsLib.getDocument(url).promise;
        if (active) {
          setPdf(loadedPdf);
          setNumPages(loadedPdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Не удалось загрузить PDF-файл. Пожалуйста, обновите страницу.");
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
      loadedPdf?.destroy?.().catch(() => {});
    };
  }, [url]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;
    let resizeTimeoutId: ReturnType<typeof setTimeout>;

    const renderPage = async () => {
      if (!canvasRef.current || cancelled) return;

      try {
        const page = await pdf.getPage(pageNum);
        if (!canvasRef.current || cancelled) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const containerWidth = containerRef.current?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        const dpr = window.devicePixelRatio || 1;

        canvas.width = scaledViewport.width * dpr;
        canvas.height = scaledViewport.height * dpr;
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

        context.resetTransform();
        context.scale(dpr, dpr);

        await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(renderPage, 100);
    };

    renderPage();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeoutId);
    };
  }, [pdf, pageNum]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setPageNum((prev) => Math.max(prev - 1, 1));
      } else if (event.key === "ArrowRight") {
        setPageNum((prev) => Math.min(prev + 1, numPages || 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages]);

  if (loading) return <PdfPlaceholder label="Загрузка брендбука..." />;

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "350px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "4px",
          background: "rgba(255, 255, 255, 0.02)",
          color: "#FD4B32",
          fontSize: "13px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "4px",
          overflow: "hidden",
          backgroundColor: "#161b1e",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {pageNum > 1 && (
          <button
            onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
            className="pdf-reader-arrow"
            style={{ left: "16px", opacity: isHovered ? 1 : 0 }}
            aria-label="Предыдущая страница брендбука"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {pageNum < numPages && (
          <button
            onClick={() => setPageNum((prev) => Math.min(prev + 1, numPages || 1))}
            className="pdf-reader-arrow"
            style={{ right: "16px", opacity: isHovered ? 1 : 0 }}
            aria-label="Следующая страница брендбука"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "16px",
          padding: "0 4px",
        }}
      >
        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255, 255, 255, 0.5)" }}>
          {pageNum} / {numPages}
        </span>
      </div>
    </div>
  );
}

export default function LazyPdfReader({ url }: { url: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={rootRef}>
      {shouldLoad ? <PdfReader url={url} /> : <PdfPlaceholder label="Брендбук загрузится ниже" />}
    </div>
  );
}
