import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  ...props 
}, ref) => {
  const inputClasses = `
    w-full px-3 py-2 text-sm border border-surface-300 rounded-md
    placeholder-surface-400 transition-colors duration-150
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
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;