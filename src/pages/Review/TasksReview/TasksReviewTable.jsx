import classNames from "classnames";
import { parseISO } from "date-fns";
import _cloneDeep from "lodash/cloneDeep";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _kebabCase from "lodash/kebabCase";
import _keys from "lodash/keys";
import _map from "lodash/map";
import _omit from "lodash/omit";
import _pull from "lodash/pull";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import { useFilters, usePagination, useSortBy, useTable } from "react-table";
import BusySpinner from "../../../components/BusySpinner/BusySpinner";
import ConfigureColumnsModal from "../../../components/ConfigureColumnsModal/ConfigureColumnsModal";
import Dropdown from "../../../components/Dropdown/Dropdown";
import MapPane from "../../../components/EnhancedMap/MapPane/MapPane";
import WithConfigurableColumns from "../../../components/HOCs/WithConfigurableColumns/WithConfigurableColumns";
import WithCurrentUser from "../../../components/HOCs/WithCurrentUser/WithCurrentUser";
import WithSavedFilters from "../../../components/HOCs/WithSavedFilters/WithSavedFilters";
import IntlDatePicker from "../../../components/IntlDatePicker/IntlDatePicker";
import InTableTagFilter from "../../../components/KeywordAutosuggestInput/InTableTagFilter";
import PaginationControl from "../../../components/PaginationControl/PaginationControl";
import ManageSavedFilters from "../../../components/SavedFilters/ManageSavedFilters";
import SavedFiltersList from "../../../components/SavedFilters/SavedFiltersList";
import SvgSymbol from "../../../components/SvgSymbol/SvgSymbol";
import {
  StatusLabel,
  ViewCommentsButton,
  makeInvertable,
} from "../../../components/TaskAnalysisTable/TaskTableHelpers";
import TaskCommentsModal from "../../../components/TaskCommentsModal/TaskCommentsModal";
import AsColoredHashable from "../../../interactions/Hashable/AsColoredHashable";
import {
  TaskPriority,
  keysByPriority,
  messagesByPriority,
} from "../../../services/Task/TaskPriority/TaskPriority";
import {
  ReviewTasksType,
  buildLinkToMapperExportCSV,
  buildLinkToReviewTableExportCSV,
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
import FilterSuggestTextBox from "./FilterSuggestTextBox";
import { FILTER_SEARCH_ALL, FILTER_SEARCH_TEXT } from "./FilterSuggestTextBox";
import messages from "./Messages";

export const getFilterIds = (search, param) => {
  const searchParams = new URLSearchParams(search);
  for (let pair of searchParams.entries()) {
    if (pair[0] === param && pair[1]) {
      if (pair[1] === "0") {
        return [FILTER_SEARCH_ALL];
      }
      return pair[1].split(",").map((n) => Number(n));
    }
  }

  return [FILTER_SEARCH_ALL];
};

/**
 * TaskReviewTable displays tasks that need to be reviewed or have been reviewed
 * as a table.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const TaskReviewTable = (props) => {
  const [showMap, setShowMap] = useState(localStorage.getItem("displayMap") === "true");
  const [openComments, setOpenComments] = useState(null);
  const [showConfigureColumns, setShowConfigureColumns] = useState(false);
  const [challengeFilterIds, setChallengeFilterIds] = useState(
    getFilterIds(props.location.search, "filters.challengeId"),
  );
  const [projectFilterIds, setProjectFilterIds] = useState(
    getFilterIds(props.location.search, "filters.projectId"),
  );
  const [lastTableState, setLastTableState] = useState(null);

  const initialSort = props.reviewCriteria?.sortCriteria ? {
    sortBy: props.reviewCriteria.sortCriteria.sortBy,
    direction: props.reviewCriteria.sortCriteria.direction
  } : null;

  const startReviewing = () => props.startReviewing(props.history);
  const startMetaReviewing = () => props.startReviewing(props.history, true);
  const toggleShowFavorites = () => {
    const reviewCriteria = _cloneDeep(props.reviewCriteria);
    reviewCriteria.savedChallengesOnly = !reviewCriteria.savedChallengesOnly;
    props.updateReviewTasks(reviewCriteria);
  };
  const toggleExcludeOthers = () => {
    const reviewCriteria = _cloneDeep(props.reviewCriteria);
    reviewCriteria.excludeOtherReviewers = !reviewCriteria.excludeOtherReviewers;
    props.updateReviewTasks(reviewCriteria);
  };

  const updateFilterIds = useCallback((item, setter) => {
    setter((prevIds) => {
      if (item.id <= 0) return [item.id];

      const filtered = prevIds.filter((i) => i > 0);
      return prevIds.includes(item.id)
        ? filtered.filter((i) => i !== item.id)
        : [...filtered, item.id];
    });
  }, []);

  const updateChallengeFilterIds = useCallback(
    (item) => {
      updateFilterIds(item, setChallengeFilterIds);
    },
    [updateFilterIds],
  );

  const updateProjectFilterIds = useCallback(
    (item) => {
      updateFilterIds(item, setProjectFilterIds);
    },
    [updateFilterIds],
  );

  useEffect(() => {
    const newChallengeIds = getFilterIds(props.location.search, "filters.challengeId");
    const newProjectIds = getFilterIds(props.location.search, "filters.projectId");

    const challengeIdsChanged = !_isEqual(newChallengeIds, challengeFilterIds);
    const projectIdsChanged = !_isEqual(newProjectIds, projectFilterIds);

    if (challengeIdsChanged || projectIdsChanged) {
      setChallengeFilterIds(challengeIdsChanged ? newChallengeIds : challengeFilterIds);
      setProjectFilterIds(projectIdsChanged ? newProjectIds : projectFilterIds);
    }
  }, [props.location.search]);

  // Setup table data and columns
  const data = props.reviewData?.tasks ?? [];
  const columnTypes = useMemo(
    () =>
      setupColumnTypes(
        {
          ...props,
          updateChallengeFilterIds: updateChallengeFilterIds,
          updateProjectFilterIds: updateProjectFilterIds,
          challengeFilterIds: challengeFilterIds,
          projectFilterIds: projectFilterIds,
        },
        (taskId) => setOpenComments(taskId),
        props.reviewCriteria,
        props.pageSize,
      ),
    [
      props,
      updateChallengeFilterIds,
      updateProjectFilterIds,
      challengeFilterIds,
      projectFilterIds,
      props.reviewCriteria,
      props.pageSize,
    ],
  );

  const columns = useMemo(
    () => Object.keys(props.addedColumns ?? {}).map((column) => columnTypes[column]),
    [props.addedColumns, columnTypes],
  );

  const initialState = {
    sortBy: initialSort ? [
      {
        id: initialSort.sortBy,
        desc: initialSort.direction === 'DESC'
      }
    ] : [
      {
        id: 'mappedOn',
        desc: false
      }
    ],
    pageSize: props.pageSize
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { sortBy, filters, pageIndex },
    gotoPage,
    setPageSize,
    setAllFilters,
    setSortBy,
  } = useTable(
    {
      columns,
      data,
      defaultColumn: {
        Filter: false,
      },
      manualSortBy: true,
      manualFilters: true,
      manualPagination: true,
      pageCount: Math.ceil((props.reviewData?.totalCount ?? 0) / props.pageSize),
      pageSize: props.pageSize,
      initialState
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  const handleClearFilters = () => {
    setAllFilters([]);
    
    setSortBy([{
      id: 'mappedOn',
      desc: false
    }]);

    setChallengeFilterIds([FILTER_SEARCH_ALL]);
    setProjectFilterIds([FILTER_SEARCH_ALL]);
    
    const defaultSort = {
      sortCriteria: {
        sortBy: "mappedOn",
        direction: "ASC"
      },
      filters: {},
      page: 0,
      boundingBox: props.reviewCriteria?.boundingBox,
      includeTags: !!props.addedColumns?.tags,
      savedChallengesOnly: false,
      excludeOtherReviewers: false,
      invertFields: {},
    };
    
    props.updateReviewTasks(defaultSort);
    props.clearFilterCriteria();
  };

  // Handle table state updates
  useEffect(() => {
    const tableState = { sorted: sortBy, filtered: filters, page: pageIndex };

    // Compare with last table state to prevent unnecessary updates
    if (_isEqual(tableState, lastTableState)) {
      return;
    }

    setLastTableState(tableState);

    const sortCriteria = sortBy[0]
      ? {
          sortBy: sortBy[0].id,
          direction: sortBy[0].desc ? "DESC" : "ASC",
        }
      : initialSort || { sortBy: "mappedOn", direction: "ASC" };

    const filterCriteria = Object.fromEntries(filters.map((filter) => [filter.id, filter.value]));

    // Handle challenge and project filters
    if (filterCriteria.challenge && _isObject(filterCriteria.challenge)) {
      if (
        !challengeFilterIds.includes(FILTER_SEARCH_TEXT) &&
        !challengeFilterIds.includes(FILTER_SEARCH_ALL)
      ) {
        filterCriteria.challengeId = challengeFilterIds;
        filterCriteria.challenge = null;
      } else if (filterCriteria.challenge.id === FILTER_SEARCH_ALL) {
        filterCriteria.challengeId = null;
        filterCriteria.challenge = null;
        filterCriteria.challengeName = null;
      }
    } else if (props.reviewChallenges) {
      // If we don't have a challenge name, make sure to populate it so
      // that the table filter will show it.
      filterCriteria.challenge = props.reviewChallenges[filterCriteria.challengeId]?.name;
    }

    if (filterCriteria.project && _isObject(filterCriteria.project)) {
      if (
        !projectFilterIds.includes(FILTER_SEARCH_TEXT) &&
        !projectFilterIds.includes(FILTER_SEARCH_ALL)
      ) {
        filterCriteria.projectId = projectFilterIds;
        filterCriteria.project = null;
      } else if (filterCriteria.project.id === FILTER_SEARCH_ALL) {
        filterCriteria.projectId = null;
        filterCriteria.project = null;
        filterCriteria.projectName = null;
      }
    } else if (props.reviewProjects) {
      // If we don't have a project name, make sure to populate it so
      // that the table filter will show it.
      filterCriteria.project = props.reviewProjects[filterCriteria.projectId]?.displayName;
    }

    const updatedCriteria = {
      sortCriteria,
      filters: filterCriteria,
      page: pageIndex,
      boundingBox: props.reviewCriteria?.boundingBox,
      includeTags: !!props.addedColumns?.tags,
      savedChallengesOnly: props.reviewCriteria?.savedChallengesOnly ?? false,
      excludeOtherReviewers: props.reviewCriteria?.excludeOtherReviewers ?? false,
      invertFields: props.reviewCriteria?.invertFields ?? {},
    };

    props.updateReviewTasks(updatedCriteria);
  }, [sortBy, filters, pageIndex, initialSort]);

  useEffect(() => {
    const { columns, defaultColumns } = setupConfigurableColumns(
      props.reviewTasksType,
      props.metaReviewEnabled,
    );
    props.resetColumnChoices(columns, defaultColumns);
  }, [props.reviewTasksType, props.metaReviewEnabled]);

  let subheader = null;
  switch (props.reviewTasksType) {
    case ReviewTasksType.reviewedByMe:
      subheader =
        props.reviewTasksSubType === "meta-reviewer" ? (
          <FormattedMessage {...messages.tasksMetaReviewedByMe} />
        ) : (
          <FormattedMessage {...messages.tasksReviewedByMe} />
        );
      break;
    case ReviewTasksType.toBeReviewed:
      subheader = <FormattedMessage {...messages.tasksToBeReviewed} />;
      break;
    case ReviewTasksType.allReviewedTasks:
      subheader = <FormattedMessage {...messages.allReviewedTasks} />;
      break;
    case ReviewTasksType.metaReviewTasks:
      subheader = <FormattedMessage {...messages.tasksToMetaReview} />;
      break;
    case ReviewTasksType.myReviewedTasks:
    default:
      subheader = <FormattedMessage {...messages.myReviewTasks} />;
      break;
  }

  const checkBoxes = props.reviewTasksType === ReviewTasksType.toBeReviewed && (
    <div className="xl:mr-flex mr-mr-4">
      <div
        className="field favorites-only-switch mr-mt-2 mr-mr-4"
        onClick={() => toggleShowFavorites()}
      >
        <input
          type="checkbox"
          id="only-saved-challenges-checkbox"
          className="mr-checkbox-toggle mr-mr-px"
          checked={!!props.reviewCriteria.savedChallengesOnly}
          onChange={() => null}
        />
        <label htmlFor="only-saved-challenges-checkbox">
          {" "}
          {props.intl.formatMessage(messages.onlySavedChallenges)}
        </label>
      </div>
      <div className="field favorites-only-switch mr-mt-2" onClick={() => toggleExcludeOthers()}>
        <input
          type="checkbox"
          id="exclude-other-reviewers-checkbox"
          className="mr-checkbox-toggle mr-mr-px"
          checked={!!props.reviewCriteria.excludeOtherReviewers}
          onChange={() => null}
        />
        <label htmlFor="exclude-other-reviewers-checkbox">
          {" "}
          {props.intl.formatMessage(messages.excludeOtherReviewers)}
        </label>
      </div>
    </div>
  );

  return (
    <Fragment>
      <div className="mr-flex-grow mr-w-full mr-mx-auto mr-text-white mr-rounded mr-py-2 mr-px-6 md:mr-py-2 md:mr-px-8 mr-mb-12">
        <header className="sm:mr-flex sm:mr-items-center sm:mr-justify-between">
          <div>
            <h1 className="mr-h2 mr-text-yellow md:mr-mr-4">{subheader}</h1>
            {checkBoxes}
          </div>
        </header>
        {showMap ? (
          <div className="mr-h-100 mr-my-4">
            <MapPane>
              <props.BrowseMap {..._omit(props, ["className"])} />
            </MapPane>
          </div>
        ) : null}
        <div className="sm:mr-flex sm:mr-items-center sm:mr-justify-between">
          <div className="mr-ml-auto">
            {props.reviewTasksType === ReviewTasksType.toBeReviewed && data.length > 0 && (
              <button
                className="mr-button mr-button-small mr-button--green-lighter mr-mr-4"
                onClick={() => startReviewing()}
              >
                <FormattedMessage {...messages.startReviewing} />
              </button>
            )}
            {props.reviewTasksType === ReviewTasksType.metaReviewTasks && data.length > 0 && (
              <button
                className="mr-button mr-button-small mr-button--green-lighter mr-mr-4"
                onClick={() => startMetaReviewing()}
              >
                <FormattedMessage {...messages.startMetaReviewing} />
              </button>
            )}
            <button
              className="mr-button mr-button-small mr-button--green-lighter mr-mr-4"
              onClick={() => {
                localStorage.setItem("displayMap", JSON.stringify(!showMap));
                setShowMap(!showMap);
              }}
            >
              <FormattedMessage {...messages.toggleMap} />
            </button>
            <button
              className={classNames("mr-button mr-button-small", {
                "mr-button--green-lighter": !(props.reviewData?.dataStale ?? false),
                "mr-button--orange": props.reviewData?.dataStale ?? false,
              })}
              onClick={() => props.refresh()}
            >
              <FormattedMessage {...messages.refresh} />
            </button>
            <div className="mr-float-right mr-mt-2 mr-ml-3">
              <div className="mr-flex mr-justify-start mr-ml-4 mr-items-center mr-space-x-4">
                <ClearFiltersControl onClick={handleClearFilters} />
                <FilterDropdown reviewCriteria={props.reviewCriteria} />
                <GearDropdown
                  reviewCriteria={props.reviewCriteria}
                  reviewTasksType={props.reviewTasksType}
                  addedColumns={props.addedColumns}
                  setShowConfigureColumns={setShowConfigureColumns}
                />
              </div>
            </div>
            <ManageSavedFilters searchFilters={props.reviewCriteria} {...props} />
          </div>
        </div>
        <div className="mr-mt-6 review">
          {props.loading ? (
            <div className="mr-my-8">
              <BusySpinner big />
            </div>
          ) : (
            <>
              <table {...getTableProps()} className="mr-table mr-w-full">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <>
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
                          <th className="mr-text-left mr-px-2 mr-py-2 mr-border-b mr-border-white-10">
                            {column.canFilter ? column.render("Filter") : null}
                          </th>
                        ))}
                      </tr>
                    </>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr className="mr-border-y mr-border-white-10" {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <PaginationControl
                currentPage={pageIndex}
                totalPages={Math.ceil((props.reviewData?.totalCount ?? 0) / props.pageSize)}
                pageSize={props.pageSize}
                gotoPage={gotoPage}
                setPageSize={setPageSize}
              />
            </>
          )}
        </div>
      </div>
      {Number.isFinite(openComments) && (
        <TaskCommentsModal taskId={openComments} onClose={() => setOpenComments(null)} />
      )}
      {showConfigureColumns && (
        <ConfigureColumnsModal {...props} onClose={() => setShowConfigureColumns(false)} />
      )}
    </Fragment>
  );
};

const ClearFiltersControl = ({ onClick }) => {
  return (
    <div className="mr-pb-2">
      <button
        className="mr-flex mr-items-center mr-text-green-lighter mr-leading-loose hover:mr-text-white mr-transition-colors"
        onClick={onClick}
      >
        <SvgSymbol
          sym="close-icon"
          viewBox="0 0 20 20"
          className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1"
        />
        <FormattedMessage {...messages.clearFiltersLabel} />
      </button>
    </div>
  );
};

const FilterDropdown = ({ reviewCriteria }) => {
  return (
    <Dropdown
      className="mr-dropdown--right"
      dropdownButton={(dropdown) => (
        <button
          onClick={dropdown.toggleDropdownVisible}
          className="mr-text-green-lighter hover:mr-text-white mr-transition-colors"
        >
          <SvgSymbol
            sym="filter-icon"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-5 mr-h-5"
          />
        </button>
      )}
      dropdownContent={(dropdown) => (
        <ul className="mr-list-dropdown mr-text-green-lighter mr-links-green-lighter">
          <SavedFiltersList
            searchFilters={reviewCriteria}
            afterClick={dropdown.toggleDropdownVisible}
          />
        </ul>
      )}
    />
  );
};

const GearDropdown = ({
  reviewCriteria,
  reviewTasksType,
  addedColumns,
  setShowConfigureColumns,
}) => {
  return (
    <Dropdown
      className="mr-dropdown--right"
      dropdownButton={(dropdown) => (
        <button
          onClick={dropdown.toggleDropdownVisible}
          className="mr-text-green-lighter hover:mr-text-white mr-transition-colors"
        >
          <SvgSymbol sym="cog-icon" viewBox="0 0 20 20" className="mr-fill-current mr-w-5 mr-h-5" />
        </button>
      )}
      dropdownContent={(dropdown) => (
        <ul className="mr-list-dropdown mr-text-green-lighter mr-links-green-lighter">
          <li>
            <button
              className="mr-text-current"
              onClick={() => {
                setShowConfigureColumns(true);
                dropdown.toggleDropdownVisible();
              }}
            >
              <FormattedMessage {...messages.configureColumnsLabel} />
            </button>
          </li>
          {(reviewTasksType === ReviewTasksType.allReviewedTasks ||
            reviewTasksType === ReviewTasksType.toBeReviewed) && (
            <li>
              {reviewCriteria.filters.projectId ? (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={buildLinkToReviewTableExportCSV(reviewCriteria, addedColumns)}
                  onClick={dropdown.toggleDropdownVisible}
                  className="mr-flex mr-items-center"
                >
                  <SvgSymbol
                    sym="download-icon"
                    viewBox="0 0 20 20"
                    className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2"
                  />
                  <FormattedMessage {...messages.exportReviewTableCSVLabel} />
                </a>
              ) : (
                <div>
                  <div className="mr-flex mr-items-center mr-opacity-50">
                    <SvgSymbol
                      sym="download-icon"
                      viewBox="0 0 20 20"
                      className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2"
                    />
                    <FormattedMessage {...messages.exportReviewTableCSVLabel} />
                  </div>
                  <div className="mr-text-grey-light">
                    <FormattedMessage {...messages.requiredForExport} />
                    <div />
                    <FormattedMessage {...messages.requiredProject} />
                  </div>
                </div>
              )}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={buildLinkToMapperExportCSV(reviewCriteria)}
                onClick={dropdown.toggleDropdownVisible}
                className="mr-flex mr-items-center"
              >
                <SvgSymbol
                  sym="download-icon"
                  viewBox="0 0 20 20"
                  className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2"
                />
                <FormattedMessage {...messages.exportMapperCSVLabel} />
              </a>
            </li>
          )}
        </ul>
      )}
    />
  );
};

export const setupColumnTypes = (props, openComments, criteria) => {
  const handleClick = (e, linkTo) => {
    e.preventDefault();
    props.history.push({
      pathname: linkTo,
      criteria,
    });
  };

  const columns = {};
  columns.id = {
    id: "id",
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: "id",
    Cell: ({ value, row }) => {
      if (!row.original.isBundlePrimary) {
        return <span>{value}</span>;
      } else {
        return (
          <span className="mr-flex mr-items-center mr-relative">
            <SvgSymbol
              sym="box-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-3 mr-h-3 mr-absolute mr-left-0 mr--ml-4"
              title={props.intl.formatMessage(messages.multipleTasksTooltip)}
            />
            {value}
          </span>
        );
      }
    },
    maxWidth: 120,
  };

  columns.featureId = {
    id: "featureId",
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: (row) => row.name || row.title,
    maxWidth: 120,
    disableSortBy: true
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
    maxWidth: 140,
    Filter: ({ column: { setFilter, filterValue } }) => {
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
        <select
          onChange={(event) => setFilter(event.target.value)}
          className={"mr-select mr-px-2 mr-py-1 mr-w-full"}
          value={filterValue || "all"}
        >
          {options}
        </select>
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
    maxWidth: 140,
    Filter: ({ column: { setFilter, filterValue } }) => {
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
        <select
          onChange={(event) => setFilter(event.target.value)}
          className={"mr-select mr-px-2 mr-py-1 mr-w-full"}
          value={filterValue || "all"}
        >
          {options}
        </select>
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
    maxWidth: 180,
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
    maxWidth: 180,
  };

  columns.challengeId = {
    id: "challengeId",
    Header: props.intl.formatMessage(messages.challengeIdLabel),
    accessor: "parent.id",
    Cell: ({ value }) => <span>{value}</span>,
    maxWidth: 120,
    disableSortBy: true
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
    Filter: ({ column: { setFilter, filterValue } }) => (
      <div className="mr-flex mr-gap-2">
        <div className="mr-inline-block">
          <FilterSuggestTextBox
            filterType={"challenge"}
            filterAllLabel={props.intl.formatMessage(messages.allChallenges)}
            selectedItem={""}
            onChange={(item) => {
              setFilter(item);
              props.updateChallengeFilterIds(item);
            }}
            value={filterValue || ""}
            itemList={props.reviewChallenges}
            multiselect={props.challengeFilterIds}
          />
        </div>
        {props.challengeFilterIds?.length && props.challengeFilterIds?.[0] !== -2 ? (
          <button
            className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
            onClick={() => {
              setFilter({ id: -2, name: "All Challenges" });
              props.updateChallengeFilterIds({ id: -2, name: "All Challenges" });
            }}
          >
            <SvgSymbol
              sym="icon-close"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-2.5 mr-h-2.5"
            />
          </button>
        ) : null}
      </div>
    ),
    disableSortBy: true
  };

  columns.projectId = {
    id: "projectId",
    Header: props.intl.formatMessage(messages.projectIdLabel),
    accessor: "parent.parent.id",
    Cell: ({ value }) => <span>{value}</span>,
    maxWidth: 120,
    disableSortBy: true
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
    Filter: ({ column: { setFilter, filterValue } }) => (
      <div className="mr-flex mr-gap-2">
        <div className="mr-inline-block">
          <FilterSuggestTextBox
            filterType={"project"}
            filterAllLabel={props.intl.formatMessage(messages.allProjects)}
            selectedItem={""}
            onChange={(item) => {
              setFilter(item);
              props.updateProjectFilterIds(item);
            }}
            value={filterValue || ""}
            itemList={_map(props.reviewProjects, (p) => ({ id: p.id, name: p.displayName }))}
            multiselect={props.projectFilterIds}
          />
        </div>
        {props.projectFilterIds?.length && props.projectFilterIds?.[0] !== -2 ? (
          <button
            className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
            onClick={() => {
              setFilter({ id: -2, name: "All Projects" });
              props.updateProjectFilterIds({ id: -2, name: "All Projects" });
            }}
          >
            <SvgSymbol
              sym="icon-close"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-2.5 mr-h-2.5"
            />
          </button>
        ) : null}
      </div>
    ),
    disableSortBy: true
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
    Filter: ({ column: { setFilter, filterValue } }) => {
      let mappedOn = filterValue;
      if (typeof mappedOn === "string" && mappedOn !== "") {
        mappedOn = parseISO(mappedOn);
      }

      return (
        <div className="mr-flex mr-gap-2">
          <IntlDatePicker
            selected={mappedOn}
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />
          {mappedOn && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
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
    maxWidth: 200,
    Filter: ({ column: { setFilter, filterValue } }) => {
      let reviewedAt = filterValue;
      if (typeof reviewedAt === "string" && reviewedAt !== "") {
        reviewedAt = parseISO(reviewedAt);
      }

      return (
        <div className="mr-flex mr-gap-2">
          <IntlDatePicker
            selected={reviewedAt}
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />
          {reviewedAt && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
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
    minWidth: 180,
    maxWidth: 200,
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
    maxWidth: 180,
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
    maxWidth: 180,
    Filter: ({ column: { setFilter, filterValue } }) => {
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
        <select
          onChange={(event) => setFilter(event.target.value)}
          className={"mr-select mr-px-2 mr-py-1 mr-w-full"}
          value={filterValue || "all"}
        >
          {options}
        </select>
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
    maxWidth: 180,
    Filter: ({ column: { setFilter, filterValue } }) => {
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
        <select
          onChange={(event) => setFilter(event.target.value)}
          className={"mr-select mr-px-2 mr-py-1 mr-w-full"}
          value={filterValue || "all"}
        >
          {options}
        </select>
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
    maxWidth: 180,
  };

  columns.reviewerControls = {
    id: "controls",
    Header: props.intl.formatMessage(messages.actionsColumnHeader),
    Cell: ({ row }) => {
      const linkTo = `/challenge/${row.original.parent.id}/task/${row.original.id}/review`;
      let action = (
        <Link
          to={linkTo}
          onClick={(e) => handleClick(e, linkTo)}
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
        >
          <FormattedMessage {...messages.reviewTaskLabel} />
        </Link>
      );

      if (row.original.reviewedBy) {
        if (row.original.reviewStatus === TaskReviewStatus.needed) {
          action = (
            <Link
              to={linkTo}
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </Link>
          );
        } else if (row.original.reviewStatus === TaskReviewStatus.disputed) {
          action = (
            <Link
              to={linkTo}
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.resolveTaskLabel} />
            </Link>
          );
        }
      }

      return <div className="row-controls-column">{action}</div>;
    },
    maxWidth: 120,
    minWidth: 110,
    disableSortBy: true
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
          <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)}>
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
        <Link
          to={linkTo}
          onClick={(e) => handleClick(e, linkTo)}
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
        >
          <FormattedMessage {...messages.metaReviewTaskLabel} />
        </Link>
      );

      if (row.original.reviewedBy) {
        if (row.original.reviewStatus === TaskReviewStatus.needed) {
          action = (
            <Link
              to={linkTo}
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.reviewAgainTaskLabel} />
            </Link>
          );
        } else if (row.original.reviewStatus === TaskReviewStatus.disputed) {
          action = (
            <Link
              to={linkTo}
              onClick={(e) => handleClick(e, linkTo)}
              className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
            >
              <FormattedMessage {...messages.resolveTaskLabel} />
            </Link>
          );
        }
      }

      return <div className="row-controls-column">{action}</div>;
    },
    maxWidth: 120,
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
          <Link to={linkTo} onClick={(e) => handleClick(e, linkTo)}>
            {message}
          </Link>
          {!props.metaReviewEnabled &&
            row.original.reviewStatus !== TaskReviewStatus.needed &&
            row.original.reviewedBy &&
            row.original.reviewedBy.id !== props.user?.id && (
              <Link
                to={`${linkTo}/review`}
                onClick={(e) => handleClick(e, `${linkTo}/review`)}
                className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-transition"
              >
                <FormattedMessage {...messages.reviewFurtherTaskLabel} />
              </Link>
            )}
        </div>
      );
    },
    maxWidth: 120,
    minWidth: 90,
    disableSortBy: true,
  };

  columns.viewComments = {
    id: "viewComments",
    Header: props.intl.formatMessage(messages.viewCommentsLabel),
    accessor: "commentID",
    Cell: (props) => <ViewCommentsButton onClick={() => openComments(props.row.original.id)} />,
    maxWidth: 110,
    disableSortBy: true,
  };

  columns.tags = {
    id: "tags",
    Header: props.intl.formatMessage(messages.tagsLabel),
    accessor: "tags",
    Cell: ({ row }) => (
      <div className="row-challenge-column mr-text-white mr-whitespace-normal mr-flex mr-flex-wrap">
        {_map(row.original.tags, (t) =>
          t.name === "" ? null : (
            <div className="mr-inline mr-bg-white-10 mr-rounded mr-py-1 mr-px-2 mr-m-1" key={t.id}>
              {t.name}
            </div>
          ),
        )}
      </div>
    ),
    minWidth: 120,
    Filter: ({ column: { setFilter, filterValue } }) => (
      <InTableTagFilter {...props} onChange={setFilter} value={filterValue || ""} />
    ),
    disableSortBy: true,
  };

  return columns;
};

const setupConfigurableColumns = (reviewTasksType, metaReviewEnabled) => {
  let columns = {
    id: {},
    featureId: {},
    reviewStatus: { permanent: true },
    reviewRequestedBy: {},
    challengeId: {},
    challenge: {},
    projectId: {},
    project: {},
    mappedOn: {},
    reviewedBy: {},
    reviewedAt: {},
    status: {},
    priority: {},
    reviewCompleteControls: { permanent: true },
    reviewerControls: { permanent: true },
    mapperControls: { permanent: true },
    viewComments: {},
    tags: {},
    additionalReviewers: {},
  };

  if (metaReviewEnabled) {
    columns.metaReviewStatus = {};
    columns.metaReviewedBy = {};
    columns.metaReviewedAt = {};
    columns.metaReviewerControls = { permanent: true };
  }
  let defaultColumns = _keys(columns);

  // Remove any columns not relevant to the current tab.
  switch (reviewTasksType) {
    case ReviewTasksType.reviewedByMe:
      columns = _omit(columns, ["reviewerControls", "mapperControls", "metaReviewerControls"]);
      defaultColumns = _pull(
        defaultColumns,
        ...["reviewedBy", "reviewerControls", "mapperControls", "metaReviewerControls"],
      );

      break;
    case ReviewTasksType.toBeReviewed:
      columns = _omit(columns, [
        "reviewCompleteControls",
        "mapperControls",
        "metaReviewerControls",
      ]);
      defaultColumns = _pull(
        defaultColumns,
        ...["reviewCompleteControls", "mapperControls", "metaReviewerControls"],
      );

      break;
    case ReviewTasksType.allReviewedTasks:
      columns = _omit(columns, [
        "reviewCompleteControls",
        "reviewerControls",
        "metaReviewerControls",
      ]);
      defaultColumns = _pull(
        defaultColumns,
        ...["reviewCompleteControls", "reviewerControls", "metaReviewerControls"],
      );

      break;
    case ReviewTasksType.metaReviewTasks:
      columns = _omit(columns, ["reviewCompleteControls", "reviewerControls", "mapperControls"]);
      defaultColumns = _pull(
        defaultColumns,
        ...["reviewCompleteControls", "reviewerControls", "mapperControls"],
      );

      break;
    case ReviewTasksType.myReviewedTasks:
    default:
      columns = _omit(columns, [
        "reviewRequestedBy",
        "reviewCompleteControls",
        "reviewerControls",
        "metaReviewerControls",
      ]);
      defaultColumns = _pull(
        defaultColumns,
        ...[
          "reviewRequestedBy",
          "reviewCompleteControls",
          "reviewerControls",
          "metaReviewerControls",
        ],
      );

      break;
  }

  return { columns, defaultColumns };
};

export default WithCurrentUser(
  WithConfigurableColumns(
    WithSavedFilters(TaskReviewTable, "reviewSearchFilters"),
    {},
    [],
    messages,
    "reviewColumns",
    "reviewTasksType",
    false,
  ),
);
