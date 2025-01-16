import _map from "lodash/map";
import _reverse from "lodash/reverse";
import { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import AchievementBadge from "../../components/AchievementBadge/AchievementBadge";
import Bungee from "../../components/Bungee/Bungee";
import BusySpinner from "../../components/BusySpinner/BusySpinner";
import External from "../../components/External/External";
import WithTargetUser from "../../components/HOCs/WithTargetUser/WithTargetUser";
import Modal from "../../components/Modal/Modal";
import SignIn from "../../pages/SignIn/SignIn";
import messages from "./Messages";

export const Achievements = (props) => {
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  if (!props.user) {
    return props.checkingLoginStatus ? (
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div>
    ) : (
      <SignIn {...props} />
    );
  }

  if (!props.targetUser) {
    return (
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div>
    );
  }

  const badges = _reverse(
    _map(props.targetUser.achievements, (achievement) => (
      <AchievementBadge
        key={achievement}
        achievement={achievement}
        className="mr-w-48 mr-my-6 mr-cursor-pointer"
        onClick={() => setSelectedAchievement(achievement)}
      />
    )),
  );

  return (
    <Fragment>
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-py-6">
        <div className="mr-bg-blue-dark mr-w-full mr-mt-8">
          <div className="mr-flex mr-justify-center mr-items-center mr-px-4 mr-h-48 mr-w-full">
            <div className="mr-bg-achievements mr-w-64 mr-h-64 mr-relative">
              <div className="mr-text-2xl mr-absolute mr-top-0 mr-flex mr-justify-center mr-items-center mr-w-64 mr-h-64">
                <Bungee
                  text={<FormattedMessage {...messages.header} />}
                  baseColor="teal"
                  highlightColor="yellow"
                />
              </div>
            </div>
          </div>
        </div>
        {props.targetUser.id !== props.user.id && (
          <div className="mr-w-full mr-flex mr-justify-center mr-mt-12 mr-text-4xl mr-text-link mr-links-green-lighter">
            <Link to={`/user/metrics/${props.targetUser.id}`}>
              {props.targetUser.osmProfile.displayName}
            </Link>
          </div>
        )}
        <div className="mr-w-full mr-flex mr-flex-wrap mr-justify-center mr-mt-12">{badges}</div>
        {badges.length === 0 && (
          <div className="mr-text-yellow mr-text-lg mr-w-full mr-p-8 mr-flex mr-flex-col mr-justify-center mr-items-center">
            <FormattedMessage {...messages.noAchievements} />
            <Link className="mr-button mr-mt-4" to="/browse/challenges">
              <FormattedMessage {...messages.findChallengesLabel} />
            </Link>
          </div>
        )}
      </div>
      {selectedAchievement && (
        <External>
          <Modal isActive onClose={() => setSelectedAchievement(null)}>
            <div className="mr-p-8">
              <AchievementBadge achievement={selectedAchievement} size="large" showDescription />
            </div>
          </Modal>
        </External>
      )}
    </Fragment>
  );
};

export default WithTargetUser(Achievements);
