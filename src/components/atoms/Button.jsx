import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 focus:ring-surface-300',
    ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus:ring-surface-300',
    danger: 'bg-error text-white hover:bg-error/90 focus:ring-error/50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-sm rounded',
    lg: 'px-6 py-3 text-base rounded-md'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  const motionProps = disabled || loading ? {} : {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  };

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {loading && (
        <ApperIcon 
          name="Loader2" 
          className="w-4 h-4 mr-2 animate-spin" 
        />
      )}
      {!loading && icon && (
        <ApperIcon 
          name={icon} 
          className="w-4 h-4 mr-2" 
        />
      )}
      {children}
    </motion.button>
  );
};

export default Button;