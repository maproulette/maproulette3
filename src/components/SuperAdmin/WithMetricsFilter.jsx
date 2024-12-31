import queryString from "query-string";
import { Component } from "react";
/**
 * WithMetricsFilter handles routes parsing/querying for super admin metrics.
 * Toggle(checkbox) filter logic here as well.
 */
const WithMetricsFilter = function (WrappedComponent) {
  return class extends Component {
    render() {
      const params = queryString.parse(this.props.location.search);
      const tab = params["tab"];
      let entityFilters = {
        visible: params["hideUndiscoverable"] === "true",
        archived: params["hideArchived"] === "true",
        virtual: params["virtual"] === "true",
        from: params["from"] || undefined,
        to: params["to"] || undefined,
      };

      const toggleFilter = (filterName) => {
        entityFilters[filterName] = !entityFilters[filterName];
        let searchquery = `?`;
        searchquery += `tab=${tab}`;
        searchquery += `&searchType=${tab}`;
        searchquery += tab !== "users" ? `&hideUndiscoverable=${entityFilters.visible}` : "";
        searchquery += tab !== "users" ? `&hideArchived=${entityFilters.archived}` : "";
        searchquery += tab === "projects" ? `&virtual=${entityFilters.virtual}` : "";
        searchquery += entityFilters.from ? `&from=${entityFilters.from}` : "";
        searchquery += entityFilters.to ? `&to=${entityFilters.to}` : "";
        this.props.history.push({
          pathname: "/superadmin",
          search: searchquery,
        });
      };

      const toggleStartDate = (startDate) => {
        entityFilters.from = startDate;
        const newQueries = { ...params, from: startDate };
        this.props.history.push({
          pathname: "/superadmin",
          search: queryString.stringify(newQueries),
        });
      };

      const toggleEndDate = (endDate) => {
        entityFilters.to = endDate;
        const newQueries = { ...params, to: endDate };
        this.props.history.push({
          pathname: "/superadmin",
          search: queryString.stringify(newQueries),
        });
      };

      const clearDateFilter = () => {
        const newQueries = { ...params, from: undefined, to: undefined };
        this.props.history.push({
          pathname: "/superadmin",
          search: queryString.stringify(newQueries),
        });
      };

      let challenges = this.props.challenges;
      let projects = this.props.projects;
      let users = this.props.users;
      let startDate = new Date(entityFilters.from);
      let endDate = new Date(entityFilters.to);
      if (tab === "challenges") {
        challenges = entityFilters.visible ? challenges.filter((c) => c.enabled) : challenges;
        challenges = entityFilters.archived ? challenges.filter((c) => !c.isArchived) : challenges;
        challenges = entityFilters.from
          ? challenges.filter((c) => {
              const date = new Date(c.created);
              return date >= startDate;
            })
          : challenges;
        challenges = entityFilters.to
          ? challenges.filter((c) => {
              const date = new Date(c.created);
              return date <= endDate;
            })
          : challenges;
      } else if (tab === "projects") {
        projects = entityFilters.visible ? projects.filter((p) => p.enabled) : projects;
        projects = entityFilters.archived ? projects.filter((p) => !p.isArchived) : projects;
        projects = entityFilters.virtual ? projects.filter((p) => p.isVirtual) : projects;
        projects = entityFilters.from
          ? projects.filter((p) => {
              const date = new Date(p.created);
              return date >= startDate;
            })
          : projects;
        projects = entityFilters.to
          ? projects.filter((p) => {
              const date = new Date(p.created);
              return date <= endDate;
            })
          : projects;
      } else {
        users = entityFilters.from
          ? users.filter((user) => {
              const date = new Date(user.created);
              return date >= startDate;
            })
          : users;

        users = entityFilters.to
          ? users.filter((user) => {
              const date = new Date(user.created);
              return date <= endDate;
            })
          : users;
      }

      return (
        <WrappedComponent
          {...this.props}
          challenges={challenges}
          projects={projects}
          users={users}
          entityFilters={entityFilters}
          toggleFilter={toggleFilter}
          toggleStartDate={toggleStartDate}
          toggleEndDate={toggleEndDate}
          clearDateFilter={clearDateFilter}
        />
      );
    }
  };
};

export default (WrappedComponent) => WithMetricsFilter(WrappedComponent);
