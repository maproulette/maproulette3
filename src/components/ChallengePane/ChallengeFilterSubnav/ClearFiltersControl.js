import React from 'react'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

const ClearFiltersControl = props => (
  <button
    className="mr-hidden lg:mr-flex mr-items-center mr-transition mr-text-green-lighter hover:mr-text-white mr-ml-4"
    onClick={props.clearFilters}
  >
    <SvgSymbol
      sym="close-outline-icon"
      viewBox="0 0 20 20"
      className="mr-fill-current mr-w-5 mr-h-5"
    />
    <span className="mr-ml-2 mr-whitespace-no-wrap">
      <FormattedMessage {...messages.clearFiltersLabel} />
    </span>
  </button>
)

export default ClearFiltersControl
