import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 1, type = 'table', className = '' }) => {
  const shimmerVariants = {
    initial: { backgroundPosition: '-200px 0' },
    animate: { 
      backgroundPosition: '200px 0',
      transition: {
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity
      }
    }
  };

  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
    backgroundSize: '200px 100%'
  };

  if (type === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="grid grid-cols-6 gap-4 p-4 border-b border-surface-100"
          >
            <div className="space-y-2">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-4 rounded"
                style={skeletonStyle}
              />
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-3 rounded w-3/4"
                style={skeletonStyle}
              />
            </div>
            
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-4 rounded"
              style={skeletonStyle}
            />
            
            <div className="space-y-1">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-3 rounded"
                style={skeletonStyle}
              />
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-3 rounded w-2/3"
                style={skeletonStyle}
              />
            </div>
            
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-4 rounded"
              style={skeletonStyle}
            />
            
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="h-6 rounded-full w-20"
              style={skeletonStyle}
            />
            
            <div className="space-y-1">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-4 rounded w-1/2"
                style={skeletonStyle}
              />
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-4 rounded w-3/4"
                style={skeletonStyle}
              />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 border border-surface-200 rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-4 w-24 rounded"
                style={skeletonStyle}
              />
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="h-6 w-6 rounded"
                style={skeletonStyle}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <motion.div
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    className="h-3 rounded"
                    style={skeletonStyle}
                  />
                  <motion.div
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    className="h-8 rounded"
                    style={skeletonStyle}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          variants={shimmerVariants}
          className="h-4 rounded"
          style={skeletonStyle}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;