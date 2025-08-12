import { useCallback, useRef, useEffect } from 'react';

interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export function useAnimations() {
  const animationRefs = useRef<Map<string, Animation>>(new Map());

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      animationRefs.current.forEach(animation => {
        animation.cancel();
      });
      animationRefs.current.clear();
    };
  }, []);

  const animate = useCallback((
    element: HTMLElement | null,
    keyframes: Keyframe[],
    config: AnimationConfig = {},
    animationId?: string
  ): Animation | null => {
    if (!element) return null;

    const {
      duration = 300,
      delay = 0,
      easing = 'ease-out',
      fillMode = 'forwards'
    } = config;

    // Cancel existing animation if using same ID
    if (animationId && animationRefs.current.has(animationId)) {
      animationRefs.current.get(animationId)?.cancel();
    }

    const animation = element.animate(keyframes, {
      duration,
      delay,
      easing,
      fill: fillMode
    });

    // Store animation reference if ID provided
    if (animationId) {
      animationRefs.current.set(animationId, animation);
      
      // Clean up reference when animation completes
      animation.addEventListener('finish', () => {
        animationRefs.current.delete(animationId);
      });
    }

    return animation;
  }, []);

  // Pre-defined animation functions
  const fadeIn = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0 },
      { opacity: 1 }
    ], config);
  }, [animate]);

  const fadeOut = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 1 },
      { opacity: 0 }
    ], config);
  }, [animate]);

  const slideUp = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], config);
  }, [animate]);

  const slideDown = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0, transform: 'translateY(-20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], config);
  }, [animate]);

  const slideLeft = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0, transform: 'translateX(20px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], config);
  }, [animate]);

  const slideRight = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0, transform: 'translateX(-20px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], config);
  }, [animate]);

  const scaleIn = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' }
    ], config);
  }, [animate]);

  const scaleOut = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.8)' }
    ], config);
  }, [animate]);

  const bounce = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' },
      { transform: 'translateY(-5px)' },
      { transform: 'translateY(0)' }
    ], { duration: 600, ...config });
  }, [animate]);

  const shake = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' }
    ], { duration: 500, ...config });
  }, [animate]);

  const pulse = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ], { duration: 500, ...config });
  }, [animate]);

  const spin = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ], { duration: 1000, ...config });
  }, [animate]);

  // Achievement-specific animations
  const achievementUnlock = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0, transform: 'scale(0) rotate(-180deg)' },
      { opacity: 1, transform: 'scale(1.2) rotate(0deg)', offset: 0.5 },
      { transform: 'scale(0.9) rotate(0deg)', offset: 0.7 },
      { opacity: 1, transform: 'scale(1) rotate(0deg)' }
    ], { duration: 800, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', ...config });
  }, [animate]);

  const xpGain = useCallback((element: HTMLElement | null, xpAmount: number, config?: AnimationConfig) => {
    // Create XP text element
    const xpText = document.createElement('div');
    xpText.textContent = `+${xpAmount} XP`;
    xpText.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      color: #22c55e;
      font-weight: bold;
      font-size: 1.2rem;
      pointer-events: none;
      z-index: 1000;
    `;
    
    if (element?.parentElement) {
      element.parentElement.appendChild(xpText);
      
      const animation = animate(xpText, [
        { opacity: 0, transform: 'translateX(-50%) translateY(30px) scale(0.8)' },
        { opacity: 1, transform: 'translateX(-50%) translateY(-10px) scale(1.1)', offset: 0.5 },
        { opacity: 0, transform: 'translateX(-50%) translateY(-40px) scale(1)' }
      ], { duration: 1500, ...config });

      animation?.addEventListener('finish', () => {
        xpText.remove();
      });

      return animation;
    }
    
    return null;
  }, [animate]);

  const levelUp = useCallback((element: HTMLElement | null, _newLevel: number, config?: AnimationConfig) => {
    // Add glow effect
    if (element) {
      element.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6)';
    }

    const animation = animate(element, [
      { 
        opacity: 0, 
        transform: 'scale(0.5) rotateY(-90deg)',
        filter: 'hue-rotate(0deg)'
      },
      { 
        opacity: 1, 
        transform: 'scale(1.2) rotateY(0deg)',
        filter: 'hue-rotate(180deg)',
        offset: 0.5
      },
      { 
        opacity: 1, 
        transform: 'scale(1) rotateY(0deg)',
        filter: 'hue-rotate(360deg)'
      }
    ], { duration: 1200, ...config });

    // Reset glow effect after animation
    animation?.addEventListener('finish', () => {
      if (element) {
        element.style.boxShadow = '';
      }
    });

    return animation;
  }, [animate]);

  const progressFill = useCallback((element: HTMLElement | null, percentage: number, config?: AnimationConfig) => {
    return animate(element, [
      { width: '0%' },
      { width: `${percentage}%` }
    ], { duration: 1000, easing: 'ease-out', ...config });
  }, [animate]);

  const cardFlip = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { transform: 'rotateY(0deg)' },
      { transform: 'rotateY(-90deg)', offset: 0.5 },
      { transform: 'rotateY(0deg)' }
    ], { duration: 600, ...config });
  }, [animate]);

  const notification = useCallback((element: HTMLElement | null, config?: AnimationConfig) => {
    return animate(element, [
      { opacity: 0, transform: 'translateX(100%) scale(0.8)' },
      { opacity: 1, transform: 'translateX(0) scale(1)' }
    ], { duration: 300, ...config });
  }, [animate]);

  // Staggered animations for lists
  const staggeredEntrance = useCallback((
    elements: HTMLElement[],
    animationType: 'fadeIn' | 'slideUp' | 'scaleIn' = 'fadeIn',
    staggerDelay: number = 100,
    config?: AnimationConfig
  ) => {
    const animations: Animation[] = [];
    
    elements.forEach((element, index) => {
      const delay = index * staggerDelay;
      const animationConfig = { ...config, delay };
      
      let animation: Animation | null = null;
      
      switch (animationType) {
        case 'fadeIn':
          animation = fadeIn(element, animationConfig);
          break;
        case 'slideUp':
          animation = slideUp(element, animationConfig);
          break;
        case 'scaleIn':
          animation = scaleIn(element, animationConfig);
          break;
      }
      
      if (animation) {
        animations.push(animation);
      }
    });
    
    return animations;
  }, [fadeIn, slideUp, scaleIn]);

  // Cancel animation by ID
  const cancelAnimation = useCallback((animationId: string) => {
    const animation = animationRefs.current.get(animationId);
    if (animation) {
      animation.cancel();
      animationRefs.current.delete(animationId);
    }
  }, []);

  // Cancel all animations
  const cancelAllAnimations = useCallback(() => {
    animationRefs.current.forEach(animation => {
      animation.cancel();
    });
    animationRefs.current.clear();
  }, []);

  return {
    animate,
    fadeIn,
    fadeOut,
    slideUp,
    slideDown,
    slideLeft,
    slideRight,
    scaleIn,
    scaleOut,
    bounce,
    shake,
    pulse,
    spin,
    achievementUnlock,
    xpGain,
    levelUp,
    progressFill,
    cardFlip,
    notification,
    staggeredEntrance,
    cancelAnimation,
    cancelAllAnimations
  };
}

// Hook for detecting animation support
export function useAnimationSupport() {
  const supportsAnimations = useCallback(() => {
    return typeof window !== 'undefined' && 
           'animate' in document.documentElement &&
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return { supportsAnimations: supportsAnimations() };
}

// Hook for respecting user's motion preferences
export function useReducedMotion() {
  const prefersReducedMotion = useCallback(() => {
    return typeof window !== 'undefined' && 
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return { prefersReducedMotion: prefersReducedMotion() };
}