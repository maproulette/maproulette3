import { FormattedMessage, injectIntl } from "react-intl";
import messages from "./Messages";

function PaginationControl({ currentPage, totalPages, pageSize, gotoPage, setPageSize, intl }) {
  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < totalPages - 1;

  const previousPage = () => gotoPage(Math.max(currentPage - 1, 0));
  const nextPage = () => gotoPage(Math.min(currentPage + 1, totalPages - 1));

  return (
    <div className="mr-flex mr-flex-wrap mr-justify-center mr-items-center mr-gap-2 md:mr-gap-3 mr-mt-6 mr-text-white">
      <button
        className="mr-button mr-button--small mr-mb-2"
        onClick={() => gotoPage(0)}
        disabled={!canPreviousPage}
      >
        {"<< "}
        <FormattedMessage {...messages.first} />
      </button>
      <button
        className="mr-button mr-button--small mr-mb-2"
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      >
        {"< "}
        <FormattedMessage {...messages.previous} />
      </button>
      <span className="mr-mb-2">
        <FormattedMessage {...messages.page} />{" "}
        <input
          className="mr-input mr-px-1 mr-py-0 mr-w-12 md:mr-w-16"
          type="number"
          min={1}
          max={totalPages}
          value={currentPage + 1}
          onChange={(e) => gotoPage(e.target.value ? Number(e.target.value) - 1 : 0)}
        />{" "}
        <FormattedMessage {...messages.of} /> {totalPages}
      </span>
      <button
        className="mr-button mr-button--small mr-mb-2"
        onClick={() => nextPage()}
        disabled={!canNextPage}
      >
        <FormattedMessage {...messages.next} />
        {" >"}
      </button>
      <button
        className="mr-button mr-button--small mr-mb-2"
        onClick={() => gotoPage(totalPages - 1)}
        disabled={!canNextPage}
      >
        <FormattedMessage {...messages.last} />
        {" >>"}
      </button>

      {setPageSize && (
        <select
          className="mr-select mr-px-2 mr-mb-2 mr-w-full sm:mr-w-auto"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[25, 50, 100].map((number) => (
            <option key={number} value={number}>
              {intl.formatMessage(messages.showNumberPerPage, { number })}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default injectIntl(PaginationControl);
