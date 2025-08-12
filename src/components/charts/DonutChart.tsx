import { useRef, useEffect, useState } from 'react';
import { useAnimations } from '../../hooks/useAnimations';
import type { ChartDataPoint } from './ChartUtils';

interface DonutChartProps {
  data: ChartDataPoint[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
  animate?: boolean;
  className?: string;
  centerContent?: React.ReactNode;
}

export function DonutChart({
  data,
  size = 200,
  innerRadius = 60,
  showLegend = true,
  showPercentages = true,
  animate = true,
  className = '',
  centerContent
}: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animatedData, setAnimatedData] = useState<ChartDataPoint[]>([]);
  const { fadeIn } = useAnimations();

  const radius = size / 2;
  const outerRadius = radius - 10;
  const center = radius;

  // Calculate totals and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }));

  // Animation effect
  useEffect(() => {
    if (animate) {
      setAnimatedData([]);
      const timer = setTimeout(() => {
        setAnimatedData(dataWithPercentages);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedData(dataWithPercentages);
    }
  }, [data, animate]);

  // Fade in effect
  useEffect(() => {
    if (svgRef.current) {
      fadeIn(svgRef.current as any, { duration: 600 });
    }
  }, [fadeIn]);

  // Generate SVG path for arc
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    innerR: number,
    outerR: number
  ) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = center + outerR * Math.cos(startAngleRad);
    const y1 = center + outerR * Math.sin(startAngleRad);
    const x2 = center + outerR * Math.cos(endAngleRad);
    const y2 = center + outerR * Math.sin(endAngleRad);
    
    const x3 = center + innerR * Math.cos(endAngleRad);
    const y3 = center + innerR * Math.sin(endAngleRad);
    const x4 = center + innerR * Math.cos(startAngleRad);
    const y4 = center + innerR * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} 
            A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}
            Z`;
  };

  // Calculate arc positions
  let currentAngle = 0;
  const arcs = animatedData.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      ...item,
      startAngle,
      endAngle,
      path: createArcPath(startAngle, endAngle, innerRadius, outerRadius),
      midAngle: startAngle + angle / 2,
      index
    };
  });

  const formatValue = (value: number) => {
    if (value >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${value}m`;
  };

  return (
    <div className={`donut-chart-container ${className}`}>
      <div className="chart-content">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="donut-chart-svg"
        >
          {/* Chart segments */}
          {arcs.map((arc, index) => (
            <g key={index}>
              <path
                d={arc.path}
                fill={arc.color}
                className="chart-segment"
                style={{
                  animation: animate ? `segmentDraw 1s ease-out ${index * 0.1}s both` : 'none'
                }}
                data-label={arc.label}
                data-value={formatValue(arc.value)}
                data-percentage={`${((arc.value / total) * 100).toFixed(1)}%`}
              />
              
              {/* Emoji labels */}
              {arc.emoji && ((arc.value / total) * 100) > 8 && (
                <text
                  x={center + (outerRadius - 20) * Math.cos((arc.midAngle - 90) * Math.PI / 180)}
                  y={center + (outerRadius - 20) * Math.sin((arc.midAngle - 90) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="segment-emoji"
                  fontSize="16"
                  style={{
                    animation: animate ? `emojiAppear 0.5s ease-out ${(index * 0.1) + 0.8}s both` : 'none'
                  }}
                >
                  {arc.emoji}
                </text>
              )}
            </g>
          ))}
          
          {/* Center content */}
          {centerContent && (
            <foreignObject
              x={center - innerRadius + 10}
              y={center - innerRadius + 10}
              width={innerRadius * 2 - 20}
              height={innerRadius * 2 - 20}
            >
              <div className="center-content">
                {centerContent}
              </div>
            </foreignObject>
          )}
        </svg>

        {showLegend && (
          <div className="chart-legend">
            {dataWithPercentages.map((item, index) => (
              <div 
                key={index} 
                className="legend-item"
                style={{
                  animation: animate ? `legendSlide 0.5s ease-out ${index * 0.1 + 0.5}s both` : 'none'
                }}
              >
                <div className="legend-color-indicator">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.emoji && <span className="legend-emoji">{item.emoji}</span>}
                </div>
                <div className="legend-details">
                  <div className="legend-label">{item.label}</div>
                  <div className="legend-value">
                    {formatValue(item.value)}
                    {showPercentages && (
                      <span className="legend-percentage">
                        ({((item.value / total) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .donut-chart-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }

        .chart-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }

        .donut-chart-svg {
          overflow: visible;
        }

        .chart-segment {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .chart-segment:hover {
          filter: brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.2));
          transform-origin: ${center}px ${center}px;
          transform: scale(1.02);
        }

        .segment-emoji {
          pointer-events: none;
          font-weight: bold;
        }

        .center-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          min-width: 200px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-xs);
          border-radius: var(--border-radius);
          transition: background-color 0.2s ease;
        }

        .legend-item:hover {
          background-color: var(--color-gray-50);
        }

        .legend-color-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          min-width: 32px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .legend-emoji {
          font-size: 14px;
        }

        .legend-details {
          flex: 1;
        }

        .legend-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-gray-900);
        }

        .legend-value {
          font-size: 0.75rem;
          color: var(--color-gray-600);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .legend-percentage {
          color: var(--color-gray-500);
        }

        @keyframes segmentDraw {
          0% {
            opacity: 0;
            transform: scale(0);
            transform-origin: ${center}px ${center}px;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes emojiAppear {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes legendSlide {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .legend-item:hover {
            background-color: var(--color-gray-800);
          }
          
          .legend-label {
            color: var(--color-gray-100);
          }
          
          .legend-value {
            color: var(--color-gray-400);
          }
          
          .center-content {
            color: var(--color-gray-400);
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .chart-content {
            flex-direction: column;
          }
          
          .chart-legend {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
}