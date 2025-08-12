import { Suspense, ReactNode } from 'react';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string;
}

export function LazyLoader({ 
  children, 
  fallback, 
  minHeight = '200px' 
}: LazyLoaderProps) {
  const defaultFallback = (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight,
        background: 'var(--color-gray-50)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--color-gray-200)',
        fontSize: '2rem'
      }}
    >
      <div className="animate-spin">⚡</div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}