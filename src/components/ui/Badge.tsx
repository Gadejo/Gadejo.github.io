import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  dot = false,
  style
}: BadgeProps) {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };
  
  const classes = [
    baseClass,
    variantClass,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} style={style}>
      {dot && (
        <div className="w-2 h-2 rounded-full bg-current opacity-75 mr-1.5" />
      )}
      {children}
    </span>
  );
}

// Specialized badge variants
export function StatusBadge({
  status,
  ...props
}: Omit<BadgeProps, 'variant' | 'children'> & {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
}) {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active', dot: true },
    inactive: { variant: 'gray' as const, label: 'Inactive', dot: true },
    pending: { variant: 'warning' as const, label: 'Pending', dot: true },
    completed: { variant: 'success' as const, label: 'Completed', dot: true },
    failed: { variant: 'error' as const, label: 'Failed', dot: true }
  };

  const config = statusConfig[status];
  
  return (
    <Badge {...props} variant={config.variant} dot={config.dot}>
      {config.label}
    </Badge>
  );
}

export function NumberBadge({
  count,
  max = 99,
  showZero = false,
  ...props
}: Omit<BadgeProps, 'children'> & {
  count: number;
  max?: number;
  showZero?: boolean;
}) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge {...props}>
      {displayCount}
    </Badge>
  );
}

export function LevelBadge({
  level,
  ...props
}: Omit<BadgeProps, 'children' | 'variant'> & {
  level: number;
}) {
  const getLevelVariant = (level: number): BadgeProps['variant'] => {
    if (level >= 10) return 'primary';
    if (level >= 5) return 'success';
    if (level >= 2) return 'warning';
    return 'gray';
  };

  return (
    <Badge {...props} variant={getLevelVariant(level)}>
      Level {level}
    </Badge>
  );
}

export function StreakBadge({
  streak,
  ...props
}: Omit<BadgeProps, 'children' | 'variant'> & {
  streak: number;
}) {
  const getStreakVariant = (streak: number): BadgeProps['variant'] => {
    if (streak >= 30) return 'primary';
    if (streak >= 7) return 'success';
    if (streak >= 3) return 'warning';
    return 'gray';
  };

  const getStreakIcon = (streak: number): string => {
    if (streak >= 30) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '✨';
    return '🎯';
  };

  return (
    <Badge {...props} variant={getStreakVariant(streak)}>
      {getStreakIcon(streak)} {streak} day{streak !== 1 ? 's' : ''}
    </Badge>
  );
}

export function XPBadge({
  xp,
  showLabel = true,
  ...props
}: Omit<BadgeProps, 'children' | 'variant'> & {
  xp: number;
  showLabel?: boolean;
}) {
  const formatXP = (xp: number): string => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  return (
    <Badge {...props} variant="primary">
      ⭐ {formatXP(xp)}{showLabel ? ' XP' : ''}
    </Badge>
  );
}

// Achievement badge with special styling
export function AchievementBadge({
  achievement,
  unlocked = false,
  progress,
  ...props
}: Omit<BadgeProps, 'children' | 'variant'> & {
  achievement: string;
  unlocked?: boolean;
  progress?: number;
}) {
  const variant = unlocked ? 'success' : 'gray';
  const emoji = unlocked ? '🏆' : '🔒';

  return (
    <Badge 
      {...props} 
      variant={variant} 
      className={`relative ${unlocked ? 'animate-pulse' : ''} ${props.className || ''}`}
    >
      {emoji} {achievement}
      {!unlocked && progress !== undefined && (
        <div className="ml-1 text-xs opacity-60">
          ({Math.round(progress * 100)}%)
        </div>
      )}
    </Badge>
  );
}

// Time badge for session durations
export function TimeBadge({
  minutes,
  ...props
}: Omit<BadgeProps, 'children'> & {
  minutes: number;
}) {
  const formatTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const getTimeVariant = (minutes: number): BadgeProps['variant'] => {
    if (minutes >= 60) return 'success';
    if (minutes >= 30) return 'primary';
    if (minutes >= 15) return 'warning';
    return 'gray';
  };

  return (
    <Badge {...props} variant={getTimeVariant(minutes)}>
      ⏱️ {formatTime(minutes)}
    </Badge>
  );
}

export default Badge;