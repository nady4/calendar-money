import { useEffect, useRef, useState } from "react";

interface ReceiptLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const SCALE_STEP = 0.2;

const ReceiptLightbox = ({ src, alt = "Receipt", onClose }: ReceiptLightboxProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const draggingRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
      } else if (event.key === "-") {
        event.preventDefault();
        setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));
      } else if (event.key === "0") {
        event.preventDefault();
        setScale(1);
        setOffset({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    setScale((s) =>
      Math.max(MIN_SCALE, Math.min(MAX_SCALE, +(s + delta).toFixed(2)))
    );
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    draggingRef.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = draggingRef.current;
    if (!drag) return;
    setOffset({
      x: drag.ox + (event.clientX - drag.x),
      y: drag.oy + (event.clientY - drag.y),
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = null;
    try {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="receipt-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Receipt preview"
      ref={containerRef}
      onClick={handleBackdrop}
    >
      <button
        type="button"
        className="receipt-lightbox-close"
        aria-label="Close preview"
        onClick={onClose}
      >
        ×
      </button>
      <div className="receipt-lightbox-toolbar" aria-hidden>
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))}
          aria-label="Zoom out"
        >
          −
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>
      <div
        className="receipt-lightbox-stage"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
};

export default ReceiptLightbox;
