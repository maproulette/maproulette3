import React, { Component } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import CloneChallengeNominatimSearchbox from './CloneChallengeNominatimSearchbox'
import Modal from '../../../Modal/Modal'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'


class CloneOverPassChallengeForAreaModal extends Component {
  state = {
    searchResult: {}
  }
  componentDidMount() {
    if(this.props.challenge) console.log(this.props.challenge)
  }
  render() {
    return (
      <Modal
        isActive
        onClose={this.props.onCloseModal}
        contentClassName="mr-h-screen75"
      >
        <article className="mr-whitespace-normal">
          <div className="mr-text-2xl mr-mb-4">
            <FormattedMessage {...messages.modalTitle}/>
          </div>
          <div>
            <p className='mr-max-w-lg mr-text-lg mr-text-mango'>
              <FormattedMessage values={{br: <br />}}{...messages.modalDescription}/>
            </p> 
          </div>
          <div className='mr-text-lg'>
            <MarkdownContent
              className='mr-markdown'
              markdown={this.props.intl.formatMessage(
                messages.modalExplanation
              )}
            />
          </div>
          <div className='mr-text-lg mr-mb-4 mr-text-mango'>
            <FormattedMessage {...messages.nominatimSearchTitle}/>    
          </div>
          <div className='mr-mb-4'>
            <CloneChallengeNominatimSearchbox 
              onResultSelected={(result => {
                console.log(result)
                this.setState({searchResult: result})
              })}
            />
          </div>
            <div className='mr-flex mr-flex-col mr-space-y-4'>
              <div className='mr-text-lg mr-text-mango'>
                <FormattedMessage {...messages.selectedNominatimArea}/>
              </div>
              <div className='mr-flex mr-space-x-2 mr-min-w-1/3 mr-items-center'>
                {this.state.searchResult && this.state.searchResult.name ? (  
                  <p className='mr-bg-white-10 mr-p-2 mr-text-mango mr-min-w-1/3' style={{maxWidth: "max-content"}}>{`"${this.state.searchResult.name}"`}</p>
                ) : <p className='mr-bg-white-10 mr-p-2 mr-text-mango mr-w-1/3'>None Selected</p>}
                {this.state.searchResult && this.state.searchResult.name && (
                  <button
                    className="mr-top-0 mr-right-0 mr-transition mr-text-green-lighter hover:mr-text-white"
                    onClick={() => {
                      this.setState({searchResult: {}})
                    }}
                  >
                    <SvgSymbol
                      sym="close-outline-icon"
                      viewBox="0 0 20 20"
                      className="mr-fill-current mr-w-5 mr-h-5"
                    />
                  </button>
                )}
              </div>
            </div>
        </article>
      </Modal>
    )
  }
}

export default injectIntl(CloneOverPassChallengeForAreaModal)

