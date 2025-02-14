import { get as levenshtein } from "fast-levenshtein";
import _compact from "lodash/compact";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import { Component, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import BusySpinner from "../../../BusySpinner/BusySpinner";
import WithPagedProjects from "../../../HOCs/WithPagedProjects/WithPagedProjects";
import WithSearch from "../../../HOCs/WithSearch/WithSearch";
import WithSearchResults from "../../../HOCs/WithSearchResults/WithSearchResults";
import Modal from "../../../Modal/Modal";
import SearchBox from "../../../SearchBox/SearchBox";
import messages from "./Messages";

export function ProjectPickerModal(props) {
  const [isSearching, setIsSearching] = useState(false);

  const executeSearch = (queryCriteria) => {
    if (!queryCriteria.query) {
      return; // nothing to do
    }

    setIsSearching(true);
    props
      .searchProjects(
        {
          searchQuery: queryCriteria.query,
          page: 0,
          onlyEnabled: false,
        },
        queryCriteria?.page?.resultsPerPage,
      )
      .finally(() => {
        setIsSearching(false);
      });
  };

  const ProjectSearch = useMemo(
    () => WithSearch(SearchBox, "projectPickerModal", (criteria) => executeSearch(criteria)),
    [], // Empty dependency array since executeSearch only depends on props
  );

  return (
    <Modal isActive narrow onClose={props.onCancel} contentClassName="mr-h-screen50">
      <div className="mr-text-yellow mr-text-lg mr-mb-2 mr-mr-6">
        <FormattedMessage {...messages.chooseProject} />
      </div>

      <div className="mr-w-64 mr-mb-6">
        <ProjectSearch leftAligned />
      </div>

      {isSearching ? (
        <div className="mr-text-center mr-my-4">
          <BusySpinner />
        </div>
      ) : (
        <CandidateProjectList
          projects={props.pagedCandidateProjects}
          currentProjectId={props.currentProjectId}
          onSelectProject={props.onSelectProject}
          searchQuery={props.searchCriteria?.query}
        />
      )}
    </Modal>
  );
}

const CandidateProjectList = function (props) {
  const { projects, currentProjectId, onSelectProject, searchQuery } = props;

  const sortedProjects = _compact(
    _map(projects, (project) => {
      if (project.id === currentProjectId) {
        return null;
      }

      let index = 0;

      if (searchQuery && (project.displayName || project.name)) {
        const projectName = (project.displayName || project.name).toLowerCase();
        const searchQueryLower = searchQuery.toLowerCase();

        // Check if any word in the project name contains the search query
        const words = projectName.split(/\s+/);
        const hasMatch = words.some((word) => word.includes(searchQueryLower));

        // Calculate Levenshtein distance for fuzzy matching
        const similarity = levenshtein(searchQueryLower, projectName);

        // Prioritize direct substring matches, then use Levenshtein as fallback
        index = hasMatch ? 1000 : 100 - similarity;
      }

      return { project, index };
    }),
  ).sort((a, b) => b.index - a.index);

  return _isEmpty(sortedProjects) ? (
    <FormattedMessage {...messages.noProjects} />
  ) : (
    <ol className="mr-list-dropdown">
      {_map(sortedProjects, ({ project }) => (
        <li key={`project-${project.id}`}>
          <a onClick={() => onSelectProject(project)}>
            {project.displayName ? project.displayName : project.name}
          </a>
        </li>
      ))}
    </ol>
  );
};

export default WithSearchResults(
  WithPagedProjects(
    ProjectPickerModal,
    "candidateProjects",
    "pagedCandidateProjects",
    "projectPickerModal",
    false,
  ),
  "projectPickerModal",
  "projects",
  "candidateProjects",
);
