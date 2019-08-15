import React from 'react'
import { FormattedMessage } from 'react-intl'
import _compact from 'lodash/compact'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'
import messages from './Messages'

/**
 * Renders a list of properties in a table, intended for use in a map popup
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const PropertyList = props => {
  const tagInfo = process.env.REACT_APP_TAGINFO_SERVER_URL

  if (_isEmpty(props.featureProperties)) {
    return (
      <div className="feature-properties empty">
        <h3>{props.header ? props.header : <FormattedMessage {...messages.title} />}</h3>
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
      <a target="_blank" rel="noopener noreferrer" href={`${tagInfo}/keys/${key}`}>{key}</a> :
      <span className="not-linked">{key}</span>

    return (
      <tr key={key} className="property">
        <td className="name">{link}</td>
        <td className="value">{value}</td>
      </tr>
    )
  }))

  return (
    <div className="feature-properties">
      <h3>{props.header ? props.header : <FormattedMessage {...messages.title} />}</h3>
      <table className="property-list table">
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

export default PropertyList
