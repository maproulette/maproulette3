import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from '../../components/Modal/Modal'
import SignInButton from '../../components/SignInButton/SignInButton'
import messages from './Messages'

export class SignIn extends Component {
  render() {
    return (
      <div className="mr-bg-cityscape mr-w-full mr-min-h-120 mr-bg-no-repeat mr-bg-repeat-x">
        <div className="mr-fixed mr-top-0 mr-w-full mr-mt-48 mr-fixed-containing-block">
          <Modal
            extraNarrow
            fullBleed
            transparentOverlay
            isActive={true}
          >
            <article>
              <div className="mr-flex mr-flex-col mr-items-center mr-pt-8 mr-pb-8 mr-bg-blue-cloudburst">
                <div className="mr-text-4xl mr-font-medium mr-text-yellow mr-mb-4">
                  <FormattedMessage {...messages.modalTitle} />
                </div>
                <div className="mr-text-md mr-text-white">
                  <FormattedMessage {...messages.modalPrompt} />
                </div>
              </div>

              <div className="mr-bg-blue-dark mr-p-8 mr-flex mr-justify-center">
                <SignInButton {...this.props} />
              </div>
            </article>
          </Modal>
        </div>
      </div>
    )
  }
}

export default SignIn
