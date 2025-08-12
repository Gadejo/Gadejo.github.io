import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [RefObject<HTMLDivElement | null>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenIntersecting, setHasBeenIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  const {
    threshold = 0.1,
    rootMargin = '0px',
    root = null,
    triggerOnce = false
  } = options;

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isCurrentlyIntersecting);
        
        if (isCurrentlyIntersecting && !hasBeenIntersecting) {
          setHasBeenIntersecting(true);
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, root, hasBeenIntersecting]);

  // Return current intersection status or "has been intersecting" if triggerOnce is true
  const shouldShow = triggerOnce ? hasBeenIntersecting : isIntersecting;

  return [targetRef, shouldShow];
}