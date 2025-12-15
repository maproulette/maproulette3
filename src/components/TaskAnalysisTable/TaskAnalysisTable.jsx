import { differenceInSeconds, parseISO } from "date-fns";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _pick from "lodash/pick";
import PropTypes from "prop-types";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import {
  useExpanded,
  useFilters,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from "react-table";
import ConfigureColumnsModal from "../ConfigureColumnsModal/ConfigureColumnsModal";
import WithConfigurableColumns from "../HOCs/WithConfigurableColumns/WithConfigurableColumns";
import WithLoadedTask from "../HOCs/WithLoadedTask/WithLoadedTask";
import WithTargetUser from "../HOCs/WithTargetUser/WithTargetUser";
import PaginationControl from "../PaginationControl/PaginationControl";
import { TableWrapper, renderTableCell, renderTableHeader } from "../TableShared/EnhancedTable";
import { rowStyles, tableStyles } from "../TableShared/TableStyles";
import TaskCommentsModal from "../TaskCommentsModal/TaskCommentsModal";
import ViewTask from "../ViewTask/ViewTask";
import messages from "./Messages";
import TaskAnalysisTableHeader from "./TaskAnalysisTableHeader";
import { setupColumnTypes } from "./columns/index.jsx";

// Setup child components with necessary HOCs
const ViewTaskSubComponent = WithLoadedTask(ViewTask);

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

const DEFAULT_COLUMNS = ["featureId", "id", "status", "priority", "controls", "comments"];

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

  const prevSortByRef = useRef(null);
  const prevFiltersRef = useRef(null);

  // Column filter keys that can be set in the table
  const columnFilterKeys = [
    "id",
    "featureId",
    "completedBy",
    "reviewRequestedBy",
    "reviewedBy",
    "metaReviewedBy",
    "mappedOn",
    "reviewedAt",
    "metaReviewedAt",
  ];

  const handleStateChange = useCallback(
    ({ sortBy, filters, pageIndex }) => {
      // Start with all column filters set to undefined (to clear them)
      const tableFilters = columnFilterKeys.reduce((acc, key) => {
        acc[key] = undefined;
        return acc;
      }, {});

      // Then set the values for filters that are actually set
      filters.forEach((filter) => {
        let value = filter.value;

        if (value === null || value === undefined || value === "") {
          return;
        }

        if (
          (filter.id === "mappedOn" ||
            filter.id === "reviewedAt" ||
            filter.id === "metaReviewedAt") &&
          value instanceof Date
        ) {
          value = value.toISOString().split("T")[0];
        }

        tableFilters[filter.id] = value;
      });

      const newSortCriteria =
        sortBy.length > 0
          ? {
              sortBy: sortBy[0].id,
              direction: sortBy[0].desc ? "DESC" : "ASC",
            }
          : undefined;

      const sortChanged =
        prevSortByRef.current !== null && !_isEqual(sortBy, prevSortByRef.current);
      const filtersChanged =
        prevFiltersRef.current !== null && !_isEqual(filters, prevFiltersRef.current);
      const shouldResetPage = sortChanged || filtersChanged;

      prevSortByRef.current = sortBy;
      prevFiltersRef.current = filters;

      const newCriteria = {
        sortCriteria: newSortCriteria,
        filters: tableFilters,
        page: shouldResetPage ? 0 : pageIndex,
      };

      const currentCriteria = _pick(props.criteria, Object.keys(newCriteria));

      // Only update if criteria actually changed (prevents infinite loop)
      if (!_isEqual(newCriteria, currentCriteria)) {
        props.updateCriteria({ ...props.criteria, ...newCriteria });
      }
    },
    [props.updateCriteria, props.criteria],
  );

  // Sort the data locally within the page (the backend does not do this for us, boo)
  const data = useMemo(() => {
    if (!props.taskData) return [];
    if (!props.criteria?.sortCriteria) return props.taskData;

    const { sortBy, direction } = props.criteria.sortCriteria;
    const sorted = [...props.taskData].sort((a, b) => {
      // Handle null/undefined values consistently in sorting
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

  const columnTypes = useMemo(() => {
    let taskBaseRoute = null;

    // if management controls are to be shown, then a challenge object is required
    if (!Array.isArray(props.showColumns) || props.showColumns.indexOf("controls") !== -1) {
      if (!_isObject(props.challenge) || !_isObject(props.challenge.parent)) {
        return null;
      }

      taskBaseRoute = `/admin/project/${props.challenge.parent.id}/challenge/${props.challenge.id}/task`;
    }

    return setupColumnTypes(props, taskBaseRoute, setOpenComments);
  }, [props.showColumns, props.challenge?.parent?.id, props.challenge?.id, props.taskBundle]);

  const columns = useMemo(() => {
    if (!columnTypes) return [];

    const baseColumns = [columnTypes.expander];

    if (Array.isArray(props.showColumns) && props.showColumns.length > 0) {
      return [
        ...baseColumns,
        ...props.showColumns.map((columnId) => columnTypes[columnId]).filter(Boolean),
      ];
    } else {
      // For default view, add expander, selected, and any custom columns
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
  }, [props.showColumns?.length, props.addedColumns, props.taskBundle, columnTypes]);

  const criteriaFiltersForTable = useMemo(() => {
    const criteriaFilters = props.criteria?.filters ?? {};
    return columnFilterKeys
      .filter(
        (key) =>
          criteriaFilters[key] !== undefined &&
          criteriaFilters[key] !== null &&
          criteriaFilters[key] !== "",
      )
      .map((key) => ({ id: key, value: criteriaFilters[key] }));
  }, [props.criteria?.filters, columnFilterKeys]);

  const criteriaSortForTable = useMemo(() => {
    if (!props.criteria?.sortCriteria?.sortBy) return [];
    return [
      {
        id: props.criteria.sortCriteria.sortBy,
        desc: props.criteria.sortCriteria.direction === "DESC",
      },
    ];
  }, [props.criteria?.sortCriteria?.sortBy, props.criteria?.sortCriteria?.direction]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setAllFilters,
    setSortBy,
    state: { sortBy, filters },
  } = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      manualFilters: true,
      manualPagination: true,
      disableSortRemove: true,
      autoResetExpanded: false,
      autoResetFilters: false,
      autoResetSortBy: false,
      defaultColumn: {
        Filter: () => null,
        minWidth: 30,
        width: 150,
      },
      initialState: {
        filters: criteriaFiltersForTable,
        sortBy: criteriaSortForTable,
        pageIndex: props.page ?? 0,
      },
      disableResizing: false,
      disableMultiSort: true,
      columnResizeMode: "onEnd",
    },
    useFilters,
    useSortBy,
    useResizeColumns,
    useExpanded,
    usePagination,
  );

  const isSyncingRef = useRef(false);

  const prevCriteriaFiltersRef = useRef(criteriaFiltersForTable);
  useEffect(() => {
    if (!_isEqual(prevCriteriaFiltersRef.current, criteriaFiltersForTable)) {
      prevCriteriaFiltersRef.current = criteriaFiltersForTable;
      isSyncingRef.current = true;
      setAllFilters(criteriaFiltersForTable);

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [criteriaFiltersForTable, setAllFilters]);

  const prevCriteriaSortRef = useRef(criteriaSortForTable);
  useEffect(() => {
    if (!_isEqual(prevCriteriaSortRef.current, criteriaSortForTable)) {
      prevCriteriaSortRef.current = criteriaSortForTable;
      isSyncingRef.current = true;
      setSortBy(criteriaSortForTable);

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [criteriaSortForTable, setSortBy]);

  useEffect(() => {
    if (!isSyncingRef.current) {
      handleStateChange({ sortBy, filters, pageIndex: props.page ?? 0 });
    }
  }, [sortBy, filters, props.page]);

  return (
    <Fragment>
      <section className="mr-my-4 mr-min-h-100 mr-fixed-containing-block mr-relative">
        {!props.suppressHeader && (
          <header className="mr-mb-4">
            <TaskAnalysisTableHeader
              {...props}
              countShown={data?.length ?? 0}
              configureColumns={() => setShowConfigureColumns(true)}
            />
          </header>
        )}

        {props.loadingTasks && (
          <div className="mr-absolute mr-inset-0 mr-flex mr-items-center mr-justify-center mr-bg-black-75 mr-z-10">
            <div className="mr-text-white mr-text-lg">Loading...</div>
          </div>
        )}
        <TableWrapper>
          <table {...getTableProps()} className={tableStyles}>
            <thead>{renderTableHeader(headerGroups)}</thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <Fragment key={row.original.id}>
                    <tr
                      {...row.getRowProps()}
                      className={`${row.isExpanded ? "mr-bg-black-10" : ""} ${rowStyles}`}
                    >
                      {row.cells.map((cell) => {
                        return renderTableCell(cell);
                      })}
                    </tr>

                    {row.isExpanded ? (
                      <tr key={`expanded-${row.original.id}`}>
                        <td colSpan={columns.length}>
                          <ViewTaskSubComponent taskId={row.original.id} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </TableWrapper>

        <PaginationControl
          currentPage={props.page ?? 0}
          totalPages={Math.ceil((props.totalTaskCount ?? 0) / props.pageSize)}
          pageSize={props.pageSize}
          gotoPage={(page) => handleStateChange({ sortBy, filters, pageIndex: page })}
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
