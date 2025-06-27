import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import FilterControl from '@/components/molecules/FilterControl';
import ApperIcon from '@/components/ApperIcon';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onClearAll,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addFilter = () => {
    const newFilter = {
      Id: Math.max(...filters.map(f => f.Id), 0) + 1,
      indicatorType: 'RSI',
      operator: '>',
      threshold: 50,
      enabled: true
    };
    onFiltersChange([...filters, newFilter]);
  };

  const updateFilter = (index, updatedFilter) => {
    const newFilters = [...filters];
    newFilters[index] = updatedFilter;
    onFiltersChange(newFilters);
  };

  const removeFilter = (index) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  };

  const activeFiltersCount = filters.filter(f => f.enabled).length;

  return (
    <Card className={`h-fit ${className}`}>
      <div className="p-4 border-b border-surface-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Filter" className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-surface-900">
              Stock Filters
            </h2>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon="RotateCcw"
              onClick={onClearAll}
              disabled={filters.length === 0}
            >
              Clear All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              icon={isCollapsed ? "ChevronDown" : "ChevronUp"}
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {filters.map((filter, index) => (
                  <motion.div
                    key={filter.Id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FilterControl
                      filter={filter}
                      onUpdate={(updatedFilter) => updateFilter(index, updatedFilter)}
                      onRemove={() => removeFilter(index)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {filters.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-surface-500"
                >
                  <ApperIcon name="Plus" className="w-8 h-8 mx-auto mb-2 text-surface-300" />
                  <p className="text-sm">No filters added yet</p>
                  <p className="text-xs text-surface-400 mt-1">
                    Add your first filter to start screening stocks
                  </p>
                </motion.div>
              )}

              <Button
                variant="secondary"
                icon="Plus"
                onClick={addFilter}
                className="w-full"
              >
                Add Filter
              </Button>

              {filters.length > 0 && (
                <div className="pt-3 border-t border-surface-100">
                  <div className="text-xs text-surface-500 space-y-1">
                    <div className="flex items-center">
                      <ApperIcon name="Info" className="w-3 h-3 mr-1" />
                      Filters are combined using AND logic
                    </div>
                    <div>All conditions must be met for a stock to appear in results</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default FilterPanel;