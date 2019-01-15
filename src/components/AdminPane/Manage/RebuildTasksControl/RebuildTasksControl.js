import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import AsManageableChallenge
       from '../../../../interactions/Challenge/AsManageableChallenge'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import Modal from '../../../Bulma/Modal'
import { DropzoneTextUpload }
       from '../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
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

  initiateConfirmation = () => this.setState({confirming: true})

  toggleRemoveUnmatchedTasks = () => {
    this.setState({removeUnmatchedTasks: !this.state.removeUnmatchedTasks})
  }

  resetState = () => this.setState({
    confirming: false,
    removeUnmatchedTasks: false,
    localFilename: null,
    localFile: null,
  })

  proceed = () => {
    const removeUnmatched = this.state.removeUnmatchedTasks
    const updatedFile = this.state.localFile ? this.state.localFile.file : null
    this.resetState() 

    this.props.rebuildChallenge(this.props.challenge, removeUnmatched, updatedFile)
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
          this.setState({localFilename: filename, localFile: uploadContext.geojson})
        },
      })
    }

    return (
      <div className="rebuild-tasks-control">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a onClick={this.initiateConfirmation}>
          <FormattedMessage {...messages.label } />
        </a>

        {this.state.confirming &&
         <Modal className="rebuild-tasks-control__modal" onClose={this.resetState}
                isActive={this.state.confirming}>
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
                   <MarkdownContent markdown={this.props.intl.formatMessage(messages.explanation)} />
                 </div>

                 <p className="rebuild-tasks-control__warning">
                   <FormattedMessage {...messages.warning} />
                 </p>

                 <div className="rebuild-tasks-control__moreInfo">
                   <MarkdownContent markdown={this.props.intl.formatMessage(messages.moreInfo)} />
                 </div>
               </div>

               <div className="rebuild-tasks-control__options">
                 <div className="rebuild-tasks-control__remove-unmatched-option">
                   <label className="checkbox">
                     <input type="checkbox"
                           checked={this.state.removeUnmatchedTasks}
                           onChange={this.toggleRemoveUnmatchedTasks} />
                     <FormattedMessage {...messages.removeUnmatchedLabel} />
                   </label>
                 </div>

                 {fileUploadArea &&
                  <div className="rebuild-tasks-control__upload-geojson">
                    <form className="rjsf">{fileUploadArea}</form>
                  </div>
                 }
               </div>

               <div className="rebuild-tasks-control__modal-controls">
                 <button className="button is-secondary is-outlined rebuild-tasks-control__cancel-control"
                         onClick={this.resetState}>
                   <FormattedMessage {...messages.cancel} />
                 </button>

                 <button className="button is-danger is-outlined rebuild-tasks-control__proceed-control"
                         onClick={this.proceed}>
                   <FormattedMessage {...messages.proceed} />
                 </button>
               </div>
             </div>
           </article>
         </Modal>
        }
      </div>
    )
  }
}

RebuildTasksControl.proptypes = {
  challenge: PropTypes.object.isRequired,
  rebuildChallenge: PropTypes.func.isRequired,
}

export default injectIntl(RebuildTasksControl)
