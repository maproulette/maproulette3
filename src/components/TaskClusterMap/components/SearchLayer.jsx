import SearchContent from "../../EnhancedMap/SearchControl/SearchContent";

/**
 * Renders the search content when search is active
 */
const SearchLayer = ({ onResultSelected, closeSearch, ...props }) => {
  return <SearchContent {...props} onResultSelected={onResultSelected} closeSearch={closeSearch} />;
};

export default SearchLayer;
