"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { imgProps } from "@/lib/images";

/** 作品相：左右滑一張張睇（自動對齊），下面有頁碼點；電腦有左右箭咀 */
export type GalleryVideo = { id: string; poster: string; label: string };

/** 影片放第 2 格（第 1 張係主圖，亦係分享圖同 Google 產品圖）；平時只係封面＋播放掣，撳咗先載入 YouTube，唔拖慢開頁 */
export function CaseGallery({ images, placeholders = [], video }: { images: { src: string; alt: string }[]; placeholders?: string[]; video?: GalleryVideo }) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = images.length + placeholders.length + (video ? 1 : 0);
  const videoAt = video ? Math.min(1, images.length) : -1;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setAt(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, Math.min(total - 1, i)) * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="bb-gallery">
      {/* 同首頁作品貨架一樣：左右滑，兩邊有浮喺相上面嘅圓形箭咀（滑鼠移入先出現），下面有頁碼點 */}
      <div className="bb-shelf__stage bb-gallery__stage">
        <div className="bb-gallery__track" ref={track} tabIndex={0} aria-label={`作品相，共 ${total} 張，可以左右滑`}>
          {images.map((im, i) => (
            <Fragment key={im.src + i}>
              {i === videoAt && video && <VideoSlide video={video} playing={playing} onPlay={() => setPlaying(true)} />}
              <figure className="bb-gallery__slide">
                <img {...imgProps(im.src, "(max-width: 960px) 100vw, 560px")} alt={im.alt} width={1000} height={1000} loading={i === 0 ? undefined : "lazy"} decoding="async" />
                {i === 0 && video && (
                  <button type="button" className="bb-gallery__vidbtn" onClick={() => go(videoAt)}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M5 3.5v9l7.5-4.5z" />
                    </svg>
                    {video.label}
                  </button>
                )}
              </figure>
            </Fragment>
          ))}
          {video && videoAt >= images.length && <VideoSlide video={video} playing={playing} onPlay={() => setPlaying(true)} />}
          {placeholders.map((p) => (
            <figure key={p} className="bb-gallery__slide bb-gallery__slide--ph">
              <span>
                {p}
                <span className="bb-demo">示例</span>
              </span>
            </figure>
          ))}
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
        <div className="bb-gallery__dots">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} type="button" aria-label={`第 ${i + 1} 張`} aria-current={at === i ? "true" : undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
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
            <svg viewBox="0 0 16 16">
              <path d="M5 3.5v9l7.5-4.5z" />
            </svg>
          </span>
          <span className="bb-gallery__vlabel">{video.label}</span>
        </button>
      )}
    </figure>
  );
}
