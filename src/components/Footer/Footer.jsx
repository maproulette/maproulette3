import { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

class Footer extends Component {
  state = {
    serviceInfo: null
  };

  componentDidMount() {
    fetch(`${window.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/service/info`)
        .then((res) => res.json())
        .then((serviceInfo) => {
          this.setState({ serviceInfo });
        })
        .catch((error) => {
          console.error(error);
        });
  }
  
  render() {
    let frontendVersion = __GIT_TAG__ !== '' ? __GIT_TAG__ : __GIT_SHA__.slice(0, 7);
    let frontendVersionUrl = __GIT_TAG__ !== ''
      ? `https://github.com/maproulette/maproulette3/releases/tag/${__GIT_TAG__}`
      : `https://github.com/maproulette/maproulette3/commit/${__GIT_SHA__}`;

    let info = this.state.serviceInfo?.compiletime;
    let backendVersion = info?.version === info?.gitHeadCommit
      ? info?.gitHeadCommit.slice(0, 7)
      : info?.version;
    let backendVersionUrl = info?.version === info?.gitHeadCommit
      ? `https://github.com/maproulette/maproulette-backend/commit/${info?.gitHeadCommit}`
      : `https://github.com/maproulette/maproulette-backend/releases/tag/v${info?.version}`;

    return (
      <footer className="mr-px-4 mr-py-12 md:mr-py-24 mr-links-green-lighter">
        <div className="mr-max-w-3xl mr-mx-auto mr-overflow-hidden">
          <div className="md:mr-flex md:mr--mx-4">
            <div className="mr-mb-8 md:mr-mb-0 md:mr-px-4 md:mr-flex-1">
              <h3 className="mr-text-white mr-text-md mr-mb-2">
                <FormattedMessage {...messages.versionLabel} />{' '}
                <span className="mr-text-green-light mr-font-mono mr-text-base">
                  <a href={frontendVersionUrl}>{frontendVersion}</a>
                </span>
              </h3>
             { this.state.serviceInfo && (
              <h3 className="mr-text-white mr-text-md mr-mb-2">
                  <FormattedMessage {...messages.APIVersionLabel} />{' '}
                  <span className="mr-text-green-light mr-font-mono mr-text-base">
                    <a href={backendVersionUrl}>{backendVersion}</a>
                  </span>
                </h3>
              )}
            </div>

            <div className="mr-mb-8 md:mr-mb-0 md:mr-px-4 md:mr-flex-1">
              <ul className="mr-list-reset mr-text-sm">
                <li>
                  <a
                    href={window.env.REACT_APP_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  ><FormattedMessage {...messages.getHelp} /></a>
                </li>
                <li>
                  <a
                    href={window.env.REACT_APP_BLOG_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  ><FormattedMessage {...messages.viewBlog} /></a>
                </li>
                <li>
                  <a
                    href="https://github.com/maproulette/maproulette3/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  ><FormattedMessage {...messages.reportBug} /></a>
                </li>
              </ul>
            </div>
            <div className="mr-mb-8 md:mr-mb-0 md:mr-px-4 md:mr-flex-1">
              <a
                href="https://openstreetmap.app.neoncrm.com/forms/maproulette"
                target="_blank"
                rel="noopener noreferrer"
                className="mr-items-center"
              >
                <span className="mr-absolute mr-ml-8"> 
                  <FormattedMessage {...messages.donateButton} />
                </span>
              </a>
            </div>
            <div className="md:mr-px-4 md:mr-flex-1 md:mr-flex md:mr-justify-end">
              <div>
                <h3 className="mr-mb-2 mr-text-xl mr-text-green-lighter">
                  <FormattedMessage {...messages.followUs} />
                </h3>
                <a
                  href="https://en.osm.town/@MapRoulette"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-inline-flex mr-items-center"
                >
                  <SvgSymbol
                    sym="icon-mastodon"
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
