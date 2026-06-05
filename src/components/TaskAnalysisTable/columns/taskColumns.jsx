import _kebabCase from "lodash/kebabCase";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import AsIdentifiableFeature from "../../../interactions/TaskFeature/AsIdentifiableFeature";
import { loadObjectsIntoJOSM } from "../../../services/Editor/Editor";
import { messagesByPriority } from "../../../services/Task/TaskPriority/TaskPriority";
import { keysByStatus, messagesByStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import messages from "../Messages";
import TableSearchFilter from "../TableSearchFilter";
import { StatusLabel } from "../TaskTableHelpers";

const osmIdForTask = (task) => {
  const feature = task?.geometries?.features?.[0];
  if (!feature) return null;
  const identifiable = AsIdentifiableFeature(feature);
  const osmId = identifiable.osmId();
  const osmType = identifiable.osmType();
  if (!osmId || !osmType) return null;
  return `${osmType[0]}${osmId}`;
};

/**
 * Creates the OSM ID column
 */
export const createFeatureIdColumn = (props) => ({
  id: "featureId",
  Header: props.intl.formatMessage(messages.featureIdLabel),
  accessor: (t) => osmIdForTask(t) || t.name || t.title,
  Cell: ({ value, row }) => {
    const josmId = osmIdForTask(row.original);
    const content = (
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
    );

    if (!josmId) {
      return content;
    }

    return (
      <a
        href={`http://127.0.0.1:8111/load_object?objects=${josmId}&new_layer=true`}
        onClick={(e) => {
          e.preventDefault();
          loadObjectsIntoJOSM([josmId], true);
        }}
        className="mr-links-green-lighter"
        title="Open in JOSM"
      >
        {content}
      </a>
    );
  },
  Filter: ({ column: { filterValue, setFilter } }) => (
    <TableSearchFilter
      filterValue={filterValue}
      setFilter={setFilter}
      placeholder={props.intl.formatMessage(messages.searchFeatureIdPlaceholder)}
    />
  ),
  disableSortBy: true,
});

/**
 * Creates the Internal ID column
 */
export const createIdColumn = (props) => ({
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
      row.original.bundleId === props.taskBundle?.bundleId
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
    <TableSearchFilter
      filterValue={filterValue}
      setFilter={setFilter}
      placeholder={props.intl.formatMessage(messages.searchIdPlaceholder)}
    />
  ),
});

/**
 * Creates the Status column
 */
export const createStatusColumn = (props) => ({
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
});

/**
 * Creates the Priority column
 */
export const createPriorityColumn = (props) => ({
  id: "priority",
  Header: props.intl.formatMessage(messages.priorityLabel),
  accessor: "priority",
  Cell: ({ value }) => (
    <div>
      <FormattedMessage {...messagesByPriority[value]} />
    </div>
  ),
  width: 90,
});

/**
 * Creates the Mapped On column
 */
export const createMappedOnColumn = (props) => ({
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
});

/**
 * Creates the Completed Duration column
 */
export const createCompletedDurationColumn = (props) => ({
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
});
