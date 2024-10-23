import { Fragment } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { useMutation } from '@apollo/client'
import AppErrors from '../../../services/Error/AppErrors'
import ConfirmAction from '../../ConfirmAction/ConfirmAction'
import BusySpinner from '../../BusySpinner/BusySpinner'
import RemoveMemberControlItem from '../MemberControls/RemoveMemberControlItem'
import AcceptInviteControlItem from '../MemberControls/AcceptInviteControlItem'
import DeclineInviteControlItem from '../MemberControls/DeclineInviteControlItem'
import { DELETE_TEAM } from '../TeamQueries'
import messages from './Messages'

/**
 * Menu of controls for a team
 */
export const TeamControls = props => {
  const [deleteTeam, { loading: isDeleting }] = useMutation(DELETE_TEAM)
  const isSaving = isDeleting

  if (isSaving) {
    return <BusySpinner />
  }

  const isAdmin = props.teamMember.isUser(props.user) && props.teamMember.isTeamAdmin()
  return (
    <ul className="mr-links-green-lighter">
      {!props.suppressView &&
       <a onClick={() => props.viewTeam(props.teamMember.team)}>
         <FormattedMessage {...messages.viewTeamLabel} />
       </a>
      }
      {isAdmin &&
       <Fragment>
         <li key="edit-team" className="mr-my-1">
           <a onClick={() => props.editTeam(props.teamMember.team)}>
             <FormattedMessage {...messages.editTeamLabel} />
           </a>
         </li>

         <li key="delete-team" className="mr-my-1">
           <ConfirmAction>
             <a
               onClick={() => {
                 deleteTeam({
                   variables: { teamId: props.teamMember.team.id },
                   refetchQueries: ['MyTeams'],
                 })
                 .catch(error => {
                     props.addErrorWithDetails(AppErrors.team.failure, error.message)
                 })
               }}
             >
               <FormattedMessage {...messages.deleteTeamLabel} />
             </a>
           </ConfirmAction>
         </li>
       </Fragment>
      }
      <AcceptInviteControlItem
        {...props}
        key="accept-invite"
        className="mr-my-1"
        refetchQueries={['MyTeams']}
      />
      <DeclineInviteControlItem
        {...props}
        key="decline-invite"
        className="mr-my-1"
        refetchQueries={['MyTeams']}
      />
      {props.teamMember.isActive() && props.teamMember.isUser(props.user) &&
       <RemoveMemberControlItem
         {...props}
         key="leave-team"
         className="mr-my-1"
         refetchQueries={['MyTeams']}
       />
      }
    </ul>
  );
}

TeamControls.propTypes = {
  teamMember: PropTypes.object.isRequired,
  viewTeam: PropTypes.func.isRequired,
  editTeam: PropTypes.func.isRequired,
  suppressView: PropTypes.bool,
}

export default TeamControls
