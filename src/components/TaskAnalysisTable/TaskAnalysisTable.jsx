import { differenceInSeconds, parseISO } from "date-fns";
import _debounce from "lodash/debounce";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _kebabCase from "lodash/kebabCase";
import _pick from "lodash/pick";
import PropTypes from "prop-types";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import {
  useBlockLayout,
  useFilters,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from "react-table";
import BusySpinner from "../../components/BusySpinner/BusySpinner";
import ConfigureColumnsModal from "../../components/ConfigureColumnsModal/ConfigureColumnsModal";
import WithTargetUser from "../../components/HOCs/WithTargetUser/WithTargetUser";
import IntlDatePicker from "../../components/IntlDatePicker/IntlDatePicker";
import InTableTagFilter from "../../components/KeywordAutosuggestInput/InTableTagFilter";
import TaskCommentsModal from "../../components/TaskCommentsModal/TaskCommentsModal";
import AsColoredHashable from "../../interactions/Hashable/AsColoredHashable";
import AsCooperativeWork from "../../interactions/Task/AsCooperativeWork";
import AsManager from "../../interactions/User/AsManager";
import { TaskPriority, messagesByPriority } from "../../services/Task/TaskPriority/TaskPriority";
import { messagesByReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import {
  TaskReviewStatus,
  isMetaReviewStatus,
  messagesByMetaReviewStatus,
} from "../../services/Task/TaskReview/TaskReviewStatus";
import { keysByStatus, messagesByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import { TaskStatus } from "../../services/Task/TaskStatus/TaskStatus";
import WithConfigurableColumns from "../HOCs/WithConfigurableColumns/WithConfigurableColumns";
import WithLoadedTask from "../HOCs/WithLoadedTask/WithLoadedTask";
import PaginationControl from "../PaginationControl/PaginationControl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import ViewTask from "../ViewTask/ViewTask";
import messages from "./Messages";
import TaskAnalysisTableHeader from "./TaskAnalysisTableHeader";
import { StatusLabel, ViewCommentsButton, makeInvertable } from "./TaskTableHelpers";

// Setup child components with necessary HOCs
const ViewTaskSubComponent = WithLoadedTask(({ task, taskId, ...props }) => {
  if (!task) {
    return <BusySpinner />;
  }

  return <ViewTask task={task} {...props} />;
});

const ALL_COLUMNS = Object.assign(
  {
    featureId: {},
    id: {},
    status: {},
    priority: {},
    completedDuration: {},
    mappedOn: {},
    editBundle: {},
    reviewStatus: { group: "review" },
    reviewRequestedBy: { group: "review" },
    reviewedBy: { group: "review" },
    reviewedAt: { group: "review" },
    reviewDuration: { group: "review" },
    controls: { permanent: true },
    comments: {},
    tags: {},
    additionalReviewers: { group: "review" },
  },
  window.env.REACT_APP_FEATURE_META_QC === "enabled"
    ? {
        metaReviewStatus: { group: "review" },
        metaReviewedBy: { group: "review" },
        metaReviewedAt: { group: "review" },
      }
    : null,
);

const DEFAULT_COLUMNS = [
  "featureId",
  "id",
  "status",
  "priority",
  "controls",
  "comments",
  "editBundle",
];

// Define which columns are sortable - matching TasksReviewTable
const sortableColumns = [
  "id",
  "status",
  "priority",
  "mappedOn",
  "reviewedAt",
  "completedDuration",
  "reviewRequestedBy",
  "metaReviewedBy",
  "reviewDuration",
  "reviewedBy",
  "metaReviewedAt",
  "reviewStatus",
  "metaReviewStatus",
];

const renderColumnHeader = (column) => {
  const header = column.render("Header");

  return (
    <div className="mr-flex mr-flex-col">
      <div className="mr-flex mr-items-center">{header}</div>
      {column.canFilter && column.Filter ? column.render("Filter") : null}
    </div>
  );
};

const FilterInput = ({ column: { filterValue, setFilter, id }, placeholder }) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState(filterValue || "");

  useEffect(() => {
    if (filterValue !== undefined && filterValue !== value) {
      setValue(filterValue || "");
    }
  }, [filterValue]);

  const debouncedSetFilter = useMemo(
    () =>
      _debounce((value) => {
        if (id === "id" && value) {
          const numValue = Number(value);
          setFilter(!isNaN(numValue) ? numValue : undefined);
        } else {
          setFilter(value || undefined);
        }
      }, 1000),
    [setFilter, id],
  );

  const handleChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let newValue = e.target.value;

    if (id === "id" && newValue) {
      newValue = newValue.replace(/[^\d]/g, "");
    }

    setValue(newValue);
    debouncedSetFilter(newValue);
  };

  const handleBlur = (e) => {
    if (e.relatedTarget?.className?.includes("mr-input")) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    return () => {
      debouncedSetFilter.flush();
      debouncedSetFilter.cancel();
    };
  }, [debouncedSetFilter]);

  return (
    <input
      ref={inputRef}
      type={id === "id" ? "number" : "text"}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      placeholder={placeholder}
      className="mr-input mr-px-2 mr-py-1 mr-w-full"
    />
  );
};

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
  const [columnWidths, setColumnWidths] = useState({});
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(null);
  const [expandedRowIds, setExpandedRowIds] = useState({});

  // Memoize the column types setup to prevent unnecessary recalculations
  const columnTypes = useMemo(() => {
    let taskBaseRoute = null;

    if (!Array.isArray(props.showColumns) || props.showColumns.indexOf("controls") !== -1) {
      if (!_isObject(props.challenge) || !_isObject(props.challenge.parent)) {
        return {};
      }

      taskBaseRoute = `/admin/project/${props.challenge.parent.id}/challenge/${props.challenge.id}/task`;
    }

    return setupColumnTypes(props, taskBaseRoute, AsManager(props.user), setOpenComments);
  }, []);

  const handleStateChange = useCallback(
    ({ sortBy, pageIndex, filters }) => {
      const newCriteria = {
        sortCriteria:
          sortBy.length > 0
            ? {
                sortBy: sortBy[0].id,
                direction: sortBy[0].desc ? "DESC" : "ASC",
              }
            : undefined,
        page: pageIndex,
        filters: Object.fromEntries(
          Object.entries(filters || {}).map(([key, value]) => [key, value]),
        ),
      };

      const currentCriteria = _pick(props.criteria, Object.keys(newCriteria));

      if (!_isEqual(newCriteria, currentCriteria)) {
        props.updateCriteria({ ...props.criteria, ...newCriteria });
      }
    },
    [props.updateCriteria, props.criteria],
  );

  const data = useMemo(() => {
    if (!props.taskData) return [];
    if (!props.criteria?.sortCriteria) return props.taskData;

    const { sortBy, direction } = props.criteria.sortCriteria;
    const sorted = [...props.taskData].sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || a.title)?.localeCompare(b.name || b.title) ?? 0;
      } else if (sortBy === "reviewDuration") {
        const getDuration = (t) => {
          if (!t.reviewedAt || !t.reviewStartedAt) return 0;
          return differenceInSeconds(parseISO(t.reviewedAt), parseISO(t.reviewStartedAt));
        };
        return getDuration(a) - getDuration(b);
      } else {
        return a[sortBy] < b[sortBy] ? -1 : a[sortBy] > b[sortBy] ? 1 : 0;
      }
    });

    return direction === "DESC" ? sorted.reverse() : sorted;
  }, [props.taskData, props.criteria?.sortCriteria]);

  const memoizedColumns = useMemo(() => {
    if (!columnTypes || Object.keys(columnTypes).length === 0) {
      return [];
    }

    // Apply sortable column configuration
    const typesWithSortConfig = { ...columnTypes };
    Object.keys(typesWithSortConfig).forEach((columnId) => {
      if (typesWithSortConfig[columnId]) {
        typesWithSortConfig[columnId].disableSortBy = !sortableColumns.includes(columnId);
      }
    });

    if (Array.isArray(props.showColumns) && props.showColumns.length > 0) {
      return props.showColumns
        .map((columnId) => {
          const col = typesWithSortConfig[columnId];

          if (columnWidths[columnId] && col) {
            return {
              ...col,
              width: columnWidths[columnId],
            };
          }
          return col;
        })
        .filter(Boolean);
    } else {
      const findColumn = (column) => {
        if (column.startsWith(":")) {
          const key = column.slice(1);
          return {
            id: key,
            Header: key,
            Cell: ({ row }) => {
              const display = row.original.geometries?.features?.[0]?.properties?.[key];
              return row.original ? <div>{display ?? ""}</div> : null;
            },
            width: columnWidths[key] || 120,
            disableSortBy: true,
          };
        } else {
          const col = typesWithSortConfig[column];

          if (columnWidths[column] && col) {
            return {
              ...col,
              width: columnWidths[column],
            };
          }
          return col;
        }
      };

      return [
        typesWithSortConfig.selected,
        ...Object.keys(props.addedColumns || {})
          .map(findColumn)
          .filter(Boolean),
      ];
    }
  }, [props.showColumns, props.addedColumns, columnTypes, columnWidths]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { sortBy, columnResizing },
  } = useTable(
    {
      columns: memoizedColumns,
      data,
      manualSortBy: true,
      manualFilters: true,
      manualPagination: true,
      defaultColumn: {
        minWidth: 80,
        width: 150,
        disableSortBy: true,
      },
      initialState: {
        sortBy: props.criteria?.sortCriteria
          ? [
              {
                id: props.criteria.sortCriteria.sortBy,
                desc: props.criteria.sortCriteria.direction === "DESC",
              },
            ]
          : [],
        pageSize: props.pageSize || 20,
        pageIndex: props.page || 0,
      },

      getSubRows: () => [],
      disableMultiSort: true,
      disableSortRemove: true,
    },
    useBlockLayout,
    useResizeColumns,
    useFilters,
    useSortBy,
    usePagination,
  );

  useEffect(() => {
    if (
      columnResizing.isResizingColumn === null &&
      Object.keys(columnResizing.columnWidths).length > 0
    ) {
      setColumnWidths((prev) => ({
        ...prev,
        ...columnResizing.columnWidths,
      }));
    }
  }, [columnResizing]);

  useEffect(() => {
    const filters = {};
    headerGroups.forEach((headerGroup) => {
      headerGroup.headers.forEach((column) => {
        if (column.filterValue) {
          filters[column.id] = column.filterValue;
        }
      });
    });

    handleStateChange({
      sortBy,
      pageIndex: props.page || 0,
      filters,
    });
  }, [headerGroups, sortBy, handleStateChange, props.page]);

  const toggleRowExpanded = useCallback((rowId) => {
    setExpandedRowIds((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  // Add useEffect to handle outside clicks
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (columnDropdownOpen !== null) {
        setColumnDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [columnDropdownOpen]);

  return (
    <Fragment>
      <section className="mr-my-4 mr-min-h-100 mr-fixed-containing-block">
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
          <div className="mr-absolute mr-inset-0 mr-flex mr-items-center mr-justify-center mr-bg-black-50 mr-z-10">
            <div className="mr-bg-black-85 mr-text-white mr-py-2 mr-px-4 mr-rounded">
              Loading...
            </div>
          </div>
        )}

        <div className="mr-max-w-full mr-overflow-x-auto">
          <div {...getTableProps()} className="mr-table mr-w-max">
            <div className="mr-bg-black-15">
              {headerGroups.map((headerGroup) => (
                <div {...headerGroup.getHeaderGroupProps()} className="mr-flex">
                  {/* Add an expander column */}
                  <div className="mr-p-2 mr-w-10 mr-border-b mr-border-white-10"></div>

                  {headerGroup.headers.map((column) => (
                    <div
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={`mr-p-2 mr-font-medium mr-relative mr-border-r mr-border-white-10 mr-text-white ${
                        !column.disableSortBy ? "mr-cursor-pointer hover:mr-bg-black-10" : ""
                      } ${
                        column.isSorted
                          ? column.isSortedDesc
                            ? "mr-border-b-2 mr-border-b-green-lighter"
                            : "mr-border-t-2 mr-border-t-green-lighter"
                          : "mr-border-b mr-border-white-10"
                      }`}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                      }}
                    >
                      {renderColumnHeader(column)}

                      {column.canResize && (
                        <div
                          {...column.getResizerProps()}
                          className={`mr-absolute mr-right-0 mr-top-0 mr-h-full mr-w-2 mr-bg-gray-400 mr-opacity-50 hover:mr-opacity-100 mr-cursor-col-resize ${
                            column.isResizing ? "mr-opacity-100" : ""
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                const isExpanded = !!expandedRowIds[row.id];

                return (
                  <Fragment key={row.id}>
                    <div
                      {...row.getRowProps()}
                      className={`mr-flex mr-border-b mr-border-white-10 ${
                        isExpanded ? "mr-bg-black-25" : "hover:mr-bg-black-10"
                      }`}
                    >
                      {/* Enhanced expander cell with better styling */}
                      <div
                        className="mr-p-2 mr-w-10 mr-flex mr-items-center mr-justify-center mr-cursor-pointer hover:mr-bg-black-25"
                        onClick={() => toggleRowExpanded(row.id)}
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        <SvgSymbol
                          sym={isExpanded ? "icon-cheveron-down" : "icon-cheveron-right"}
                          viewBox="0 0 20 20"
                          className="mr-fill-current mr-w-4 mr-h-4"
                        />
                      </div>

                      {row.cells.map((cell) => (
                        <div
                          {...cell.getCellProps()}
                          className="mr-p-2 mr-border-r mr-border-white-10"
                          style={{
                            width: cell.column.width,
                            minWidth: cell.column.minWidth,
                          }}
                        >
                          {cell.render("Cell")}
                        </div>
                      ))}
                    </div>

                    {/* Render expanded content with transition */}
                    {isExpanded && (
                      <ViewTaskSubComponent
                        taskId={row.original.id}
                        key={`task-${row.original.id}`}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <PaginationControl
          currentPage={props.page ?? 0}
          totalPages={Math.ceil((props.totalTaskCount ?? 0) / props.pageSize)}
          pageSize={props.pageSize}
          gotoPage={(page) => handleStateChange({ sortBy, pageIndex: page })}
          setPageSize={props.changePageSize}
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

// Setup tasks table. See react-table docs for details
const setupColumnTypes = (props, taskBaseRoute, manager, openComments) => {
  const columns = {};

  columns.selected = {
    id: "selected",
    accessor: (task) => props.isTaskSelected(task.id),
    Cell: ({ value, row }) => {
      const status = row.original?.status ?? row.original?.taskStatus;
      const alreadyBundled =
        row.original?.bundleId && props.initialBundle?.bundleId !== row.original?.bundleId;
      const enableSelecting =
        !alreadyBundled &&
        !props.bundling &&
        !props.taskReadOnly &&
        ([0, 3, 6].includes(status) ||
          (props.initialBundle?.bundleId &&
            props.initialBundle?.bundleId === row.original?.bundleId)) &&
        row.original?.taskId !== props.task?.id &&
        props.workspace?.name !== "taskReview" &&
        !AsCooperativeWork(props.task).isTagType();

      return props.highlightPrimaryTask &&
        row.original?.id === props.task?.id &&
        !alreadyBundled ? (
        <span className="mr-text-green-lighter">✓</span>
      ) : enableSelecting ? (
        <input
          type="checkbox"
          className="mr-checkbox-toggle"
          checked={value}
          onChange={() => props.toggleTaskSelection(row.original)}
        />
      ) : (
        ""
      );
    },
    width: 25,
    minWidth: 25,
    disableSortBy: true,
    disableFilters: true,
  };

  columns.featureId = {
    id: "featureId",
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: (t) => t.name || t.title,
    Cell: ({ value }) => <div>{value}</div>,
    Filter: ({ column }) => (
      <FilterInput
        column={column}
        placeholder={props.intl.formatMessage(messages.filterByFeatureId)}
      />
    ),
    width: 180,
    minWidth: 120,
    disableFilters: false,
  };

  columns.id = {
    id: "id",
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: "id",
    Cell: ({ value }) => (
      <Link
        to={`/challenge/${props.challenge.id}/task/${value}`}
        className="mr-text-green-lighter hover:mr-text-white"
      >
        {value}
      </Link>
    ),
    Filter: ({ column }) => (
      <FilterInput
        column={column}
        placeholder={props.intl.formatMessage(messages.filterByInternalId)}
      />
    ),
    width: 120,
    minWidth: 90,
    disableFilters: false,
  };

  columns.status = {
    id: "status",
    Header: props.intl.formatMessage(messages.statusLabel),
    accessor: "status",
    Cell: ({ value }) => (
      <StatusLabel
        {...props}
        intlMessage={messagesByStatus[value]}
        className={`mr-status-${_kebabCase(keysByStatus[value])}`}
      />
    ),
    Filter: ({ column: { setFilter, filterValue } }) => (
      <select
        onChange={(event) => setFilter(event.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="mr-select mr-px-2 mr-py-1 mr-w-full"
        value={filterValue || "all"}
      >
        <option value="all">{props.intl.formatMessage(messages.allStatuses)}</option>
        {Object.entries(TaskStatus).map(([key, value]) => (
          <option key={key} value={value}>
            {props.intl.formatMessage(messagesByStatus[value])}
          </option>
        ))}
      </select>
    ),
    minWidth: 110,
    disableFilters: false,
  };

  columns.editBundle = {
    id: "editBundle",
    accessor: "remove",
    Cell: ({ row }) => {
      const bundlePrimary = props.taskBundle?.tasks.find((task) => task.isBundlePrimary);
      const isTaskSelected = row.original.id === (bundlePrimary?.id || props.task?.id);
      const alreadyBundled =
        row.original.bundleId && props.taskBundle?.bundleId !== row.original.bundleId;
      const enableBundleEdits =
        props.initialBundle?.taskIds?.includes(row.original.id) ||
        [0, 3, 6].includes(row.original.status);

      return (
        <div>
          {!isTaskSelected && enableBundleEdits && !alreadyBundled && (
            <button
              disabled={props.bundleEditsDisabled}
              className="mr-text-red-light"
              style={{
                cursor: props.bundleEditsDisabled ? "default" : "pointer",
                opacity: props.bundleEditsDisabled ? 0.3 : 1,
                pointerEvents: props.bundleEditsDisabled ? "none" : "auto",
              }}
              onClick={() => props.unbundleTask(row.original)}
            >
              <FormattedMessage {...messages.unbundle} />
            </button>
          )}

          {isTaskSelected && <div className="mr-text-yellow">Primary Task</div>}
        </div>
      );
    },
    minWidth: 110,
  };

  columns.priority = {
    id: "priority",
    Header: props.intl.formatMessage(messages.priorityLabel),
    accessor: "priority",
    Cell: ({ value }) => (
      <div>
        <StatusLabel
          {...props}
          intlMessage={messagesByPriority[value]}
          className={`mr-priority-${value}`}
        />
      </div>
    ),
    Filter: ({ column: { setFilter, filterValue } }) => (
      <select
        onChange={(event) => setFilter(event.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="mr-select mr-px-2 mr-py-1 mr-w-full"
        value={filterValue || "all"}
      >
        <option value="all">{props.intl.formatMessage(messages.allPriorities)}</option>
        {Object.values(TaskPriority).map((priority) => (
          <option key={priority} value={priority}>
            {props.intl.formatMessage(messagesByPriority[priority])}
          </option>
        ))}
      </select>
    ),
    width: 120,
    minWidth: 90,
    disableFilters: false,
  };

  columns.mappedOn = {
    id: "mappedOn",
    Header: props.intl.formatMessage(messages.mappedOnLabel),
    accessor: "mappedOn",
    Cell: ({ value }) => {
      if (!value) return null;
      return (
        <span>
          <FormattedDate value={value} /> <FormattedTime value={value} />
        </span>
      );
    },
    maxWidth: 180,
    minWidth: 150,
    Filter: ({ column: { setFilter, filterValue } }) => {
      let mappedOn = filterValue;
      if (typeof mappedOn === "string" && mappedOn !== "") {
        mappedOn = parseISO(mappedOn);
      }

      return (
        <div
          className="mr-flex mr-gap-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <IntlDatePicker
            selected={mappedOn}
            onChange={(value) => setFilter(value)}
            intl={props.intl}
          />
          {mappedOn && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFilter(null);
              }}
              title={props.intl.formatMessage(messages.clearDate)}
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
    },
  };

  columns.completedDuration = {
    id: "completedTimeSpent",
    Header: props.intl.formatMessage(messages.completedDurationLabel),
    accessor: "completedTimeSpent",
    Cell: ({ value }) => {
      if (!value) return null;

      const seconds = value / 1000;
      return (
        <span>
          {Math.floor(seconds / 60)}m {Math.floor(seconds) % 60}s
        </span>
      );
    },
    width: 120,
  };

  columns.reviewRequestedBy = {
    id: "completedBy",
    Header: makeInvertable(
      props.intl.formatMessage(messages.reviewRequestedByLabel),
      () => props.invertField && props.invertField("completedBy"),
      props.criteria?.invertFields?.completedBy,
    ),
    accessor: "completedBy",
    Cell: ({ row }) => {
      const completedBy = row.original?.completedBy?.username || row.original?.completedBy;
      if (!completedBy) return null;

      return (
        <div
          className="row-user-column"
          style={{
            color: AsColoredHashable(completedBy).hashColor,
          }}
        >
          <a
            className="mr-mx-4"
            href={props.targetUserOSMProfileUrl ? props.targetUserOSMProfileUrl() : "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {completedBy}
          </a>
        </div>
      );
    },
    Filter: ({ column }) => (
      <FilterInput
        column={column}
        placeholder={props.intl.formatMessage(messages.filterByMapper)}
      />
    ),
    width: 180,
    minWidth: 150,
    disableSortBy: false,
    disableFilters: false,
  };

  columns.reviewedAt = {
    id: "reviewedAt",
    Header: props.intl.formatMessage(messages.reviewedAtLabel),
    accessor: "reviewedAt",
    Cell: ({ value }) => {
      if (!value) return null;
      return (
        <span>
          <FormattedDate value={value} /> <FormattedTime value={value} />
        </span>
      );
    },
    Filter: ({ column: { setFilter, filterValue } }) => {
      let reviewedAt = filterValue;
      if (typeof reviewedAt === "string" && reviewedAt !== "") {
        reviewedAt = parseISO(reviewedAt);
      }

      return (
        <div
          className="mr-flex mr-gap-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <IntlDatePicker
            selected={reviewedAt}
            onChange={(value) => setFilter(value)}
            intl={props.intl}
          />
          {reviewedAt && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFilter(null);
              }}
              title={props.intl.formatMessage(messages.clearDate)}
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
    },
    width: 150,
    maxWidth: 180,
    minWidth: 150,
    disableFilters: false,
  };

  columns.metaReviewedAt = {
    id: "metaReviewedAt",
    Header: props.intl.formatMessage(messages.metaReviewedAtLabel),
    accessor: "metaReviewedAt",
    Cell: ({ value }) => {
      if (!value) return null;
      return (
        <span>
          <FormattedDate value={value} /> <FormattedTime value={value} />
        </span>
      );
    },
    width: 150,
    maxWidth: 180,
    minWidth: 150,
  };

  columns.reviewDuration = {
    id: "reviewDuration",
    Header: props.intl.formatMessage(messages.reviewDurationLabel),
    accessor: (row) => {
      if (!row.reviewedAt || !row.reviewStartedAt) return null;
      return differenceInSeconds(parseISO(row.reviewedAt), parseISO(row.reviewStartedAt));
    },
    Cell: ({ value }) => {
      if (!value) return null;
      return (
        <span>
          {Math.floor(value / 60)}m {value % 60}s
        </span>
      );
    },
    width: 120,
    maxWidth: 120,
    minWidth: 120,
  };

  columns.reviewedBy = {
    id: "reviewedBy",
    Header: makeInvertable(
      props.intl.formatMessage(messages.reviewedByLabel),
      () => props.invertField("reviewedBy"),
      props.criteria?.invertFields?.reviewedBy,
    ),
    accessor: "reviewedBy",
    Cell: ({ value }) => {
      if (!value) return null;

      const username = value.username ?? value;
      return (
        <div className="row-user-column" style={{ color: AsColoredHashable(username).hashColor }}>
          {username}
        </div>
      );
    },
    Filter: ({ column }) => (
      <FilterInput
        column={column}
        placeholder={props.intl.formatMessage(messages.filterByReviewer)}
      />
    ),
    width: 180,
    maxWidth: 180,
    disableFilters: false,
  };

  columns.metaReviewedBy = {
    id: "metaReviewedBy",
    Header: makeInvertable(
      props.intl.formatMessage(messages.metaReviewedByLabel),
      () => props.invertField("metaReviewedBy"),
      props.criteria?.invertFields?.metaReviewedBy,
    ),
    accessor: "metaReviewedBy",
    Cell: ({ value }) => {
      if (!value) return null;

      const username = value.username ?? value;
      return (
        <div className="row-user-column" style={{ color: AsColoredHashable(username).hashColor }}>
          {username}
        </div>
      );
    },
    width: 180,
    maxWidth: 180,
  };

  columns.reviewStatus = {
    id: "reviewStatus",
    Header: props.intl.formatMessage(messages.reviewStatusLabel),
    accessor: (x) => (x.reviewStatus === undefined ? -1 : x.reviewStatus),
    Cell: ({ value }) => {
      if (value === undefined || value === -1) return null;
      return (
        <StatusLabel
          {...props}
          intlMessage={messagesByReviewStatus[value]}
          className={`mr-review-${value}`}
        />
      );
    },
    Filter: ({ column: { setFilter, filterValue } }) => (
      <select
        onChange={(event) => setFilter(event.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="mr-select mr-px-2 mr-py-1 mr-w-full"
        value={filterValue || "all"}
      >
        <option value="all">{props.intl.formatMessage(messages.allReviewStatuses)}</option>
        {Object.values(TaskReviewStatus).map((status) => {
          if (status !== TaskReviewStatus.unnecessary) {
            return (
              <option key={status} value={status}>
                {props.intl.formatMessage(messagesByReviewStatus[status])}
              </option>
            );
          }
          return null;
        })}
      </select>
    ),
    width: 155,
    minWidth: 155,
    maxWidth: 180,
    disableFilters: false,
  };

  columns.metaReviewStatus = {
    id: "metaReviewStatus",
    Header: props.intl.formatMessage(messages.metaReviewStatusLabel),
    accessor: "metaReviewStatus",
    Cell: ({ value }) => {
      if (value === undefined) return null;
      return (
        <StatusLabel
          {...props}
          intlMessage={messagesByReviewStatus[value]}
          className={`mr-review-${value}`}
        />
      );
    },
    Filter: ({ column: { setFilter, filterValue } }) => (
      <select
        onChange={(event) => setFilter(event.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="mr-select mr-px-2 mr-py-1 mr-w-full"
        value={filterValue || "all"}
      >
        <option value="all">{props.intl.formatMessage(messages.allMetaReviewStatuses)}</option>
        <option value="-2">{props.intl.formatMessage(messages.metaUnreviewed)}</option>
        {Object.values(TaskReviewStatus).map((status) => {
          if (status !== TaskReviewStatus.unnecessary && isMetaReviewStatus(status)) {
            return (
              <option key={status} value={status}>
                {props.intl.formatMessage(messagesByMetaReviewStatus[status])}
              </option>
            );
          }
          return null;
        })}
      </select>
    ),
    width: 155,
    maxWidth: 180,
    minWidth: 155,
    disableFilters: false,
  };

  columns.additionalReviewers = {
    id: "otherReviewers",
    Header: props.intl.formatMessage(messages.additionalReviewersLabel),
    accessor: "additionalReviewers",
    Cell: ({ row }) => (
      <div
        className="row-user-column"
        style={{
          color: AsColoredHashable(row.original.completedBy?.username || row.original.completedBy)
            .hashColor,
        }}
      >
        {row.original.additionalReviewers?.map((reviewer, index) => (
          <Fragment key={reviewer.username + "-" + index}>
            <span style={{ color: AsColoredHashable(reviewer.username).hashColor }}>
              {reviewer.username}
            </span>
            {index + 1 !== row.original.additionalReviewers?.length ? ", " : ""}
          </Fragment>
        ))}
      </div>
    ),
    width: 180,
    maxWidth: 180,
  };

  columns.controls = {
    id: "controls",
    Header: props.intl.formatMessage(messages.controlsLabel),
    Cell: ({ row }) => (
      <div className="row-controls-column mr-links-green-lighter">
        <Link
          className="mr-mr-2"
          to={{
            pathname: `${taskBaseRoute}/${row.original.id}/inspect`,
            state: props.criteria,
          }}
        >
          <FormattedMessage {...messages.inspectTaskLabel} />
        </Link>
        {manager.canWriteProject(props.challenge.parent) && (
          <Link
            className="mr-mr-2"
            to={{
              pathname: `${taskBaseRoute}/${row.original.id}/edit`,
              state: props.criteria,
            }}
          >
            <FormattedMessage {...messages.editTaskLabel} />
          </Link>
        )}
        {row.original.reviewStatus !== undefined && (
          <Link
            to={{
              pathname: `/challenge/${props.challenge.id}/task/${row.original.id}/review`,
              state: { ...props.criteria, filters: { challengeId: props.challenge.id } },
            }}
            className="mr-mr-2"
          >
            <FormattedMessage {...messages.reviewTaskLabel} />
          </Link>
        )}
        <Link to={`/challenge/${props.challenge.id}/task/${row.original.id}`}>
          <FormattedMessage {...messages.startTaskLabel} />
        </Link>
      </div>
    ),
    width: 150,
    minWidth: 150,
  };

  columns.comments = {
    id: "viewComments",
    Header: props.intl.formatMessage(messages.commentsLabel),
    accessor: "commentID",
    Cell: ({ row }) => <ViewCommentsButton onClick={() => openComments(row.original.id)} />,
    width: 110,
    maxWidth: 110,
  };

  columns.tags = {
    id: "tags",
    Header: props.intl.formatMessage(messages.tagsLabel),
    accessor: "tags",
    Cell: ({ value }) => {
      return (
        <div className="row-challenge-column mr-text-white mr-whitespace-normal mr-flex mr-flex-wrap">
          {value?.map((t) =>
            t.name === "" ? null : (
              <div
                className="mr-inline mr-bg-white-10 mr-rounded mr-py-1 mr-px-2 mr-m-1"
                key={t.id}
              >
                {t.name}
              </div>
            ),
          )}
        </div>
      );
    },
    Filter: ({ column: { filterValue, setFilter } }) => {
      const preferredTags = [
        ...(props.challenge?.preferredTags?.split(",") ?? []),
        ...(props.challenge?.preferredReviewTags?.split(",") ?? []),
      ].filter(Boolean);

      return (
        <InTableTagFilter
          {...props}
          preferredTags={preferredTags}
          onChange={setFilter}
          value={filterValue ?? ""}
        />
      );
    },
    width: 120,
    minWidth: 120,
  };

  // After all columns are defined, set disableSortBy property
  Object.keys(columns).forEach((columnId) => {
    if (columns[columnId]) {
      columns[columnId].disableSortBy = !sortableColumns.includes(columnId);
    }
  });

  return columns;
};

TaskAnalysisTableInternal.propTypes = {
  /** The tasks to display */
  taskInfo: PropTypes.shape({
    challengeId: PropTypes.number,
    loading: PropTypes.bool,
    tasks: PropTypes.array,
  }),
  /** Challenge the tasks belong to */
  challenge: PropTypes.object,
  /** Total tasks available (we may receive a subset) */
  totalTaskCount: PropTypes.number,
  /** Currently selected tasks */
  selectedTasks: PropTypes.object.isRequired,
  /** Invoked to toggle selection of a task */
  toggleTaskSelection: PropTypes.func.isRequired,
  updateCriteria: PropTypes.func.isRequired,
};

export default injectIntl(
  WithTargetUser(
    WithConfigurableColumns(TaskAnalysisTableInternal, ALL_COLUMNS, DEFAULT_COLUMNS, messages),
  ),
);
