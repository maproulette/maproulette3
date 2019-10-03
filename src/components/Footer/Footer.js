import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

class Footer extends Component {
  render() {
    return (
      <footer
        className="mr-px-4 mr-py-12 md:mr-py-24 mr-links-green-lighter"
      >
        <div className="mr-max-w-3xl mr-mx-auto mr-overflow-hidden">
          <div className="md:mr-flex md:mr--mx-4">
            <div className="mr-mb-8 md:mr-mb-0 md:mr-px-4 md:mr-flex-1">
              <h3 className="mr-text-white mr-text-md mr-mb-2">
                <FormattedMessage {...messages.versionLabel} />{' '}
                <span className="mr-text-green-light mr-font-mono mr-text-base">
                  <a
                    href={`https://github.com/osmlab/maproulette3/releases/tag/v${process.env.REACT_APP_VERSION_SEMVER}`}
                  >
                    v{process.env.REACT_APP_VERSION_SEMVER}
                  </a>
                </span>
              </h3>
            </div>

            <div className="mr-mb-8 md:mr-mb-0 md:mr-px-4 md:mr-flex-1">
              <ul className="mr-list-reset mr-text-sm">
                <li>
                  <a
                    href="https://github.com/osmlab/maproulette3/wiki"
                    target="_blank"
                    rel="noopener noreferrer"
                  ><FormattedMessage {...messages.getHelp} /></a>
                </li>
                <li>
                  <a
                    href="https://github.com/osmlab/maproulette3/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  ><FormattedMessage {...messages.reportBug} /></a>
                </li>
              </ul>
            </div>

            <div className="md:mr-px-4 md:mr-flex-1 md:mr-flex md:mr-justify-end">
              <div>
                <h3 className="mr-mb-2 mr-text-xl mr-text-green-lighter">
                  <FormattedMessage {...messages.followUs} />
                </h3>
                <a
                  href="https://twitter.com/maproulette"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-inline-flex mr-items-center"
                >
                  <SvgSymbol
                    sym="icon-twitter"
                    viewBox="0 0 30 24"
                    className="mr-w-6 mr-h-auto mr-fill-twitter"
                  />
                  <span className="mr-ml-2">@maproulette</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}

export default injectIntl(Footer)
