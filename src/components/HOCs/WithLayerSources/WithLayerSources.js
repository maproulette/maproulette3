import React, { Component } from 'react';
import _clone from 'lodash/clone'
import { LayerSources } from '../../../services/VisibleLayer/LayerSources'
import AsMappableChallenge
       from '../../../interactions/Challenge/AsMappableChallenge'
import AsMappingUser
       from '../../../interactions/User/AsMappingUser'
import messages from './Messages'

export default function WithLayerSources(WrappedComponent) {
  return class extends Component {
    render() {
      const allLayerSources = _clone(LayerSources)

      const challengeBasemapLayer =
        AsMappableChallenge(this.props.challenge).defaultLayerSource()

      if (challengeBasemapLayer && challengeBasemapLayer.isDynamic) {
        challengeBasemapLayer.name = messages.challengeDefault
        allLayerSources.push(challengeBasemapLayer)
      }

      const userBasemapLayer =
        AsMappingUser(this.props.user).defaultLayerSource()

      if (userBasemapLayer && userBasemapLayer.isDynamic) {
        userBasemapLayer.name = messages.userDefault
        allLayerSources.push(userBasemapLayer)
      }

      return <WrappedComponent layerSources={allLayerSources} {...this.props} />
    }
  }
}
