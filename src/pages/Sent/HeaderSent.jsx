import { Component } from "react";
import { FormattedMessage } from "react-intl";
import BusySpinner from "../../components/BusySpinner/BusySpinner";
import CommentType from "../../services/Comment/CommentType";
import messages from "./Messages";

class HeaderSent extends Component {
  render() {
    return (
      <header className="mr-mb-8 mr-pb-4 mr-border-b mr-border-grey-light">
        <div className="sm:mr-flex sm:mr-justify-between mr-mb-2 sm:mr-mb-4">
          <div>
            <h1 className="mr-h2 mr-text-white mr-mb-2 md:mr-mb-0 md:mr-mr-4">
              <FormattedMessage {...messages.sentHeader} />
            </h1>
          </div>
          <div>
            {this.props.notificationsLoading ? (
              <BusySpinner />
            ) : (
              <button
                className="mr-button mr-button--green-lighter mr-button--small"
                onClick={() => this.props.refreshData()}
              >
                <FormattedMessage {...messages.refreshCommentsLabel} />
              </button>
            )}
          </div>
        </div>
        <div className="mr-flex mr-justify-between mr-items-center">
          <div className="mr-flex-1 mr-mr-4" style={{ maxWidth: "300px" }}>
            <input
              type="text"
              placeholder="Search comments..."
              value={this.props.searchTerm}
              onChange={(e) => this.props.onSearchChange(e.target.value)}
              className="mr-p-2 mr-rounded mr-w-full mr-bg-black-15 mr-text-white mr-border mr-border-grey-light focus:mr-border-green-lighter"
            />
          </div>
          <ul className="mr-list-reset mr-leading-tight mr-flex mr-items-center mr-text-white">
            <li className="mr-mr-3 mr-pr-3 mr-border-r mr-border-grey-light">
              <button
                onClick={() => this.props.setCommentType(CommentType.TASK)}
                disabled={this.props.commentType === CommentType.TASK}
                className={`${this.props.commentType === CommentType.TASK ? "mr-text-green-lighter " : ""}mr-text-current hover:mr-text-green-lighter mr-transition`}
              >
                <FormattedMessage {...messages.tasks} />
              </button>
            </li>
            <li>
              <button
                onClick={() => this.props.setCommentType(CommentType.CHALLENGE)}
                disabled={this.props.commentType === CommentType.CHALLENGE}
                className={`${this.props.commentType === CommentType.CHALLENGE ? "mr-text-green-lighter " : ""}mr-text-current hover:mr-text-green-lighter mr-transition`}
              >
                <FormattedMessage {...messages.challenges} />
              </button>
            </li>
          </ul>
        </div>
      </header>
    );
  }
}

export default HeaderSent;
