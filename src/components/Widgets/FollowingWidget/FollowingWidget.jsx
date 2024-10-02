import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useQuery } from '@apollo/client'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _throttle from 'lodash/throttle'
import { subscribeToFollowUpdates, unsubscribeFromFollowUpdates }
       from '../../../services/User/User'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import QuickWidget from '../../QuickWidget/QuickWidget'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import ViewFollowing from '../../Following/ViewFollowing/ViewFollowing'
import ViewFollowers from '../../Following/ViewFollowers/ViewFollowers'
import Activity from '../../Following/Activity/Activity'
import { USER} from '../../Following/FollowingQueries'
import BusySpinner from '../../BusySpinner/BusySpinner'
import messages from './Messages'

const descriptor = {
  widgetKey: 'FollowingWidget',
  label: messages.title,
  targets: [WidgetDataTarget.user],
  minWidth: 3,
  minHeight: 3,
  defaultWidth: 6,
  defaultHeight: 10,
  defaultConfiguration: {
    activityIsGrouped: true,
    showExactDates: false,
  }
}

const FollowingWidget = props => {
  const [tab, setTab] = useState('activity')
  const { loading, error, data, refetch } = useQuery(USER, {
    variables: { id: props.user.id }
  })

  // Refresh the user when this component updates to avoid stale data if the user
  // leaves the dashboard and returns later. It's throttled down to one request
  // at most every 5 seconds to avoid rapid refreshing
  useEffect(() => refreshUser(refetch))

  useEffect(() => {
    subscribeToFollowUpdates(message => {
      if (message.data.followedId === props.user.id ||
          message.data.followerId === props.user.id ||
          _find(_get(data, 'user.followers'), f => f.user.id === message.data.followerId) ||
          _find(_get(data, 'user.following'), {id: message.data.followedId})) {
        refetch()
      }
    }, "FollowingWidget")

    return () => unsubscribeFromFollowUpdates("FollowingWidget")
  })

  if (!props.user) {
    return null
  }

  if (error) {
    throw error
  }

  if (loading) {
    return <BusySpinner />
  }

  let ActiveView = null
  let title = null
  switch (tab) {
    case 'followers':
      ActiveView = ViewFollowers
      title = messages.followersTitle
      break
    case 'following':
      ActiveView = ViewFollowing
      title = messages.followingTitle
      break
    case 'activity':
    default:
      ActiveView = Activity
      title = messages.activityTitle
      break
  }

  return (
    <QuickWidget
      {...props}
      className=""
      widgetTitle={<FormattedMessage {...title} />}
      noMain
      rightHeaderControls = {
        <div className="mr-flex mr-justify-end mr-items-center mr-links-green-lighter mr-leading-none mr-uppercase mr-text-xs">
          <a
            className="mr-mr-2 mr-pr-2 mr-border-r-2 mr-border-white-10"
            onClick={() => setTab('activity')}
          >
            <FormattedMessage {...messages.activityLabel} />
          </a>
          <a
            className="mr-mr-2 mr-pr-2 mr-border-r-2 mr-border-white-10"
            onClick={() => setTab('following')}
          >
            <FormattedMessage {...messages.followingLabel} />
          </a>
           <a
             className="mr-mr-8"
             onClick={() => setTab('followers')}
           >
            <FormattedMessage {...messages.followersLabel} />
          </a>
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
                  className="mr-fill-current mr-w-4 mr-h-4"
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
        </div>
      }
    >
      <ActiveView
        {...props}
        showExactDates={props.widgetConfiguration.showExactDates}
        data={data}
      />
    </QuickWidget>
  )
}

const refreshUser = _throttle((refetch) => {
  refetch()
}, 5000, {leading: true, trailing: false})

registerWidgetType(FollowingWidget, descriptor)
export default FollowingWidget
