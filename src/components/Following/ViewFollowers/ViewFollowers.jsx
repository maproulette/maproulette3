import PropTypes from 'prop-types'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import _isEmpty from 'lodash/isEmpty'
import _groupBy from 'lodash/groupBy'
import _map from 'lodash/map'
import { FollowerStatus } from '../../../services/User/User'
import AppErrors from '../../../services/Error/AppErrors'
import BusySpinner from '../../BusySpinner/BusySpinner'
import FollowList from '../FollowList/FollowList'
import { BLOCK_USER, UNBLOCK_USER, FOLLOW_USER } from '../FollowingQueries'
import messages from './Messages'

/**
 * Displays a user's followers, as well as a section including those the user
 * has blocked
 */
export const ViewFollowers = props => {
  const [block, { loading: isBlocking }] = useMutation(BLOCK_USER)
  const [unblock, { loading: isUnblocking }] = useMutation(UNBLOCK_USER)
  const [follow, { loading: isFollowing }] = useMutation(FOLLOW_USER)

  if (!props.data || isBlocking || isUnblocking || isFollowing) {
    return <BusySpinner />
  }

  const following = new Set(_map(props.data.user.following, 'id'))
  const groupedFollowers = _groupBy(props.data.user.followers, 'status')
  const followers = _map(groupedFollowers[FollowerStatus.following], 'user')
  const blockedFollowers = _map(groupedFollowers[FollowerStatus.blocked], 'user')

  return (
    <div>
      {_isEmpty(followers) ?
       (props.user.settings.allowFollowing === false ?
        <FormattedMessage {...messages.followersNotAllowed} /> :
        <FormattedMessage {...messages.noFollowers} />
       ) :
       <FollowList
         {...props}
         itemUsers = {followers}
         itemStatus = {(itemUser) =>
           !following.has(itemUser.id) ? null :
           <div className="mr-text-white-40 mr-uppercase mr-text-xs mr-mx-8">
             <FormattedMessage {...messages.followingIndicator} />
           </div>
         }
         itemControls = {(itemUser) => (
           <ul className="mr-links-green-lighter">
             {!following.has(itemUser.id) &&
              <li key="followBack" className="mr-my-2">
                <a
                  onClick={() =>
                    follow({ variables: { userId: itemUser.id } })
                    .catch(error => {
                      props.addErrorWithDetails(AppErrors.user.followFailure, error.message)
                    })
                  }
                >
                  <FormattedMessage {...messages.followBackLabel} />
                </a>
              </li>
             }
             <li key="block" className="mr-my-2">
               <a
                 onClick={() =>
                   block({ variables: { userId: itemUser.id } })
                   .catch(error => {
                     props.addErrorWithDetails(AppErrors.user.followFailure, error.message)
                   })
                 }
               >
                 <FormattedMessage {...messages.blockFollowerLabel} />
               </a>
             </li>
           </ul>
         )}
       />
      }

      <h4 className="mr-mt-8 mr-mb-2 mr-uppercase mr-text-sm mr-text-mango">
        <FormattedMessage {...messages.blockedHeader} />
      </h4>
      {_isEmpty(blockedFollowers) ?
       <FormattedMessage {...messages.noBlockedFollowers} /> :
       <FollowList
         {...props}
         itemUsers = {blockedFollowers}
         itemControls = {(itemUser) => (
           <ul className="mr-links-green-lighter">
             <li key="unblock" className="mr-my-2">
               <a
                 onClick={() =>
                   unblock({ variables: { userId: itemUser.id } })
                   .catch(error => {
                     props.addErrorWithDetails(AppErrors.user.followFailure, error.message)
                   })
                 }
               >
                 <FormattedMessage {...messages.unblockFollowerLabel }/>
               </a>
             </li>
           </ul>
         )}
       />
      }
    </div>
  )
}

ViewFollowers.propTypes = {
  user: PropTypes.object.isRequired,
}

export default ViewFollowers
