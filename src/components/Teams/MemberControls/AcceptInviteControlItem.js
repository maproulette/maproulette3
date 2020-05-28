import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { useMutation } from '@apollo/client'
import AppErrors from '../../../services/Error/AppErrors'
import BusySpinner from '../../BusySpinner/BusySpinner'
import { ACCEPT_INVITE } from '../TeamQueries'
import messages from './Messages'

/**
 * Control item for accepting an invitation to join a team
 */
const AcceptInviteControlItem = props => {
  const [acceptInvite, { loading: isSaving }] = useMutation(ACCEPT_INVITE)

  // The team member needs have an invitation and be the current user
  if (!props.teamMember.isInvited() || !props.teamMember.isUser(props.user)) {
    return null
  }

  if (isSaving) {
    return <BusySpinner />
  }

  return (
    <li className={props.className}>
      { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        onClick={() => {
          acceptInvite({
            variables: { teamId: props.teamMember.team.id },
            refetchQueries: props.refetchQueries,
          })
          .catch(error => {
            props.addErrorWithDetails(AppErrors.team.failure, error.message)
          })
        }}
      >
        <FormattedMessage {...messages.acceptInviteLabel} />
      </a>
    </li>
  )
}

AcceptInviteControlItem.propTypes = {
  user: PropTypes.object.isRequired,
  teamMember: PropTypes.object.isRequired,
  refetchQueries: PropTypes.array,
}

AcceptInviteControlItem.defaultProps = {
  refetchQueries: [],
}

export default AcceptInviteControlItem
