import { useEffect, useRef } from 'react';
import { useAnimations } from '../hooks/useAnimations';

interface EnhancedToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  onHide: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function EnhancedToast({
  message,
  isVisible,
  type = 'success',
  onHide,
  duration = 4000,
  position = 'top-right'
}: EnhancedToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { notification, fadeOut } = useAnimations();

  useEffect(() => {
    if (isVisible && toastRef.current) {
      // Animate in
      notification(toastRef.current, { duration: 300 });

      // Set auto-hide timer
      timeoutRef.current = setTimeout(() => {
        handleHide();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, duration, notification]);

  const handleHide = async () => {
    if (toastRef.current) {
      // Animate out
      const animation = fadeOut(toastRef.current, { duration: 200 });
      animation?.addEventListener('finish', () => {
        onHide();
      });
    } else {
      onHide();
    }
  };

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-600'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      borderColor: 'border-red-600'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      borderColor: 'border-yellow-600'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      borderColor: 'border-blue-600'
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const config = typeConfig[type];
  const positionClass = positionClasses[position];

  return (
    <div
      ref={toastRef}
      className={`
        fixed ${positionClass} z-50 max-w-sm w-full mx-auto
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border-2 rounded-xl shadow-2xl p-4
        backdrop-blur-sm bg-opacity-95
        hover-lift touch-feedback
        animate-notification-bounce
        safe-area-top safe-area-right safe-area-left safe-area-bottom
      `}
      onClick={handleHide}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 text-xl animate-pulse">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">
            {message}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleHide();
          }}
          className="flex-shrink-0 ml-2 text-white/80 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-2 w-full bg-white/20 rounded-full h-1 overflow-hidden">
        <div
          className="h-full bg-white/60 rounded-full animate-progress-fill"
          style={{
            animation: `progressFill ${duration}ms linear`
          }}
        />
      </div>
    </div>
  );
}

// Enhanced Confetti Component
interface ConfettiProps {
  isActive: boolean;
  onComplete: () => void;
  colors?: string[];
  particleCount?: number;
  duration?: number;
}

export function EnhancedConfetti({
  isActive,
  onComplete,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'],
  particleCount = 50,
  duration = 3000
}: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Create particles
    const particles: HTMLDivElement[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${Math.random() * window.innerWidth}px;
        top: -20px;
        animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
      `;
      
      containerRef.current.appendChild(particle);
      particles.push(particle);
    }

    particlesRef.current = particles;

    // Clean up after animation
    const cleanup = setTimeout(() => {
      particles.forEach(particle => {
        if (particle.parentElement) {
          particle.parentElement.removeChild(particle);
        }
      });
      onComplete();
    }, duration);

    return () => {
      clearTimeout(cleanup);
      particles.forEach(particle => {
        if (particle.parentElement) {
          particle.parentElement.removeChild(particle);
        }
      });
    };
  }, [isActive, colors, particleCount, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        background: 'transparent'
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(${window.innerHeight + 20}px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// XP Gain Notification
interface XPNotificationProps {
  xp: number;
  isVisible: boolean;
  onComplete: () => void;
  position?: { x: number; y: number };
}

export function XPNotification({
  xp,
  isVisible,
  onComplete,
  position = { x: window.innerWidth / 2, y: 100 }
}: XPNotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);
  const { xpGain } = useAnimations();

  useEffect(() => {
    if (isVisible && notificationRef.current) {
      const animation = xpGain(notificationRef.current, xp, { duration: 1500 });
      animation?.addEventListener('finish', onComplete);
    }
  }, [isVisible, xp, xpGain, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={notificationRef}
      className="fixed pointer-events-none z-50 text-2xl font-bold text-green-500"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)'
      }}
    >
      +{xp} XP ⭐
    </div>
  );
}

// Achievement Unlock Notification
interface AchievementNotificationProps {
  title: string;
  description: string;
  icon: string;
  isVisible: boolean;
  onComplete: () => void;
}

export function AchievementNotification({
  title,
  description,
  icon,
  isVisible,
  onComplete
}: AchievementNotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);
  const { achievementUnlock } = useAnimations();

  useEffect(() => {
    if (isVisible && notificationRef.current) {
      const animation = achievementUnlock(notificationRef.current);
      animation?.addEventListener('finish', () => {
        setTimeout(onComplete, 3000); // Show for 3 seconds
      });
    }
  }, [isVisible, achievementUnlock, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        ref={notificationRef}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-2xl max-w-md mx-4 animate-achievement-glow celebration-sequence"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">{icon}</div>
          <h3 className="text-xl font-bold mb-1">Achievement Unlocked!</h3>
          <p className="text-lg font-semibold mb-2">{title}</p>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default EnhancedToast;