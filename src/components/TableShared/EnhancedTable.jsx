import React, { useState, useEffect, Fragment } from "react";
import "./EnhancedTable.scss";
import { inputStyles, tableWrapperStyles } from "./TableStyles";

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

/**
 * Renders a consistent table header from react-table's headerGroups
 */
export const renderTableHeader = (headerGroups, props) => {
  const handleSortChange = (columnId) => {
    if (!props.updateCriteria) return;

    const currentSort = props.criteria?.sortCriteria;
    let newSortCriteria;

    if (!currentSort || currentSort.sortBy !== columnId) {
      newSortCriteria = { sortBy: columnId, direction: "ASC" };
    } else if (currentSort.direction === "ASC") {
      newSortCriteria = { sortBy: columnId, direction: "DESC" };
    } else {
      newSortCriteria = { sortBy: "name", direction: "DESC" };
    }

    props.updateCriteria({ sortCriteria: newSortCriteria });
  };
  const currentSort = props.criteria?.sortCriteria;

  return (
    <>
      {headerGroups.map((headerGroup, headerGroupIndex) => (
        <Fragment key={`header-group-${headerGroupIndex}`}>
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, columnIndex) => (
              <th
                {...column.getHeaderProps()}
                className={`mr-px-2 mr-text-left mr-border-gray-600 mr-relative ${column.canResize ? "mr-border-r mr-border-gray-500" : ""}`}
                key={`header-${column.id}-${columnIndex}`}
                style={{
                  ...column.getHeaderProps().style,
                  width: column.width,
                  minWidth: column.minWidth,
                  overflow: "hidden",
                }}
              >
                <div
                  className="mr-relative mr-overflow-hidden"
                  style={{ paddingRight: !column.disableSortBy ? "24px" : "8px" }}
                >
                  <div className="mr-truncate">{column.render("Header")}</div>
                  {!column.disableSortBy && (
                    <button
                      className="mr-absolute mr-right-0 mr-top-0 mr-bottom-0 mr-w-6 mr-h-full mr-flex mr-items-center mr-justify-center mr-text-gray-400 hover:mr-text-white mr-cursor-pointer mr-text-xs mr-z-20"
                      onClick={() => handleSortChange(column.id)}
                      title={`Sort by ${column.Header || column.id}`}
                    >
                      {!currentSort || currentSort.sortBy !== column.id
                        ? "↕"
                        : currentSort.direction === "DESC"
                          ? "▼"
                          : "▲"}
                    </button>
                  )}
                </div>
                {column.canResize && (
                  <div
                    {...column.getResizerProps()}
                    className="mr-absolute mr-right-0 mr-top-0 mr-w-1 mr-h-full mr-bg-gray-400 mr-cursor-col-resize hover:mr-bg-blue-400 hover:mr-scale-x-3 mr-transition-all mr-z-10"
                  />
                )}
              </th>
            ))}
          </tr>
          <tr>
            {headerGroup.headers.map((column, columnIndex) => (
              <th key={`filter-${column.id}-${columnIndex}`} className="mr-px-2">
                <div>{column.Filter ? column.render("Filter") : null}</div>
              </th>
            ))}
          </tr>
        </Fragment>
      ))}
    </>
  );
};

/**
 * A table wrapper component that adds horizontal scrolling
 */
export const TableWrapper = ({ children, className = "" }) => (
  <div
    className={`${tableWrapperStyles} ${className}`}
    style={{ maxWidth: "100%", overflowX: "auto" }}
  >
    <div className="mr-inline-block mr-min-w-full">{children}</div>
  </div>
);

/**
 * Renders a table cell with nowrap styling
 * @param {Object} cell - The react-table cell object
 * @param {Object} options - Additional styling options
 * @returns {JSX.Element} - The rendered table cell
 */
export const renderTableCell = (cell, row, cellIndex) => {
  return (
    <td
      key={`cell-${row.original.id}-${cell.column.id}-${cellIndex}`}
      {...cell.getCellProps()}
      className="mr-px-2"
      style={{
        ...cell.getCellProps().style,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {cell.render("Cell")}
    </td>
  );
};
