import PropTypes from 'prop-types'
import { MY_TEAMS } from '../TeamQueries'
import RemoveMemberControlItem from './RemoveMemberControlItem'
import AcceptInviteControlItem from './AcceptInviteControlItem'
import DeclineInviteControlItem from './DeclineInviteControlItem'

/**
 * Menu of controls for a team member
 */
export const MemberControls = props => {
  return (
    <ul className="mr-links-green-lighter">
      <AcceptInviteControlItem
        {...props}
        key="accept-invite"
        className="mr-my-1"
        refetchQueries={['TeamUsers']}
      />
      <DeclineInviteControlItem
        {...props}
        key="decline-invite"
        className="mr-my-1"
        refetchQueries={[
          'TeamUsers',
          {query: MY_TEAMS, variables: { userId: props.user.id }}
        ]}
      />
      <RemoveMemberControlItem
        {...props}
        key="leave-team"
        className="mr-my-1"
        refetchQueries={[
          'TeamUsers',
          {query: MY_TEAMS, variables: { userId: props.user.id }}
        ]}
      />
    </ul>
  )
}

MemberControls.propTypes = {
  user: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMember: PropTypes.object.isRequired,
}

export default MemberControls
