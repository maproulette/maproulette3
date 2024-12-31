import PropTypes from "prop-types";
import { Component } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FormattedMessage } from "react-intl";
import Button from "../../components/Button/Button";
import ConfirmAction from "../../components/ConfirmAction/ConfirmAction";
import messages from "./Messages";

export default class ApiKey extends Component {
  render() {
    return (
      <section className="mr-section" id="apikey">
        <header className="mr-section__header mr-flex mr-items-center mr-justify-between mr-mb-8">
          <h2 className="mr-h4 mr-text-white">
            <FormattedMessage {...messages.apiKey} />
          </h2>
        </header>
        <input
          type="text"
          disabled
          className="mr-input mr-border-none mr-shadow-none mr-bg-white-10 mr-text-mango mr-p-4"
          value={this.props.user.apiKey}
        />
        <div className="mr-mt-4 mr-flex">
          <CopyToClipboard text={this.props.user.apiKey}>
            <button className="mr-button mr-button--green-lighter mr-mr-4">
              <FormattedMessage {...messages.apiKeyCopyLabel} />
            </button>
          </CopyToClipboard>

          <ConfirmAction>
            <Button
              className="mr-button mr-button--green-lighter"
              onClick={() => this.props.resetAPIKey(this.props.user.id)}
            >
              <FormattedMessage {...messages.apiKeyResetLabel} />
            </Button>
          </ConfirmAction>
        </div>
      </section>
    );
  }
}

ApiKey.propTypes = {
  user: PropTypes.object,
  resetAPIKey: PropTypes.func.isRequired,
};
