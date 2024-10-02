import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import QuickWidget from '../../QuickWidget/QuickWidget'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import ActivityListing from '../../ActivityListing/ActivityListing'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ActivityListingWidget',
  label: messages.title,
  targets: [WidgetDataTarget.activity],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 4,
  defaultHeight: 12,
  defaultConfiguration: {
    activityIsGrouped: true,
    showExactDates: false,
  }
}

export const ActivityListingWidget = props => {
  return (
    <QuickWidget
      {...props}
      className=""
      noMain
      widgetTitle={<FormattedMessage {...messages.title} />}
      rightHeaderControls = {
        <Dropdown
          className="mr-dropdown--right"
          dropdownButton={dropdown => (
            <button
              onClick={dropdown.toggleDropdownVisible}
              className="mr-flex mr-items-center mr-text-green-lighter"
            >
              <SvgSymbol
                sym="cog-icon"
                viewBox="0 0 20 20"
                className="mr-fill-green-lighter mr-w-4 mr-h-4"
              />
            </button>
          )}
          dropdownContent={() => (
            <ul className="mr-list-dropdown">
              <li className="mr-my-2">
                <a
                  className="mr-normal-case mr-flex"
                  onClick={() => props.updateWidgetConfiguration({
                    showExactDates: !props.widgetConfiguration.showExactDates
                  })}
                >
                  <div className="mr-text-white mr-w-4">
                    {props.widgetConfiguration.showExactDates && "✓"}
                  </div>
                  <FormattedMessage {...messages.toggleExactDatesLabel} />
                </a>
              </li>
            </ul>
          )}
        />
      }
    >
      <ActivityListing
        {...props}
        showExactDates={props.widgetConfiguration.showExactDates}
        isGrouped={props.widgetConfiguration.activityIsGrouped}
        toggleIsGrouped={() => props.updateWidgetConfiguration({
          activityIsGrouped: !props.widgetConfiguration.activityIsGrouped
        })}
      />
    </QuickWidget>
  )
}

registerWidgetType(ActivityListingWidget, descriptor)

export default ActivityListingWidget
