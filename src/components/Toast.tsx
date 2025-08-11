import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}

export function Toast({ message, isVisible, onHide }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  return (
    <div 
      className={`toast ${isVisible ? 'show' : ''}`}
      role="status" 
      aria-live="polite"
    >
      {message}
    </div>
  );
}

interface ConfettiProps {
  isActive: boolean;
  onComplete: () => void;
}

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: string; emoji: string; left: string; top: string; delay: string }>>([]);

  useEffect(() => {
    if (isActive) {
      const emojis = ['🌟', '🎉', '⚡', '🏆', '✨', '💎', '🔥'];
      const newParticles = Array.from({ length: 24 }, (_, i) => ({
        id: `particle-${i}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: `${Math.random() * 100}vw`,
        top: `${60 + Math.random() * 20}vh`,
        delay: `${Math.random() * 0.35}s`
      }));

      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="confetti" aria-hidden="true">
      {particles.map(particle => (
        <span
          key={particle.id}
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay
          }}
        >
          {particle.emoji}
        </span>
      ))}
    </div>
  );
}