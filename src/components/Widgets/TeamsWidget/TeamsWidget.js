import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import _isEmpty from 'lodash/isEmpty'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import QuickWidget from '../../QuickWidget/QuickWidget'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import MyTeams from '../../Teams/MyTeams/MyTeams'
import ViewTeam from '../../Teams/ViewTeam/ViewTeam'
import EditTeam from '../../Teams/EditTeam/EditTeam'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TeamsWidget',
  label: messages.title,
  targets: [WidgetDataTarget.user],
  minWidth: 3,
  minHeight: 3,
  defaultWidth: 6,
  defaultHeight: 10,
}

const TeamsWidget = props => {
  const [editingTeam, setEditingTeam] = useState(null)
  const [viewingTeam, setViewingTeam] = useState(null)

  if (!props.user) {
    return null
  }

  let widgetTitle = messages.title
  let headerControls = null
  let currentView = null

  if (editingTeam) {
    currentView = (
      <EditTeam
        {...props}
        team={editingTeam}
        finish={() => setEditingTeam(null)}
      />
    )

    widgetTitle =
      _isEmpty(editingTeam) ?
      messages.createTeamTitle :
      messages.editTeamTitle
  }
  else if (viewingTeam) {
    currentView = <ViewTeam {...props} team={viewingTeam} />
    widgetTitle = messages.viewTeamTitle
    headerControls = (
      <div className="mr-links-green-lighter">
        <a className="mr-mb-4" onClick={() => setViewingTeam(null)}>
          &larr; <FormattedMessage {...messages.myTeamsLabel} />
        </a>
      </div>
    )
  }
  else {
    currentView = (
      <MyTeams
        {...props}
        viewTeam={team => setViewingTeam(team)}
        editTeam={team => setEditingTeam(team)}
        createTeam={() => setEditingTeam({})}
      />
    )
    widgetTitle = messages.myTeamsTitle
    headerControls = (
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
            <li>
              <button
                className="mr-text-current"
                onClick={() => setEditingTeam({})}
              >
                <FormattedMessage {...messages.createTeamLabel} />
              </button>
            </li>
          </ul>
        )}
      />
    )
  }

  return (
    <QuickWidget
      {...props}
      className=""
      widgetTitle={<FormattedMessage {...widgetTitle} />}
      rightHeaderControls={headerControls}
      noMain
    >
      {currentView}  
    </QuickWidget>
  )
}

registerWidgetType(TeamsWidget, descriptor)
export default TeamsWidget
