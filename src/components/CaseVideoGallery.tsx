"use client";

import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CaseGalleryItem } from "@/lib/case-gallery";
import { getFallbackMediaUrl } from "@/lib/media-fallback";

interface CaseVideoGalleryProps {
    items?: readonly CaseGalleryItem[];
    slug: string;
}

interface VideoState {
    duration: number;
    hasStarted: boolean;
    isMuted: boolean;
    isPlaying: boolean;
    progress: number;
}

type FullscreenVideoElement = HTMLVideoElement & {
    webkitEnterFullscreen?: () => void;
    webkitRequestFullscreen?: () => Promise<void> | void;
};

function getMediaAspectRatio(item: CaseGalleryItem) {
    if (item.type === "video") {
        return "9 / 16";
    }

    if (item.width && item.height) {
        return `${item.width} / ${item.height}`;
    }

    return "1 / 1";
}

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}

export default function CaseVideoGallery({ items, slug }: CaseVideoGalleryProps) {
    const [mediaItems, setMediaItems] = useState<CaseGalleryItem[]>(items ? [...items] : []);
    const [isLoaded, setIsLoaded] = useState(items !== undefined);
    const [activeVideoSrc, setActiveVideoSrc] = useState<string | null>(null);
    const [cursor, setCursor] = useState({ visible: false, x: 0, y: 0 });
    const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({});
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (items !== undefined) {
            setMediaItems([...items]);
            setIsLoaded(true);
            return;
        }

        const controller = new AbortController();

        async function loadMedia() {
            try {
                const response = await fetch(`/api/case-videos?slug=${encodeURIComponent(slug)}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    setMediaItems([]);
                    return;
                }

                const data = (await response.json()) as { media?: CaseGalleryItem[]; videos?: CaseGalleryItem[] };
                const items = Array.isArray(data.media) ? data.media : data.videos;
                setMediaItems(Array.isArray(items) ? items : []);
            } catch {
                if (!controller.signal.aborted) {
                    setMediaItems([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoaded(true);
                }
            }
        }

        loadMedia();

        return () => controller.abort();
    }, [items, slug]);

    useEffect(() => {
        setActiveVideoSrc(null);
        setCursor({ visible: false, x: 0, y: 0 });
        setVideoStates({});
    }, [mediaItems]);

    useEffect(() => {
        const handleFullscreenEnd = (event: Event) => {
            const video = event.target as HTMLVideoElement;
            if (video) {
                video.controls = false;
                video.removeAttribute("controls");
            }
        };

        const currentVideos = Object.values(videoRefs.current);
        currentVideos.forEach((video) => {
            if (video) {
                video.addEventListener("webkitendfullscreen", handleFullscreenEnd);
                video.addEventListener("fullscreenchange", handleFullscreenEnd);
            }
        });

        return () => {
            currentVideos.forEach((video) => {
                if (video) {
                    video.removeEventListener("webkitendfullscreen", handleFullscreenEnd);
                    video.removeEventListener("fullscreenchange", handleFullscreenEnd);
                }
            });
        };
    }, [mediaItems]);

    const updateVideoState = (src: string, state: Partial<VideoState>) => {
        const defaultState: VideoState = {
            duration: 0,
            hasStarted: false,
            isMuted: false,
            isPlaying: false,
            progress: 0,
        };

        setVideoStates((currentStates) => ({
            ...currentStates,
            [src]: {
                ...defaultState,
                ...currentStates[src],
                ...state,
            },
        }));
    };

    const pauseOtherVideos = (src: string) => {
        Object.entries(videoRefs.current).forEach(([videoSrc, video]) => {
            if (video && videoSrc !== src) {
                video.pause();
                updateVideoState(videoSrc, { isPlaying: false });
            }
        });
    };

    const playVideo = (src: string) => {
        pauseOtherVideos(src);

        const video = videoRefs.current[src];

        if (video) {
            video.volume = 0.3;
            void video
                .play()
                .then(() => {
                    updateVideoState(src, { hasStarted: true, isMuted: video.muted, isPlaying: true });
                })
                .catch(() => {
                    updateVideoState(src, { isPlaying: false });
                });
        }

        setActiveVideoSrc(src);
        setCursor({ visible: false, x: 0, y: 0 });
    };

    const togglePlayback = (src: string) => {
        const video = videoRefs.current[src];

        if (!video) {
            return;
        }

        if (video.paused) {
            playVideo(src);
            return;
        }

        video.pause();
        updateVideoState(src, { isPlaying: false });
    };

    const toggleMute = (src: string) => {
        const video = videoRefs.current[src];

        if (!video) {
            return;
        }

        video.muted = !video.muted;
        updateVideoState(src, { isMuted: video.muted });
    };

    const seekVideo = (src: string, progress: number) => {
        const video = videoRefs.current[src];

        if (!video || !Number.isFinite(video.duration)) {
            return;
        }

        video.currentTime = (progress / 100) * video.duration;
        updateVideoState(src, { progress });
    };

    const openFullscreen = (src: string) => {
        const video = videoRefs.current[src] as FullscreenVideoElement | null;
        const card = cardRefs.current[src];
        const fullscreenTarget = video || card;

        if (!fullscreenTarget) {
            return;
        }

        if (video) {
            video.controls = false;
            video.removeAttribute("controls");
        }

        if (fullscreenTarget.requestFullscreen) {
            void fullscreenTarget.requestFullscreen().catch(() => {
                if (video?.webkitEnterFullscreen) {
                    video.webkitEnterFullscreen();
                }
            });
            return;
        }

        if (video?.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
        }
    };

    const handleVideoCardClick = (src: string) => {
        openFullscreen(src);
        playVideo(src);
    };

    if (!isLoaded) {
        return null;
    }

    if (mediaItems.length === 0) {
        return null;
    }

    return (
        <section ref={sectionRef} className="relative border-b border-white/10 px-[var(--page-margin)] py-20 bg-[#0a0a0a]">
            {cursor.visible && (
                <div
                    className="pointer-events-none absolute left-0 top-0 z-[100] font-sans text-xs font-bold uppercase tracking-[0.24em] text-white mix-blend-difference will-change-transform"
                    style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%)` }}
                >
                    Смотреть
                </div>
            )}
            <div
                data-testid="case-gallery-grid"
                className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            >
                {mediaItems.map((item, index) => (
                    <div
                        key={`${item.src}-${index}`}
                        ref={(node) => {
                            cardRefs.current[item.src] = node;
                        }}
                        className="w-full self-start bg-zinc-950 border border-white/5 rounded-none overflow-hidden"
                    >
                        {item.type === "image" ? (
                            <img
                                className="block h-full w-full bg-zinc-900 object-cover"
                                src={item.src}
                                alt={item.name || `Материал кейса ${index + 1}`}
                                loading="lazy"
                                width={item.width}
                                height={item.height}
                                style={{ aspectRatio: getMediaAspectRatio(item) }}
                                onError={(event) => {
                                    const fallback = item.fallbackSrc || getFallbackMediaUrl(item.src);
                                    if (fallback && event.currentTarget.src !== fallback) {
                                        event.currentTarget.src = fallback;
                                    }
                                }}
                            />
                        ) : (
                            <div
                                data-testid="case-gallery-video"
                                className={`group relative w-full bg-zinc-900 overflow-hidden ${
                                    activeVideoSrc === item.src ? "cursor-auto" : "cursor-none"
                                }`}
                                style={{ aspectRatio: getMediaAspectRatio(item) }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Смотреть ${item.name || `видео кейса ${index + 1}`}`}
                                onClick={() => handleVideoCardClick(item.src)}
                                onMouseMove={(event) => {
                                    if (activeVideoSrc !== item.src && sectionRef.current) {
                                        const rect = sectionRef.current.getBoundingClientRect();
                                        setCursor({
                                            visible: true,
                                            x: event.clientX - rect.left,
                                            y: event.clientY - rect.top,
                                        });
                                    }
                                }}
                                onMouseLeave={() => setCursor({ visible: false, x: 0, y: 0 })}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        handleVideoCardClick(item.src);
                                    }
                                }}
                            >
                                <video
                                    ref={(node) => {
                                        videoRefs.current[item.src] = node;
                                    }}
                                    src={item.src}
                                    className="block h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.01]"
                                    controls={false}
                                    controlsList="nodownload noplaybackrate noremoteplayback"
                                    disablePictureInPicture
                                    playsInline
                                    poster={item.posterSrc}
                                    preload={item.posterSrc ? "none" : "metadata"}
                                    width={item.width}
                                    height={item.height}
                                    aria-label={item.name || `Видео кейса ${index + 1}`}
                                    onContextMenu={(event) => event.preventDefault()}
                                    onError={(event) => {
                                        const fallback = item.fallbackSrc || getFallbackMediaUrl(item.src);
                                        if (fallback && event.currentTarget.src !== fallback) {
                                            event.currentTarget.src = fallback;
                                            event.currentTarget.load();
                                        }
                                    }}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleVideoCardClick(item.src);
                                    }}
                                    onLoadedMetadata={(event) => {
                                        updateVideoState(item.src, {
                                            duration: event.currentTarget.duration,
                                            isMuted: event.currentTarget.muted,
                                        });
                                    }}
                                    onPause={() => updateVideoState(item.src, { isPlaying: false })}
                                    onPlay={() => updateVideoState(item.src, { isPlaying: true })}
                                    onTimeUpdate={(event) => {
                                        const video = event.currentTarget;

                                        if (!Number.isFinite(video.duration) || video.duration <= 0) {
                                            return;
                                        }

                                        updateVideoState(item.src, {
                                            duration: video.duration,
                                            progress: (video.currentTime / video.duration) * 100,
                                        });
                                    }}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-0 z-10 cursor-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
                                    aria-label={`Смотреть ${item.name || `видео кейса ${index + 1}`}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleVideoCardClick(item.src);
                                    }}
                                />
                                {!videoStates[item.src]?.hasStarted && (
                                    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center md:hidden">
                                        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-black shadow-[0_14px_34px_rgba(0,0,0,0.3)] backdrop-blur">
                                            <Play
                                                className="h-6 w-6 translate-x-0.5"
                                                fill="currentColor"
                                                strokeWidth={2.2}
                                            />
                                        </span>
                                    </div>
                                )}
                                {videoStates[item.src]?.hasStarted && (
                                    <>
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-black/80 via-black/35 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-100" />
                                        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 px-3 pb-3 text-white">
                                            <input
                                                className="h-1 w-full cursor-pointer appearance-none bg-white/25 accent-white"
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={videoStates[item.src]?.progress || 0}
                                                aria-label="Прогресс видео"
                                                onChange={(event) =>
                                                    seekVideo(item.src, Number(event.currentTarget.value))
                                                }
                                                onClick={(event) => event.stopPropagation()}
                                                onMouseDown={(event) => event.stopPropagation()}
                                            />
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="grid h-9 w-9 place-items-center rounded-full bg-white text-black transition hover:bg-white/85"
                                                        type="button"
                                                        aria-label={
                                                            videoStates[item.src]?.isPlaying ? "Пауза" : "Смотреть"
                                                        }
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            togglePlayback(item.src);
                                                        }}
                                                    >
                                                        {videoStates[item.src]?.isPlaying ? (
                                                            <Pause className="h-4 w-4" strokeWidth={2.4} />
                                                        ) : (
                                                            <Play
                                                                className="h-4 w-4 translate-x-px"
                                                                strokeWidth={2.4}
                                                            />
                                                        )}
                                                    </button>
                                                    <span className="font-sans text-xs font-medium tabular-nums text-white/90">
                                                        {formatTime(
                                                            ((videoStates[item.src]?.progress || 0) / 100) *
                                                                (videoStates[item.src]?.duration || 0),
                                                        )}{" "}
                                                        / {formatTime(videoStates[item.src]?.duration || 0)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
                                                        type="button"
                                                        aria-label={
                                                            videoStates[item.src]?.isMuted
                                                                ? "Включить звук"
                                                                : "Выключить звук"
                                                        }
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleMute(item.src);
                                                        }}
                                                    >
                                                        {videoStates[item.src]?.isMuted ? (
                                                            <VolumeX className="h-4 w-4" strokeWidth={2.2} />
                                                        ) : (
                                                            <Volume2 className="h-4 w-4" strokeWidth={2.2} />
                                                        )}
                                                    </button>
                                                    <button
                                                        className="grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
                                                        type="button"
                                                        aria-label="Во весь экран"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            openFullscreen(item.src);
                                                        }}
                                                    >
                                                        <Maximize2 className="h-4 w-4" strokeWidth={2.2} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
