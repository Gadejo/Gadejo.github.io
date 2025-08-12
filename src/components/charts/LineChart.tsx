import { useRef, useEffect, useState } from 'react';
import { useAnimations } from '../../hooks/useAnimations';
import type { TimeSeriesPoint } from './ChartUtils';

interface LineChartProps {
  data: TimeSeriesPoint[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showPoints?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  className?: string;
}

export function LineChart({
  data,
  width = 400,
  height = 200,
  color = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.1)',
  showPoints = true,
  showGrid = true,
  animate = true,
  className = ''
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { fadeIn } = useAnimations();

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate scales
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  const xScale = (index: number) => (index / (data.length - 1 || 1)) * chartWidth + padding;
  const yScale = (value: number) => height - padding - ((value - minValue) / valueRange) * chartHeight;

  // Generate path data
  const generatePath = (data: TimeSeriesPoint[]) => {
    if (data.length === 0) return '';
    
    const pathCommands = data.map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    return pathCommands.join(' ');
  };

  const generateFillPath = (data: TimeSeriesPoint[]) => {
    if (data.length === 0) return '';
    
    const linePath = generatePath(data);
    // const lastPoint = data[data.length - 1];
    // const firstPoint = data[0];
    
    const x1 = xScale(0);
    const x2 = xScale(data.length - 1);
    const bottom = yScale(minValue);
    
    return `${linePath} L ${x2} ${bottom} L ${x1} ${bottom} Z`;
  };

  // Animation effect
  useEffect(() => {
    if (animate && pathRef.current && !isVisible) {
      const path = pathRef.current;
      const length = path.getTotalLength();
      
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      
      setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 1.5s ease-out';
        path.style.strokeDashoffset = '0';
        setIsVisible(true);
      }, 100);
    }
  }, [animate, isVisible]);

  // Fade in effect
  useEffect(() => {
    if (svgRef.current) {
      fadeIn(svgRef.current as any, { duration: 600 });
    }
  }, [fadeIn]);

  const formatValue = (value: number) => {
    if (value >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${value}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`line-chart-container ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="line-chart-svg"
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="chart-grid">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding + ratio * chartHeight;
              return (
                <line
                  key={`h-${ratio}`}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })}
            {/* Vertical grid lines */}
            {data.map((_, index) => {
              if (index % Math.ceil(data.length / 5) !== 0) return null;
              const x = xScale(index);
              return (
                <line
                  key={`v-${index}`}
                  x1={x}
                  y1={padding}
                  x2={x}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })}
          </g>
        )}

        {/* Fill area */}
        {data.length > 0 && (
          <path
            d={generateFillPath(data)}
            fill={fillColor}
            className="chart-fill"
          />
        )}

        {/* Line */}
        {data.length > 0 && (
          <path
            ref={pathRef}
            d={generatePath(data)}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line"
          />
        )}

        {/* Data points */}
        {showPoints && data.map((point, index) => {
          const x = xScale(index);
          const y = yScale(point.value);
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke={color}
                strokeWidth="3"
                className="chart-point"
                style={{
                  animation: animate ? `pointFadeIn 0.5s ease-out ${index * 0.1}s both` : 'none'
                }}
              />
              {/* Tooltip on hover */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="transparent"
                className="chart-point-hover"
                data-value={formatValue(point.value)}
                data-date={formatDate(point.date)}
              />
            </g>
          );
        })}

        {/* Y-axis labels */}
        <g className="y-axis-labels">
          {[0, 0.5, 1].map((ratio) => {
            const y = padding + (1 - ratio) * chartHeight;
            const value = minValue + ratio * valueRange;
            return (
              <text
                key={`y-label-${ratio}`}
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                className="chart-label"
                fontSize="12"
                fill="#6b7280"
              >
                {formatValue(Math.round(value))}
              </text>
            );
          })}
        </g>

        {/* X-axis labels */}
        <g className="x-axis-labels">
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 4) !== 0) return null;
            const x = xScale(index);
            return (
              <text
                key={`x-label-${index}`}
                x={x}
                y={height - padding + 16}
                textAnchor="middle"
                className="chart-label"
                fontSize="11"
                fill="#6b7280"
              >
                {formatDate(point.date)}
              </text>
            );
          })}
        </g>
      </svg>

      <style>{`
        .line-chart-container {
          position: relative;
          overflow: visible;
        }

        .line-chart-svg {
          overflow: visible;
        }

        .chart-point-hover:hover + * {
          opacity: 0.8;
        }

        .chart-point:hover {
          r: 6;
          filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
        }

        @keyframes pointFadeIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .chart-label {
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .chart-line {
          filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2));
        }

        .chart-fill {
          opacity: 0.6;
        }

        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          .chart-grid line {
            stroke: #374151;
          }
          
          .chart-label {
            fill: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
}