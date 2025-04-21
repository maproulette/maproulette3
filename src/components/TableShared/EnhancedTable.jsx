import React from "react";
import "./EnhancedTable.scss";
import { headerStyles, inputStyles, sortableHeaderStyles, tableWrapperStyles } from "./TableStyles";

/**
 * A simple search filter component for react-table
 */
export const SearchFilter = ({ value, onChange, placeholder, inputClassName = "" }) => (
  <input
    type="text"
    className={inputClassName || inputStyles}
    value={value || ""}
    onChange={(e) => onChange(e.target.value || undefined)}
    placeholder={placeholder}
    onClick={(e) => e.stopPropagation()}
  />
);

/**
 * Renders a consistent table header from react-table's headerGroups
 */
export const renderTableHeader = (headerGroups) => {
  return (
    <>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
          {headerGroup.headers.map((column) => {
            const headerProps = column.getHeaderProps();
            const sortByProps = column.getSortByToggleProps ? column.getSortByToggleProps() : {};

            // Make sure to prevent click event conflicts
            const onHeaderClick = (e) => {
              if (column.getSortByToggleProps && !column.disableSortBy) {
                sortByProps.onClick(e);
              }
            };

            return (
              <th
                key={column.id}
                className={`${headerStyles} ${!column.disableSortBy ? sortableHeaderStyles : ""}`}
                {...headerProps}
                onClick={onHeaderClick}
                style={{
                  ...headerProps.style,
                  width: column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.width,
                  position: "relative",
                }}
              >
                <div className="mr-header-content">
                  <div className="mr-flex mr-items-center mr-justify-between">
                    <div
                      className="mr-flex mr-items-center mr-whitespace-nowrap"
                      style={{
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
                  {!column.disableResizing && (
                    <div
                      className={`mr-resizer`}
                      {...column.getResizerProps?.()}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      ))}

      {/* Add a separate row for filters */}
      {headerGroups.map((headerGroup) => (
        <tr key={`filter-${headerGroup.id}`}>
          {headerGroup.headers.map((column) => (
            <td
              key={`filter-${column.id}`}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.width,
              }}
            >
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
  <div
    className={`${tableWrapperStyles} ${className}`}
    style={{ maxWidth: "100%", overflowX: "auto" }}
  >
    <div className="mr-inline-block mr-min-w-full">{children}</div>
  </div>
);
