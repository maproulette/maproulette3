import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import FeatureStyleLegend from '../../FeatureStyleLegend/FeatureStyleLegend'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'FeatureStyleLegendWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task, WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 3,
  defaultHeight: 8,
}

export default class FeatureStyleLegendWidget extends Component {
  render() {
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
      >
        <FeatureStyleLegend {...this.props} />
      </QuickWidget>
    )
  }
}

registerWidgetType(FeatureStyleLegendWidget, descriptor)
