import React from 'react';
import { LoadingButton } from '../LoadingStates';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = 'btn';
  const variantClass = variant === 'danger' ? 'btn-error' : `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  const classes = [baseClass, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <LoadingButton
        {...props}
        isLoading={loading}
        disabled={disabled}
        className={classes}
      >
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </LoadingButton>
    );
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={classes}
    >
      {icon && <span className="btn-icon mr-2">{icon}</span>}
      {children}
    </button>
  );
}

// Specialized button variants
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />;
}

export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="success" />;
}

export function WarningButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="warning" />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="danger" />;
}

// Icon button component
export function IconButton({
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <Button
      {...props}
      className={`!p-3 !justify-center !min-w-0 ${className}`}
    >
      {children}
    </Button>
  );
}

// Button group component
export function ButtonGroup({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          let buttonClassName = '';
          if (isFirst) {
            buttonClassName = '!rounded-r-none';
          } else if (isLast) {
            buttonClassName = '!rounded-l-none !-ml-px';
          } else {
            buttonClassName = '!rounded-none !-ml-px';
          }

          return React.cloneElement(child as React.ReactElement<any>, {
            className: `${(child as any).props.className || ''} ${buttonClassName}`.trim()
          });
        }
        return child;
      })}
    </div>
  );
}

export default Button;