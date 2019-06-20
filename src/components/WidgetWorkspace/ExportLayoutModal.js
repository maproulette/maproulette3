import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import External from '../External/External'
import Modal from '../Modal/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

export default class ExportLayoutModal extends Component {
  state = {
    exportName: '',
  }

  componentDidMount() {
    this.setState({exportName: this.props.exportName})
  }

  render() {
    return (
      <External>
        <Modal isActive onClose={this.props.onCancel}>
          <div className="mr-flex mr-justify-between">
            <div className="mr-pt-12">
              <SvgSymbol
                sym="illustration-tasks"
                viewBox="0 0 200 171"
                className="mr-h-40 mr-mr-12"
              />
            </div>

            <div className="mr-w-full">
              <h2 className="mr-text-white mr-text-4xl mr-mb-4">
                <FormattedMessage {...messages.exportModalHeader} />
              </h2>

              <div className="mr-text-white mr-text-sm mr-font-medium mr-mt-12">
                <FormattedMessage {...messages.exportModalNameLabel} />
              </div>
              <div className="mr-mt-1">
                <input
                  type="text"
                  className="mr-input mr-input--green-lighter-outline"
                  value={this.state.exportName}
                  onChange={e => this.setState({exportName: e.target.value})}
                />
              </div>

              <div className="mr-flex mr-justify-end mr-items-center mr-mt-8">
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
    )
  }
}

ExportLayoutModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
}
