import { useEffect, useRef, useState } from 'react';
import { flipFrom, type Rect } from '../../lib/motion/flip';
import type { GalleryItem } from '../../types/profile';

interface PhotoViewerProps {
  gallery: GalleryItem[];
  /** null keeps the viewer closed. */
  index: number | null;
  /** Box of the thumbnail that was clicked — the photo travels out of it. */
  originRect?: Rect | null;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function PhotoViewer({
  gallery,
  index,
  originRect,
  onSelect,
  onClose,
}: PhotoViewerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [loading, setLoading] = useState(true);
  // The original never cleared the previous highlight, so every visited thumbnail keeps its border.
  const [visited, setVisited] = useState<number[]>([]);

  const selected = index === null ? null : gallery[index];
  const open = index !== null;

  useEffect(() => {
    if (index === null) return;
    setLoading(true);
    resetRef.current?.();
    setVisited((previous) => (previous.includes(index) ? previous : [...previous, index]));
  }, [index]);

  /* Keyboard: escape closes, arrows step through the gallery. */
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && index !== null) {
        onSelect((index + 1) % gallery.length);
      }
      if (event.key === 'ArrowLeft' && index !== null) {
        onSelect((index - 1 + gallery.length) % gallery.length);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, index, gallery.length, onSelect, onClose]);

  // Zoom, drag and pinch on the large photo — plain DOM listeners so touch events can be cancelled.
  useEffect(() => {
    const swipeImage = imageRef.current;
    if (!swipeImage) return;

    let scale = 1;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let previousTranslateX = 0;
    let previousTranslateY = 0;
    let previousEventScale = 1;

    const apply = () => {
      swipeImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    };

    // Each new photo starts unzoomed and centred.
    resetRef.current = () => {
      scale = 1;
      currentTranslateX = 0;
      currentTranslateY = 0;
      previousTranslateX = 0;
      previousTranslateY = 0;
      swipeImage.style.transform = '';
    };

    const startDrag = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      isDragging = true;
      swipeImage.style.cursor = 'grabbing';
      if (event.type === 'touchstart') {
        startX = (event as TouchEvent).touches[0].clientX;
        startY = (event as TouchEvent).touches[0].clientY;
      } else {
        startX = (event as MouseEvent).clientX;
        startY = (event as MouseEvent).clientY;
      }
      previousTranslateX = currentTranslateX || 0;
      previousTranslateY = currentTranslateY || 0;
    };

    const drag = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      event.preventDefault();
      let x: number | undefined;
      let y: number | undefined;

      if (event.type === 'touchmove' && (event as TouchEvent).touches.length < 2) {
        x = (event as TouchEvent).touches[0].clientX;
        y = (event as TouchEvent).touches[0].clientY;
      } else {
        x = (event as MouseEvent).clientX;
        y = (event as MouseEvent).clientY;
      }

      if (x != null && y != null) {
        currentTranslateX = previousTranslateX + (x - startX);
        currentTranslateY = previousTranslateY + (y - startY);
        apply();
      }
    };

    const endDrag = () => {
      swipeImage.style.cursor = 'grab';
      isDragging = false;
      previousTranslateX = currentTranslateX;
      previousTranslateY = currentTranslateY;
    };

    const onGestureStart = (event: Event) => {
      event.preventDefault();
      previousTranslateX = currentTranslateX;
      previousTranslateY = currentTranslateY;
    };

    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gestureScale = (event as Event & { scale: number }).scale;
      const next = scale + (gestureScale - previousEventScale);
      if (next < 5 && next > 0.5) {
        scale = next;
        apply();
      }
      previousEventScale = gestureScale;
    };

    const onGestureEnd = (event: Event) => {
      event.preventDefault();
      previousEventScale = 1;
    };

    const zoomIn = () => {
      scale += 0.15;
      apply();
    };
    const zoomOut = () => {
      if (scale > 0.5) scale -= 0.15;
      apply();
    };

    const zoomInBtn = document.getElementById('zoomInButton');
    const zoomOutBtn = document.getElementById('zoomOutButton');

    swipeImage.addEventListener('mousedown', startDrag);
    swipeImage.addEventListener('touchstart', startDrag, { passive: false });
    swipeImage.addEventListener('mousemove', drag);
    swipeImage.addEventListener('touchmove', drag, { passive: false });
    swipeImage.addEventListener('mouseup', endDrag);
    swipeImage.addEventListener('touchend', endDrag);
    swipeImage.addEventListener('mouseleave', endDrag);
    swipeImage.addEventListener('touchcancel', endDrag);
    zoomInBtn?.addEventListener('click', zoomIn);
    zoomOutBtn?.addEventListener('click', zoomOut);
    swipeImage.addEventListener('gesturestart', onGestureStart);
    swipeImage.addEventListener('gesturechange', onGestureChange);
    swipeImage.addEventListener('gestureend', onGestureEnd);

    return () => {
      resetRef.current = null;
      swipeImage.removeEventListener('mousedown', startDrag);
      swipeImage.removeEventListener('touchstart', startDrag);
      swipeImage.removeEventListener('mousemove', drag);
      swipeImage.removeEventListener('touchmove', drag);
      swipeImage.removeEventListener('mouseup', endDrag);
      swipeImage.removeEventListener('touchend', endDrag);
      swipeImage.removeEventListener('mouseleave', endDrag);
      swipeImage.removeEventListener('touchcancel', endDrag);
      zoomInBtn?.removeEventListener('click', zoomIn);
      zoomOutBtn?.removeEventListener('click', zoomOut);
      swipeImage.removeEventListener('gesturestart', onGestureStart);
      swipeImage.removeEventListener('gesturechange', onGestureChange);
      swipeImage.removeEventListener('gestureend', onGestureEnd);
    };
  }, []);

  return (
    <div
      id="photoContainer"
      className="bg1"
      role="dialog"
      aria-modal="true"
      aria-label={selected ? selected.name : 'Photo viewer'}
      style={{ display: open ? 'flex' : 'none' }}
    >
      <div className="pc_buttons">
        <div id="zoomButtons">
          <button id="zoomInButton" type="button" aria-label="Zoom in">
            <span className="ico-gen" aria-hidden="true">
              I
            </span>
          </button>
          <button id="zoomOutButton" type="button" aria-label="Zoom out">
            <span className="ico-gen" aria-hidden="true">
              J
            </span>
          </button>
        </div>
        <button id="closeButton" type="button" ref={closeRef} onClick={onClose} aria-label="Close">
          <span className="ico-gen" aria-hidden="true">
            F
          </span>
        </button>
      </div>

      <div id="largePhotoHolder">
        {loading && <div className="loading-indicator" aria-hidden="true"></div>}
        <img
          ref={imageRef}
          id="largePhoto"
          src={selected ? selected.image_url : ''}
          alt={selected ? selected.name : ''}
          style={{ display: loading ? 'none' : 'block' }}
          onLoad={() => {
            setLoading(false);
            // Shared element: fly out of the thumbnail that was clicked.
            if (imageRef.current) void flipFrom(imageRef.current, originRect ?? null);
          }}
        />
      </div>

      <div id="thumbnailContainer" className="bg2">
        {gallery.map((item, i) => (
          <img
            key={item.gallery_item_id}
            className={'thumbnail-g' + (visited.includes(i) ? ' selected' : '')}
            src={item.thumb_url}
            alt={item.name}
            data-name={item.name}
            loading="lazy"
            onClick={() => onSelect(i)}
          />
        ))}
      </div>

      <div id="photoTitle">{selected?.name}</div>
      <div id="photoSubtitle">{selected?.description}</div>
    </div>
  );
}
