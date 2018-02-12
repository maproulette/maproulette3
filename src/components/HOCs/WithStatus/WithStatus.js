import { connect } from 'react-redux'
import _get from 'lodash/get'
import { FETCHING_CHALLENGES_STATUS,
         CHECKING_LOGIN_STATUS }
       from '../../../services/Status/Status'

export const mapStateToProps = state => {
  return {
    fetchingChallenges:
      _get(state, `currentStatus.${FETCHING_CHALLENGES_STATUS}`, []),

    checkingLoginStatus:
      _get(state, `currentStatus.${CHECKING_LOGIN_STATUS}`, false),
  }
}

export default WrappedComponent =>
  connect(mapStateToProps)(WrappedComponent)
