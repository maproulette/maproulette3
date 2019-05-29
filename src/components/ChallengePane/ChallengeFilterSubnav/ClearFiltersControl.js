import React from 'react'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

const ClearFiltersControl = props => (
  <button
    className="mr-hidden lg:mr-flex mr-items-center mr-transition mr-text-green-lighter hover:mr-text-white mr-ml-2"
    onClick={props.clearFilters}
  >
    <FormattedMessage {...messages.clearFiltersLabel} />
  </button>
)

export default ClearFiltersControl
