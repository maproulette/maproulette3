import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'

export default class PlaceDescription extends Component {
  render() {
    const addr = _get(this.props, 'place.address')
    const scaleDescriptions = []

    if (_isObject(addr)) {
      if (_isString(addr.city)) {
        scaleDescriptions.push(addr.city)
      }
      else if (_isString(addr.town)) {
        scaleDescriptions.push(addr.town)
      }
      else if (_isString(addr.hamlet)) {
        scaleDescriptions.push(addr.hamlet)
      }
      else if (_isString(addr.village)) {
        scaleDescriptions.push(addr.village)
      }

      if (_isString(addr.county)) {
        scaleDescriptions.push(
          addr.county.toLowerCase().indexOf('county') === -1 ?
          `${addr.county} County` :
          addr.county
        )
      }

      if (_isString(addr.state)) {
        scaleDescriptions.push(addr.state)
      }

      if (_isString(addr.country)) {
        scaleDescriptions.push(addr.country)
      }
      else if (_isString(addr.continent)) {
        scaleDescriptions.push(addr.continent)
      }
    }

    return (
      <div className={classNames('place-description', this.props.className)}>
        {scaleDescriptions.length === 0 ? null : scaleDescriptions.join(', ')}
      </div>
    )
  }
}

PlaceDescription.propTypes = {
  place: PropTypes.object,
}
