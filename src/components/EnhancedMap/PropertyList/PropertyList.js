import React from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _compact from 'lodash/compact'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'
import _truncate from 'lodash/truncate'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * Renders a list of properties in a table, intended for use in a map popup
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const PropertyList = props => {
  // Default is lightMode -- only do darkMode if the value is present and false
  const darkMode = props.lightMode === false
  const tagInfo = process.env.REACT_APP_TAGINFO_SERVER_URL
  const header = (
    <h3 className="mr-flex mr-items-center">
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      {props.onBack && <a onClick={props.onBack} className="mr-mr-4">
          <SvgSymbol
            sym="icon-cheveron-left"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-6 mr-h-6"
          />
        </a>
      }
      {props.header ? props.header : <FormattedMessage {...messages.title} />}
    </h3>
  )

  if (_isEmpty(props.featureProperties)) {
    return (
      <div className="feature-properties empty">
        {header}
        <span className="mr-ml-5"><FormattedMessage {...messages.noProperties} /></span>
      </div>
    )
  }

  const rows = _compact(_map(props.featureProperties, (value, key) => {
    if (_isObject(value)) {
      return null
    }

    const link =
      !_isEmpty(tagInfo) ?
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`${tagInfo}/keys/${key}`}
        title={key}
      >
        {_truncate(key, {length: 20})}
      </a> :
      <span className="not-linked mr-text-grey">{key}</span>

    return (
      <tr key={key} className="property">
        <td className={classNames("name", {"mr-border-none mr-links-green-lighter mr-pr-3": darkMode})}>{link}</td>
        <td className={classNames("value", {"mr-border-none mr-pb-1": darkMode})}>{value}</td>
      </tr>
    )
  }))

  return (
    <div className="feature-properties mr-ml-2">
      {!props.hideHeader && header}
      <table className={classNames("property-list", {"mr-bg-transparent mr-text-white": darkMode, "table": !darkMode})}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

export default PropertyList
