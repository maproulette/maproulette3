import messages from './Messages'

/**
 * Return intl properties required for react-table-6 to ensure the various
 * buttons and messages it renders are properly localized
 */
export const intlTableProps = intl => ({
  previousText: intl.formatMessage(messages.previousLabel),
  nextText: intl.formatMessage(messages.nextLabel),
  loadingText: intl.formatMessage(messages.loadingLabel),
  noDataText: intl.formatMessage(messages.noData),
  pageText: intl.formatMessage(messages.pageLabel),
  ofText: intl.formatMessage(messages.of),
  rowsText: intl.formatMessage(messages.rows),
  pageJumpText: intl.formatMessage(messages.jumpToPageLabel),
  rowsSelectorText: intl.formatMessage(messages.rowsPerPageLabel),
  totalText: intl.formatMessage(messages.totalLabel),
})
