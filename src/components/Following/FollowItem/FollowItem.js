import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import AsAvatarUser from '../../../interactions/User/AsAvatarUser'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'

/**
 * Lists a user involved in following (either followed or a follower)
 */
const FollowItem = props => {
  const itemUser = AsAvatarUser(props.itemUser)
  return (
    <li className="mr-my-2">
      <div className="mr-flex mr-justify-between mr-items-center">
        <Link to={`/user/metrics/${itemUser.id}`}>
          <div className="mr-flex mr-items-center">
            <figure className="mr-w-8 mr-h-8 mr-mr-4">
              <img
                src={itemUser.profilePic(100)}
                alt=""
                className="mr-rounded-full mr-w-8 mr-h-8"
              />
            </figure>

            <span>{itemUser.osmProfile.displayName}</span>
          </div>
        </Link>

        <div className="mr-flex mr-justify-end mr-items-center mr-leading-none mr-h-5">
          {props.itemStatus && props.itemStatus(itemUser)}
          {props.itemControls &&
           <Dropdown
             className="mr-dropdown--right"
             dropdownButton={dropdown => (
               <button
                 onClick={dropdown.toggleDropdownVisible}
                 className="mr-flex mr-items-center mr-text-white-40 mr-h-5"
               >
                 <SvgSymbol
                   sym="navigation-more-icon"
                   viewBox="0 0 20 20"
                   className="mr-fill-current mr-w-5 mr-h-5"
                 />
               </button>
             )}
             dropdownContent={() => props.itemControls(itemUser)}
           />
          }
        </div>
      </div>
    </li>
  )
}

FollowItem.propTypes = {
  user: PropTypes.object.isRequired,
  itemUser: PropTypes.object.isRequired,
  itemControls: PropTypes.func,
}

export default FollowItem
