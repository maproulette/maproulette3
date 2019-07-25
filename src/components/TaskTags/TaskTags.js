import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import KeywordAutosuggestInput
       from '../KeywordAutosuggestInput/KeywordAutosuggestInput'
import External from '../External/External'
import Modal from '../Modal/Modal'
import messages from './Messages'

export class TaskTags extends Component {
  state = {
    edit: false
  }

  handleAddTag = (value) => {
    this.props.setTags(!this.props.tags ? value : (this.props.tags + "," + value))
  }

  handleChangeTags = (value) => {
    this.props.setTags(value)
  }

  onSave = () => {
    this.props.saveTaskTags(this.props.task, this.props.tags)
    this.setState({edit: false})
  }

  render() {
    if (this.state.edit) {
      return (
        <External>
          <Modal isActive onClose={() => this.setState({edit: false})}>
            <div className="mr-w-full">
              <h2 className="mr-text-yellow mr-text-4xl mr-mb-4">
                <FormattedMessage {...messages.modifyTags} />
              </h2>
              <div className="mr-mt-2">
                <KeywordAutosuggestInput handleChangeTags={this.handleChangeTags}
                                         handleAddTag={this.handleAddTag}
                                         formData={this.props.tags} {...this.props}
                                         tagType={"tasks"}
                                         placeholder={this.props.intl.formatMessage(messages.addTagsPlaceholder)} />
              </div>
              <div className="mr-flex mr-justify-end mr-items-center mr-mt-8">
                <button
                  className="mr-button mr-button--white mr-mr-4"
                  onClick={() => this.setState({edit: false})}
                >
                  <FormattedMessage {...messages.cancelTags} />
                </button>

                <button
                  className="mr-button"
                  onClick={() => this.onSave()}
                >
                  <FormattedMessage {...messages.saveTags} />
                </button>
              </div>
            </div>
          </Modal>
        </External>
      )
    }
    else if (this.props.tags && this.props.tags !== "") {
      return (
        <div>
          <div className="mr-float-right mr-text-green-lighter hover:mr-text-white"
               onClick={() => this.setState({edit: true})}>
            <FormattedMessage {...messages.updateTags} />
          </div>
          <div className="mr-text-sm mr-text-white">
            <FormattedMessage
              {...messages.taskTags}
            /> {this.props.tags}
          </div>
        </div>
      )
    }
    else {
      return (
        <div>
          <div className="mr-text-green-lighter hover:mr-text-white"
               onClick={() => this.setState({edit: true})}>
            <FormattedMessage {...messages.addTags} />
          </div>
        </div>
      )
    }
  }
}

export default injectIntl(TaskTags)
