import classNames from "classnames";
import _noop from "lodash/noop";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import BusySpinner from "../BusySpinner/BusySpinner";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import Taxonomy from "../Taxonomy/Taxonomy";
import messages from "./Messages";

export class CardProject extends Component {
  render() {
    return (
      <article
        ref={(node) => (this.node = node)}
        className={classNames("mr-card-project", this.props.className, {
          "is-active": this.props.isExpanded,
        })}
      >
        <header className="mr-card-project__header" onClick={this.props.cardClicked}>
          <div>
            <Taxonomy {...this.props} {...this.props.project} />
            <span className="mr-text-grey-light mr-text-xs mr-uppercase mr-ml-2">
              <FormattedMessage {...messages.projectIndicatorLabel} />
            </span>
            <h3 className="mr-card-project__title">
              <Link
                to={{
                  pathname: `/browse/projects/${this.props.project.id}`,
                  state: { fromSearch: true },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {this.props.project.displayName || this.props.project.name}
              </Link>
            </h3>
          </div>
        </header>
        {this.props.isExpanded && (
          <div className="mr-card-project__content">
            {/* Disable Link tell project leaderboard page is reimplemented */}
            {/* <ol className="mr-card-project__meta">
             <li>
               <Link
                 className="mr-text-green-lighter hover:mr-text-white"
                 to={`/project/${this.props.project.id}/leaderboard`}
               >
                 <FormattedMessage {...messages.viewLeaderboard} />
               </Link>
             </li>
           </ol> */}

            <div className="mr-card-project__description">
              <MarkdownContent markdown={this.props.project.description} />
            </div>

            <ul className="mr-card-project__actions">
              {this.props.startControl !== undefined && (
                <li>{this.props.isLoading ? <BusySpinner inline /> : this.props.startControl}</li>
              )}
              {this.props.manageControl !== undefined && <li>{this.props.manageControl}</li>}
            </ul>
          </div>
        )}
      </article>
    );
  }
}

CardProject.propTypes = {
  /** The project to display */
  project: PropTypes.object.isRequired,
  /** Set to true if card should be in expanded view */
  isExpanded: PropTypes.bool,
  /** Invoked when the card is clicked, if provided */
  cardClicked: PropTypes.func,
  /** Set to true if project data is still being loaded */
  isLoading: PropTypes.bool,
};

CardProject.defaultProps = {
  isExpanded: true,
  isLoading: false,
  cardClicked: _noop,
};

export default CardProject;
