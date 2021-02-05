import React from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import FollowItem from '../FollowItem/FollowItem'

export const FollowList = props => {
  return (
    <div>
      <ul className="mr-links-green-lighter">
        {_map(props.itemUsers, user =>
         <FollowItem key={user.id} {...props} itemUser={user} />
        )}
      </ul>
    </div>
  )
}

FollowList.propTypes = {
  itemUsers: PropTypes.array.isRequired,
}

export default FollowList
