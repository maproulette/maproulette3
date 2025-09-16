import { parseISO } from "date-fns";
import _kebabCase from "lodash/kebabCase";
import _map from "lodash/map";
import { Fragment } from "react";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import AsColoredHashable from "../../../interactions/Hashable/AsColoredHashable";
import {
  TaskPriority,
  keysByPriority,
  messagesByPriority,
} from "../../../services/Task/TaskPriority/TaskPriority";
import {
  ReviewTasksType,
} from "../../../services/Task/TaskReview/TaskReview";
import {
  TaskReviewStatus,
  isMetaReviewStatus,
  isNeedsReviewStatus,
  keysByReviewStatus,
  messagesByMetaReviewStatus,
  messagesByReviewStatus,
} from "../../../services/Task/TaskReview/TaskReviewStatus";
import {
  TaskStatus,
  isReviewableStatus,
  keysByStatus,
  messagesByStatus,
} from "../../../services/Task/TaskStatus/TaskStatus";
import IntlDatePicker from "../../../components/IntlDatePicker/IntlDatePicker";
import InTableTagFilter from "../../../components/KeywordAutosuggestInput/InTableTagFilter";
import SvgSymbol from "../../../components/SvgSymbol/SvgSymbol";
import {
  SearchFilter,
} from "../../../components/TableShared/EnhancedTable";
import {
  inputStyles,
  linkStyles,
} from "../../../components/TableShared/TableStyles";
import {
  StatusLabel,
  ViewCommentsButton,
  makeInvertable,
} from "../../../components/TaskAnalysisTable/TaskTableHelpers";
import FilterSuggestTextBox from "./FilterSuggestTextBox";
import { FILTER_SEARCH_ALL } from "./FilterSuggestTextBox";
import messages from "./Messages";

