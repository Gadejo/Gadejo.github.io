import { useRef, useEffect } from 'react';
import { useAnimations } from '../../hooks/useAnimations';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: string;
  animate?: boolean;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = '#3b82f6',
  animate = true,
  className = '',
  onClick
}: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const { slideUp, pulse } = useAnimations();

  // Entrance animation
  useEffect(() => {
    if (animate && cardRef.current) {
      slideUp(cardRef.current, { duration: 400 });
    }
  }, [animate, slideUp]);

  // Value animation
  useEffect(() => {
    if (animate && valueRef.current) {
      // Animate number counting if value is a number
      if (typeof value === 'number') {
        let startValue = 0;
        const endValue = value;
        const duration = 1500;
        const startTime = performance.now();

        const animateValue = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease out cubic function
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutCubic);
          
          if (valueRef.current) {
            valueRef.current.textContent = currentValue.toString();
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateValue);
          }
        };
        
        requestAnimationFrame(animateValue);
      }
    }
  }, [animate, value]);

  const handleClick = () => {
    if (onClick) {
      if (cardRef.current) {
        pulse(cardRef.current, { duration: 300 });
      }
      onClick();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isPositive !== false ? '📈' : '📉';
  };

  const getTrendColor = () => {
    if (!trend) return '';
    return trend.isPositive !== false ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div
      ref={cardRef}
      className={`metric-card ${onClick ? 'clickable' : ''} ${className}`}
      onClick={handleClick}
      style={{ '--accent-color': color } as React.CSSProperties}
    >
      <div className="metric-header">
        <div className="metric-title-row">
          {icon && <span className="metric-icon">{icon}</span>}
          <h3 className="metric-title">{title}</h3>
        </div>
        {trend && (
          <div className={`metric-trend ${getTrendColor()}`}>
            <span className="trend-icon">{getTrendIcon()}</span>
            <span className="trend-value">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="metric-content">
        <div 
          ref={valueRef}
          className="metric-value"
        >
          {value}
        </div>
        {subtitle && (
          <div className="metric-subtitle">{subtitle}</div>
        )}
        {trend && (
          <div className="metric-trend-label">
            {trend.label}
          </div>
        )}
      </div>

      {/* Progress bar for visual emphasis */}
      <div className="metric-progress-bar">
        <div 
          className="metric-progress-fill"
          style={{
            backgroundColor: color,
            animation: animate ? 'progressFillIn 1.5s ease-out 0.5s both' : 'none'
          }}
        />
      </div>

      <style>{`
        .metric-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }

        .metric-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .metric-card.clickable {
          cursor: pointer;
        }

        .metric-card.clickable:hover {
          border-color: var(--accent-color);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1), 0 0 0 1px var(--accent-color, #3b82f6);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
        }

        .metric-title-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .metric-icon {
          font-size: 1.25rem;
          opacity: 0.8;
        }

        .metric-title {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-gray-600);
          letter-spacing: 0.025em;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.75rem;
          font-weight: 600;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--color-gray-50);
          border-radius: var(--border-radius);
        }

        .trend-icon {
          font-size: 0.875rem;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-gray-900);
          line-height: 1.1;
          font-variant-numeric: tabular-nums;
        }

        .metric-subtitle {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin-top: var(--spacing-xs);
        }

        .metric-trend-label {
          font-size: 0.75rem;
          color: var(--color-gray-500);
          margin-top: var(--spacing-xs);
        }

        .metric-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--color-gray-100);
        }

        .metric-progress-fill {
          height: 100%;
          width: 100%;
          background: var(--accent-color);
          transform: scaleX(0);
          transform-origin: left;
        }

        .text-green-600 {
          color: #10b981;
        }

        .text-red-600 {
          color: #ef4444;
        }

        @keyframes progressFillIn {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .metric-card {
            background: var(--color-gray-800);
            border-color: var(--color-gray-700);
          }

          .metric-title {
            color: var(--color-gray-300);
          }

          .metric-value {
            color: var(--color-gray-100);
          }

          .metric-subtitle {
            color: var(--color-gray-400);
          }

          .metric-trend-label {
            color: var(--color-gray-500);
          }

          .metric-trend {
            background: var(--color-gray-700);
          }

          .metric-progress-bar {
            background: var(--color-gray-700);
          }
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .metric-value {
            font-size: 1.75rem;
          }

          .metric-header {
            flex-direction: column;
            gap: var(--spacing-sm);
          }

          .metric-trend {
            align-self: flex-start;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .metric-card.clickable:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
}