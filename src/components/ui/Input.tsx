import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`;
  const hasError = !!error;
  
  const inputClasses = [
    'form-input',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          {...props}
          ref={ref}
          id={inputId}
          className={inputClasses}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div className="mt-1 text-xs text-gray-500">
          {helpText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Specialized input variants
export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  ...props
}: InputProps & {
  onSearch?: (value: string) => void;
}) {
  return (
    <Input
      {...props}
      type="search"
      placeholder={placeholder}
      leftIcon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      onChange={(e) => {
        props.onChange?.(e);
        onSearch?.(e.target.value);
      }}
    />
  );
}

export function EmailInput(props: Omit<InputProps, 'type'>) {
  return (
    <Input
      {...props}
      type="email"
      leftIcon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      }
    />
  );
}

export function PasswordInput({
  showToggle = true,
  ...props
}: InputProps & {
  showToggle?: boolean;
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      leftIcon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      }
      rightIcon={showToggle ? (
        <button
          type="button"
          className="pointer-events-auto"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      ) : undefined}
    />
  );
}

export function NumberInput({
  min,
  max,
  step = 1,
  ...props
}: InputProps & {
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Input
      {...props}
      type="number"
      min={min}
      max={max}
      step={step}
    />
  );
}

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helpText,
  containerClassName = '',
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 11)}`;
  const hasError = !!error;
  
  const textareaClasses = [
    'form-input',
    'resize-y',
    hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      
      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        rows={rows}
        className={textareaClasses}
      />
      
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div className="mt-1 text-xs text-gray-500">
          {helpText}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helpText,
  options,
  placeholder,
  containerClassName = '',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 11)}`;
  const hasError = !!error;
  
  const selectClasses = [
    'form-input',
    'pr-10',
    hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          {...props}
          ref={ref}
          id={selectId}
          className={selectClasses}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div className="mt-1 text-xs text-gray-500">
          {helpText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Input;