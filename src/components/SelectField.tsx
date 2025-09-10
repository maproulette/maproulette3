import type React from 'react';
import { Field, Label, Description, Select } from '@headlessui/react';

export interface SelectFieldProps {
  /** The name attribute for the select field */
  name: string;
  /** The current value of the select field */
  value: string | number;
  /** Callback function when the value changes */
  onChange: (value: string | number) => void;
  /** Array of options for the select field */
  options: { value: string | number; label: string }[];
  /** Label text for the field */
  label: string;
  /** Optional description text below the label */
  description?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * A reusable select field component built with Headless UI for accessibility
 * and consistent styling across the MapRoulette 4 application.
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  value,
  onChange,
  options,
  label,
  description,
  disabled = false,
  className = '',
  required = false,
}) => {
  return (
    <Field>
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <Description className="mt-1 text-xs text-gray-500">{description}</Description>
      )}
      <Select
        name={name}
        value={value}
        onChange={(e) => {
          const target = e.target as HTMLSelectElement;
          onChange(target.value);
        }}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        } ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
};
