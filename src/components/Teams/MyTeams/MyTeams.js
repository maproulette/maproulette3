import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import _find from 'lodash/find'
import _throttle from 'lodash/throttle'
import { subscribeToTeamUpdates, unsubscribeFromTeamUpdates }
       from '../../../services/Team/Team'
import AsTeamMember from '../../../interactions/TeamMember/AsTeamMember'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../BusySpinner/BusySpinner'
import TeamControls from '../TeamControls/TeamControls'
import { MY_TEAMS } from '../TeamQueries'
import messages from './Messages'

/**
 * Lists all the teams on which the current user is a member
 */
export const MyTeams = function(props) {
  const { loading, error, data, refetch } = useQuery(MY_TEAMS, {
    variables: { userId: props.user.id }
  })

  // Refresh the teams when this component updates to avoid stale data. It's
  // throttled down to one request at most every 2 seconds to avoid rapid
  // refreshing
  useEffect(() => refreshTeams(refetch))

  useEffect(() => {
    subscribeToTeamUpdates(message => {
      if (message.data.userId === props.user.id ||
          _find(data.userTeams, {teamId: message.data.teamId})) {
        refetch()
      }
    }, "MyTeams")

    return () => unsubscribeFromTeamUpdates("MyTeams")
  })

  if (error) {
    throw error
  }

  if (loading) {
    return <BusySpinner />
  }

  const teamItems = data.userTeams.map(teamUser => {
    const teamMember = AsTeamMember(teamUser)
    return (
      <li key={teamMember.team.id} className="mr-h-5 mr-my-2">
        <div className="mr-flex mr-justify-between">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => props.viewTeam(teamMember.team)}>
            {teamMember.team.name}
          </a>

          <div className="mr-flex mr-justify-end mr-items-center">
            <div className="mr-mr-4">
              <FormattedMessage {...teamMember.roleDescription()} />
            </div>

            <div className="mr-min-w-6 mr-h-5">
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={dropdown => (
                  <button
                    onClick={dropdown.toggleDropdownVisible}
                    className="mr-flex mr-items-center mr-text-white-40"
                  >
                    <SvgSymbol
                      sym="navigation-more-icon"
                      viewBox="0 0 20 20"
                      className="mr-fill-current mr-w-5 mr-h-5"
                    />
                  </button>
                )}
                dropdownContent={dropdown =>
                  <TeamControls {...props} teamMember={teamMember} />
                }
              />
            </div>
          </div>
        </div>
      </li>
    )
  })

  return (
    <div className="mr-flex mr-flex-col mr-justify-between">
      {teamItems.length === 0 ?
       <FormattedMessage {...messages.noTeams} /> :
       <ul className="mr-links-green-lighter">
         {teamItems}
       </ul>
      }
    </div>
  )
}

const refreshTeams = _throttle((refetch) => {
  refetch()
}, 2000, {leading: true, trailing: false})

MyTeams.propTypes = {
  user: PropTypes.object.isRequired,
  viewTeam: PropTypes.func.isRequired,
  editTeam: PropTypes.func.isRequired,
}

export default MyTeams
