import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-white border border-surface-200 rounded-lg';
  
  const cardClasses = `
    ${baseClasses}
    ${hover ? 'transition-all duration-150 hover:shadow-sm' : ''}
    ${className}
  `.trim();

  const motionProps = hover ? {
    whileHover: { y: -2 },
    transition: { duration: 0.15 }
  } : {};

  return (
    <motion.div
      className={cardClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;