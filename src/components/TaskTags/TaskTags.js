import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import _filter from 'lodash/filter'
import _split from 'lodash/split'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import KeywordAutosuggestInput
       from '../KeywordAutosuggestInput/KeywordAutosuggestInput'
import External from '../External/External'
import Modal from '../Modal/Modal'
import messages from './Messages'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

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

  tagList = () => {
    const tags = _map(this.props.tags.split(/,\s*/), (tag, index) => {
      if ( !_isEmpty(tag) ) {
        return (
          <div className="mr-bg-white-10 mr-text-white mr-mr-2 mr-px-2 mr-rounded"
               key={`tag-${index}`}>
            {tag}
          </div>
        )
      }
      else {
        return null
      }
    })

    return (
      <div className="mr-flex mr-text-base mr-ml-2">{tags}</div>
    )
  }

  render() {
    const disableEditTags = this.props.taskReadOnly || (
      (this.props.task?.status !== 0 &&
         (![0, 2, 4, 5].includes(this.props.task?.reviewStatus))) && 
         ( 
      this.props.task?.reviewRequestedBy !== this.props.user && 
      this.props.task?.reviewClaimedBy !== this.props.user
      )
    )

    if (this.state.edit) {
      const preferredTags =
        _filter(
          _split(_get(this.props.task.parent, 'preferredTags'), ','),
          (result) => !_isEmpty(result)
        )
      const limitTags = !!_get(this.props.task.parent, 'limitTags')
      
      return (
        <External>
          <Modal isActive onClose={() => this.setState({edit: false})} allowOverflow>
            <div className="mr-w-full">
              <div className="mr-flex">
              <h3 className="mr-text-yellow mr-text-3xl mr-mb-4">
                <FormattedMessage {...messages.modifyTags} />
              </h3>
              <a target="_blank" href="https://learn.maproulette.org/en-us/documentation/using-maproulette-tags/" title="Learn more about Maproulette tags" className="mr-ml-2">
              <SvgSymbol
                  sym="info-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-white mr-w-4 mr-h-4"
                />
              </a>
            </div>
              <div className="mr-mt-2 mr-w-full">
                <KeywordAutosuggestInput
                  handleChangeTags={this.handleChangeTags}
                  handleAddTag={this.handleAddTag}
                  formData={this.props.tags} {...this.props}
                  tagType={"tasks"}
                  preferredResults={preferredTags}
                  limitToPreferred={limitTags}
                  placeholder={this.props.intl.formatMessage(messages.addTagsPlaceholder)}
                />
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
        <div className="mr-flex mr-justify-between mr-items-center mr-mb-2">
          <div className="mr-text-sm mr-text-white mr-flex mr-items-center mr-flex-grow">
            <FormattedMessage
              {...messages.taskTags}
            /> {this.tagList()}
          </div>

          {!disableEditTags ?
            <div className="mr-links-green-lighter mr-flex-grow-0 mr-flex">
            <a onClick={() => this.setState({ edit: true })} className="mr-inline-block mr-mr-2">
              <FormattedMessage {...messages.updateTags} />
            </a>
            <a target="_blank" href="https://learn.maproulette.org/en-us/documentation/using-maproulette-tags/" title="Learn more about Maproulette tags" className="">
            <SvgSymbol
                sym="info-icon"
                viewBox="0 0 20 20"
                className="mr-fill-white mr-w-3 mr-h-3"
              />
            </a>
          </div> : null
          }
        </div>
      )
    }
    else if (!disableEditTags) {
      return (
        <div className="mr-links-green-lighter mr-flex">
          <a onClick={() => this.setState({edit: true})}>
            <FormattedMessage {...messages.addTags} />
          </a>
          <a target="_blank" href="https://learn.maproulette.org/en-us/documentation/using-maproulette-tags/" title="Learn more about Maproulette tags" className="mr-ml-1">
            <SvgSymbol
              sym="info-icon"
              viewBox="0 0 20 20"
              className="mr-fill-white mr-w-3 mr-h-3"
            />
          </a>
        </div>
      )
    }
    else {
      return (
        <div className="mr-text-sm mr-text-white">
          <FormattedMessage
            {...messages.taskTags}
          />
        </div>
      )
    }
  }
}

export default injectIntl(TaskTags)
