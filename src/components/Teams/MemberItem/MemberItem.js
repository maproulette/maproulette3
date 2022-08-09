import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { useMutation } from '@apollo/client'
import AppErrors from '../../../services/Error/AppErrors'
import AsTeamMember from '../../../interactions/TeamMember/AsTeamMember'
import RolePicker from '../../RolePicker/RolePicker'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../BusySpinner/BusySpinner'
import MemberControls from '../MemberControls/MemberControls'
import { UPDATE_ROLE } from '../TeamQueries'
import messages from './Messages'

/**
 * Lists a team member along with member controls
 */
const MemberItem = props => {
  const [updateRole, { loading: isLoading }] = useMutation(UPDATE_ROLE)

  if (isLoading) {
    return <BusySpinner />
  }

  const teamMember = AsTeamMember(props.teamUser)
  return (
    <li className="mr-my-1">
      <div className="mr-flex mr-justify-between">
        <Link to={`/user/metrics/${teamMember.userId}`}>
          {teamMember.name}
          {teamMember.isUser(props.user) &&
           <span className="mr-ml-2 mr-text-mango">
             <FormattedMessage {...messages.youLabel} />
           </span>
          }
        </Link>

        <div className="mr-flex mr-justify-end">
          <div className="mr-mr-4">
            {(props.userTeamMember.isTeamAdmin() && teamMember.isActive()) ?
             <RolePicker
               {...props}
               role={teamMember.highestRole()}
               pickRole={role =>
                updateRole({
                  variables: {
                    teamId: teamMember.team.id,
                    userId: teamMember.userId,
                    role: parseInt(role),
                  },
                  refetchQueries: ['TeamUsers'],
                })
                .catch(error => {
                  props.addErrorWithDetails(AppErrors.team.failure, error.message)
                })
               }
             /> :
             <FormattedMessage {...teamMember.roleDescription()} />
            }
          </div>
          <div className="mr-min-w-6">
            {(props.userTeamMember.isTeamAdmin() || teamMember.isUser(props.user)) &&
             <Dropdown
               className="mr-dropdown--right"
               dropdownButton={dropdown => (
                 <button
                   onClick={dropdown.toggleDropdownVisible}
                   className="mr-flex mr-items-center mr-text-white"
                 >
                   <SvgSymbol
                     sym="navigation-more-icon"
                     viewBox="0 0 20 20"
                     className="mr-fill-current mr-w-5 mr-h-5"
                   />
                 </button>
               )}
               dropdownContent={() =>
                 <MemberControls {...props} teamMember={teamMember} />
               }
             />
            }
          </div>
        </div>
      </div>
    </li>
  )
}

MemberItem.propTypes = {
  user: PropTypes.object.isRequired,
  userTeamMember: PropTypes.object.isRequired,
  teamUser: PropTypes.object.isRequired,
}

export default MemberItem
