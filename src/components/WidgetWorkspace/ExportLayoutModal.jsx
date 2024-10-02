import { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import External from "../External/External";
import Modal from "../Modal/Modal";
import messages from "./Messages";
import shippingTruck from "../../static/images/shipping-truck.svg";

export default class ExportLayoutModal extends Component {
  state = {
    exportName: "",
  };

  componentDidMount() {
    this.setState({ exportName: this.props.exportName });
  }

  render() {
    return (
      <External>
        <Modal narrow isActive onClose={this.props.onCancel}>
          <div>
            <div className="mr-flex mr-justify-center mr-my-8">
              <img src={shippingTruck} style={{ height: 99, width: 198 }} />
            </div>
            <div className="mr-w-full">
              <h2 className="mr-text-white mr-text-4xl mr-mb-4">
                <FormattedMessage {...messages.exportModalHeader} />
              </h2>
              <div className="mr-text-white mr-text-sm mr-font-medium mr-mt-6">
                <FormattedMessage {...messages.exportModalNameLabel} />
              </div>
              <div className="mr-mt-1">
                <input
                  type="text"
                  className="mr-input"
                  value={this.state.exportName}
                  onChange={(e) =>
                    this.setState({ exportName: e.target.value })
                  }
                />
              </div>

              <div className="mr-flex mr-justify-start mr-items-center mr-mt-8">
                <button
                  className="mr-button mr-button--white mr-mr-4"
                  onClick={this.props.onCancel}
                >
                  <FormattedMessage {...messages.cancelLabel} />
                </button>

                <button
                  className="mr-button"
                  onClick={() => this.props.onDownload(this.state.exportName)}
                >
                  <FormattedMessage {...messages.downloadLabel} />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </External>
    );
  }
}

ExportLayoutModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};
