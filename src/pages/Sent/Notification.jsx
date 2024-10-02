import { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { FormattedMessage }
       from 'react-intl'
import External from '../../components/External/External'
import Modal from '../../components/Modal/Modal'
import Markdown from '../../components/MarkdownContent/MarkdownContent'
import messages from './Messages'
import CommentType from '../../services/Comment/CommentType'

class Notification extends Component {
  notificationBody = () => {
    return <CommentBody id={this.props.id} text={this.props.text} type={this.props.type} />
  }

  renderedNotification = () => (
    <div
      key={this.props.id}
      className={"mr-bg-pink-light-10 mr-rounded mr-border mr-border-pink-light-50 mr-mt-2"}
    >
      <div className="mr-p-6">
        {this.notificationBody()}
      </div>
    </div>
  )

  render() {
    return (
      <External>
        <Modal
          isActive={true}
          onClose={this.props.onClose}
        >
          {this.renderedNotification()}
        </Modal>
      </External>
    )
  }
}

const CommentBody = function(props) {
  return (
    <Fragment>
      <AttachedComment text={props.text} />
      <ViewTask id={props.id} type={props.type}/>
    </Fragment>
  );
}

const AttachedComment = function(props) {
  return (
    <Fragment>
      <div className="mr-text-sm mr-rounded-sm mr-p-2 mr-bg-grey-lighter-10">
        <div className="mr-markdown mr-markdown--longtext">
          <Markdown allowShortCodes markdown={props.text} />
        </div>
      </div>
    </Fragment>
  );
}

const ViewTask = function(props) {
  const path = props.type === CommentType.TASK
    ? `task/${props.id}`
    : `browse/challenges/${props.id}?tab=conversation`
  const label = props.type === CommentType.TASK
    ? messages.goToTaskLabel
    : messages.goToChallengeLabel

  return (
    <div className="mr-mt-8 mr-links-green-lighter">
      <div className="mr-flex mr-leading-tight">
        <Link to={path} target="_blank" rel="noopener noreferrer">
            <FormattedMessage {...label} />
        </Link>
      </div>
    </div>
  )
}

Notification.propTypes = {
  id: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
}

export default Notification
