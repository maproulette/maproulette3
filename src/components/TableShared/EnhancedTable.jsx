import React, { useState, useEffect } from "react";
import "./EnhancedTable.scss";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import { headerStyles, inputStyles, sortableHeaderStyles, tableWrapperStyles } from "./TableStyles";

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
export const SearchFilter = ({
  value,
  onChange,
  placeholder,
  inputClassName = "",
  onClear,
  type = "text",
}) => {
  const [localValue, setLocalValue] = useState(value || "");
  const debouncedValue = useDebounce(localValue, 1000);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue || "");
    }
  }, [debouncedValue]);

  const handleClear = () => {
    setLocalValue("");
    if (onClear) {
      onClear();
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="mr-flex mr-items-center mr-flex-1">
      <input
        type={type === "number" ? type : "text"} // Use text for number to allow better control
        className={inputClassName || inputStyles}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
        inputMode={type === "number" ? "numeric" : "text"}
        pattern={type === "number" ? "[0-9]*" : undefined}
      />
      {localValue && (
        <button
          className="mr-text-white hover:mr-text-green-lighter mr-transition-colors mr-ml-2"
          onClick={handleClear}
          type="button"
        >
          <SvgSymbol
            sym="icon-close"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-2.5 mr-h-2.5"
          />
        </button>
      )}
    </div>
  );
};

/**
 * Renders a consistent table header from react-table's headerGroups
 */
export const renderTableHeader = (headerGroups, props = {}) => {
  const currentSort = props.criteria?.sortCriteria;

  return (
    <>
      {headerGroups.map((headerGroup, index) => (
        <tr {...headerGroup.getHeaderGroupProps()} key={`header-row-${headerGroup.id || index}`}>
          {headerGroup.headers.map((column) => {
            const headerProps = column.getHeaderProps();

            // Make sure to prevent click event conflicts
            const onHeaderClick = (e) => {
              if (!column.disableSortBy) {
                if (!props.updateCriteria) return;

                const currentSort = props.criteria?.sortCriteria;
                let newSortCriteria;
                const columnId = column.id;
                if (!currentSort || currentSort.sortBy !== columnId) {
                  newSortCriteria = { sortBy: columnId, direction: "ASC" };
                } else if (currentSort.direction === "ASC") {
                  newSortCriteria = { sortBy: columnId, direction: "DESC" };
                } else {
                  newSortCriteria = { sortBy: "name", direction: "DESC" };
                }

                props.updateCriteria({ sortCriteria: newSortCriteria });
              }
            };

            return (
              <th
                key={`header-cell-${column.id}`}
                className={`${headerStyles} ${!column.disableSortBy ? sortableHeaderStyles : ""}`}
                {...headerProps}
                onClick={onHeaderClick}
                style={{
                  ...headerProps.style,
                  width: column.width,
                  position: "relative",
                }}
              >
                <div className="mr-header-content mr-flex mr-items-center mr-justify-between">
                  <div
                    className="mr-flex mr-items-center mr-flex-1 mr-min-w-0"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      className="mr-truncate mr-flex-1"
                      title={
                        typeof column.render("Header") === "string" ? column.render("Header") : ""
                      }
                    >
                      {column.render("Header")}
                    </span>
                  </div>
                  <div className="mr-flex mr-items-center mr-flex-shrink-0 mr-ml-2">
                    {!column.disableSortBy && (
                      <span className="mr-opacity-70 mr-text-sm">
                        {!(!currentSort || currentSort.sortBy !== column.id) ? (
                          currentSort.direction === "DESC" ? (
                            "▼"
                          ) : (
                            "▲"
                          )
                        ) : (
                          <span className="mr-text-xs mr-opacity-50">↕</span>
                        )}
                      </span>
                    )}
                    {!column.disableResizing && (
                      <div
                        className="mr-resizer"
                        {...column.getResizerProps()}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    )}
                  </div>
                </div>
              </th>
            );
          })}
        </tr>
      ))}

      {/* Add a separate row for filters */}
      {headerGroups.map((headerGroup, index) => (
        <tr key={`filter-row-${headerGroup.id}-${index}`}>
          {headerGroup.headers.map((column) => (
            <td
              key={`filter-cell-${column.id}`}
              style={{
                width: column.width,
              }}
            >
              {column.canFilter && (
                <div
                  className="mr-header-filter mr-mr-2"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    overflow: "hidden",
                  }}
                >
                  {column.render("Filter")}
                </div>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * A table wrapper component that adds horizontal scrolling
 */
export const TableWrapper = ({ children, className = "" }) => (
  <div className={`${tableWrapperStyles} ${className}`} style={{ overflowX: "auto" }}>
    <div className="mr-inline-block mr-min-w-full">{children}</div>
  </div>
);

/**
 * Renders a table cell with nowrap styling
 * @param {Object} cell - The react-table cell object
 * @param {Object} options - Additional styling options
 * @returns {JSX.Element} - The rendered table cell
 */
export const renderTableCell = (cell, row, cellIndex, options = {}) => {
  return (
    <td
      key={`cell-${row.original.id}-${cell.column.id}-${cellIndex}`}
      {...cell.getCellProps()}
      style={{
        ...cell.getCellProps().style,
        whiteSpace: "nowrap !important",
        overflow: "hidden !important",
        textOverflow: "ellipsis !important",
        ...options,
      }}
    >
      <div
        style={{
          overflow: "hidden !important",
          textOverflow: "ellipsis !important",
          whiteSpace: "nowrap !important",
          width: "100%",
          display: "block",
        }}
      >
        {cell.render("Cell")}
      </div>
    </td>
  );
};
