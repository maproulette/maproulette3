import React, { useState, useEffect } from "react";
import "./EnhancedTable.scss";
import { inputStyles } from "./TableStyles";

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - The debounced value
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * A simple search filter component for react-table
 */
export const SearchFilter = ({ value, onChange, placeholder, inputClassName = "" }) => {
  const [localValue, setLocalValue] = useState(value || "");
  const debouncedValue = useDebounce(localValue, 1000);

  useEffect(() => {
    if (localValue !== value) {
      setLocalValue(value || "");
    }
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue || undefined);
    }
  }, [debouncedValue]);

  return (
    <input
      type="text"
      className={inputClassName || inputStyles}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
    />
  );
};
