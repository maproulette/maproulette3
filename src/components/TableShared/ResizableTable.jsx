import { useEffect, useState } from "react";
import React from "react";
import { FormattedMessage } from "react-intl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import "./ResizableTable.scss";

// Default input styles from the review table
export const inputStyles =
  "mr-py-2 mr-px-4 mr-border-none mr-placeholder-white-50 mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner mr-flex-grow mr-w-full mr-h-full mr-outline-none";

export const useDebounce = (callback, delay) => {
  const [timer, setTimer] = useState(null);

  return (value) => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => callback(value), delay);
    setTimer(newTimer);
  };
};

export const SearchFilter = ({
  value: filterValue,
  onChange: setFilter,
  placeholder,
  inputClassName = inputStyles,
  delay = 300,
}) => {
  const [inputValue, setInputValue] = useState(filterValue || "");
  const debouncedSetFilter = useDebounce(setFilter, delay);

  return (
    <div
      className="mr-relative mr-w-full mr-flex mr-items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        className={inputClassName}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          debouncedSetFilter(e.target.value || undefined);
        }}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export const ClearFiltersControl = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="mr-text-green-lighter mr-text-sm hover:mr-text-white mr-ml-4"
    >
      <FormattedMessage defaultMessage="Clear Filters" />
    </button>
  );
};

export const useColumnWidthStorage = (storageKey) => {
  // Load saved column widths from localStorage
  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const savedWidths = localStorage.getItem(storageKey);
      return savedWidths ? JSON.parse(savedWidths) : {};
    } catch (e) {
      return {};
    }
  });

  const saveColumnWidths = (newWidths) => {
    const updatedWidths = { ...columnWidths, ...newWidths };
    setColumnWidths(updatedWidths);

    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedWidths));
    } catch (e) {
      console.warn("Failed to save column widths to localStorage", e);
    }
  };

  return [columnWidths, saveColumnWidths];
};

export const useResizingState = (columnResizing, headerGroups, columnWidths, saveColumnWidths) => {
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const isCurrentlyResizing = !!columnResizing.isResizingColumn;

    // When resizing ends, store the new column widths
    if (isResizing && !isCurrentlyResizing) {
      const newColumnWidths = {};
      headerGroups.forEach((headerGroup) => {
        headerGroup.headers.forEach((column) => {
          if (column.id) {
            newColumnWidths[column.id] = column.width;
          }
        });
      });
      saveColumnWidths(newColumnWidths);
    }

    setIsResizing(isCurrentlyResizing);

    // Add a class to the body during resizing to prevent other interactions
    if (isCurrentlyResizing) {
      document.body.classList.add("resizing-active");
    } else {
      document.body.classList.remove("resizing-active");
    }
  }, [columnResizing.isResizingColumn, headerGroups, saveColumnWidths, isResizing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("resizing-active");
    };
  }, []);

  return isResizing;
};

// A wrapper component for tables to provide consistent container styling
export const TableContainer = React.forwardRef(({ children, className = "", onScroll }, ref) => {
  return (
    <div
      ref={ref}
      className={`mr-table-container mr-overflow-x-auto ${className}`}
      onScroll={onScroll}
    >
      {children}
    </div>
  );
});

export const renderTableHeader = (headerGroups, isResizing, columnResizing) => {
  return headerGroups.map((headerGroup) => (
    <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
      {headerGroup.headers.map((column) => {
        // Create separate handlers for sorting and resizing
        const headerProps = column.getHeaderProps();
        const sortByProps = !column.disableSortBy ? column.getSortByToggleProps() : {};

        // Make sure to prevent click event conflicts
        const onHeaderClick = (e) => {
          if (!column.disableSortBy && !columnResizing.isResizingColumn && !isResizing) {
            sortByProps.onClick(e);
          }
        };

        return (
          <th
            key={column.id}
            className={`mr-text-left mr-px-2 mr-py-2 mr-border-b mr-border-white-10 ${
              !column.disableSortBy && !isResizing ? "mr-sortable-header" : ""
            }`}
            {...headerProps}
            onClick={onHeaderClick}
            style={{
              ...headerProps.style,
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.width,
              position: "relative",
              cursor: isResizing ? "col-resize" : !column.disableSortBy ? "pointer" : "auto",
              overflow: "hidden",
            }}
          >
            <div className="mr-header-content">
              <div className="mr-flex mr-items-center mr-justify-between">
                <div
                  className="mr-flex mr-items-center mr-whitespace-nowrap"
                  style={{
                    cursor: !column.disableSortBy && !isResizing ? "pointer" : "auto",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span>{column.render("Header")}</span>
                  {!column.disableSortBy && (
                    <span className="mr-ml-1 mr-opacity-70">
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          " ▼"
                        ) : (
                          " ▲"
                        )
                      ) : (
                        <span className="mr-text-xs mr-opacity-50 mr-inline-block">↕</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              {column.canFilter && (
                <div
                  className="mr-header-filter mr-mr-2"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    overflow: "hidden",
                    maxWidth: "100%",
                  }}
                >
                  {column.render("Filter")}
                </div>
              )}
              {!column.disableResizing && (
                <div
                  className={`mr-resizer ${column.isResizing ? "mr-isResizing" : ""}`}
                  {...column.getResizerProps()}
                  onClick={(e) => {
                    // Stop propagation to prevent sorting when clicking resize handle
                    e.stopPropagation();
                  }}
                />
              )}
            </div>
          </th>
        );
      })}
    </tr>
  ));
};
