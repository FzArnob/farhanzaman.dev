import { useRef, type MouseEvent } from 'react';
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
  onOpen: () => void;
}

function GalleryTile({ item, side, onOpen }: TileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  /** Tilts the tile towards the pointer and casts a matching teal shadow. */
  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const imageContainer = containerRef.current;
    if (!imageContainer) return;
    if (iconRef.current) iconRef.current.style.display = 'block';
    if (backRef.current) backRef.current.style.display = 'block';

    const divRect = imageContainer.getBoundingClientRect();
    const divCenterX = divRect.left + divRect.width / 2;
    const divCenterY = divRect.top + divRect.height / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Distance between the pointer and the centre of the tile
    const distanceX = mouseX - divCenterX;
    const distanceY = mouseY - divCenterY;
    const maxDistanceX = Math.abs(divRect.left - divCenterX);
    const maxDistanceY = Math.abs(divRect.top - divCenterY);
    const ratioX = (distanceX / maxDistanceX) * -1;
    const ratioY = distanceY / maxDistanceY;

    const distanceFromCenter = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const maxDistanceFromCenter = Math.sqrt(
      maxDistanceX * maxDistanceX + maxDistanceY * maxDistanceY
    );
    const maxRotation = 8; // Maximum rotation angle in degrees
    const minRotation = 0; // Minimum rotation angle in degrees
    const rotationRange = maxRotation - minRotation;

    const rotation =
      minRotation + (distanceFromCenter / maxDistanceFromCenter) * rotationRange;
    const maxBoxShadowDepthX = Math.floor(ratioX * -4);
    const maxBoxShadowDepthY = Math.floor(ratioY * 4);
    imageContainer.style.boxShadow = `${maxBoxShadowDepthX}px ${maxBoxShadowDepthY}px 5px rgba(0, 211, 180, 0.3)`;
    imageContainer.style.transform = `perspective(600px) rotate3d(${ratioY}, ${ratioX}, 0, ${rotation}deg) scale(1.02)`;
  };

  const onMouseLeave = () => {
    if (iconRef.current) iconRef.current.style.display = 'none';
    if (backRef.current) backRef.current.style.display = 'none';
    if (containerRef.current) {
      containerRef.current.style.boxShadow = 'none';
      containerRef.current.style.transform = 'none';
    }
  };

  return (
    <div
      ref={containerRef}
      className="image-container"
      data-name={item.name}
      style={{ width: side + 'px', height: side + 'px', transition: 'none' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onOpen}
    >
      <img
        src={item.thumb_url}
        className="gallery-image"
        style={{ objectFit: 'cover', width: side + 'px', height: side + 'px' }}
      />
      <div ref={backRef} className="gallery-image-back"></div>
      <div ref={iconRef} className="zoom-icon ico-gen" style={{ fontSize: '40px' }}>
        O
      </div>
    </div>
  );
}

interface GalleryProps {
  gallery: GalleryItem[];
  /** The hobbies page shows everything; the home teaser shows two rows behind a fade. */
  extended: boolean;
  onOpen: (index: number) => void;
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
        style={{ overflow: 'hidden', height: extended ? undefined : containerHeight + 'px' }}
      >
        {gallery.slice(0, length).map((item, index) => (
          <GalleryTile
            key={item.gallery_item_id}
            item={item}
            side={imageSide}
            onOpen={() => onOpen(index)}
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
