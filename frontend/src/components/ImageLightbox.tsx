import { useEffect } from "react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

// Modal simple que muestra una imagen ampliada sobre un fondo oscuro
const ImageLightbox = ({ src, alt, onClose }: ImageLightboxProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button type="button" className="lightbox-cerrar" onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageLightbox;
