interface InfluurPulseLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InfluurPulseLogo({ className = '', size = 'md' }: InfluurPulseLogoProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-3xl',
  };

  return (
    <span className={`font-bold tracking-tight ${sizeClasses[size]} ${className}`}>
      <span className="text-primary">influur</span>
      <span className="text-foreground">pulse</span>
    </span>
  );
}
