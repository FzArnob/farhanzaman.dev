import { useEffect, useRef, useState } from 'react';
import type { GalleryItem } from '../../types/profile';

interface PhotoViewerProps {
  gallery: GalleryItem[];
  /** null keeps the viewer closed. */
  index: number | null;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function PhotoViewer({ gallery, index, onSelect, onClose }: PhotoViewerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(true);
  // The original never cleared the previous highlight, so every visited thumbnail keeps its border.
  const [visited, setVisited] = useState<number[]>([]);

  const selected = index === null ? null : gallery[index];

  useEffect(() => {
    if (index === null) return;
    setLoading(true);
    setVisited((previous) => (previous.includes(index) ? previous : [...previous, index]));
  }, [index]);

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
      event.preventDefault();
      if (!isDragging) return;
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

    const endDrag = (event: Event) => {
      swipeImage.style.cursor = 'graB';
      event.preventDefault();
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
      if (5 > scale + (gestureScale - previousEventScale) && scale + (gestureScale - previousEventScale) > 0.5) {
        scale = scale + (gestureScale - previousEventScale);
        apply();
      }
      previousEventScale = gestureScale;
    };

    const onGestureEnd = (event: Event) => {
      event.preventDefault();
      previousEventScale = 1;
    };

    const zoomIn = () => {
      scale += 0.1;
      apply();
    };
    const zoomOut = () => {
      if (scale > 0.5) scale -= 0.1;
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
      className="animate-top bg1"
      style={{ display: index === null ? 'none' : 'flex' }}
    >
      <div className="pc_buttons">
        <div id="zoomButtons">
          <button id="zoomInButton">
            <span className="ico-gen">I</span>
          </button>
          <button id="zoomOutButton">
            <span className="ico-gen">J</span>
          </button>
        </div>
        <div id="closeButton" onClick={onClose}>
          <span className="ico-gen">F</span>
        </div>
      </div>
      <div id="largePhotoHolder">
        {loading && <div className="loading-indicator"></div>}
        <img
          ref={imageRef}
          id="largePhoto"
          className="animate-opacity"
          src={selected ? selected.image_url : ''}
          alt="Large Photo"
          style={{ display: loading ? 'none' : 'block' }}
          onLoad={() => setLoading(false)}
        />
      </div>
      <div id="thumbnailContainer" className="bg2">
        {gallery.map((item, i) => (
          <img
            key={item.gallery_item_id}
            className={'thumbnail-g animate-opacity' + (visited.includes(i) ? ' selected' : '')}
            src={item.thumb_url}
            alt={`Thumbnail ${i + 1}`}
            data-name={item.name}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
      <div id="photoTitle">{selected?.name}</div>
      <div id="photoSubtitle">{selected?.description}</div>
    </div>
  );
}
