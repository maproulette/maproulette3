import { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

import { version } from '../../../package.json'

class Footer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data : null
    };
  }

  componentDidMount() {
    this.renderMyData();
  }

  renderMyData(){
    fetch(`${window.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/service/info`)
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({ data : responseJson })
        })
        .catch((error) => {
          console.error(error);
        });
  }
  
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
                    href={`https://github.com/maproulette/maproulette3/releases/tag/v${version}`}
                  >
                    v{version}
                  </a>
                </span>
              </h3>
             { this.state.data ? 
              <h3 className="mr-text-white mr-text-md mr-mb-2">
                  <FormattedMessage {...messages.APIVersionLabel} />{' '}
                  <span className="mr-text-green-light mr-font-mono mr-text-base">
                    <a
                      href={`https://github.com/maproulette/maproulette-backend/releases/tag/v${this.state.data.compiletime.version}`}
                    >
                      v{this.state.data.compiletime.version}
                    </a>
                  </span>
                </h3> : 
                null 
              }
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
