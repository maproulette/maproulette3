import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import AsManageableChallenge from '../../../../interactions/Challenge/AsManageableChallenge'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import Modal from '../../../Bulma/Modal'
import { DropzoneTextUpload } from '../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import messages from './Messages'
import './RebuildTasksControl.scss'

/**
 * RebuildTasksControl displays a control a challenge owner can use to rebuild
 * the tasks in their challenge. When clicked, a modal is displayed that offers
 * more information about rebuilding, as well as configuration options for the
 * rebuild (and a spot for uploading a new GeoJSON file if the challenge is
 * sourced from local GeoJSON).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class RebuildTasksControl extends Component {
  state = {
    confirming: false,
    removeUnmatchedTasks: false,
    localFilename: null,
    localFile: null,
  }

  initiateConfirmation = () => this.setState({ confirming: true })

  toggleRemoveUnmatchedTasks = () => {
    this.setState({ removeUnmatchedTasks: !this.state.removeUnmatchedTasks })
  }

  resetState = () => {
    this.setState({
      confirming: false,
      removeUnmatchedTasks: false,
      localFilename: null,
      localFile: null,
    })
  }

  proceed = () => {
    const removeUnmatched = this.state.removeUnmatchedTasks
    const updatedFile = this.state.localFile ? this.state.localFile.file : null
    this.resetState()

    const deleteStepIfRequested = removeUnmatched ?
                                  this.props.deleteIncompleteTasks(this.props.challenge) :
                                  Promise.resolve()

    deleteStepIfRequested.then(() => {
      this.props.rebuildChallenge(this.props.challenge, updatedFile, this.state.dataOriginDate)
    })
  }

  render() {
    if (!this.props.challenge) {
      return null
    }

    const challenge = AsManageableChallenge(this.props.challenge)

    let fileUploadArea = null
    if (challenge.dataSource() === 'local') {
      const uploadContext = {}
      fileUploadArea = DropzoneTextUpload({
        id: 'geojson',
        required: true,
        readonly: false,
        formContext: uploadContext,
        onChange: filename => {
          this.setState({
            localFilename: filename,
            localFile: uploadContext.geojson,
          })
        },
      })
    }

    let originDateField = null
    // Only offer an option to change the source origin date if it's a local file
    // we are uploading.
    if (challenge.dataSource() === 'local') {
      originDateField =
        <div className="form-group field field-string mr-mt-2">
          <label className="control-label">
            <FormattedMessage {...messages.dataOriginDateLabel} />
          </label>
          <input className="form-control" type="date"
                 label={this.props.intl.formatMessage(messages.dataOriginDateLabel)}
                 onChange={e => this.setState({dataOriginDate: e.target.value})}
                 value={this.state.dataOriginDate || challenge.dataOriginDate} />
        </div>
    }

    return (
      <div className="rebuild-tasks-control">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={this.initiateConfirmation}
          className="mr-text-green-lighter hover:mr-text-white mr-mr-4"
        >
          <FormattedMessage {...messages.label} />
        </a>

        {this.state.confirming && (
          <Modal
            className="rebuild-tasks-control__modal"
            onClose={this.resetState}
            isActive={this.state.confirming}
          >
            <article className="message">
              <div className="message-header">
                <FormattedMessage {...messages.modalTitle} />
              </div>

              <div className="message-body">
                <div className="rebuild-tasks-control__explanation">
                  <p className="rebuild-tasks-control__explanation__intro">
                    <FormattedMessage {...messages[challenge.dataSource()]} />
                  </p>

                  <div className="rebuild-tasks-control__explanation__steps">
                    <MarkdownContent
                      markdown={this.props.intl.formatMessage(
                        messages.explanation
                      )}
                    />
                  </div>

                  <p className="rebuild-tasks-control__warning">
                    <FormattedMessage {...messages.warning} />
                  </p>

                  <div className="rebuild-tasks-control__moreInfo">
                    <MarkdownContent
                      markdown={this.props.intl.formatMessage(
                        messages.moreInfo
                      )}
                    />
                  </div>
                </div>

                <div className="rebuild-tasks-control__options">
                  <div className="rebuild-tasks-control__remove-unmatched-option">
                    <input
                      type="checkbox"
                      className="mr-mr-1"
                      checked={this.state.removeUnmatchedTasks}
                      onChange={this.toggleRemoveUnmatchedTasks}
                    />
                    <label className="mr-text-blue-light">
                      <FormattedMessage {...messages.removeUnmatchedLabel} />
                    </label>
                  </div>

                  {fileUploadArea && (
                    <div className="rebuild-tasks-control__upload-geojson">
                      <form className="rjsf">{fileUploadArea}</form>
                    </div>
                  )}
                  {originDateField}
                </div>

                <div className="rebuild-tasks-control__modal-controls">
                  <button
                    className="button is-secondary is-outlined rebuild-tasks-control__cancel-control"
                    onClick={this.resetState}
                  >
                    <FormattedMessage {...messages.cancel} />
                  </button>

                  <button
                    className="button is-danger is-outlined rebuild-tasks-control__proceed-control"
                    onClick={this.proceed}
                  >
                    <FormattedMessage {...messages.proceed} />
                  </button>
                </div>
              </div>
            </article>
          </Modal>
        )}
      </div>
    )
  }
}

RebuildTasksControl.propTypes = {
  challenge: PropTypes.object.isRequired,
  rebuildChallenge: PropTypes.func.isRequired,
}

export default injectIntl(RebuildTasksControl)
