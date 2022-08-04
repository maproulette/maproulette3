import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import AsManageableChallenge from '../../../../interactions/Challenge/AsManageableChallenge'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import Modal from '../../../Modal/Modal'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import { DropzoneTextUpload } from '../../../Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import messages from './Messages'

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

    this.props.recordSnapshot(this.props.challenge.id)

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
        dropAreaClassName: "mr-text-green-white mr-border-matisse-blue mr-border-2 mr-rounded mr-text-sm mr-p-4 mr-cursor-pointer",
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
      originDateField = (
        <div>
          <label className="mr-text-orange mr-mr-2">
            <FormattedMessage {...messages.dataOriginDateLabel} />
          </label>
          <input
            className="mr-text-white mr-bg-transparent mr-border mr-border-white mr-rounded mr-p-2"
            type="date"
            label={this.props.intl.formatMessage(messages.dataOriginDateLabel)}
            onChange={e => this.setState({dataOriginDate: e.target.value})}
            value={this.state.dataOriginDate || challenge.dataOriginDate}
          />
        </div>
      )
    }

    return (
      <React.Fragment>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={this.initiateConfirmation}
          className={this.props.controlClassName}
        >
          <FormattedMessage {...messages.label} />
        </a>

        {this.state.confirming && (
          <Modal
            onClose={this.resetState}
            isActive={this.state.confirming}
          >
            <article className="mr-text-sm mr-whitespace-normal">
              <div className="mr-text-2xl mr-mb-4">
                <FormattedMessage {...messages.modalTitle} />
              </div>

              <div className="mr-text-white">
                <div>
                  <p>
                    <FormattedMessage {...messages[challenge.dataSource()]} />
                  </p>

                  <div>
                    <MarkdownContent
                      markdown={this.props.intl.formatMessage(
                        messages.explanation
                      )}
                    />
                  </div>

                  <div className="mr-bg-white-10 mr-rounded mr-text-orange mr-mt-4 mr-mb-8 mr-px-4 mr-pt-4 mr-pb-0 mr-flex mr-items-center">
                    <div className="mr-w-20 mr-ml-2 mr-mr-6">
                      <SvgSymbol
                        className="mr-fill-red mr-h-10 mr-h-10"
                        viewBox='0 0 20 20'
                        sym='alert-icon'
                      />
                    </div>
                    <div>
                      <FormattedMessage {...messages.warning} />
                      <div className="mr-my-4 mr-links-green-light">
                        <a
                          href={`${process.env.REACT_APP_DOCS_URL}/documentation/rebuilding-challenge-tasks/`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FormattedMessage {...messages.moreInfo} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mr-mt-8">
                  {fileUploadArea && (
                    <div>
                      <form className="rjsf">{fileUploadArea}</form>
                    </div>
                  )}
                </div>

                <div className="mr-w-full mr-flex mr-justify-between mr-items-center mr-mt-2">
                  <div>
                    <input
                      type="checkbox"
                      className="mr-mr-2"
                      checked={this.state.removeUnmatchedTasks}
                      onChange={this.toggleRemoveUnmatchedTasks}
                    />
                    <label className="mr-text-orange">
                      <FormattedMessage {...messages.removeUnmatchedLabel} />
                    </label>
                  </div>

                  {originDateField}
                </div>

                <div className="mr-mt-8">
                  <button
                    className="mr-button mr-button--white mr-mr-4"
                    onClick={this.resetState}
                  >
                    <FormattedMessage {...messages.cancel} />
                  </button>

                  <button
                    className="mr-button mr-button--danger"
                    onClick={this.proceed}
                  >
                    <FormattedMessage {...messages.proceed} />
                  </button>
                </div>
              </div>
            </article>
          </Modal>
        )}
      </React.Fragment>
    )
  }
}

RebuildTasksControl.propTypes = {
  challenge: PropTypes.object.isRequired,
  rebuildChallenge: PropTypes.func.isRequired,
}

export default injectIntl(RebuildTasksControl)
