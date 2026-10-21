"use client";

import { useEffect, useRef, useState } from "react";
import { imgProps } from "@/lib/images";

export type GalleryVideo = { id: string; poster: string; label: string };

type Img = { src: string; alt: string };
type Slide = { kind: "img"; img: Img; n: number } | { kind: "video" } | { kind: "ph"; text: string };

const PLAY = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M5 3.5v9l7.5-4.5z" />
  </svg>
);

/**
 * 作品相（學京東、天貓、蘋果產品頁）：
 * - 大圖左右滑，電腦有左右箭咀；下面一排縮圖，撳邊張去邊張（取代頁碼點）
 * - 影片放第 2 格（第 1 張係主圖，亦係分享圖同 Google 產品圖）；平時只係封面＋播放掣，撳咗先載入 YouTube，唔拖慢開頁
 * - 撳相全螢幕放大睇細節（原生 <dialog>，Esc 或者撳 ✕ 關）
 */
export function CaseGallery({ images, placeholders = [], video }: { images: Img[]; placeholders?: string[]; video?: GalleryVideo }) {
  const track = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDialogElement>(null);
  const boxTrack = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [boxAt, setBoxAt] = useState(0);
  const [playing, setPlaying] = useState(false);

  const slides: Slide[] = [];
  images.forEach((img, n) => {
    if (n === 1 && video) slides.push({ kind: "video" });
    slides.push({ kind: "img", img, n });
  });
  if (video && images.length < 2) slides.push({ kind: "video" });
  placeholders.forEach((text) => slides.push({ kind: "ph", text }));
  const total = slides.length;
  const videoAt = slides.findIndex((s) => s.kind === "video");

  useEffect(() => {
    const watch = (el: HTMLDivElement | null, set: (i: number) => void) => {
      if (!el) return () => {};
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => set(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("scroll", onScroll);
      };
    };
    const a = watch(track.current, setAt);
    const b = watch(boxTrack.current, setBoxAt);
    return () => {
      a();
      b();
    };
  }, []);

  const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: Math.max(0, Math.min(total - 1, i)) * el.clientWidth, behavior: smooth() });
  };
  const boxGo = (i: number, instant = false) => {
    const el = boxTrack.current;
    if (el) el.scrollTo({ left: Math.max(0, Math.min(images.length - 1, i)) * el.clientWidth, behavior: instant ? "auto" : smooth() });
  };
  const open = (n: number) => {
    const d = box.current;
    if (!d) return;
    d.showModal();
    setBoxAt(n);
    requestAnimationFrame(() => boxGo(n, true));
  };

  return (
    <div className="bb-gallery">
      <div className="bb-shelf__stage bb-gallery__stage">
        <div className="bb-gallery__track" ref={track} tabIndex={0} aria-label={`作品相，共 ${total} 格，可以左右滑`}>
          {slides.map((s, i) =>
            s.kind === "video" && video ? (
              <VideoSlide key="video" video={video} playing={playing} onPlay={() => setPlaying(true)} />
            ) : s.kind === "img" ? (
              <figure key={s.img.src} className="bb-gallery__slide">
                <button type="button" className="bb-gallery__zoom" onClick={() => open(s.n)} aria-label={`放大睇：${s.img.alt}`}>
                  <img {...imgProps(s.img.src, "(max-width: 960px) 100vw, 560px")} alt={s.img.alt} width={1000} height={1000} loading={i === 0 ? undefined : "lazy"} decoding="async" />
                </button>
                {i === 0 && video && (
                  <button type="button" className="bb-gallery__vidbtn" onClick={() => go(videoAt)}>
                    {PLAY}
                    {video.label}
                  </button>
                )}
              </figure>
            ) : s.kind === "ph" ? (
              <figure key={s.text} className="bb-gallery__slide bb-gallery__slide--ph">
                <span>
                  {s.text}
                  <span className="bb-demo">示例</span>
                </span>
              </figure>
            ) : null,
          )}
        </div>
        {total > 1 && (
          <>
            <button type="button" className="bb-shelf__paddle bb-shelf__paddle--prev" onClick={() => go(at - 1)} disabled={at === 0} aria-label="上一張">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 2.5 4.5 8l5.5 5.5" />
              </svg>
            </button>
            <button type="button" className="bb-shelf__paddle bb-shelf__paddle--next" onClick={() => go(at + 1)} disabled={at >= total - 1} aria-label="下一張">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m6 2.5 5.5 5.5L6 13.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="bb-gallery__thumbs" role="group" aria-label="揀相">
          {slides.map((s, i) => (
            <button key={i} type="button" className="bb-gallery__thumb" aria-current={at === i ? "true" : undefined} onClick={() => go(i)} aria-label={s.kind === "img" ? `第 ${i + 1} 格：${s.img.alt}` : s.kind === "video" ? `第 ${i + 1} 格：${video?.label}` : `第 ${i + 1} 格`}>
              {s.kind === "img" && <img {...imgProps(s.img.src, "72px")} alt="" width={72} height={72} decoding="async" fetchPriority="low" />}
              {s.kind === "video" && video && (
                <>
                  <img {...imgProps(video.poster, "72px")} alt="" width={72} height={72} decoding="async" fetchPriority="low" />
                  <span className="bb-gallery__thumbplay">{PLAY}</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      <dialog ref={box} className="bb-lightbox" aria-label="放大睇作品相">
        <div className="bb-lightbox__track" ref={boxTrack}>
          {images.map((im) => (
            <figure key={im.src} className="bb-lightbox__slide">
              <img {...imgProps(im.src, "min(100vw, 100vh)")} alt={im.alt} width={1000} height={1000} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
        <p className="bb-lightbox__count" aria-live="polite">
          {boxAt + 1} / {images.length}
        </p>
        <button type="button" className="bb-lightbox__close" onClick={() => box.current?.close()} aria-label="關閉">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m3.5 3.5 9 9m0-9-9 9" />
          </svg>
        </button>
        {images.length > 1 && (
          <>
            <button type="button" className="bb-shelf__paddle bb-shelf__paddle--prev bb-lightbox__nav" onClick={() => boxGo(boxAt - 1)} disabled={boxAt === 0} aria-label="上一張">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 2.5 4.5 8l5.5 5.5" />
              </svg>
            </button>
            <button type="button" className="bb-shelf__paddle bb-shelf__paddle--next bb-lightbox__nav" onClick={() => boxGo(boxAt + 1)} disabled={boxAt >= images.length - 1} aria-label="下一張">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m6 2.5 5.5 5.5L6 13.5" />
              </svg>
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}

function VideoSlide({ video, playing, onPlay }: { video: GalleryVideo; playing: boolean; onPlay: () => void }) {
  return (
    <figure className="bb-gallery__slide bb-gallery__slide--video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
          title={video.label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" className="bb-gallery__poster" onClick={onPlay} aria-label={`播放${video.label}`}>
          <img {...imgProps(video.poster, "(max-width: 960px) 100vw, 560px")} alt="" width={1000} height={1000} loading="lazy" decoding="async" />
          <span className="bb-gallery__play" aria-hidden="true">
            {PLAY}
          </span>
          <span className="bb-gallery__vlabel">{video.label}</span>
        </button>
      )}
    </figure>
  );
}
