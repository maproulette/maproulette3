export default function PaginationControl({
  currentPage,
  totalPages,
  pageSize,
  gotoPage,
  setPageSize,
}) {
  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < totalPages - 1;

  const previousPage = () => gotoPage(Math.max(currentPage - 1, 0));
  const nextPage = () => gotoPage(Math.min(currentPage + 1, totalPages - 1));

  return (
    <div className="mr-flex mr-justify-center mr-items-center mr-gap-3 mr-mt-6 mr-text-white">
      <button
        className="mr-button mr-button--small"
        onClick={() => gotoPage(0)}
        disabled={!canPreviousPage}
      >
        {"<< First"}
      </button>
      <button
        className="mr-button mr-button--small"
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      >
        {"< Previous"}
      </button>
      <span>
        {"Page "}
        <input
          className="mr-input mr-px-1 mr-py-0 mr-w-16"
          type="number"
          min={1}
          max={totalPages}
          defaultValue={currentPage + 1}
          onChange={(e) => gotoPage(e.target.value ? Number(e.target.value) - 1 : 0)}
        />
        {" of "}
        {totalPages}
      </span>
      <button
        className="mr-button mr-button--small"
        onClick={() => nextPage()}
        disabled={!canNextPage}
      >
        {"Next >"}
      </button>
      <button
        className="mr-button mr-button--small"
        onClick={() => gotoPage(totalPages - 1)}
        disabled={!canNextPage}
      >
        {"Last >>"}
      </button>

      {setPageSize && (
        <select
          className="mr-select mr-px-3"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[25, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize} per page
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
