import { differenceInSeconds, parseISO } from "date-fns";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _kebabCase from "lodash/kebabCase";
import _pick from "lodash/pick";
import PropTypes from "prop-types";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { useExpanded, useFilters, usePagination, useSortBy, useTable } from "react-table";
import BusySpinner from "../../components/BusySpinner/BusySpinner";
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
import PaginationControl from "../PaginationControl/PaginationControl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
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

const DEFAULT_COLUMNS = [
  "featureId",
  "id",
  "status",
  "priority",
  "controls",
  "comments",
  "editBundle",
];

const useDebounce = (callback, delay) => {
  const [timer, setTimer] = useState(null);

  return (value) => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => callback(value), delay);
    setTimer(newTimer);
  };
};

const SearchFilter = ({ value: filterValue, onChange: setFilter, placeholder }) => {
  const [inputValue, setInputValue] = useState(filterValue || "");
  const debouncedSetFilter = useDebounce(setFilter, 500);

  return (
    <div className="mr-flex mr-gap-2">
      <input
        className="mr-input mr-px-2 mr-py-1 mr-w-full"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          debouncedSetFilter(e.target.value || undefined);
        }}
        placeholder={placeholder}
      />
      {inputValue && (
        <button
          className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
          onClick={() => {
            setInputValue("");
            setFilter(undefined);
          }}
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

  // When sort/filter/page changes, call updateCriteria to fetch new data
  const handleStateChange = useCallback(
    ({ sortBy, filters, pageIndex }) => {
      const newCriteria = {
        sortCriteria:
          sortBy.length > 0
            ? {
                sortBy: sortBy[0].id,
                direction: sortBy[0].desc ? "DESC" : "ASC",
              }
            : undefined,
        filters: filters.reduce(
          (acc, filter) => ({
            ...acc,
            [filter.id]: filter.value,
          }),
          {},
        ),
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

  const columns = useMemo(() => {
    let taskBaseRoute = null;

    // if management controls are to be shown, then a challenge object is required
    if (!Array.isArray(props.showColumns) || props.showColumns.indexOf("controls") !== -1) {
      if (!_isObject(props.challenge) || !_isObject(props.challenge.parent)) {
        return null;
      }

      taskBaseRoute = `/admin/project/${props.challenge.parent.id}/challenge/${props.challenge.id}/task`;
    }

    const columnTypes = setupColumnTypes(
      props,
      taskBaseRoute,
      AsManager(props.user),
      setOpenComments,
    );

    if (Array.isArray(props.showColumns) && props.showColumns.length > 0) {
      return props.showColumns.map((columnId) => columnTypes[columnId]).filter(Boolean);
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
            width: 120,
          };
        } else {
          return columnTypes[column];
        }
      };

      return [
        {
          // Special column for the row expander
          id: "expander",
          Cell: ({ row }) => (
            <span {...row.getToggleRowExpandedProps()}>{row.isExpanded ? "▼" : "▶"}</span>
          ),
        },
        columnTypes.selected,
        ...Object.keys(props.addedColumns || {})
          .map(findColumn)
          .filter(Boolean),
      ];
    }
  }, [props, setOpenComments]);

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
      defaultColumn: {
        Filter: () => null,
      },
      initialState: {
        filters: Object.entries(props.criteria.filters ?? {}).map(([id, value]) => ({ id, value })),
        sortBy: props.criteria.sortCriteria
          ? [
              {
                id: props.criteria.sortCriteria.sortBy,
                desc: props.criteria.sortCriteria.direction === "DESC",
              },
            ]
          : [],
      },
    },
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
  );

  // Update parent when table state changes
  useEffect(() => {
    handleStateChange({ sortBy, filters, pageIndex: props.page });
  }, [sortBy, filters, handleStateChange]);

  return (
    <Fragment>
      <section className="mr-my-4 mr-min-h-100 mr-fixed-containing-block">
        {!props.suppressHeader && (
          <header className="mr-mb-4">
            <TaskAnalysisTableHeader
              {...props}
              countShown={data?.length ?? 0}
              configureColumns={() => setShowConfigureColumns(true)}
            />
          </header>
        )}

        {props.loadingTasks ? (
          <div className="mr-my-8">
            <BusySpinner big />
          </div>
        ) : (
          <>
            <table
              {...getTableProps()}
              className="mr-table mr-w-full mr-text-white mr-links-green-lighter"
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <Fragment key={headerGroup.id}>
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          className="mr-text-left mr-px-2 mr-py-2 mr-border-b mr-border-white-10"
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                        >
                          {column.render("Header")}
                          {column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {headerGroup.headers.map((column) => (
                        <th key={column.id}>{column.canFilter ? column.render("Filter") : null}</th>
                      ))}
                    </tr>
                  </Fragment>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <Fragment>
                      <tr className="mr-border-y mr-border-white-10" {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td className="mr-px-2" {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>

                      {row.isExpanded ? (
                        <tr>
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

            <PaginationControl
              currentPage={props.page ?? 0}
              totalPages={Math.ceil((props.totalTaskCount ?? 0) / props.pageSize)}
              pageSize={props.pageSize}
              gotoPage={(page) => handleStateChange({ sortBy, filters, pageIndex: page })}
              setPageSize={props.changePageSize}
            />
          </>
        )}
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
        !alreadyBundled &&
        !props.bundling &&
        !props.taskReadOnly &&
        [0, 3, 6].includes(status) &&
        row.original.taskId !== props.task?.id &&
        props.workspace.name !== "taskReview" &&
        !AsCooperativeWork(props.task).isTagType();

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
    maxWidth: 25,
  };

  columns.featureId = {
    id: "featureId",
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: (t) => t.name || t.title,
    Cell: ({ value }) => value || "",
    Filter: ({ column: { filterValue, setFilter } }) => (
      <SearchFilter value={filterValue} onChange={setFilter} placeholder="Search feature ID..." />
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
          <span className="mr-flex mr-items-center mr-relative">
            <SvgSymbol
              sym="box-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-3 mr-h-3 mr-absolute mr-left-0 mr--ml-4"
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
              className="mr-fill-current mr-w-4 mr-h-4 mr-absolute mr-left-0 mr--ml-2"
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
      <SearchFilter value={filterValue} onChange={setFilter} placeholder="Search ID..." />
    ),
    maxWidth: 120,
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
    maxWidth: 180,
    minWidth: 150,
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
    maxWidth: 180,
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
    maxWidth: 180,
    minWidth: 150,
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
    width: 180,
    maxWidth: 180,
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
    maxWidth: 180,
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
    maxWidth: 180,
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
    disableSortBy: true,
  };

  columns.comments = {
    id: "viewComments",
    Header: props.intl.formatMessage(messages.commentsLabel),
    accessor: "commentID",
    Cell: ({ row }) => <ViewCommentsButton onClick={() => openComments(row.original.id)} />,
    width: 110,
    maxWidth: 110,
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
