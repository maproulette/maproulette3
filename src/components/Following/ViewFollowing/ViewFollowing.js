import React from 'react'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import AppErrors from '../../../services/Error/AppErrors'
import BusySpinner from '../../BusySpinner/BusySpinner'
import FollowList from '../FollowList/FollowList'
import StartFollowing from '../StartFollowing/StartFollowing'
import { UNFOLLOW_USER } from '../FollowingQueries'
import messages from './Messages'

/**
 * Displays users followed by this user
 */
export const ViewFollowing = props => {
  const [unfollow, { loading: isUnfollowing }] = useMutation(UNFOLLOW_USER)

  if (!props.data || isUnfollowing) {
    return <BusySpinner />
  }

  return (
    <div>
      {_isEmpty(_get(props.data, 'user.following')) ?
       <FormattedMessage {...messages.notFollowing} /> :
       <FollowList
         {...props}
         itemUsers = {props.data.user.following}
         itemControls = {(itemUser) => (
           <ul className="mr-links-green-lighter">
             <li key="unfollow" className="mr-my-2">
               <a
                 onClick={() =>
                   unfollow({ variables: { userId: itemUser.id } })
                   .catch(error => {
                     props.addErrorWithDetails(AppErrors.user.followFailure, error.message)
                   })
                 }
               >
                 <FormattedMessage {...messages.stopFollowingLabel }/>
               </a>
             </li>
           </ul>
         )}
       />
      }

      <div className="mr-mt-8">
        <StartFollowing {...props} />
      </div>
    </div>
  )
}

ViewFollowing.propTypes = {
  user: PropTypes.object.isRequired,
}

export default ViewFollowing
