import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import InTableTagFilter from "../../KeywordAutosuggestInput/InTableTagFilter";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import messages from "../Messages";
import { ViewCommentsButton } from "../TaskTableHelpers";
import { BUNDLEABLE_STATUSES } from "../utils/bundleHelpers";

/**
 * Creates the Edit Bundle column for managing task bundles
 */
export const createEditBundleColumn = (props) => ({
  id: "editBundle",
  accessor: "remove",
  Cell: ({ row }) => {
    const { taskBundle, task, initialBundle, user, bundleEditsDisabled } = props;
    const { id: taskId, bundleId, status } = row.original;

    const isActiveTask = taskId === task?.id;
    const isInActiveBundle = taskBundle?.taskIds?.includes(taskId);
    const alreadyBundled = bundleId && initialBundle?.bundleId !== bundleId;
    const validBundlingStatus =
      initialBundle?.taskIds?.includes(taskId) || BUNDLEABLE_STATUSES.includes(status);
    const isLocked = row.original.lockedBy && row.original.lockedBy !== user?.id;

    return (
      <div>
        {!isActiveTask &&
          validBundlingStatus &&
          isInActiveBundle &&
          !alreadyBundled &&
          !isLocked && (
            <button
              disabled={bundleEditsDisabled}
              className="mr-text-red-light"
              style={{
                cursor: bundleEditsDisabled ? "default" : "pointer",
                opacity: bundleEditsDisabled ? 0.3 : 1,
                pointerEvents: bundleEditsDisabled ? "none" : "auto",
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
              disabled={bundleEditsDisabled}
              className="mr-text-green-lighter"
              style={{
                cursor: bundleEditsDisabled ? "default" : "pointer",
                opacity: bundleEditsDisabled ? 0.3 : 1,
                pointerEvents: bundleEditsDisabled ? "none" : "auto",
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
});

/**
 * Creates the Controls column with action links
 */
export const createControlsColumn = (props, taskBaseRoute, manager) => ({
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
      {manager?.canWriteProject(props.challenge?.parent) && (
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
            pathname: `/challenge/${props.challenge?.id}/task/${row.original.id}/review`,
            state: { ...props.criteria, filters: { challengeId: props.challenge?.id } },
          }}
          className="mr-mr-2"
        >
          <FormattedMessage {...messages.reviewTaskLabel} />
        </Link>
      )}
      <Link to={`/challenge/${props.challenge?.id}/task/${row.original.id}`}>
        <FormattedMessage {...messages.startTaskLabel} />
      </Link>
    </div>
  ),
  width: 150,
  minWidth: 150,
  disableSortBy: true,
});

/**
 * Creates the Comments column
 */
export const createCommentsColumn = (props, openComments) => ({
  id: "viewComments",
  Header: props.intl.formatMessage(messages.commentsLabel),
  accessor: "commentID",
  Cell: ({ row }) => <ViewCommentsButton onClick={() => openComments(row.original.id)} />,
  width: 110,
  disableSortBy: true,
});

/**
 * Creates the Tags column
 */
export const createTagsColumn = (props) => ({
  id: "tags",
  Header: props.intl.formatMessage(messages.tagsLabel),
  accessor: "tags",
  Cell: ({ value }) => {
    return (
      <div className="row-challenge-column mr-text-white mr-whitespace-normal mr-flex mr-flex-wrap">
        {value?.map((t) =>
          t.name === "" ? null : (
            <div className="mr-inline mr-bg-white-10 mr-rounded mr-py-1 mr-px-2 mr-m-1" key={t.id}>
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
});
