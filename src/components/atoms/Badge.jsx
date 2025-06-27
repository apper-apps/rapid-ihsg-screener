import ApperIcon from '@/components/ApperIcon';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon,
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-surface-100 text-surface-700',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
    bullish: 'bg-accent/10 text-accent',
    bearish: 'bg-secondary/10 text-secondary',
    neutral: 'bg-surface-100 text-surface-600'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const badgeClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <span className={badgeClasses}>
      {icon && (
        <ApperIcon 
          name={icon} 
          className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} 
        />
      )}
      {children}
    </span>
  );
};

export default Badge;