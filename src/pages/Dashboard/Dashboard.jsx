import { Component } from "react";
import { FormattedMessage } from "react-intl";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import WithUserMetrics from "../../components/HOCs/WithUserMetrics/WithUserMetrics";
import WithWidgetWorkspaces from "../../components/HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces";
import WidgetWorkspace from "../../components/WidgetWorkspace/WidgetWorkspace";
import { WidgetDataTarget, generateWidgetId, widgetDescriptor } from "../../services/Widget/Widget";
import DashboardHeader from "./DashboardHeader";
import messages from "./Messages";

const WIDGET_WORKSPACE_NAME = "userDashboard";

export const defaultWorkspaceSetup = function () {
  return {
    dataModelVersion: 2,
    name: WIDGET_WORKSPACE_NAME,
    label: "Dashboard",
    widgets: [
      widgetDescriptor("FeaturedChallengesWidget"),
      widgetDescriptor("SavedChallengesWidget"),
      widgetDescriptor("LockedTasksWidget"),
      widgetDescriptor("TopUserChallengesWidget"),
      widgetDescriptor("UserActivityTimelineWidget"),
      widgetDescriptor("PopularChallengesWidget"),
    ],
    layout: [
      { i: generateWidgetId(), x: 0, y: 0, w: 6, h: 12 },
      { i: generateWidgetId(), x: 0, y: 12, w: 6, h: 6 },
      { i: generateWidgetId(), x: 0, y: 18, w: 6, h: 6 },
      { i: generateWidgetId(), x: 6, y: 0, w: 6, h: 12 },
      { i: generateWidgetId(), x: 6, y: 12, w: 6, h: 6 },
    ],
  };
};

class Dashboard extends Component {
  render() {
    return (
      <WidgetWorkspace
        {...this.props}
        className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse"
        workspaceTitle={
          <h1 className="mr-text-4xl mr-font-light">
            <FormattedMessage {...messages.header} />
          </h1>
        }
        subHeader={<DashboardHeader {...this.props} />}
        lightMode={false}
        darkMode={true}
      />
    );
  }
}

export default WithCurrentUser(
  WithUserMetrics(
    WithWidgetWorkspaces(
      Dashboard,
      WidgetDataTarget.user,
      WIDGET_WORKSPACE_NAME,
      defaultWorkspaceSetup,
    ),
    "user",
  ),
);
