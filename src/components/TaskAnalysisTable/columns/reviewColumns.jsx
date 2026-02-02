import { differenceInSeconds, parseISO } from "date-fns";
import _kebabCase from "lodash/kebabCase";
import { Fragment } from "react";
import { FormattedDate, FormattedTime } from "react-intl";
import AsColoredHashable from "../../../interactions/Hashable/AsColoredHashable";
import {
  keysByReviewStatus,
  messagesByReviewStatus,
} from "../../../services/Task/TaskReview/TaskReviewStatus";
import messages from "../Messages";
import TableSearchFilter from "../TableSearchFilter";
import { StatusLabel, makeInvertable } from "../TaskTableHelpers";

/**
 * Creates the Review Requested By (Mapper) column
 */
export const createReviewRequestedByColumn = (props) => ({
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
          href={props.targetUserOSMProfileUrl?.()}
          target="_blank"
          rel="noopener noreferrer"
        >
          {username}
        </a>
      </div>
    );
  },
  Filter: ({ column: { filterValue, setFilter } }) => (
    <TableSearchFilter
      filterValue={filterValue}
      setFilter={setFilter}
      placeholder={props.intl.formatMessage(messages.searchMapperPlaceholder)}
    />
  ),
});

/**
 * Creates the Reviewed At column
 */
export const createReviewedAtColumn = (props) => ({
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
});

/**
 * Creates the Meta Reviewed At column
 */
export const createMetaReviewedAtColumn = (props) => ({
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
});

/**
 * Creates the Review Duration column
 */
export const createReviewDurationColumn = (props) => ({
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
});

/**
 * Creates the Reviewed By column
 */
export const createReviewedByColumn = (props) => ({
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
  Filter: ({ column: { filterValue, setFilter } }) => (
    <TableSearchFilter
      filterValue={filterValue}
      setFilter={setFilter}
      placeholder={props.intl.formatMessage(messages.searchReviewerPlaceholder)}
    />
  ),
});

/**
 * Creates the Meta Reviewed By column
 */
export const createMetaReviewedByColumn = (props) => ({
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
  Filter: ({ column: { filterValue, setFilter } }) => (
    <TableSearchFilter
      filterValue={filterValue}
      setFilter={setFilter}
      placeholder={props.intl.formatMessage(messages.searchMetaReviewerPlaceholder)}
    />
  ),
});

/**
 * Creates the Review Status column
 */
export const createReviewStatusColumn = (props) => ({
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
});

/**
 * Creates the Meta Review Status column
 */
export const createMetaReviewStatusColumn = (props) => ({
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
});

/**
 * Creates the Additional Reviewers column
 */
export const createAdditionalReviewersColumn = (props) => ({
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
});
