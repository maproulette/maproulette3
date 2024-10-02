import PropTypes from 'prop-types'
import { Role, messagesByRole } from '../../services/Grant/Role'
import messages from './Messages'

const RolePicker = props => {
  const roleOptions = [
    <option key={Role.read} value={Role.read}>
      {props.intl.formatMessage(messagesByRole[Role.read])}
    </option>,

    <option key={Role.write} value={Role.write}>
      {props.intl.formatMessage(messagesByRole[Role.write])}
    </option>,

    <option key={Role.admin} value={Role.admin}>
      {props.intl.formatMessage(messagesByRole[Role.admin])}
    </option>,
  ]

  return (
    <select
      value={props.role}
      onChange={e => props.pickRole(e.target.value)}
      className="mr-flex-grow-0 mr-min-w-30 mr-select"
    >
      {[
        <option key='none' value=''>
          {props.intl.formatMessage(messages.chooseRole)}
        </option>
      ].concat(roleOptions)}
    </select>
  )
}

RolePicker.propTypes = {
  pickRole: PropTypes.func.isRequired,
}

export default RolePicker
