import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import { Fragment, useMemo, useState } from "react";
import { injectIntl } from "react-intl";
import { useTable, useExpanded, useSortBy, useResizeColumns } from "react-table";
import ConfigureColumnsModal from "../../components/ConfigureColumnsModal/ConfigureColumnsModal";
import WithTargetUser from "../../components/HOCs/WithTargetUser/WithTargetUser";
import TaskCommentsModal from "../../components/TaskCommentsModal/TaskCommentsModal";
import AsManager from "../../interactions/User/AsManager";
import WithConfigurableColumns from "../HOCs/WithConfigurableColumns/WithConfigurableColumns";
import PaginationControl from "../PaginationControl/PaginationControl";
import { rowStyles, tableStyles } from "../TableShared/TableStyles";
import ViewTask from "../ViewTask/ViewTask";
import messages from "./Messages";
import TaskAnalysisTableHeader from "./TaskAnalysisTableHeader";
import { ALL_COLUMNS, DEFAULT_COLUMNS } from "./columns";
import { setupColumnTypes } from "./setupColumnTypes";

/**
 * TaskAnalysisTable renders a table of tasks using react-table.  Rendering is
 * performed from summary info, like that given by clusteredTasks, but an
 * individual task can be expanded to see additional details provided by
 * the ViewTask component.
 *
 * @see See ViewTask
 * @see See [react-table](https://react-table.js.org)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const TaskAnalysisTableInternal = (props) => {
  const [openComments, setOpenComments] = useState(null);
  const [showConfigureColumns, setShowConfigureColumns] = useState(false);

  const columnTypes = useMemo(() => {
    let taskBaseRoute = null;

    if (!Array.isArray(props.showColumns) || props.showColumns.indexOf("controls") !== -1) {
      if (!_isObject(props.challenge) || !_isObject(props.challenge.parent)) {
        return null;
      }

      taskBaseRoute = `/admin/project/${props.challenge.parent.id}/challenge/${props.challenge.id}/task`;
    }

    return setupColumnTypes(props, taskBaseRoute, AsManager(props.user), setOpenComments);
  }, [props.showColumns, props.challenge?.parent?.id, props.challenge?.id, props.taskBundle]);

  const columns = useMemo(() => {
    if (!columnTypes) return [];

    const baseColumns = [
      {
        id: "expander",
        Header: "",
        Cell: ({ row }) => (
          <span {...row.getToggleRowExpandedProps()} className="mr-cursor-pointer mr-select-none">
            {row.isExpanded ? "▼" : "▶"}
          </span>
        ),
        width: 40,
        disableSortBy: true,
        disableResizing: true,
      },
    ];

    if (Array.isArray(props.showColumns) && props.showColumns.length > 0) {
      return [
        ...baseColumns,
        ...props.showColumns.map((columnId) => columnTypes[columnId]).filter(Boolean),
      ];
    } else {
      const findColumn = (column) => {
        if (column.startsWith(":")) {
          const key = column.slice(1);
          return {
            id: key,
            Header: key,
            Cell: ({ row }) => {
              const display = row.original.geometries?.features?.[0]?.properties?.[key];
              return <div>{display ?? ""}</div>;
            },
            disableSortBy: true,
          };
        } else {
          return columnTypes[column];
        }
      };

      return [
        ...baseColumns,
        columnTypes.selected,
        ...Object.keys(props.addedColumns || {})
          .map(findColumn)
          .filter(Boolean),
      ];
    }
  }, [columnTypes, props.showColumns, props.addedColumns, props.taskBundle]);

  const data = useMemo(() => {
    const tasks = props.taskData || [];
    if (props.criteria?.sortCriteria?.direction === "DESC") {  
      return [...tasks].reverse();
    }
    return tasks;
  }, [props.taskData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      manualSortBy: true, // All sorting handled by backend
      autoResetExpanded: false,
      autoResetSortBy: false,
      defaultColumn: {
        minWidth: 20,
        width: 60,
      },
      columnResizeMode: 'onChange', // Independent column resizing
    },
    useResizeColumns,
    useSortBy,
    useExpanded
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  // Handle sorting changes by updating backend criteria
  const handleSortChange = (columnId) => {
    if (!props.updateCriteria) return;
    
    const currentSort = props.criteria?.sortCriteria;
    let newSortCriteria;
    
    if (!currentSort || currentSort.sortBy !== columnId) {
      // No current sort on this column, add ascending
      newSortCriteria = { sortBy: columnId, direction: "ASC" };
    } else if (currentSort.direction === "ASC") {
      // Currently ascending, change to descending
      newSortCriteria = { sortBy: columnId, direction: "DESC" };
    } else {
      // Currently descending, remove sort (back to default)
      newSortCriteria = { sortBy: "name", direction: "DESC" };
    }
    
    props.updateCriteria({ sortCriteria: newSortCriteria });
  };

  return (
    <Fragment>
      <section className="mr-my-4 mr-min-h-100 mr-fixed-containing-block mr-relative">
        {!props.suppressHeader && (
          <header className="mr-mb-4">
            <TaskAnalysisTableHeader
              {...props}
              countShown={data.length}
              configureColumns={() => setShowConfigureColumns(true)}
            />
          </header>
        )}

        {props.loadingTasks && (
          <div className="mr-absolute mr-inset-0 mr-flex mr-items-center mr-justify-center mr-bg-black-75 mr-z-10">
            <div className="mr-text-white mr-text-lg">Loading...</div>
          </div>
        )}

        <div className="mr-overflow-x-auto">
          <table {...getTableProps()} className={tableStyles} style={{ minWidth: 'max-content' }}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <Fragment key={headerGroup.id}>
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps()}
                      className={`mr-px-2 mr-text-left mr-border-gray-600 mr-relative ${column.canResize ? "mr-border-r mr-border-gray-500" : ""}`}
                      key={column.id}
                      style={{
                        ...column.getHeaderProps().style,
                        width: column.width,
                        minWidth: column.minWidth,
                        overflow: 'hidden',
                      }}
                    >
                      <div className="mr-flex mr-items-center mr-justify-between mr-overflow-hidden">
                        <span className="mr-truncate mr-flex-1">{column.render("Header")}</span>
                        {!column.disableSortBy && (
                          <button
                            className="mr-ml-2 mr-text-gray-400 hover:mr-text-white mr-cursor-pointer mr-flex-shrink-0"
                            onClick={() => handleSortChange(column.id)}
                          >
                            {(() => {
                              const currentSort = props.criteria?.sortCriteria;
                              if (!currentSort || currentSort.sortBy !== column.id) return "↕";
                              return currentSort.direction === "DESC" ? "▼" : "▲";
                            })()}
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
                  {headerGroup.headers.map((column) => (
                    <th
                      key={`filter-${column.id}`}
                      className="mr-px-2"
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        overflow: 'hidden',
                      }}
                    >
                      <div className="mr-overflow-hidden">
                        {column.Filter ? column.render("Filter") : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </Fragment>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <Fragment key={row.id}>
                  <tr
                    {...row.getRowProps()}
                    className={`${row.isExpanded ? "mr-bg-black-10" : ""} ${rowStyles}`}
                  >
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        className="mr-px-2"
                        style={{
                          ...cell.getCellProps().style,
                          width: cell.column.width,
                          minWidth: cell.column.minWidth,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>

                  {row.isExpanded && (
                    <tr>
                      <td colSpan={columns.length} className="mr-p-0">
                        <ViewTask
                          taskId={row.original.id}
                          taskGeometries={row.original.geometries}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          </table>
        </div>

        <PaginationControl
          currentPage={props.criteria?.page || 0}
          pageCount={Math.ceil((props.totalTaskCount || 0) / (props.criteria?.pageSize || 20))}
          pageSize={props.criteria?.pageSize || 20}
          gotoPage={(page) => props.updateCriteria({ page })}
          setPageSize={(pageSize) => props.updateCriteria({ pageSize, page: 0 })}
          previousPage={() => props.updateCriteria({ page: Math.max(0, (props.criteria?.page || 0) - 1) })}
          nextPage={() => {
            const maxPage = Math.ceil((props.totalTaskCount || 0) / (props.criteria?.pageSize || 20)) - 1;
            props.updateCriteria({ page: Math.min(maxPage, (props.criteria?.page || 0) + 1) });
          }}
        />
      </section>

      {Number.isFinite(openComments) && (
        <TaskCommentsModal taskId={openComments} onClose={() => setOpenComments(null)} />
      )}
      {showConfigureColumns && (
        <ConfigureColumnsModal {...props} onClose={() => setShowConfigureColumns(false)} />
      )}
    </Fragment>
  );
};

export default injectIntl(
  WithTargetUser(
    WithConfigurableColumns(TaskAnalysisTableInternal, ALL_COLUMNS, DEFAULT_COLUMNS, messages),
  ),
);
