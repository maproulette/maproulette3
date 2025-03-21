import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import { WidgetDataTarget, registerWidgetType } from "../../services/Widget/Widget";
import CardChallenge from "../CardChallenge/CardChallenge";
import CardProject from "../CardProject/CardProject";
import WithFeatured from "../HOCs/WithFeatured/WithFeatured";
import QuickWidget from "../QuickWidget/QuickWidget";
import messages from "./Messages";

const descriptor = {
  widgetKey: "FeaturedChallengesWidget",
  label: messages.header,
  targets: [WidgetDataTarget.user],
  minWidth: 4,
  defaultWidth: 6,
  minHeight: 12,
  defaultHeight: 12,
};

export default function FeaturedChallengesWidget(props) {
  return (
    <QuickWidget
      {...props}
      nomain
      className=""
      widgetTitle={<FormattedMessage {...messages.header} />}
    >
      <FeaturedList
        featuredProjects={props.featuredProjects}
        featuredChallenges={props.featuredChallenges}
      />
    </QuickWidget>
  );
}

const FeaturedList = ({ featuredProjects, featuredChallenges }) => {
  if (featuredProjects.length === 0 && featuredChallenges.length === 0) {
    return (
      <div className="mr-text-grey-lighter">
        <FormattedMessage {...messages.nothingFeatured} />
      </div>
    );
  }

  return (
    <div
      className="mr-flex mr-flex-row"
      style={{
        gap: "1em",
        scrollSnapType: "x mandatory",
        overflowX: "auto",
      }}
    >
      {featuredProjects.map((project) => (
        <div
          key={project.id}
          className="mr-w-full"
          style={{ scrollSnapAlign: "start", flexShrink: 0 }}
        >
          <CardProject
            className="mr-card-project--featured mr-bg-transparent mr-w-full"
            project={project}
            isExpanded
            permanentlyExpanded
            startControl={<BrowseControl featuredItem={project} itemType="projects" />}
          />
        </div>
      ))}

      {featuredChallenges.map((challenge) => (
        <div
          key={challenge.id}
          className="mr-w-full"
          style={{ scrollSnapAlign: "start", flexShrink: 0 }}
        >
          <CardChallenge
            className="mr-card-challenge--featured mr-bg-transparent mr-w-full"
            challenge={challenge}
            isExpanded
            permanentlyExpanded
            startControl={<BrowseControl featuredItem={challenge} itemType="challenges" />}
          />
        </div>
      ))}
    </div>
  );
};

const BrowseControl = (props) => {
  return (
    <Link
      to={{
        pathname: `/browse/${props.itemType}/${props.featuredItem.id}`,
        state: { fromSearch: true },
      }}
      className="mr-button mr-button--small"
    >
      <FormattedMessage {...messages.browseFeaturedLabel} />
    </Link>
  );
};

registerWidgetType(WithFeatured(FeaturedChallengesWidget), descriptor);
