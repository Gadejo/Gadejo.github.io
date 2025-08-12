import { useCallback, useRef } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useGestures(config: GestureConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = config;

  const startPoint = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    startPoint.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchMove = useCallback(() => {
    // Cancel long press if finger moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Cancel long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!startPoint.current) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const endPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    const deltaX = endPoint.x - startPoint.current.x;
    const deltaY = endPoint.y - startPoint.current.y;
    const deltaTime = endPoint.time - startPoint.current.time;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isSwipe = distance > threshold;

    if (isSwipe) {
      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    } else if (distance < 10 && deltaTime < 300) {
      // It's a tap
      const now = Date.now();
      const timeSinceLastTap = now - lastTap.current;

      if (timeSinceLastTap < 300 && onDoubleTap) {
        // Double tap
        onDoubleTap();
        lastTap.current = 0; // Reset to prevent triple tap
      } else {
        // Single tap
        lastTap.current = now;
        setTimeout(() => {
          if (lastTap.current === now && onTap) {
            onTap();
          }
        }, 300);
      }
    }

    startPoint.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, threshold]);

  const attachGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { attachGestures };
}

// Hook for mouse gestures (desktop)
export function useMouseGestures(config: Omit<GestureConfig, 'onLongPress'>) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    threshold = 50
  } = config;

  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const lastClick = useRef<number>(0);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    startPoint.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback(() => {
    if (startPoint.current) {
      isDragging.current = true;
    }
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!startPoint.current) return;

    const endPoint = { x: e.clientX, y: e.clientY };
    const deltaX = endPoint.x - startPoint.current.x;
    const deltaY = endPoint.y - startPoint.current.y;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (isDragging.current && distance > threshold) {
      // It's a drag/swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    } else if (!isDragging.current) {
      // It's a click
      const now = Date.now();
      const timeSinceLastClick = now - lastClick.current;

      if (timeSinceLastClick < 400 && onDoubleTap) {
        onDoubleTap();
        lastClick.current = 0;
      } else {
        lastClick.current = now;
        setTimeout(() => {
          if (lastClick.current === now && onTap) {
            onTap();
          }
        }, 400);
      }
    }

    startPoint.current = null;
    isDragging.current = false;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, threshold]);

  const attachMouseGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return { attachMouseGestures };
}

// Combined hook for both touch and mouse
export function useUnifiedGestures(config: GestureConfig) {
  const { attachGestures } = useGestures(config);
  const { attachMouseGestures } = useMouseGestures(config);

  const attachUnifiedGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const cleanupTouch = attachGestures(element);
    const cleanupMouse = attachMouseGestures(element);

    return () => {
      cleanupTouch?.();
      cleanupMouse?.();
    };
  }, [attachGestures, attachMouseGestures]);

  return { attachUnifiedGestures };
}