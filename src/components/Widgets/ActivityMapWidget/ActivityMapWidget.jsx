import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import QuickWidget from '../../QuickWidget/QuickWidget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import ActivityMap from '../../ActivityMap/ActivityMap'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ActivityMapWidget',
  label: messages.title,
  targets: [WidgetDataTarget.activity],
  minWidth: 3,
  defaultWidth: 8,
  minHeight: 5,
  defaultHeight: 12,
}

export const ActivityMapWidget = props => {
  return (
    <QuickWidget
      {...props}
      className=""
      noMain
      widgetTitle={<FormattedMessage {...messages.title} />}
    >
      <MapPane {...props}>
        <ActivityMap
          {...props}
          noAttributionPrefix={props.widgetLayout.w < 4}
        />
      </MapPane>
    </QuickWidget>
  )
}

registerWidgetType(ActivityMapWidget, descriptor)

export default ActivityMapWidget
