import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = forwardRef(({ 
  label, 
  error, 
  options = [],
  className = '', 
  placeholder = 'Select an option',
  ...props 
}, ref) => {
  const selectClasses = `
    w-full px-3 py-2 pr-10 text-sm border border-surface-300 rounded-md
    bg-white appearance-none transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    ${error ? 'border-error focus:border-error focus:ring-error/50' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ApperIcon name="ChevronDown" className="w-4 h-4 text-surface-400" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;