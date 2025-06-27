import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  message = "Something went wrong",
  onRetry,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <ApperIcon 
          name="AlertCircle" 
          className="w-8 h-8 text-error" 
        />
      </div>
      
      <h3 className="text-lg font-medium text-surface-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-surface-500 mb-6 max-w-sm mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={onRetry}
            icon="RefreshCw"
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ErrorState;