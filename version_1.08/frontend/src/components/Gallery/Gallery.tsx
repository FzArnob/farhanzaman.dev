import { useRef, type PointerEvent } from 'react';
import { captureRect, type Rect } from '../../lib/motion/flip';
import { mutate } from '../../lib/motion/raf';
import { useWindowSize } from '../../hooks/useWindowSize';
import type { GalleryItem } from '../../types/profile';

function columnsFor(width: number): number {
  switch (true) {
    case width >= 600 && width < 800:
      return 2;
    case width >= 800 && width < 1400:
      return 3;
    case width >= 1400 && width < 2000:
      return 4;
    case width >= 2000:
      return 5;
    default:
      return 1;
  }
}

interface TileProps {
  item: GalleryItem;
  side: number;
  onOpen: (rect: Rect | null) => void;
}

function GalleryTile({ item, side, onOpen }: TileProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  /** Measured once on enter — the old version read the box on every mousemove. */
  const boxRef = useRef<DOMRect | null>(null);

  const onPointerEnter = () => {
    boxRef.current = containerRef.current?.getBoundingClientRect() ?? null;
  };

  /** Tilts the tile towards the pointer and casts a matching teal shadow. */
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const tile = containerRef.current;
    const box = boxRef.current;
    if (!tile || !box) return;

    const centreX = box.left + box.width / 2;
    const centreY = box.top + box.height / 2;
    const distanceX = event.clientX - centreX;
    const distanceY = event.clientY - centreY;
    const maxX = box.width / 2;
    const maxY = box.height / 2;
    if (maxX === 0 || maxY === 0) return;

    const ratioX = (distanceX / maxX) * -1;
    const ratioY = distanceY / maxY;

    const fromCentre = Math.hypot(distanceX, distanceY);
    const maxFromCentre = Math.hypot(maxX, maxY);
    const rotation = (fromCentre / maxFromCentre) * 8;

    const shadowX = Math.round(ratioX * -4);
    const shadowY = Math.round(ratioY * 4);

    // Queued: all reads for the frame happen before any write.
    mutate(() => {
      tile.style.boxShadow = `${shadowX}px ${shadowY}px 5px var(--theme-color-shadow)`;
      tile.style.transform = `perspective(600px) rotate3d(${ratioY.toFixed(3)}, ${ratioX.toFixed(
        3
      )}, 0, ${rotation.toFixed(2)}deg) scale(1.02)`;
    });
  };

  const onPointerLeave = () => {
    const tile = containerRef.current;
    if (!tile) return;
    boxRef.current = null;
    mutate(() => {
      tile.style.boxShadow = '';
      tile.style.transform = '';
    });
  };

  return (
    <button
      type="button"
      ref={containerRef}
      className="image-container"
      data-name={item.name}
      style={{ width: side + 'px', height: side + 'px' }}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={() => onOpen(captureRect(containerRef.current))}
      aria-label={`Open ${item.name}`}
    >
      <img
        src={item.thumb_url}
        className="gallery-image"
        alt={item.name}
        loading="lazy"
        decoding="async"
        style={{ objectFit: 'cover', width: side + 'px', height: side + 'px' }}
      />
      <span className="gallery-image-back" aria-hidden="true"></span>
      <span className="gallery-category">{item.category}</span>
      <span className="zoom-icon ico-gen" aria-hidden="true">
        O
      </span>
    </button>
  );
}

interface GalleryProps {
  gallery: GalleryItem[];
  /** The hobbies page shows everything; the home teaser shows two rows behind a fade. */
  extended: boolean;
  onOpen: (index: number, rect: Rect | null) => void;
}

export function Gallery({ gallery, extended, onOpen }: GalleryProps) {
  const { width } = useWindowSize();
  const numColumn = columnsFor(width);
  const imageSide = width / numColumn - 70;
  const containerHeight = imageSide + imageSide / 2 + 30;
  const containerShadowHeight = imageSide / 2;
  const length = extended ? gallery.length : numColumn * 2;

  return (
    <div id="gallery">
      <div
        className="gallery-container"
        data-reveal="stagger"
        data-reveal-from="center"
        style={{ overflow: 'hidden', height: extended ? undefined : containerHeight + 'px' }}
      >
        {gallery.slice(0, length).map((item, index) => (
          <GalleryTile
            key={item.gallery_item_id}
            item={item}
            side={imageSide}
            onOpen={(rect) => onOpen(index, rect)}
          />
        ))}
        {!extended && (
          <div
            className="bottom-gradient-bg gallery-container-shadow"
            style={{
              height: containerShadowHeight + 'px',
              top: containerHeight - containerShadowHeight - 1 + 'px',
            }}
          ></div>
        )}
      </div>
    </div>
  );
}
