import React from 'react'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'

/**
 * Renders a list of properties in a table, intended for use in a map popup
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const PropertyList = props => {
  const tagInfo = process.env.REACT_APP_TAGINFO_SERVER_URL

  if (_isEmpty(props.featureProperties)) {
    return <div className="feature-properties empty">No Properties</div>
  }

  const rows = _map(props.featureProperties, (value, key) => {
    const link =
      !_isEmpty(tagInfo) ?
      <a target="_blank" rel="noopener" href={`${tagInfo}/keys/${key}`}>{key}</a> :
      <span className="not-linked">{key}</span>

    return (
      <tr key={key} className="property">
        <td className="name">{link}</td>
        <td className="value">{value}</td>
      </tr>
    )
  })

  return (
    <div className="feature-properties">
      <h3>{props.header || "Properties"}</h3>
      <table className="property-list table">
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

export default PropertyList
