import queryString from "query-string";
import WithSearch from "../HOCs/WithSearch/WithSearch";

const SEARCH_FIELD_GETTER = {
  challenges: (item) => item.name,
  projects: (item) => item.displayName,
  users: (item) => item.osmProfile?.displayName,
};

/**
 * WithMetricsSearchResults acts as a filter that applies the named search query to an
 * array of candidate items, presenting to the wrapped component only those
 * items that match the query.
 **/
export function WithMetricsSearchResults(WrappedComponent) {
  return function (props) {
    const params = queryString.parse(props.location.search);
    const searchType = params["searchType"] || "challenges";
    const getSearchField = SEARCH_FIELD_GETTER[searchType];
    let items = props[searchType];

    const query = props.searchCriteria?.query ?? "";
    if (query && getSearchField) {
      items = items.filter((item) =>
        getSearchField(item)?.toLowerCase().includes(query.toLowerCase()),
      );
    }

    const forwardedProps = { ...props, [searchType]: items };
    return <WrappedComponent {...forwardedProps} />;
  };
}

export default (WrappedComponent, searchName, itemsProp, searchFunction = null) =>
  WithSearch(WithMetricsSearchResults(WrappedComponent), searchName, searchFunction);
