import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import WithEditor from '../HOCs/WithEditor/WithEditor'
import { Editor } from '../../services/Editor/Editor'

/**
 * Renders a reference to an OSM element (such as a node or way) as an Overpass
 * Turbo link, but on click will try to load the data into JOSM if that is the
 * user's chosen editor -- otherwise will proceed to open Overpass Turbo in a
 * new browser tab
 */
export class OSMElementReference extends PureComponent {
  overpassQuery() {
    const elementStatements = this.props.osmElements.map(
      osmElement => `${osmElement.elementType}(${osmElement.osmId});`
    ).join('')

    return `(${elementStatements});(._;>;);out;`
  }

  description() {
    return this.props.osmElements.map(
      osmElement => `${osmElement.elementType} ${osmElement.osmId}`
    ).join(', ')
  }

  loadInJOSMIfActive(clickEvent) {
    if (!this.props.isJosmEditor(this.props.configuredEditor)) {
      return
    }

    clickEvent.preventDefault()
    const josmObjectIds = this.props.osmElements.map(
      osmElement => `${osmElement.elementType[0]}${osmElement.osmId}`
    )
    this.props.loadObjectsIntoJOSM(josmObjectIds,
                                   this.props.configuredEditor === Editor.josmLayer)
  }

  render() {
    const overpassUrl =
      `https://overpass-turbo.eu/map.html?Q=${encodeURIComponent(this.overpassQuery())}`

    return (
      <a
        href={overpassUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={e => this.loadInJOSMIfActive(e)}
      >
        {this.description()}
      </a>
    )
  }
}

OSMElementReference.propTypes = {
  osmElements: PropTypes.arrayOf(
    PropTypes.shape({
      elementType: PropTypes.string.isRequired,
      osmId: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default WithEditor(OSMElementReference)
