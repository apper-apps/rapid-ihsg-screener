import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import FilterControl from '@/components/molecules/FilterControl';
import ApperIcon from '@/components/ApperIcon';
import presetService from '@/services/api/presetService';
const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onClearAll,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const presetList = await presetService.getAll();
      setPresets(presetList);
    } catch (error) {
      toast.error('Failed to load filter presets');
    }
  };

  const handlePresetSelect = async (presetId) => {
    if (!presetId) {
      setSelectedPreset('');
      return;
    }

    try {
      setLoading(true);
      const preset = await presetService.getById(presetId);
      const filtersWithIds = preset.filters.map((filter, index) => ({
        Id: Math.max(...filters.map(f => f.Id), 0) + index + 1,
        ...filter
      }));
      onFiltersChange(filtersWithIds);
      setSelectedPreset(presetId);
      toast.success(`Applied preset: ${preset.name}`);
    } catch (error) {
      toast.error('Failed to load preset');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!saveForm.name.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    if (filters.length === 0) {
      toast.error('No filters to save');
      return;
    }

    try {
      setLoading(true);
      const presetData = {
        name: saveForm.name.trim(),
        description: saveForm.description.trim(),
        filters: filters.map(filter => ({
          indicatorType: filter.indicatorType,
          operator: filter.operator,
          threshold: filter.threshold,
          enabled: filter.enabled
        }))
      };

      await presetService.create(presetData);
      await loadPresets();
      setShowSaveModal(false);
      setSaveForm({ name: '', description: '' });
      toast.success('Filter preset saved successfully');
    } catch (error) {
      toast.error('Failed to save preset');
    } finally {
      setLoading(false);
    }
  };

  const presetOptions = [
    { value: '', label: 'Select a preset...' },
    ...presets.map(preset => ({
      value: preset.Id.toString(),
      label: preset.name
    }))
  ];
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

        {/* Preset Selection */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Bookmark" className="w-4 h-4 text-surface-600" />
            <span className="text-sm font-medium text-surface-700">Quick Presets</span>
          </div>
          
          <div className="flex space-x-2">
            <div className="flex-1">
              <Select
                value={selectedPreset}
                onChange={(e) => handlePresetSelect(e.target.value)}
                options={presetOptions}
                disabled={loading}
                className="w-full"
              />
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              icon="Save"
              onClick={() => setShowSaveModal(true)}
              disabled={filters.length === 0 || loading}
              title="Save current filters as preset"
            >
              Save
            </Button>
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

      {/* Save Preset Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-900">Save Filter Preset</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => setShowSaveModal(false)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Preset Name *
                  </label>
                  <Input
                    value={saveForm.name}
                    onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter preset name..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Description
                  </label>
                  <Input
                    value={saveForm.description}
                    onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    className="w-full"
                  />
                </div>

                <div className="bg-surface-50 rounded-lg p-3">
                  <div className="text-sm text-surface-600 mb-2">
                    <strong>Filters to save:</strong>
                  </div>
                  <div className="space-y-1 text-xs text-surface-500">
                    {filters.filter(f => f.enabled).map((filter, index) => (
                      <div key={index}>
                        {filter.indicatorType} {filter.operator} {filter.threshold}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowSaveModal(false)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSavePreset}
                    disabled={loading || !saveForm.name.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : 'Save Preset'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default FilterPanel;