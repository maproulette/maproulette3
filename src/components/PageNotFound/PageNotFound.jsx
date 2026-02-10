import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import Illustration404 from "../../../images/404-illustration.svg";
import messages from "./Messages";

/**
 * PageNotFound displays a 404 message.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
class PageNotFound extends Component {
  render() {
    return (
      <div className="mr-min-h-content-no-filters mr-bg-gradient-b-blue-darker-blue-dark mr-flex mr-items-center mr-p-4">
        <div className="mr-flex-grow mr-max-w-lg mr-mx-auto mr-text-center mr-text-white">
          <img
            src={Illustration404}
            alt={this.props.intl.formatMessage(messages.pageNotFoundAlt)}
          />
          <p className="mr-my-8 mr-text-lg">
            <FormattedMessage {...messages.missingPage} />
          </p>
          <Link className="mr-button" to="/">
            <FormattedMessage {...messages.homePage} />
          </Link>
        </div>
      </div>
    );
  }
}

export default injectIntl(PageNotFound);
