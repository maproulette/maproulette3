import { differenceInSeconds, parseISO } from "date-fns";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _kebabCase from "lodash/kebabCase";
import _pick from "lodash/pick";
import PropTypes from "prop-types";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import {
  useExpanded,
  useFilters,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from "react-table";
import ConfigureColumnsModal from "../../components/ConfigureColumnsModal/ConfigureColumnsModal";
import WithTargetUser from "../../components/HOCs/WithTargetUser/WithTargetUser";
import InTableTagFilter from "../../components/KeywordAutosuggestInput/InTableTagFilter";
import TaskCommentsModal from "../../components/TaskCommentsModal/TaskCommentsModal";
import AsColoredHashable from "../../interactions/Hashable/AsColoredHashable";
import AsCooperativeWork from "../../interactions/Task/AsCooperativeWork";
import AsManager from "../../interactions/User/AsManager";
import { messagesByPriority } from "../../services/Task/TaskPriority/TaskPriority";
import {
  keysByReviewStatus,
  messagesByReviewStatus,
} from "../../services/Task/TaskReview/TaskReviewStatus";
import { keysByStatus, messagesByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import WithConfigurableColumns from "../HOCs/WithConfigurableColumns/WithConfigurableColumns";
import WithLoadedTask from "../HOCs/WithLoadedTask/WithLoadedTask";
import IntlDatePicker from "../IntlDatePicker/IntlDatePicker";
import PaginationControl from "../PaginationControl/PaginationControl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import {
  SearchFilter,
  TableWrapper,
  renderTableCell,
  renderTableHeader,
} from "../TableShared/EnhancedTable";
import { inputStyles, rowStyles, tableStyles } from "../TableShared/TableStyles";
import ViewTask from "../ViewTask/ViewTask";
import messages from "./Messages";
import TaskAnalysisTableHeader from "./TaskAnalysisTableHeader";
import { StatusLabel, ViewCommentsButton, makeInvertable } from "./TaskTableHelpers";

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

  const handleStateChange = useCallback(
    ({ sortBy, filters, pageIndex }) => { 
      const currentSortId = sortBy[0].id;
      const isProperty =
        !!props.addedColumns && Object.prototype.hasOwnProperty.call(props.addedColumns, `:${currentSortId}`); 
        const direction = sortBy[0].desc ? "DESC" : "ASC";
        console.log("sortBy", sortBy);
        console.log("isProperty", isProperty);
        console.log("direction", direction);
      const newCriteria = {
        sortCriteria:
          sortBy.length > 0
            ? {
                  sortBy: sortBy[0].id,
                  direction,
                  propertySort: isProperty,
                  propertyKey: isProperty ? currentSortId : undefined,
          
              }
            : undefined,
        filters: filters.reduce((acc, filter) => {
          let value = filter.value;

          if (value === null || value === undefined || value === "") {
            return acc;
          }

          if (
            (filter.id === "mappedOn" ||
              filter.id === "reviewedAt" ||
              filter.id === "metaReviewedAt") &&
            value instanceof Date
          ) {
            value = value.toISOString().split("T")[0];
          }

          return {
            ...acc,
            [filter.id]: value,
          };
        }, {}),
        page: pageIndex,
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
      } else if (props.addedColumns && Object.prototype.hasOwnProperty.call(props.addedColumns, `:${sortBy}`)) {
        const getProp = (t) => t?.geometries?.features?.[0]?.properties?.[sortBy];
        const aval = getProp(a);
        const bval = getProp(b);
        if (aval == null && bval == null) return 0;
        if (aval == null) return -1;
        if (bval == null) return 1;
        const an = Number(aval);
        const bn = Number(bval);
        if (!Number.isNaN(an) && !Number.isNaN(bn)) {
          return an - bn;
        }
        return String(aval).localeCompare(String(bval));
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

    return setupColumnTypes(props, taskBaseRoute, AsManager(props.user), setOpenComments);
  }, [props.showColumns, props.challenge?.parent?.id, props.challenge?.id, props.taskBundle]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "expander",
        Cell: ({ row }) => (
          <span {...row.getToggleRowExpandedProps()}>{row.isExpanded ? "▼" : "▶"}</span>
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
      // For default view, add expander, selected, and any custom columns
      const findColumn = (column) => {
        if (column.startsWith(":")) {
          const key = column.slice(1);
          return {
            id: key,
            Header: key,
            accessor: (row) => row.geometries?.features?.[0]?.properties?.[key],
            Cell: ({ value }) => <div>{value ?? ""}</div>,
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
  }, [props.showColumns?.length, props.addedColumns, props.taskBundle]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
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
      defaultColumn: {
        Filter: () => null,
        minWidth: 30,
        width: 150,
      },
      initialState: {
        filters: Object.entries(props.criteria?.filters ?? {}).map(([id, value]) => ({
          id,
          value,
        })),
        sortBy: props.criteria?.sortCriteria
          ? [
              {
                id: props.criteria.sortCriteria.sortBy,
                desc: props.criteria.sortCriteria.direction === "DESC",
              },
            ]
          : [],
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

  // Update parent when table state changes
  useEffect(() => {
    handleStateChange({ sortBy, filters, pageIndex: props.page ?? 0 });
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

// Setup tasks table. See react-table docs for details
const setupColumnTypes = (props, taskBaseRoute, manager, openComments) => {
  const columns = {};

  columns.selected = {
    id: "selected",
    accessor: (task) => props.isTaskSelected(task.id),
    Cell: ({ value, row }) => {
      const status = row.original.status ?? row.original.taskStatus;
      const alreadyBundled =
        row.original.bundleId && !props.taskBundle?.bundleId !== row.original.bundleId;
      const enableSelecting =
        !props.task ||
        (!row.original.lockedBy &&
          !alreadyBundled &&
          !props.bundling &&
          !props.taskReadOnly &&
          [0, 3, 6].includes(status) &&
          row.original.taskId !== props.task?.id &&
          props.workspace.name !== "taskReview" &&
          !AsCooperativeWork(props.task).isTagType());

      if (
        props.highlightPrimaryTask &&
        row.original.id === props.task?.id &&
        !row.original.bundleId
      ) {
        return <span className="mr-text-green-lighter">✓</span>;
      }

      if (enableSelecting) {
        return (
          <input
            type="checkbox"
            className="mr-checkbox-toggle"
            checked={value}
            onChange={() => props.toggleTaskSelection(row.original)}
          />
        );
      }

      return null;
    },
    width: 40,
    disableSortBy: true,
    disableResizing: true,
  };

  columns.featureId = {
    id: "featureId",
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: (t) => t.name || t.title,
    Cell: ({ value }) => (
      <div
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          width: "100%",
        }}
      >
        {value || ""}
      </div>
    ),
    Filter: ({ column: { filterValue, setFilter } }) => (
      <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
        <SearchFilter
          value={filterValue}
          onChange={setFilter}
          placeholder="Search feature ID..."
          inputClassName={inputStyles}
        />
        {filterValue && (
          <button
            className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
            onClick={() => setFilter(null)}
          >
            <SvgSymbol
              sym="icon-close"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-2.5 mr-h-2.5 mr-ml-2"
            />
          </button>
        )}
      </div>
    ),
    disableSortBy: true,
  };

  columns.id = {
    id: "id",
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: "id",
    Cell: ({ value: id, row }) => {
      const taskLink = (
        <div className="row-controls-column mr-links-green-lighter">
          <Link
            to={`/challenge/${row.original.parentId ?? row.original.parent}/task/${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {id}
          </Link>
        </div>
      );

      if (row.original.isBundlePrimary && id === props.task?.id) {
        return (
          <span className="mr-flex mr-items-center">
            <SvgSymbol
              sym="box-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-3 mr-h-3 mr-mr-2"
              title={props.intl.formatMessage(messages.multipleTasksTooltip)}
            />
            {taskLink}
          </span>
        );
      } else if (
        Number.isFinite(row.original.bundleId) &&
        row.original.bundleId &&
        row.original.bundleId == props.taskBundle?.bundleId
      ) {
        return (
          <span className="mr-flex mr-items-center">
            <SvgSymbol
              sym="puzzle-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-4 mr-h-4 mr-mr-2"
              title={props.intl.formatMessage(messages.bundleMemberTooltip)}
            />
            {taskLink}
          </span>
        );
      } else {
        return <span>{taskLink}</span>;
      }
    },
    Filter: ({ column: { filterValue, setFilter } }) => (
      <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
        <SearchFilter
          value={filterValue}
          onChange={setFilter}
          placeholder="Search ID..."
          inputClassName={inputStyles}
        />
        {filterValue && (
          <button
            className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
            onClick={() => setFilter(null)}
          >
            <SvgSymbol
              sym="icon-close"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-2.5 mr-h-2.5 mr-ml-2"
            />
          </button>
        )}
      </div>
    ),
  };

  columns.status = {
    id: "status",
    Header: props.intl.formatMessage(messages.statusLabel),
    accessor: "status",
    Cell: ({ value }) => (
      <div>
        <StatusLabel
          {...props}
          intlMessage={messagesByStatus[value]}
          className={`mr-status-${_kebabCase(keysByStatus[value])}`}
        />
      </div>
    ),
    minWidth: 110,
  };

  columns.editBundle = {
    id: "editBundle",
    accessor: "remove",
    Cell: ({ row }) => {
      const { taskBundle, task, initialBundle } = props;
      const { id: taskId, bundleId, status } = row.original;

      const isActiveTask = taskId === task?.id;
      const isInActiveBundle = taskBundle?.taskIds?.includes(taskId);
      const alreadyBundled = bundleId && initialBundle?.bundleId !== bundleId;
      const validBundlingStatus =
        initialBundle?.taskIds?.includes(taskId) || [0, 3, 6].includes(status);
      const isLocked = row.original.lockedBy && row.original.lockedBy !== props.user.id;

      return (
        <div>
          {!isActiveTask &&
            validBundlingStatus &&
            isInActiveBundle &&
            !alreadyBundled &&
            !isLocked && (
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

          {!isActiveTask &&
            validBundlingStatus &&
            !isInActiveBundle &&
            !alreadyBundled &&
            !isLocked && (
              <button
                disabled={props.bundleEditsDisabled}
                className="mr-text-green-lighter"
                style={{
                  cursor: props.bundleEditsDisabled ? "default" : "pointer",
                  opacity: props.bundleEditsDisabled ? 0.3 : 1,
                  pointerEvents: props.bundleEditsDisabled ? "none" : "auto",
                }}
                onClick={() => props.bundleTask(row.original)}
              >
                <FormattedMessage {...messages.bundle} />
              </button>
            )}
          {isActiveTask && <div className="mr-text-yellow">Primary Task</div>}
          {isLocked && <div className="mr-text-red-light">Locked</div>}
        </div>
      );
    },
    minWidth: 110,
    disableSortBy: true,
  };

  columns.priority = {
    id: "priority",
    Header: props.intl.formatMessage(messages.priorityLabel),
    accessor: "priority",
    Cell: ({ value }) => (
      <div>
        <FormattedMessage {...messagesByPriority[value]} />
      </div>
    ),
    width: 90,
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
    minWidth: 150,
    Filter: ({ column: { setFilter, filterValue } }) => {
      let mappedOn = filterValue;
      if (typeof mappedOn === "string" && mappedOn !== "") {
        mappedOn = parseISO(mappedOn);
      }

      return (
        <div className="mr-space-x-1 mr-flex" onClick={(e) => e.stopPropagation()}>
          <IntlDatePicker
            selected={mappedOn}
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />

          {mappedOn && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors mr-absolute mr-right-2 mr-top-2"
              onClick={() => setFilter(null)}
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
      () => props.invertField("completedBy"),
      props.criteria?.invertFields?.completedBy,
    ),
    accessor: "completedBy",
    Cell: ({ value }) => {
      if (!value) return null;

      const username = value.username ?? value;
      return (
        <div className="row-user-column" style={{ color: AsColoredHashable(username).hashColor }}>
          <a
            className="mr-mx-4"
            href={props.targetUserOSMProfileUrl()}
            target="_blank"
            rel="noopener"
          >
            {username}
          </a>
        </div>
      );
    },
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
    width: 150,
    minWidth: 150,
    Filter: ({ column: { setFilter, filterValue } }) => {
      let reviewedAt = filterValue;
      if (typeof reviewedAt === "string" && reviewedAt !== "") {
        reviewedAt = parseISO(reviewedAt);
      }

      return (
        <div className="mr-space-x-1 mr-flex" onClick={(e) => e.stopPropagation()}>
          <IntlDatePicker
            selected={reviewedAt}
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />

          {reviewedAt && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors mr-absolute mr-right-2 mr-top-2"
              onClick={() => setFilter(null)}
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
    minWidth: 150,
    Filter: ({ column: { setFilter, filterValue } }) => {
      let metaReviewedAt = filterValue;
      if (typeof metaReviewedAt === "string" && metaReviewedAt !== "") {
        metaReviewedAt = parseISO(metaReviewedAt);
      }

      return (
        <div className="mr-space-x-1 mr-flex" onClick={(e) => e.stopPropagation()}>
          <IntlDatePicker
            selected={metaReviewedAt}
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />

          {metaReviewedAt && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors mr-absolute mr-right-2 mr-top-2"
              onClick={() => setFilter(null)}
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
    width: 180,
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
  };

  columns.reviewStatus = {
    id: "reviewStatus",
    Header: props.intl.formatMessage(messages.reviewStatusLabel),
    accessor: "reviewStatus",
    Cell: ({ value }) => {
      if (value === undefined) return null;
      return (
        <StatusLabel
          {...props}
          intlMessage={messagesByReviewStatus[value]}
          className={`mr-review-${_kebabCase(keysByReviewStatus[value])}`}
        />
      );
    },
    width: 155,
    minWidth: 155,
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
          className={`mr-review-${_kebabCase(keysByReviewStatus[value])}`}
        />
      );
    },
    width: 155,

    minWidth: 155,
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
    disableSortBy: true,
  };

  columns.comments = {
    id: "viewComments",
    Header: props.intl.formatMessage(messages.commentsLabel),
    accessor: "commentID",
    Cell: ({ row }) => <ViewCommentsButton onClick={() => openComments(row.original.id)} />,
    width: 110,
    disableSortBy: true,
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
        <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
          <InTableTagFilter
            {...props}
            preferredTags={preferredTags}
            onChange={setFilter}
            value={filterValue ?? ""}
          />
          {filterValue && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => setFilter(null)}
            >
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-2.5 mr-h-2.5 mr-ml-2"
              />
            </button>
          )}
        </div>
      );
    },
    width: 120,
    minWidth: 120,
  };

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
