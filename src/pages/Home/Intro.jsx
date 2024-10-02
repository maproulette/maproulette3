import { Component } from "react";
import { FormattedMessage } from "react-intl";
import expertImage from "../../static/images/expert.svg";
import findImage from "../../static/images/find.svg";
import teamsImage from "../../static/images/teams.svg";
import messages from "./Messages";
class Intro extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24 mr-bg-space">
        <div className="mr-flex mr-justify-center">
          <div className="mr-text-center mr-w-1/2">
            <h2 className="mr-text-yellow mr-mb-12 mr-font-light md:mr-text-5xl">
              <FormattedMessage {...messages.introHeader} />
            </h2>
            <p className="mr-text-white mr-mb-20">
              <FormattedMessage {...messages.introDetail} />
            </p>
          </div>
        </div>

        <div className="mr-flex mr-justify-center">
          <div className="mr-flex mr-justify-between mr-text-white mr-font-light mr-w-3/4">
            <div className="mr-w-52 mr-mx-4">
              <div className="mr-w-full mr-h-40">
                <img src={expertImage} className="mr-w-full mr-h-full" />
              </div>
              <h3 className="mr-font-light mr-mt-4">
                <FormattedMessage {...messages.introFirstBullet} />
              </h3>
            </div>

            <div className="mr-w-52 mr-mx-4">
              <div className="mr-w-full mr-h-40">
                <img src={findImage} className="mr-w-full mr-h-full" />
              </div>
              <h3 className="mr-font-light mr-mt-4">
                <FormattedMessage {...messages.introSecondBullet} />
              </h3>
            </div>

            <div className="mr-w-52 mr-mx-4">
              <div className="mr-w-full mr-h-40 mr-relative">
                <img src={teamsImage} className="mr-w-full mr-h-full" />
              </div>
              <h3 className="mr-font-light mr-mt-4">
                <FormattedMessage {...messages.introThirdBullet} />
              </h3>
            </div>
          </div>
        </div>
        <a
          href="https://openstreetmap.app.neoncrm.com/forms/maproulette"
          target="_blank"
          rel="noopener noreferrer"
          className="mr-button mr-mt-20 mr-w-2/3 mr-justify-center mr-flex mr-items-center mr-mx-auto"
        >
          <FormattedMessage {...messages.donateButton} />
        </a>
      </section>
    );
  }
}

export default Intro;
