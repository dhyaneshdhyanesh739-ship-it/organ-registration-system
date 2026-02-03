import { cn } from '../../utils/cn';

const Select = ({ 
  label, 
  error, 
  options = [], 
  className,
  containerClassName,
  id,
  required,
  ...props 
}) => {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${selectId}-error`;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        className={cn(
          'w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg transition-all duration-200 outline-none cursor-pointer focus:ring-2',
          error 
            ? 'border-red-500 focus:ring-red-500/50' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-transparent',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <span aria-hidden="true">⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export default Select;
