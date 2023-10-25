import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import CloneChallengeNominatimSearchbox from './CloneChallengeNominatimSearchbox'
import Modal from '../../../Modal/Modal'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import messages from './Messages'


export class CloneOverPassChallengeForAreaModal extends Component {
  componentDidMount() {
    if(this.props.challenge) console.log(this.props.challenge)
  }
  render() {
    return (
      <Modal
        isActive
        onClose={this.props.onCloseModal}
        contentClassName="mr-h-screen50"
      >
        <article className="mr-whitespace-normal">
          <div className="mr-text-2xl mr-mb-4">
            <FormattedMessage {...messages.modalTitle}/>
          </div>
          <div>
            <p className='mr-max-w-lg mr-text-lg mr-text-mango-60'>
              <FormattedMessage values={{br: <br />}}{...messages.modalDescription}/>
            </p> 
          </div>
          <div className='mr-text-lg'>
            <MarkdownContent
              className='mr-text-lg important'
              markdown={this.props.intl.formatMessage(
                messages.modalExplanation
              )}
            />
          </div>
          <CloneChallengeNominatimSearchbox onResultSelected={(result => {console.log(result)})}/>
        </article>
        
      </Modal>
    )
  }
}

