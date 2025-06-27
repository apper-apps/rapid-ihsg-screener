import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md mx-auto"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <ApperIcon name="SearchX" className="w-12 h-12 text-primary" />
        </motion.div>

        <h1 className="text-4xl font-heading font-bold text-surface-900 mb-2">
          404
        </h1>
        
        <h2 className="text-xl font-medium text-surface-700 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-surface-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate('/')}
            icon="Home"
          >
            Back to Screener
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;