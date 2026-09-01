import { useEffect, useRef } from 'react';
import type { GalleryItem } from '../types/profile';
import type { GamingVideo } from '../types/gaming';

/**
 * Full-resolution artwork, and the inline clip player.
 *
 * The frame flies to camera in 3D and this takes over at the point where a texture
 * would be doing worse than an <img> — full resolution, right-clickable, zoomable by
 * the browser, and readable by a screen reader.
 */

export function Lightbox({
  gallery,
  index,
  onIndex,
  onClose,
}: {
  gallery: GalleryItem[];
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (index !== null) closeRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onIndex((index + 1) % gallery.length);
      if (event.key === 'ArrowLeft') onIndex((index - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, gallery.length, onIndex]);

  if (index === null) return null;
  const item = gallery[index];
  if (!item) return null;

  return (
    <div className="prism-lightbox" role="dialog" aria-modal="true" aria-label={item.name}>
      <img src={item.image_url} alt={item.description || item.name} />
      <div className="prism-lightbox-bar">
        <div>
          <h2>{item.name}</h2>
          <p>
            <span className="prism-chip">{item.category}</span> {item.description}
          </p>
        </div>
        <nav className="prism-lightbox-nav" aria-label="Gallery">
          <button
            type="button"
            onClick={() => onIndex((index - 1 + gallery.length) % gallery.length)}
            aria-label="Previous work"
          >
            ←
          </button>
          <span className="prism-count">
            {index + 1} / {gallery.length}
          </span>
          <button
            type="button"
            onClick={() => onIndex((index + 1) % gallery.length)}
            aria-label="Next work"
          >
            →
          </button>
          <button ref={closeRef} type="button" className="prism-close" onClick={onClose} aria-label="Close">
            Esc
          </button>
        </nav>
      </div>
    </div>
  );
}

/** A clip from the arcade wall, played where it was clicked. */
export function ClipPlayer({ clip, onClose }: { clip: GamingVideo | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (clip) closeRef.current?.focus();
  }, [clip]);

  useEffect(() => {
    if (!clip) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clip, onClose]);

  if (!clip) return null;
  const id = clip.video_url.split('v=')[1]?.split('&')[0] ?? '';

  return (
    <div className="prism-lightbox prism-lightbox-clip" role="dialog" aria-modal="true" aria-label={clip.video_title}>
      <div className="prism-clip-frame">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={clip.video_title}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a href={clip.video_url} target="_blank" rel="noreferrer">
            Open on YouTube
          </a>
        )}
      </div>
      <div className="prism-lightbox-bar">
        <div>
          <h2>{clip.video_title}</h2>
          <p>
            {clip.video_view_count.toLocaleString()} views · {clip.video_like_count.toLocaleString()} likes
          </p>
        </div>
        <nav className="prism-lightbox-nav">
          <a className="prism-btn" href={clip.video_url} target="_blank" rel="noreferrer">
            YouTube
          </a>
          <button ref={closeRef} type="button" className="prism-close" onClick={onClose} aria-label="Close">
            Esc
          </button>
        </nav>
      </div>
    </div>
  );
}
