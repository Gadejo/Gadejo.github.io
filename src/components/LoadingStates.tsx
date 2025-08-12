import React from 'react';

// Spinning loader component
export function Spinner({ size = 'medium', color = 'blue' }: { 
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'white' | 'gray';
}) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// Full page loading screen
export function PageLoader({ 
  message = 'Loading your learning journey...',
  icon = '🧠'
}: {
  message?: string;
  icon?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">{icon}</div>
        <Spinner size="large" />
        <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-sm mx-auto">
          {message}
        </p>
      </div>
    </div>
  );
}

// Skeleton components for content loading
export function SkeletonText({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      </div>
      
      {/* Content */}
      <SkeletonText lines={2} className="mb-4" />
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
          <div className="h-8 bg-blue-200 dark:bg-blue-800 rounded-full animate-pulse w-32" />
        </div>
        <SkeletonText lines={1} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
          </div>
        ))}
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// Inline loading state
export function InlineLoader({ 
  message = 'Loading...', 
  size = 'small' 
}: {
  message?: string;
  size?: 'small' | 'medium';
}) {
  return (
    <div className="flex items-center justify-center space-x-2 p-4">
      <Spinner size={size} />
      <span className="text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  isLoading = false, 
  disabled = false,
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`relative ${className} ${
        (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="small" color="white" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}

// Form field loading state
export function FieldLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    </div>
  );
}

// List skeleton
export function ListSkeleton({ 
  items = 5, 
  showImage = false,
  className = '' 
}: {
  items?: number;
  showImage?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
          {showImage && (
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

// Async content wrapper
export function AsyncContent({ 
  loading, 
  error, 
  children, 
  loadingComponent,
  errorComponent,
  retryAction
}: {
  loading: boolean;
  error: Error | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  retryAction?: () => void;
}) {
  if (loading) {
    return (
      <div>
        {loadingComponent || <InlineLoader />}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {errorComponent || (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            {retryAction && (
              <button
                onClick={retryAction}
                className="btn btn-primary"
              >
                🔄 Try Again
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// Progress bar component
export function ProgressBar({ 
  progress, 
  className = '',
  showPercentage = true,
  color = 'blue'
}: {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}