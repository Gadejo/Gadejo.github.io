import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  loading?: boolean;
  error?: Error | null;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  hover = false, 
  loading = false,
  error = null,
  onClick 
}: CardProps) {
  const baseClass = 'card';
  const hoverClass = hover || onClick ? 'card-hover' : '';
  const loadingClass = loading ? 'opacity-75' : '';
  const errorClass = error ? 'border-red-300 bg-red-50' : '';
  
  const classes = [baseClass, hoverClass, loadingClass, errorClass, className]
    .filter(Boolean)
    .join(' ');

  const CardComponent = onClick ? 'button' : 'div';

  if (loading) {
    return (
      <div className={classes}>
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes}>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <p className="text-red-600 text-sm">
              {error.message || 'Something went wrong'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CardComponent 
      className={classes} 
      onClick={onClick}
      style={onClick ? { cursor: 'pointer', border: 'none', padding: 0, background: 'none' } : undefined}
    >
      {children}
    </CardComponent>
  );
}

export function CardHeader({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
}

// Card title component
export function CardTitle({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

// Card subtitle component
export function CardSubtitle({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

// Loading skeleton for cards
export function CardSkeleton() {
  return (
    <>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-8 bg-gray-200 rounded-full animate-pulse w-20" />
        </div>
      </CardFooter>
    </>
  );
}

// Specialized card variants
export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  trendDirection = 'up',
  className = '' 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600', 
    neutral: 'text-gray-600'
  };

  return (
    <Card className={className}>
      <CardBody className="!p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon && (
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={`text-xs font-medium ${trendColors[trendDirection]}`}>
              {trend}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function ActionCard({
  title,
  description,
  icon,
  action,
  disabled = false,
  className = ''
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Card 
      hover={!disabled}
      onClick={disabled ? undefined : action}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <CardBody className="text-center py-8">
        {icon && (
          <div className="text-4xl mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </CardBody>
    </Card>
  );
}

export default Card;