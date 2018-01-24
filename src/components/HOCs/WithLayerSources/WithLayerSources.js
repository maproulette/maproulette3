import React, { Component } from 'react';
import { LayerSources } from '../../../services/VisibleLayer/LayerSources'

export default function WithLayerSources(WrappedComponent) {
  return class extends Component {
    render() {
      return <WrappedComponent layerSources={LayerSources} {...this.props} />
    }
  }
}