export const setupColumnTypes = (props, openComments, criteria) => {
  const handleClick = (e, linkTo) => {
    e.preventDefault();
    props.history.push({
      pathname: linkTo,
      state: criteria,
    });
  };

  const columns = {};

  columns.id = {
    id: "id",
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: "id",
    Cell: ({ value, row }) => {
      if (row.original.isBundlePrimary) {
        return (
          <span className="mr-flex mr-items-center mr-relative">
            <SvgSymbol
              sym="box-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-3 mr-h-3 mr-mr-2"
              title={props.intl.formatMessage(messages.multipleTasksTooltip)}
            />
            {value}
          </span>
        );
      } else if (Number.isFinite(row.original.bundleId) && row.original.bundleId) {
        return (
          <span className="mr-flex mr-items-center mr-relative">
            <SvgSymbol
              sym="puzzle-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-3 mr-h-3 mr-mr-2"
              title={props.intl.formatMessage(messages.bundleMemberTooltip)}
            />
            {value}
          </span>
        );
      } else {
        return <span>{value}</span>;
      }
    },
    width: 120,
    minWidth: 80,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.id || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.id = value;
        } else {
          delete newFilters.id;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
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

  columns.featureId = {
    id: "featureId",
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: (row) => row.name || row.title,
    width: 120,
    minWidth: 80,
    disableSortBy: true,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.featureId || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.featureId = value;
        } else {
          delete newFilters.featureId;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
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
  };

  columns.status = {
    id: "status",
    Header: makeInvertable(
      props.intl.formatMessage(messages.statusLabel),
      () => props.invertField("status"),
      criteria?.invertFields?.status,
    ),
    accessor: "status",
    Cell: ({ value }) => (
      <StatusLabel
        value={value}
        intlMessage={messagesByStatus[value]}
        className={`mr-status-${_kebabCase(keysByStatus[value])}`}
      />
    ),
    width: 140,
    minWidth: 100,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.status || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value && value !== "all") {
          newFilters.status = value;
        } else {
          delete newFilters.status;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      const options = [
        <option key="all" value="all">
          All
        </option>,
      ];

      for (const [name, value] of Object.entries(TaskStatus)) {
        if (isReviewableStatus(value)) {
          options.push(
            <option key={name} value={value}>
              {props.intl.formatMessage(messagesByStatus[value])}
            </option>,
          );
        }
      }

      return (
        <div className="mr-flex" onClick={(e) => e.stopPropagation()}>
          <select
            onChange={(event) => updateFilter(event.target.value)}
            className={inputStyles}
            style={{ width: "90%" }}
            value={filterValue || "all"}
          >
            {options}
          </select>
          <div className="mr-pointer-events-none mr-absolute mr-inset-y-0 mr-right-0 mr-flex mr-items-center mr-px-2">
            <SvgSymbol
              sym="dropdown-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5 mr-text-white"
            />
          </div>
        </div>
      );
    },
  };

  columns.priority = {
    id: "priority",
    Header: makeInvertable(
      props.intl.formatMessage(messages.priorityLabel),
      () => props.invertField("priority"),
      criteria?.invertFields?.priority,
    ),
    accessor: "priority",
    Cell: ({ value }) => (
      <StatusLabel
        value={value}
        intlMessage={messagesByPriority[value]}
        className={`mr-status-${_kebabCase(keysByPriority[value])}`}
      />
    ),
    width: 140,
    minWidth: 100,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.priority || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value && value !== "all") {
          newFilters.priority = value;
        } else {
          delete newFilters.priority;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      const options = [
        <option key="all" value="all">
          All
        </option>,
      ];

      for (const [name, value] of Object.entries(TaskPriority)) {
        options.push(
          <option key={name} value={value}>
            {props.intl.formatMessage(messagesByPriority[value])}
          </option>,
        );
      }

      return (
        <div className="mr-flex" onClick={(e) => e.stopPropagation()}>
          <select
            onChange={(event) => updateFilter(event.target.value)}
            className={inputStyles}
            style={{ width: "90%" }}
            value={filterValue || "all"}
          >
            {options}
          </select>
          <div className="mr-pointer-events-none mr-absolute mr-inset-y-0 mr-right-0 mr-flex mr-items-center mr-px-2">
            <SvgSymbol
              sym="dropdown-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5 mr-text-white"
            />
          </div>
        </div>
      );
    },
  };

  columns.reviewRequestedBy = {
    id: "reviewRequestedBy",
    Header: makeInvertable(
      props.intl.formatMessage(messages.reviewRequestedByLabel),
      () => props.invertField("reviewRequestedBy"),
      criteria?.invertFields?.reviewRequestedBy,
    ),
    accessor: (row) => row.reviewRequestedBy?.username,
    Cell: ({ value }) => (
      <div className="row-user-column" style={{ color: AsColoredHashable(value).hashColor }}>
        {value}
      </div>
    ),
    width: 180,
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.reviewRequestedBy || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.reviewRequestedBy = value;
        } else {
          delete newFilters.reviewRequestedBy;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
          <SearchFilter
            value={filterValue}
            onChange={updateFilter}
            placeholder="Search mapper..."
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
        {_map(row.original.additionalReviewers, (reviewer, index) => (
          <Fragment key={reviewer + "-" + index}>
            <span style={{ color: AsColoredHashable(reviewer.username).hashColor }}>
              {reviewer.username}
            </span>
            {index + 1 !== row.original.additionalReviewers?.length ? ", " : ""}
          </Fragment>
        ))}
      </div>
    ),
    width: 180,
    minWidth: 120,
    disableSortBy: true,
  };

  columns.challengeId = {
    id: "challengeId",
    Header: props.intl.formatMessage(messages.challengeIdLabel),
    accessor: "parent.id",
    Cell: ({ value }) => <span>{value}</span>,
    width: 120,
    minWidth: 80,
    disableSortBy: true,
  };

  columns.challenge = {
    id: "challenge",
    Header: makeInvertable(
      props.intl.formatMessage(messages.challengeLabel),
      () => props.invertField("challenge"),
      criteria?.invertFields?.challenge,
    ),
    accessor: "parent.name",
    Cell: ({ value }) => <div className="row-challenge-column mr-text-white">{value}</div>,
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.challenge || "";
      const updateFilter = (item) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (item && item.id !== FILTER_SEARCH_ALL) {
          newFilters.challenge = item;
        } else {
          delete newFilters.challenge;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-flex" onClick={(e) => e.stopPropagation()}>
          <div>
            <FilterSuggestTextBox
              filterType={"challenge"}
              filterAllLabel={props.intl.formatMessage(messages.allChallenges)}
              selectedItem={""}
              onChange={(item) => {
                updateFilter(item);
                props.updateChallengeFilterIds(item);
              }}
              value={filterValue || ""}
              itemList={props.reviewChallenges}
              multiselect={props.challengeFilterIds}
              inputClassName={inputStyles}
            />
          </div>
          {props.challengeFilterIds?.length &&
          props.challengeFilterIds?.[0] !== FILTER_SEARCH_ALL &&
          props.challengeFilterIds?.[0] !== -2 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateFilter({ id: FILTER_SEARCH_ALL, name: "All Challenges" });
                props.updateChallengeFilterIds({ id: FILTER_SEARCH_ALL, name: "All Challenges" });
              }}
            >
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-2.5 mr-h-2.5 mr-ml-2"
              />
            </button>
          ) : null}
        </div>
      );
    },
    disableSortBy: true,
  };

  columns.projectId = {
    id: "projectId",
    Header: props.intl.formatMessage(messages.projectIdLabel),
    accessor: "parent.parent.id",
    Cell: ({ value }) => <span>{value}</span>,
    width: 120,
    minWidth: 80,
    disableSortBy: true,
  };

  columns.project = {
    id: "project",
    Header: makeInvertable(
      props.intl.formatMessage(messages.projectLabel),
      () => props.invertField("project"),
      criteria?.invertFields?.project,
    ),
    accessor: "parent.parent.displayName",
    Cell: ({ value }) => <div className="row-project-column">{value}</div>,
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.project || "";
      const updateFilter = (item) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (item && item.id !== FILTER_SEARCH_ALL) {
          newFilters.project = item;
        } else {
          delete newFilters.project;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-flex" onClick={(e) => e.stopPropagation()}>
          <div>
            <FilterSuggestTextBox
              filterType={"project"}
              filterAllLabel={props.intl.formatMessage(messages.allProjects)}
              selectedItem={""}
              onChange={(item) => {
                updateFilter(item);
                props.updateProjectFilterIds(item);
              }}
              value={filterValue || ""}
              itemList={_map(props.reviewProjects, (p) => ({ id: p.id, name: p.displayName }))}
              multiselect={props.projectFilterIds}
              inputClassName={inputStyles}
            />
          </div>
          {props.projectFilterIds?.length &&
          props.projectFilterIds?.[0] !== FILTER_SEARCH_ALL &&
          props.projectFilterIds?.[0] !== -2 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateFilter({ id: FILTER_SEARCH_ALL, name: "All Projects" });
                props.updateProjectFilterIds({ id: FILTER_SEARCH_ALL, name: "All Projects" });
              }}
            >
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-2.5 mr-h-2.5 mr-ml-2"
              />
            </button>
          ) : null}
        </div>
      );
    },
    disableSortBy: true,
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
    width: 180,
    minWidth: 120,
    Filter: ({ column }) => {
      let filterValue = props.reviewCriteria?.filters?.mappedOn;
      if (typeof filterValue === "string" && filterValue !== "") {
        filterValue = parseISO(filterValue);
      }

      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.mappedOn = value;
        } else {
          delete newFilters.mappedOn;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-space-x-1 mr-flex" onClick={(e) => e.stopPropagation()}>
          <IntlDatePicker
            selected={filterValue}
            onChange={updateFilter}
            intl={props.intl}
          />
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
    minWidth: 180,
    width: 200,
    Filter: ({ column }) => {
      let filterValue = props.reviewCriteria?.filters?.reviewedAt;
      if (typeof filterValue === "string" && filterValue !== "") {
        filterValue = parseISO(filterValue);
      }

      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.reviewedAt = value;
        } else {
          delete newFilters.reviewedAt;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-space-x-1 mr-flex" onClick={(e) => e.stopPropagation()}>
          <IntlDatePicker
            selected={filterValue}
            onChange={updateFilter}
            intl={props.intl}
            className={inputStyles}
          />
          {filterValue && (
            <button
              className="mr-filter-clear mr-ml-2 mr-absolute mr-right-2"
              onClick={(e) => {
                e.stopPropagation();
                updateFilter(null);
              }}
            >
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-2 mr-h-2"
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
    minWidth: 180,
    width: 200,
    Filter: ({ column }) => {
      let filterValue = props.reviewCriteria?.filters?.metaReviewedAt;
      if (typeof filterValue === "string" && filterValue !== "") {
        filterValue = parseISO(filterValue);
      }

      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.metaReviewedAt = value;
        } else {
          delete newFilters.metaReviewedAt;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-space-x-1 mr-flex" onClick={(e) => e.stopPropagation()}>
          <IntlDatePicker
            selected={filterValue}
            onChange={updateFilter}
            intl={props.intl}
            className={inputStyles}
          />
          {filterValue && (
            <button
              className="mr-filter-clear mr-ml-2 mr-absolute mr-right-2"
              onClick={(e) => {
                e.stopPropagation();
                updateFilter(null);
              }}
            >
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-2 mr-h-2"
              />
            </button>
          )}
        </div>
      );
    },
  };

  columns.reviewedBy = {
    id: "reviewedBy",
    Header: makeInvertable(
      props.intl.formatMessage(messages.reviewedByLabel),
      () => props.invertField("reviewedBy"),
      criteria?.invertFields?.reviewedBy,
    ),
    accessor: "reviewedBy.username",
    Cell: ({ row }) => (
      <div
        className="row-user-column"
        style={{ color: AsColoredHashable(row.original.reviewedBy?.username).hashColor }}
      >
        {row.original.reviewedBy ? row.original.reviewedBy.username : "N/A"}
      </div>
    ),
    width: 180,
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.reviewedBy || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.reviewedBy = value;
        } else {
          delete newFilters.reviewedBy;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
          <SearchFilter
            value={filterValue}
            onChange={updateFilter}
            placeholder="Search reviewer..."
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

  columns.reviewStatus = {
    id: "reviewStatus",
    Header: makeInvertable(
      props.intl.formatMessage(messages.reviewStatusLabel),
      () => props.invertField("reviewStatus"),
      criteria?.invertFields?.reviewStatus,
    ),
    accessor: "reviewStatus",
    Cell: ({ value }) => (
      <StatusLabel
        value={value}
        intlMessage={messagesByReviewStatus[value]}
        className={`mr-review-${_kebabCase(keysByReviewStatus[value])}`}
      />
    ),
    width: 180,
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.reviewStatus || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value && value !== "all") {
          newFilters.reviewStatus = value;
        } else {
          delete newFilters.reviewStatus;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      const options = [
        <option key="all" value="all">
          All
        </option>,
      ];

      if (props.reviewTasksType === ReviewTasksType.metaReviewTasks) {
        for (const status of [TaskReviewStatus.approved, TaskReviewStatus.approvedWithFixes]) {
          options.push(
            <option key={keysByReviewStatus[status]} value={status}>
              {props.intl.formatMessage(messagesByReviewStatus[status])}
            </option>,
          );
        }
      } else if (
        props.reviewTasksType === ReviewTasksType.reviewedByMe ||
        props.reviewTasksType === ReviewTasksType.myReviewedTasks ||
        props.reviewTasksType === ReviewTasksType.allReviewedTasks
      ) {
        for (const status of Object.values(TaskReviewStatus)) {
          if (status !== TaskReviewStatus.unnecessary) {
            options.push(
              <option key={keysByReviewStatus[status]} value={status}>
                {props.intl.formatMessage(messagesByReviewStatus[status])}
              </option>,
            );
          }
        }
      } else {
        for (const status of Object.values(TaskReviewStatus)) {
          if (isNeedsReviewStatus(status)) {
            options.push(
              <option key={keysByReviewStatus[status]} value={status}>
                {props.intl.formatMessage(messagesByReviewStatus[status])}
              </option>,
            );
          }
        }
      }

      return (
        <div className="mr-flex" onClick={(e) => e.stopPropagation()}>
          <select
            onChange={(event) => updateFilter(event.target.value)}
            className={inputStyles}
            style={{ width: "90%" }}
            value={filterValue || "all"}
          >
            {options}
          </select>
          <div className="mr-pointer-events-none mr-absolute mr-inset-y-0 mr-right-0 mr-flex mr-items-center mr-px-2">
            <SvgSymbol
              sym="dropdown-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5 mr-text-white"
            />
          </div>
        </div>
      );
    },
  };

  columns.metaReviewStatus = {
    id: "metaReviewStatus",
    Header: makeInvertable(
      props.intl.formatMessage(messages.metaReviewStatusLabel),
      () => props.invertField("metaReviewStatus"),
      criteria?.invertFields?.metaReviewStatus,
    ),
    accessor: "metaReviewStatus",
    Cell: ({ value }) =>
      value === undefined ? (
        ""
      ) : (
        <StatusLabel
          value={value}
          intlMessage={messagesByMetaReviewStatus[value]}
          className={`mr-review-${_kebabCase(keysByReviewStatus[value])}`}
        />
      ),
    width: 180,
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.metaReviewStatus || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value && value !== "all") {
          newFilters.metaReviewStatus = value;
        } else {
          delete newFilters.metaReviewStatus;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      const options = [];

      if (props.reviewTasksType === ReviewTasksType.metaReviewTasks) {
        options.push(
          <option key="all" value="0,-2">
            {props.intl.formatMessage(messages.allNeeded)}
          </option>,
        );
        options.push(
          <option key="none" value="-2">
            {props.intl.formatMessage(messages.metaUnreviewed)}
          </option>,
        );
        options.push(
          <option key={keysByReviewStatus[TaskReviewStatus.needed]} value={TaskReviewStatus.needed}>
            {props.intl.formatMessage(messagesByMetaReviewStatus[TaskReviewStatus.needed])}
          </option>,
        );
      } else {
        options.push(
          <option key="all" value="all">
            All
          </option>,
        );
        options.push(
          <option key="none" value="-2">
            {props.intl.formatMessage(messages.metaUnreviewed)}
          </option>,
        );
        for (const status of Object.values(TaskReviewStatus)) {
          if (status !== TaskReviewStatus.unnecessary && isMetaReviewStatus(status)) {
            options.push(
              <option key={keysByReviewStatus[status]} value={status}>
                {props.intl.formatMessage(messagesByMetaReviewStatus[status])}
              </option>,
            );
          }
        }
      }

      return (
        <div className="mr-flex" onClick={(e) => e.stopPropagation()}>
          <select
            onChange={(event) => updateFilter(event.target.value)}
            className={inputStyles}
            style={{ width: "90%" }}
            value={filterValue || "all"}
          >
            {options}
          </select>
          <div className="mr-pointer-events-none mr-absolute mr-inset-y-0 mr-right-0 mr-flex mr-items-center mr-px-2">
            <SvgSymbol
              sym="dropdown-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5 mr-text-white"
            />
          </div>
        </div>
      );
    },
  };

  columns.metaReviewedBy = {
    id: "metaReviewedBy",
    Header: makeInvertable(
      props.intl.formatMessage(messages.metaReviewedByLabel),
      () => props.invertField("metaReviewedBy"),
      criteria?.invertFields?.metaReviewedBy,
    ),
    accessor: "metaReviewedBy.username",
    Cell: ({ row }) => (
      <div
        className="row-user-column"
        style={{ color: AsColoredHashable(row.original.metaReviewedBy?.username).hashColor }}
      >
        {row.original.metaReviewedBy ? row.original.metaReviewedBy.username : ""}
      </div>
    ),
    width: 180,
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.metaReviewedBy || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.metaReviewedBy = value;
        } else {
          delete newFilters.metaReviewedBy;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
          <SearchFilter
            value={filterValue}
            onChange={updateFilter}
            placeholder="Search meta reviewer..."
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

  columns.reviewerControls = {
    id: "controls",
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    Cell: ({ row }) => {
      const linkTo = `/challenge/${row.original.parent.id}/task/${row.original.id}/review`;
      let action = (
        <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
          <FormattedMessage {...messages.reviewTaskLabel} />
        </Link>
      );

      if (row.original.reviewedBy) {
        if (row.original.reviewStatus === TaskReviewStatus.needed) {
          action = (
            <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </Link>
          );
        } else if (row.original.reviewStatus === TaskReviewStatus.disputed) {
          action = (
            <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
              <FormattedMessage {...messages.resolveTaskLabel} />
            </Link>
          );
        }
      }

      return <div className="row-controls-column">{action}</div>;
    },
    width: 120,
    minWidth: 110,
    disableSortBy: true,
  };

  columns.reviewCompleteControls = {
    id: "controls",
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    Cell: ({ row }) => {
      let linkTo = `/challenge/${row.original.parent.id}/task/${row.original.id}`;
      let message = <FormattedMessage {...messages.viewTaskLabel} />;

      // The mapper needs to rereview a contested task.
      if (
        row.original.reviewStatus === TaskReviewStatus.disputed ||
        row.original.metaReviewStatus === TaskReviewStatus.rejected
      ) {
        linkTo += "/review";
        message = <FormattedMessage {...messages.resolveTaskLabel} />;
      }

      return (
        <div className="row-controls-column mr-links-green-lighter">
          <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
            {message}
          </Link>
        </div>
      );
    },
  };

  columns.metaReviewerControls = {
    id: "controls",
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    Cell: ({ row }) => {
      const linkTo = `/challenge/${row.original.parent.id}/task/${row.original.id}/meta-review`;
      let action = (
        <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
          <FormattedMessage {...messages.metaReviewTaskLabel} />
        </Link>
      );

      if (row.original.reviewedBy) {
        if (row.original.reviewStatus === TaskReviewStatus.needed) {
          action = (
            <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </Link>
          );
        } else if (row.original.reviewStatus === TaskReviewStatus.disputed) {
          action = (
            <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
              <FormattedMessage {...messages.resolveTaskLabel} />
            </Link>
          );
        }
      }

      return <div className="row-controls-column">{action}</div>;
    },
    width: 120,
    minWidth: 110,
  };

  columns.mapperControls = {
    id: "controls",
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    Cell: ({ row }) => {
      const linkTo = `/challenge/${row.original.parent.id}/task/${row.original.id}`;
      let message =
        row.original.reviewStatus === TaskReviewStatus.rejected ? (
          <FormattedMessage {...messages.fixTaskLabel} />
        ) : (
          <FormattedMessage {...messages.viewTaskLabel} />
        );

      return (
        <div className="row-controls-column mr-links-green-lighter">
          <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)} className={linkStyles}>
            {message}
          </Link>
          {!props.metaReviewEnabled &&
            row.original.reviewStatus !== TaskReviewStatus.needed &&
            row.original.reviewedBy &&
            row.original.reviewedBy.id !== props.user?.id && (
              <Link
                to={`${linkTo}/review`}
                onClick={(e) => handleClick(e, `${linkTo}/review`)}
                className={linkStyles}
              >
                <FormattedMessage {...messages.reviewFurtherTaskLabel} />
              </Link>
            )}
        </div>
      );
    },
    width: 120,
    minWidth: 90,
    disableSortBy: true,
  };

  columns.viewComments = {
    id: "viewComments",
    Header: props.intl.formatMessage(messages.viewCommentsLabel),
    accessor: "commentID",
    Cell: (props) => <ViewCommentsButton onClick={() => openComments(props.row.original.id)} />,
    width: 110,
    minWidth: 110,
    disableSortBy: true,
  };

  columns.tags = {
    id: "tags",
    Header: props.intl.formatMessage(messages.tagsLabel),
    accessor: "tags",
    Cell: ({ row }) => (
      <div className="mr-text-white mr-whitespace-normal mr-flex mr-flex-wrap mr-px-1 mr-py-2">
        {row.original.tags && row.original.tags.length > 0 ? (
          _map(row.original.tags, (t) => {
            if (t.name === "") return null;
            return (
              <div key={t.id}>
                <span className="mr-relative mr-z-10">{t.name}</span>
              </div>
            );
          })
        ) : (
          <span className="mr-text-grey-lighter mr-text-sm mr-italic">No tags</span>
        )}
      </div>
    ),
    minWidth: 120,
    Filter: ({ column }) => {
      const filterValue = props.reviewCriteria?.filters?.tags || "";
      const updateFilter = (value) => {
        const newFilters = { ...props.reviewCriteria?.filters };
        if (value) {
          newFilters.tags = value;
        } else {
          delete newFilters.tags;
        }
        props.updateReviewCriteria({
          ...props.reviewCriteria,
          filters: newFilters,
          page: 0,
        });
      };

      return (
        <InTableTagFilter
          {...props}
          onChange={updateFilter}
          value={filterValue}
          inputClassName={inputStyles}
        />
      );
    },
    disableSortBy: true,
  };

  return columns;
};
