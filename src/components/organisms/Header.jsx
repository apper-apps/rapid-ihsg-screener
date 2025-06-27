import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Header = ({ onExport, resultsCount, totalCount, loading }) => {
  const ihsgValue = 7245.73;
  const ihsgChange = 0.45;
  const ihsgChangePercent = 0.62;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-surface-200 px-6 py-4"
    >
      <div className="max-w-full flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-surface-900">
                IHSG Screener
              </h1>
              <p className="text-sm text-surface-600">
                Indonesian Stock Technical Analysis
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 pl-6 border-l border-surface-200">
            <div className="text-center">
              <div className="text-sm text-surface-600">IHSG Index</div>
              <div className="font-mono font-medium text-surface-900">
                {ihsgValue.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-surface-600">Change</div>
              <div className={`font-mono text-sm flex items-center ${
                ihsgChange >= 0 ? 'text-accent' : 'text-secondary'
              }`}>
                <ApperIcon 
                  name={ihsgChange >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                  className="w-3 h-3 mr-1" 
                />
                {ihsgChange >= 0 ? '+' : ''}{ihsgChange} ({ihsgChangePercent >= 0 ? '+' : ''}{ihsgChangePercent}%)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-sm text-surface-600">
            Showing <span className="font-medium text-surface-900">{resultsCount}</span> of{' '}
            <span className="font-medium text-surface-900">{totalCount}</span> stocks
          </div>
          
          <Button
            variant="secondary"
            icon="Download"
            onClick={onExport}
            disabled={loading || resultsCount === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Mobile IHSG info */}
      <div className="md:hidden mt-4 pt-4 border-t border-surface-100">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-xs text-surface-600">IHSG Index</div>
            <div className="font-mono text-sm font-medium text-surface-900">
              {ihsgValue.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-surface-600">Change</div>
            <div className={`font-mono text-xs flex items-center ${
              ihsgChange >= 0 ? 'text-accent' : 'text-secondary'
            }`}>
              <ApperIcon 
                name={ihsgChange >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                className="w-3 h-3 mr-1" 
              />
              {ihsgChange >= 0 ? '+' : ''}{ihsgChange} ({ihsgChangePercent >= 0 ? '+' : ''}{ihsgChangePercent}%)
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-surface-600">Results</div>
            <div className="text-sm font-medium text-surface-900">
              {resultsCount}/{totalCount}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;