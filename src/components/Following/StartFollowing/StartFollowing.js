import React, { useState } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'
import { useMutation } from '@apollo/client'
import AppErrors from '../../../services/Error/AppErrors'
import WithOSMUserSearch from '../../HOCs/WithOSMUserSearch/WithOSMUserSearch'
import AutosuggestTextBox from '../../AutosuggestTextBox/AutosuggestTextBox'
import BusySpinner from '../../BusySpinner/BusySpinner'
import { FOLLOW_USER } from '../FollowingQueries'
import messages from './Messages'

const ChooseOSMUser = WithOSMUserSearch(AutosuggestTextBox)

/**
 * Control for following a user by username
 */
const StartFollowing = props => {
  const [username, setUsername] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [followUser, { loading: isSaving }] = useMutation(FOLLOW_USER)

  const followSelectedUser = () => {
    followUser({ variables: { userId: selectedUser.id } })
    .catch(error => {
      props.addErrorWithDetails(AppErrors.user.followFailure, error.message)
    })
    setSelectedUser(null)
    setUsername("")
  }

  if (isSaving) {
    return <BusySpinner />
  }

  return (
    <div>
      <h4 className="mr-mt-8 mr-mb-2 mr-text-mango mr-text-base">
        <FormattedMessage {...messages.header} />
      </h4>

      <div className="mr-flex mr-justify-between">
        <div className="mr-mr-4 mr-flex-grow">
          <ChooseOSMUser
            inputValue={username}
            inputClassName="mr-py-2 mr-px-4 mr-border-none mr-placeholder-white-50 mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner"
            selectedItem={selectedUser}
            onInputValueChange={username => setUsername(username)}
            onChange={osmUser => setSelectedUser(osmUser)}
            placeholder={props.intl.formatMessage(messages.osmUsername)}
            fixedMenu
          />
        </div>
        {selectedUser &&
         <button className="mr-button mr-button--small" onClick={followSelectedUser}>
           <FormattedMessage {...messages.followLabel} />
         </button>
        }
      </div>
    </div>
  )
}

export default injectIntl(StartFollowing)
