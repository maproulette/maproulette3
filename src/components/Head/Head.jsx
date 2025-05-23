import _isEmpty from "lodash/isEmpty";
import { Helmet } from "react-helmet";
import { injectIntl } from "react-intl";
import { withRouter } from "react-router";
import WithCurrentChallenge from "../AdminPane/HOCs/WithCurrentChallenge/WithCurrentChallenge";
import WithCurrentProject from "../AdminPane/HOCs/WithCurrentProject/WithCurrentProject";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";

export const REACT_APP_TITLE = "MapRoulette";

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const findCurrentChallengeName = (props) => {
  return props.challenge?.name;
};

const findCurrentProjectName = (props) => {
  return props.project?.displayName;
};

const findCurrentUserName = (props) => {
  return props.user?.osmProfile.displayName;
};

const findCurrentCountryCode = (props) => {
  return props?.match?.params?.countryCode;
};

const findCurrentTaskId = (props) => {
  return props?.match?.params?.taskId;
};

const findReviewType = (props) => {
  return props?.match?.params?.showType;
};

/* parse names from url path into array, replace id params with names, and then concatenate with - for title */
export const formatTitle = (props) => {
  if (props?.match?.path) {
    let pathArr = props.match.path.split("/").filter((element) => element);

    pathArr = pathArr.map((param) => {
      if (param === ":challengeId") {
        return findCurrentChallengeName(props);
      } else if (param === ":projectId") {
        return findCurrentProjectName(props);
      } else if (param === ":countryCode") {
        return findCurrentCountryCode(props);
      } else if (param === ":userId") {
        return findCurrentUserName(props);
      } else if (param === ":taskId") {
        return findCurrentTaskId(props);
      } else if (param === ":showType") {
        return findReviewType(props);
      } else {
        return capitalize(param);
      }
    });

    pathArr.reverse();

    const newTitle = _isEmpty(pathArr)
      ? REACT_APP_TITLE
      : pathArr.join(" - ") + " - " + REACT_APP_TITLE;
    return newTitle;
  }
};

export const HeadTitle = (props) => {
  return (
    <Helmet>
      <title>{formatTitle(props)}</title>
    </Helmet>
  );
};

export default withRouter(
  WithCurrentUser(
    WithCurrentProject(WithCurrentChallenge(injectIntl(HeadTitle)), { allowNonManagers: true }),
  ),
);
