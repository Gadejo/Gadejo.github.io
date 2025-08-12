import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  className,
  style,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [ref, isVisible] = useIntersectionObserver({ triggerOnce: true });

  useEffect(() => {
    if (isVisible && !isLoaded && !hasError) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
      img.src = src;
    }
  }, [isVisible, src, isLoaded, hasError, onLoad, onError]);

  return (
    <div ref={ref} className={className} style={style}>
      {hasError ? (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-gray-100)',
            color: 'var(--color-gray-500)',
            minHeight: '100px',
            borderRadius: 'var(--border-radius)',
            ...style
          }}
        >
          <span>Failed to load image</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            opacity: isLoaded ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            ...style
          }}
          className={className}
        />
      )}
    </div>
  );
}