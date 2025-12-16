import SvgSymbol from "../SvgSymbol/SvgSymbol";
import { SearchFilter } from "../TableShared/EnhancedTable";
import { inputStyles } from "../TableShared/TableStyles";

/**
 * Reusable search filter component for table columns.
 * Wraps the SearchFilter with a clear button and consistent styling.
 *
 * @param {Object} props
 * @param {string} props.filterValue - Current filter value
 * @param {Function} props.setFilter - Function to update the filter value
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} [props.className] - Optional additional CSS classes
 */
const TableSearchFilter = ({ filterValue, setFilter, placeholder, className = "" }) => {
  return (
    <div className={`mr-flex mr-items-center ${className}`} onClick={(e) => e.stopPropagation()}>
      <SearchFilter
        value={filterValue}
        onChange={setFilter}
        placeholder={placeholder}
        inputClassName={inputStyles}
      />
      {filterValue && (
        <button
          className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
          onClick={() => setFilter(null)}
          aria-label="Clear filter"
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
};

export default TableSearchFilter;
