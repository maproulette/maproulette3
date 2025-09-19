import classNames from "classnames";
import _cloneDeep from "lodash/cloneDeep";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _omit from "lodash/omit";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useResizeColumns, useSortBy, useTable } from "react-table";
import ConfigureColumnsModal from "../../../components/ConfigureColumnsModal/ConfigureColumnsModal";
import Dropdown from "../../../components/Dropdown/Dropdown";
import MapPane from "../../../components/EnhancedMap/MapPane/MapPane";
import WithConfigurableColumns from "../../../components/HOCs/WithConfigurableColumns/WithConfigurableColumns";
import WithCurrentUser from "../../../components/HOCs/WithCurrentUser/WithCurrentUser";
import WithSavedFilters from "../../../components/HOCs/WithSavedFilters/WithSavedFilters";
import PaginationControl from "../../../components/PaginationControl/PaginationControl";
import ManageSavedFilters from "../../../components/SavedFilters/ManageSavedFilters";
import SavedFiltersList from "../../../components/SavedFilters/SavedFiltersList";
import SvgSymbol from "../../../components/SvgSymbol/SvgSymbol";
import {
  cellStyles,
  linkStyles,
  rowStyles,
  tableStyles,
} from "../../../components/TableShared/TableStyles";
import TaskCommentsModal from "../../../components/TaskCommentsModal/TaskCommentsModal";
import {
  ReviewTasksType,
  buildLinkToMapperExportCSV,
  buildLinkToReviewTableExportCSV,
} from "../../../services/Task/TaskReview/TaskReview";
import FilterSuggestTextBox from "./FilterSuggestTextBox";
import { FILTER_SEARCH_ALL, FILTER_SEARCH_TEXT } from "./FilterSuggestTextBox";
import messages from "./Messages";
import { setupConfigurableColumns } from "./columns";
import { setupColumnTypes } from "./setupColumnTypes";

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

  const startReviewing = () => props.startReviewing(props.history);
  const startMetaReviewing = () => props.startReviewing(props.history, true);
  const toggleShowFavorites = () => {
    const reviewCriteria = _cloneDeep(props.reviewCriteria);
    reviewCriteria.savedChallengesOnly = !reviewCriteria.savedChallengesOnly;
    props.updateReviewCriteria(reviewCriteria);
  };
  const toggleExcludeOthers = () => {
    const reviewCriteria = _cloneDeep(props.reviewCriteria);
    reviewCriteria.excludeOtherReviewers = !reviewCriteria.excludeOtherReviewers;
    props.updateReviewCriteria(reviewCriteria);
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
  }, [props.location.search, challengeFilterIds, projectFilterIds]);

  // Setup table data and columns
  const sortCriteria = props.reviewCriteria?.sortCriteria;
  const data = useMemo(() => {
    const tasks = props.reviewData?.tasks ?? [];
    if (sortCriteria?.direction === "DESC") {
      return [...tasks].reverse();
    }
    return tasks;
  }, [props.reviewData?.tasks, sortCriteria?.direction]);

  const invertFieldsOnLength = Object.values(props.reviewCriteria?.invertFields || {}).filter(
    Boolean,
  ).length;

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
      updateChallengeFilterIds,
      updateProjectFilterIds,
      challengeFilterIds,
      projectFilterIds,
      props.pageSize,
      invertFieldsOnLength,
      props.reviewCriteria?.invertFields,
    ],
  );

  const columns = useMemo(() => {
    if (!columnTypes) return [];

    if (Object.keys(props.addedColumns ?? {}).length > 0) {
      return Object.keys(props.addedColumns)
        .map((columnId) => columnTypes[columnId])
        .filter(Boolean);
    } else {
      // Default columns if none are specifically added
      const defaultCols = ["id", "reviewStatus", "challenge", "mappedOn", "reviewerControls"];
      return defaultCols.map((columnId) => columnTypes[columnId]).filter(Boolean);
    }
  }, [columnTypes, props.addedColumns]);

  const tableConfig = useMemo(
    () => ({
      columns,
      data,
      manualSortBy: true, // All sorting handled by backend
      autoResetSortBy: false,
      autoResetResize: false, // Prevent column width reset on data changes
      autoResetFilters: false,
      autoResetGlobalFilter: false,
      defaultColumn: {
        minWidth: 80, // Increased minimum width for better text display
        width: 120, // Better default width
        maxWidth: 400, // Prevent columns from becoming too wide
      },
      columnResizeMode: "onChange", // Independent column resizing
      disableResizing: false,
    }),
    [columns, data],
  );

  const tableInstance = useTable(tableConfig, useResizeColumns, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const handleClearFilters = () => {
    setChallengeFilterIds([FILTER_SEARCH_ALL]);
    setProjectFilterIds([FILTER_SEARCH_ALL]);

    const defaultCriteria = {
      sortCriteria: {
        sortBy: "mappedOn",
        direction: "ASC",
      },
      filters: {},
      page: 0,
      boundingBox: props.reviewCriteria?.boundingBox,
      includeTags: !!props.addedColumns?.tags,
      savedChallengesOnly: false,
      excludeOtherReviewers: false,
      invertFields: {},
    };

    props.updateReviewCriteria(defaultCriteria);
    if (props.clearFilterCriteria) {
      props.clearFilterCriteria();
    }
  };
  // Handle sorting changes by updating backend criteria
  const handleSortChange = (columnId) => {
    if (!props.updateReviewCriteria) return;

    const currentSort = props.reviewCriteria?.sortCriteria;
    let newSortCriteria;

    if (!currentSort || currentSort.sortBy !== columnId) {
      // No current sort on this column, add ascending
      newSortCriteria = { sortBy: columnId, direction: "ASC" };
    } else if (currentSort.direction === "ASC") {
      // Currently ascending, change to descending
      newSortCriteria = { sortBy: columnId, direction: "DESC" };
    } else {
      // Currently descending, remove sort (back to default)
      newSortCriteria = { sortBy: "mappedOn", direction: "ASC" };
    }

    props.updateReviewCriteria({
      ...props.reviewCriteria,
      sortCriteria: newSortCriteria,
    });
  };

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
          {props.loading && (
            <div className="mr-absolute mr-inset-0 mr-flex mr-items-center mr-justify-center mr-bg-black-25 mr-z-10">
              <div className="mr-text-white mr-text-lg">Loading...</div>
            </div>
          )}
          <div className="mr-overflow-x-auto">
            <table {...getTableProps()} className={tableStyles} style={{ minWidth: "max-content" }}>
              <thead>
                {headerGroups.map((headerGroup) => (
                  <Fragment key={headerGroup.id}>
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps()}
                          className={`mr-px-2 mr-text-left mr-border-gray-600 mr-relative ${
                            column.canResize ? "mr-border-r mr-border-gray-500" : ""
                          }`}
                          key={column.id}
                          style={{
                            ...column.getHeaderProps().style,
                            width: column.width,
                            minWidth: column.minWidth,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className="mr-relative mr-overflow-hidden"
                            style={{ paddingRight: !column.disableSortBy ? "24px" : "8px" }}
                          >
                            <div className="mr-truncate">{column.render("Header")}</div>
                            {!column.disableSortBy && (
                              <button
                                className="mr-absolute mr-right-0 mr-top-0 mr-bottom-0 mr-w-6 mr-h-full mr-flex mr-items-center mr-justify-center mr-text-gray-400 hover:mr-text-white mr-cursor-pointer mr-text-xs mr-z-20"
                                onClick={() => handleSortChange(column.id)}
                                title={`Sort by ${column.Header || column.id}`}
                              >
                                {(() => {
                                  const currentSort = props.reviewCriteria?.sortCriteria;
                                  if (!currentSort || currentSort.sortBy !== column.id) return "↕";
                                  return currentSort.direction === "DESC" ? "▼" : "▲";
                                })()}
                              </button>
                            )}
                          </div>
                          {column.canResize && (
                            <div
                              {...column.getResizerProps()}
                              className="mr-absolute mr-right-0 mr-top-0 mr-w-1 mr-h-full mr-bg-gray-400 mr-cursor-col-resize hover:mr-bg-blue-400 hover:mr-scale-x-3 mr-transition-all mr-z-10"
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {headerGroup.headers.map((column) => (
                        <th
                          key={`filter-${column.id}`}
                          className="mr-px-2"
                          style={{
                            width: column.width,
                            minWidth: column.minWidth,
                          }}
                        >
                          <div className="">{column.Filter ? column.render("Filter") : null}</div>
                        </th>
                      ))}
                    </tr>
                  </Fragment>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr className={rowStyles} {...row.getRowProps()} key={row.id}>
                      {row.cells.map((cell) => (
                        <td
                          key={cell.column.id}
                          {...cell.getCellProps()}
                          className={cellStyles}
                          style={{
                            ...cell.getCellProps().style,
                            width: cell.column.width,
                            minWidth: cell.column.minWidth,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationControl
            currentPage={props.reviewCriteria?.page || 0}
            pageCount={Math.ceil(
              (props.reviewData?.totalCount || 0) /
                (props.reviewCriteria?.pageSize || props.pageSize || 20),
            )}
            pageSize={props.reviewCriteria?.pageSize || props.pageSize || 20}
            gotoPage={(page) => props.updateReviewCriteria({ ...props.reviewCriteria, page })}
            setPageSize={(pageSize) =>
              props.updateReviewCriteria({ ...props.reviewCriteria, pageSize, page: 0 })
            }
            previousPage={() =>
              props.updateReviewCriteria({
                ...props.reviewCriteria,
                page: Math.max(0, (props.reviewCriteria?.page || 0) - 1),
              })
            }
            nextPage={() => {
              const maxPage =
                Math.ceil(
                  (props.reviewData?.totalCount || 0) /
                    (props.reviewCriteria?.pageSize || props.pageSize || 20),
                ) - 1;
              props.updateReviewCriteria({
                ...props.reviewCriteria,
                page: Math.min(maxPage, (props.reviewCriteria?.page || 0) + 1),
              });
            }}
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
        <button onClick={dropdown.toggleDropdownVisible} className={linkStyles}>
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
        <button onClick={dropdown.toggleDropdownVisible} className={linkStyles}>
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
