import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import { RESULTS_PER_PAGE } from '../../services/Search/Search'
import LoadMoreButton from './LoadMoreButton'
import messages from './Messages'


/**
 * LoadMoreButton renders a 'load more' button that can be used
 * to manage paging.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class PageResultsButton extends Component {
  render() {
    const resultsPerPage = _get(this.props, `searchPage.resultsPerPage`, RESULTS_PER_PAGE)
    const currentPage = _get(this.props, `searchPage.currentPage`, 0)

    return (
      <LoadMoreButton {...this.props}
          loadMore={() => this.props.setSearchPage({currentPage: (currentPage + 1), resultsPerPage}, this.props.applyToSearchGroups)} >
        <FormattedMessage {...messages.moreResultsLabel} />
      </LoadMoreButton>
    )
  }
}

PageResultsButton.propTypes = {
  /** Invoked to page the challenges when the button is clicked */
  setSearchPage: PropTypes.func.isRequired,
  /** Boolean flag indicating if there are more results */
  hasMoreResults: PropTypes.bool,
  /** Boolean flag indicating we should show a busy spinner */
  isLoading: PropTypes.bool,
  /** Search Group to apply the paging too */
  applyToSearchGroups: PropTypes.array,
}
