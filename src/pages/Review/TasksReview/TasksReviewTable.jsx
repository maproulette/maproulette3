import classNames from "classnames";
import { parseISO } from "date-fns";
import _cloneDeep from "lodash/cloneDeep";
import _debounce from "lodash/debounce";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _kebabCase from "lodash/kebabCase";
import _keys from "lodash/keys";
import _map from "lodash/map";
import _omit from "lodash/omit";
import _pull from "lodash/pull";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import {
  useBlockLayout,
  useFilters,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from "react-table";
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
  const [displayData, setDisplayData] = useState(props.reviewData?.tasks ?? []);
  const [columnWidths, setColumnWidths] = useState({});

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

  // Update displayData when new data is loaded and not loading
  useEffect(() => {
    if (!props.loading && props.reviewData?.tasks) {
      setDisplayData(props.reviewData.tasks);
    }
  }, [props.loading, props.reviewData]);

  // Setup table data and columns
  const data = displayData;

  // Memoize the column types setup to prevent unnecessary recalculations
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
    [],
  );

  const columns = useMemo(
    () =>
      Object.keys(props.addedColumns ?? {}).map((column) => {
        const col = columnTypes[column];
        // Apply saved width if available
        if (columnWidths[column]) {
          return {
            ...col,
            width: columnWidths[column],
          };
        }
        return col;
      }),
    [props.addedColumns, columnTypes, columnWidths],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { sortBy, filters, pageIndex, columnResizing },
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      defaultColumn: {
        Filter: false,
        minWidth: 80,
        disableSortBy: true,
      },
      manualSortBy: true,
      manualFilters: true,
      manualPagination: true,
      pageCount: Math.ceil((props.reviewData?.totalCount ?? 0) / props.pageSize),
      pageSize: props.pageSize,
      disableMultiSort: true,
      disableSortRemove: true,
    },
    useBlockLayout,
    useResizeColumns,
    useFilters,
    useSortBy,
    usePagination,
  );

  // Save column widths when they change
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
      : { sortBy: "mappedOn", direction: "ASC" };

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
  }, [sortBy, filters, pageIndex]);

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
                <ClearFiltersControl onClick={() => props.clearFilterCriteria()} />
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
          <div className="mr-relative">
            {props.loading && (
              <div className="mr-absolute mr-inset-0 mr-bg-black-50 mr-flex mr-items-center mr-justify-center mr-z-10">
                <div className="mr-text-white mr-text-lg mr-flex mr-items-center">
                  <BusySpinner className="mr-mr-2" />
                  <span>Loading...</span>
                </div>
              </div>
            )}
            <div className="mr-overflow-x-auto">
              <table
                className="mr-w-full mr-text-left mr-text-white mr-border-collapse"
                style={{ minWidth: "1200px" }}
              >
                <thead className="mr-bg-black-15">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
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
                            position: "relative",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div className="mr-flex mr-flex-col">
                            <div className="mr-flex mr-items-center mr-justify-between">
                              <div className="mr-flex mr-items-center">
                                {column.render("Header")}
                              </div>
                            </div>
                            {column.canFilter && (
                              <div className="mr-mt-2" onClick={(e) => e.stopPropagation()}>
                                {column.render("Filter")}
                              </div>
                            )}
                          </div>
                          {column.getResizerProps && (
                            <div
                              {...column.getResizerProps()}
                              className={`mr-absolute mr-right-0 mr-top-0 mr-h-full mr-w-2 mr-bg-gray-400 mr-opacity-50 hover:mr-opacity-100 mr-cursor-col-resize ${
                                column.isResizing ? "mr-opacity-100" : ""
                              }`}
                              style={{ touchAction: "none" }}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          const column = cell.column;
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="mr-px-2 mr-py-1 mr-border-b mr-border-r mr-border-white-10"
                              style={{
                                width: column.width,
                                minWidth: column.minWidth,
                                maxWidth: column.width,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationControl
            currentPage={pageIndex}
            totalPages={Math.ceil((props.reviewData?.totalCount ?? 0) / props.pageSize)}
            pageSize={props.pageSize}
            gotoPage={gotoPage}
            setPageSize={setPageSize}
          />
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

export const setupColumnTypes = (props, openComments, criteria, pageSize) => {
  const handleClick = (e, linkTo) => {
    e.preventDefault();
    props.history.push({
      pathname: linkTo,
      criteria,
    });
  };

  // Define sortable columns
  const sortableColumns = [
    "id",
    "status",
    "priority",
    "mappedOn",
    "reviewedAt",
    "metaReviewedAt",
    "reviewStatus",
    "metaReviewStatus",
  ];

  // Create column definitions as before
  const columns = {};

  columns.id = {
    id: "id",
    Header: props.intl.formatMessage(messages.idLabel),
    accessor: "id",
    Cell: ({ value, row }) => (
      <Link
        to={`/challenge/${row.original.parent.id}/task/${value}`}
        className="mr-text-green-lighter hover:mr-text-white"
      >
        {value}
      </Link>
    ),
    Filter: ({ column }) => (
      <FilterInput
        column={column}
        placeholder={props.intl.formatMessage({
          id: "Review.TaskAnalysisTable.filterByInternalId",
          defaultMessage: "Filter by ID",
        })}
      />
    ),
    width: 120,
    minWidth: 90,
    disableFilters: false,
  };

  columns.featureId = {
    id: "featureId",
    Header: props.intl.formatMessage(messages.featureIdLabel),
    accessor: (row) => row.name || row.title,
    width: 120,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("featureId"),
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
    minWidth: 80,
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
    disableSortBy: !sortableColumns.includes("status"),
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
    minWidth: 80,
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
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={"mr-select mr-px-2 mr-py-1 mr-w-full"}
          value={filterValue || "all"}
        >
          {options}
        </select>
      );
    },
    disableSortBy: !sortableColumns.includes("priority"),
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
    Filter: ({ column }) => (
      <FilterInput
        column={column}
        placeholder={props.intl.formatMessage({
          id: "Review.TaskAnalysisTable.filterByMapper",
          defaultMessage: "Filter by mapper",
        })}
      />
    ),
    width: 180,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("reviewRequestedBy"),
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
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("otherReviewers"),
  };

  columns.challengeId = {
    id: "challengeId",
    Header: props.intl.formatMessage(messages.challengeIdLabel),
    accessor: "parent.id",
    Cell: ({ value }) => <span>{value}</span>,
    width: 120,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("challengeId"),
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
    disableSortBy: !sortableColumns.includes("challenge"),
  };

  columns.projectId = {
    id: "projectId",
    Header: props.intl.formatMessage(messages.projectIdLabel),
    accessor: "parent.parent.id",
    Cell: ({ value }) => <span>{value}</span>,
    width: 120,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("projectId"),
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
    disableSortBy: !sortableColumns.includes("project"),
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
    minWidth: 80,
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
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />
          {mappedOn && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFilter(null);
              }}
              title={props.intl.formatMessage({
                id: "Review.TaskAnalysisTable.clearDate",
                defaultMessage: "Clear date",
              })}
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
    disableSortBy: !sortableColumns.includes("mappedOn"),
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
    width: 180,
    minWidth: 80,
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
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />
          {reviewedAt && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFilter(null);
              }}
              title={props.intl.formatMessage({
                id: "Review.TaskAnalysisTable.clearDate",
                defaultMessage: "Clear date",
              })}
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
    disableSortBy: !sortableColumns.includes("reviewedAt"),
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
    width: 180,
    minWidth: 80,
    Filter: ({ column: { setFilter, filterValue } }) => {
      let metaReviewedAt = filterValue;
      if (typeof metaReviewedAt === "string" && metaReviewedAt !== "") {
        metaReviewedAt = parseISO(metaReviewedAt);
      }

      return (
        <div
          className="mr-flex mr-gap-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <IntlDatePicker
            selected={metaReviewedAt}
            onChange={(value) => {
              setFilter(value);
            }}
            intl={props.intl}
          />
          {metaReviewedAt && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFilter(null);
              }}
              title={props.intl.formatMessage({
                id: "Review.TaskAnalysisTable.clearDate",
                defaultMessage: "Clear date",
              })}
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
    disableSortBy: !sortableColumns.includes("metaReviewedAt"),
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
    Filter: ({ column }) => (
      <FilterInput
        column={column}
        placeholder={props.intl.formatMessage({
          id: "Review.TaskAnalysisTable.filterByReviewer",
          defaultMessage: "Filter by reviewer",
        })}
      />
    ),
    width: 180,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("reviewedBy"),
    disableFilters: false,
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
    minWidth: 80,
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
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={"mr-select mr-px-2 mr-py-1 mr-w-full"}
          value={filterValue || "all"}
        >
          {options}
        </select>
      );
    },
    disableSortBy: !sortableColumns.includes("reviewStatus"),
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
    minWidth: 80,
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
    disableSortBy: !sortableColumns.includes("metaReviewStatus"),
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
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("metaReviewedBy"),
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
    width: 120,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("controls"),
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
    disableSortBy: !sortableColumns.includes("controls"),
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
    width: 120,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("controls"),
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
    width: 120,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("controls"),
  };

  columns.viewComments = {
    id: "viewComments",
    Header: props.intl.formatMessage(messages.viewCommentsLabel),
    accessor: "commentID",
    Cell: (props) => <ViewCommentsButton onClick={() => openComments(props.row.original.id)} />,
    width: 110,
    minWidth: 80,
    disableSortBy: !sortableColumns.includes("viewComments"),
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
    disableSortBy: !sortableColumns.includes("tags"),
  };

  // After all columns are defined, set disableSortBy property based on sortableColumns list
  Object.keys(columns).forEach((columnId) => {
    columns[columnId].disableSortBy = !sortableColumns.includes(columnId);
  });

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
