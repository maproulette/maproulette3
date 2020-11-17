import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import WithNominatimSearch from '../../HOCs/WithNominatimSearch/WithNominatimSearch'
import BusySpinner from '../../BusySpinner/BusySpinner'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

const SearchContent = props => {
  const checkForSpecialKeys = e => {
    // Esc clears search, Enter signals completion
    if (e.key === "Escape") {
      props.clearNominatimSearch()
    }
    else if (e.key === "Enter") {
      props.searchNominatim()
    }
  }

  const resultItems = _map(props.nominatimResults, result => (
    <li key={result.osmId || result.placeId}>
      <button
        className='mr-text-current hover:mr-text-yellow'
        onClick={() => props.chooseNominatimResult(result)}
      >
        {result.name}
      </button>
    </li>
  ))

  return (
    <div className="mr-absolute mr-top-0 mr-mt-3 mr-w-full mr-flex mr-justify-center">
      <div className={classNames(
        "mr-min-w-102 mr-z-5 mr-p-4 mr-rounded mr-w-4/5",
        props.nominatimResults ? "mr-bg-blue-dark" : "mr-bg-blue-dark-50"
      )}>
        <div className="mr-flex mr-justify-between mr-items-center">
          <div className="mr-flex mr-items-center">
            <input
              className={classNames(
                "mr-input mr-input--green-lighter-outline",
                props.nominatimResults ? "mr-bg-black-15" : "mr-bg-black-50"
              )}
              type="text"
              placeholder={props.intl.formatMessage(messages.nominatimQuery)}
              value={props.nominatimQuery}
              onChange={(e) => props.updateNominatimQuery(e.target.value)}
              onKeyDown={checkForSpecialKeys}
            />
            {props.nominatumSearching ?
              <BusySpinner inline className="mr-static" /> :
              <button
                className="mr-button mr-h-10 mr-py-0 mr-ml-4"
                onClick={props.searchNominatim}
              >
                <FormattedMessage {...messages.searchLabel } />
              </button>
            }
          </div>
          <button
            className="mr-ml-4"
            onClick={() => {
              props.clearNominatimSearch()
              props.closeSearch()
            }}
          >
            <SvgSymbol
              sym="icon-close"
              viewBox="0 0 20 20"
              className="mr-fill-white mr-w-4 mr-h-4"
              aria-hidden
            />
          </button>
        </div>

        {props.nominatimResults &&
          <React.Fragment>
            <hr className="mr-h-px mr-my-4 mr-bg-blue-light" />
            {resultItems.length === 0 ?
              <FormattedMessage {...messages.noResults } /> :
              <ol
                className="mr-o-2 mr-max-w-screen50 mr-whitespace-no-wrap mr-overflow-x-scroll"
                onClick={() => props.closeSearch()}
              >
                {resultItems}
              </ol>
            }
          </React.Fragment>
        }
      </div>
    </div>
  )
}

export default WithNominatimSearch(injectIntl(SearchContent))
