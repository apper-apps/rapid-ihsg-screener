import { useState } from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const FilterControl = ({ 
  filter, 
  onUpdate, 
  onRemove,
  className = '' 
}) => {
  const [localFilter, setLocalFilter] = useState(filter);

const indicatorOptions = [
    { value: 'RSI', label: 'RSI (14)' },
    { value: 'MACD', label: 'MACD' },
    { value: 'SMA_20', label: 'SMA (20)' },
    { value: 'EMA_12', label: 'EMA (12)' },
    { value: 'PRICE', label: 'Stock Price' }
  ];

  const priceOperatorOptions = [
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater or equal (>=)' },
    { value: '<=', label: 'Less or equal (<=)' },
    { value: '=', label: 'Equal to (=)' },
    { value: 'between', label: 'Between range' }
  ];

  const isPrice = localFilter.indicatorType === 'PRICE';
  const showRangeInput = isPrice && localFilter.operator === 'between';

  const operatorOptions = [
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater or equal (>=)' },
    { value: '<=', label: 'Less or equal (<=)' },
    { value: '=', label: 'Equal to (=)' }
  ];

  const handleChange = (field, value) => {
    const updatedFilter = { ...localFilter, [field]: value };
    setLocalFilter(updatedFilter);
    onUpdate(updatedFilter);
  };

  return (
    <div className={`p-4 border border-surface-200 rounded-lg space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={localFilter.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary/50"
          />
          <span className="text-sm font-medium text-surface-700">
            Enable Filter
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon="X"
          onClick={onRemove}
          className="text-surface-400 hover:text-error"
        />
      </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          label="Indicator"
          value={localFilter.indicatorType}
          onChange={(e) => handleChange('indicatorType', e.target.value)}
          options={indicatorOptions}
          placeholder="Select indicator"
        />

        <Select
          label="Operator"
          value={localFilter.operator}
          onChange={(e) => handleChange('operator', e.target.value)}
          options={isPrice ? priceOperatorOptions : operatorOptions}
          placeholder="Select operator"
        />

        {!showRangeInput ? (
          <Input
            label={isPrice ? (localFilter.operator === 'between' ? 'Min Price' : 'Price') : 'Threshold'}
            type="number"
            step={isPrice ? "1" : "0.01"}
            value={localFilter.threshold}
            onChange={(e) => handleChange('threshold', parseFloat(e.target.value) || 0)}
            placeholder={isPrice ? "Enter price" : "Enter value"}
          />
        ) : (
          <div className="space-y-2">
            <Input
              label="Min Price"
              type="number"
              step="1"
              value={localFilter.threshold}
              onChange={(e) => handleChange('threshold', parseFloat(e.target.value) || 0)}
              placeholder="Minimum price"
            />
            <Input
              label="Max Price"
              type="number"
              step="1"
              value={localFilter.maxThreshold || ''}
              onChange={(e) => handleChange('maxThreshold', parseFloat(e.target.value) || 0)}
              placeholder="Maximum price"
            />
          </div>
        )}
      </div>

      {!localFilter.enabled && (
        <div className="text-xs text-surface-500 flex items-center">
          <ApperIcon name="Info" className="w-3 h-3 mr-1" />
          This filter is disabled and won't affect results
        </div>
      )}
    </div>
  );
};

export default FilterControl;