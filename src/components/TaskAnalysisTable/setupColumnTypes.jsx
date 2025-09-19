import { differenceInSeconds, parseISO } from "date-fns";
import _kebabCase from "lodash/kebabCase";
import { Fragment } from "react";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import AsColoredHashable from "../../interactions/Hashable/AsColoredHashable";
import AsCooperativeWork from "../../interactions/Task/AsCooperativeWork";
import { messagesByPriority } from "../../services/Task/TaskPriority/TaskPriority";
import {
  keysByReviewStatus,
  messagesByReviewStatus,
} from "../../services/Task/TaskReview/TaskReviewStatus";
import { keysByStatus, messagesByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import IntlDatePicker from "../IntlDatePicker/IntlDatePicker";
import InTableTagFilter from "../KeywordAutosuggestInput/InTableTagFilter";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import { SearchFilter } from "../TableShared/EnhancedTable";
import { inputStyles } from "../TableShared/TableStyles";
import messages from "./Messages";
import { StatusLabel, ViewCommentsButton, makeInvertable } from "./TaskTableHelpers";

export const setupColumnTypes = (props, taskBaseRoute, manager, openComments) => {
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
            checked={props.isTaskSelected(row.original.id)}
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
    Cell: ({ value }) => <div>{value || ""}</div>,
    Filter: ({ column }) => {
      const filterValue = props.criteria?.filters?.featureId || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.criteria?.filters };
        if (value) {
          newFilters.featureId = value;
        } else {
          delete newFilters.featureId;
        }
        props.updateCriteria({ filters: newFilters, page: 0 });
      };

      return (
        <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
          <SearchFilter
            value={filterValue}
            onChange={updateFilter}
            placeholder="Search feature ID..."
            inputClassName={inputStyles}
          />
          {filterValue && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => updateFilter("")}
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
    Filter: ({ column }) => {
      const filterValue = props.criteria?.filters?.id || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.criteria?.filters };
        if (value) {
          newFilters.id = value;
        } else {
          delete newFilters.id;
        }
        props.updateCriteria({ filters: newFilters, page: 0 });
      };

      return (
        <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
          <SearchFilter
            value={filterValue}
            onChange={updateFilter}
            placeholder="Search ID..."
            inputClassName={inputStyles}
          />
          {filterValue && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => updateFilter("")}
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
    Filter: ({ column }) => {
      let filterValue = props.criteria?.filters?.mappedOn;
      if (typeof filterValue === "string" && filterValue !== "") {
        filterValue = parseISO(filterValue);
      }

      const updateFilter = (value) => {
        // Preserve horizontal scroll position
        const scrollContainer = document.querySelector(".mr-overflow-x-auto");
        const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;

        const newFilters = { ...props.criteria?.filters };
        if (value) {
          // Convert Date object to ISO format string (YYYY-MM-DD)
          const isoDateString = value instanceof Date ? value.toISOString().split("T")[0] : value;
          newFilters.mappedOn = isoDateString;
        } else {
          delete newFilters.mappedOn;
        }

        props.updateCriteria({ filters: newFilters, page: 0 });

        // Restore horizontal scroll position after a short delay
        setTimeout(() => {
          if (scrollContainer) {
            scrollContainer.scrollLeft = scrollLeft;
          }
        }, 50);
      };

      return (
        <div className="mr-space-x-1 mr-flex" onClick={(e) => e.stopPropagation()}>
          <IntlDatePicker selected={filterValue} onChange={updateFilter} intl={props.intl} />
          {filterValue && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors mr-absolute mr-right-2 mr-top-2"
              onClick={() => updateFilter(null)}
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

    disableSortBy: true,
  };

  columns.comments = {
    id: "viewComments",
    Header: props.intl.formatMessage(messages.commentsLabel),
    accessor: "commentID",
    Cell: ({ row }) => <ViewCommentsButton onClick={() => openComments(row.original.id)} />,

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
    Filter: ({ column }) => {
      const filterValue = props.criteria?.filters?.tags || "";
      const preferredTags = [
        ...(props.challenge?.preferredTags?.split(",") ?? []),
        ...(props.challenge?.preferredReviewTags?.split(",") ?? []),
      ].filter(Boolean);

      const updateFilter = (value) => {
        const newFilters = { ...props.criteria?.filters };
        if (value) {
          newFilters.tags = value;
        } else {
          delete newFilters.tags;
        }
        props.updateCriteria({ filters: newFilters, page: 0 });
      };

      return (
        <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
          <InTableTagFilter
            {...props}
            preferredTags={preferredTags}
            onChange={updateFilter}
            value={filterValue}
          />
          {filterValue && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={() => updateFilter("")}
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
  };

  return columns;
};
