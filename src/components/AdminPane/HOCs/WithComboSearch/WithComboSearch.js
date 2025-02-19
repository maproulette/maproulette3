import WithSearch from "../../../HOCs/WithSearch/WithSearch";

/**
 * WithComboSearch combines together multiple WithSearch HOCs
 * for the same wrapped component, allowing a single search query to easily be
 * used for multiple discrete searches (e.g. searching both projects and
 * challenges simultaneously for a given name entered in a search box).
 *
 * @param searches {object} containing searchName: searchFunction fields for
 *        each desired search.
 *
 * @see See WithSearch
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithComboSearch = (WrappedComponent, searches) => {
  let Combo = WrappedComponent;

  for (const [searchName, searchFunction] of Object.entries(searches)) {
    Combo = WithSearch(Combo, searchName, searchFunction);
  }

  return Combo;
};

export default WithComboSearch;
