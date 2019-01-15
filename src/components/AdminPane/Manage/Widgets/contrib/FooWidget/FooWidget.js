import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _values from 'lodash/values'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../../services/Widget/Widget'
import QuickWidget from '../../../../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'FooWidget',
  label: messages.label,
  targets: _values(WidgetDataTarget), // all targets
  defaultWidth: 6,
  defaultHeight: 7,
}

export class FooWidget extends Component {
  render() {
    return (
      <QuickWidget {...this.props} className="foo-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <h1><FormattedMessage {...messages.content} /></h1>
      </QuickWidget>
    )
  }
}

registerWidgetType(FooWidget, descriptor) 
