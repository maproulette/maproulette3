import _find from "lodash/find";
import _throttle from "lodash/throttle";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from "react-query";
import {
  subscribeToFollowUpdates,
  unsubscribeFromFollowUpdates,
} from "../../../services/User/User";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import BusySpinner from "../../BusySpinner/BusySpinner";
import { USER, fetchFollowData } from "../../Following/FollowingQueries";
import ViewFollowers from "../../Following/ViewFollowers/ViewFollowers";
import ViewFollowing from "../../Following/ViewFollowing/ViewFollowing";
import QuickWidget from "../../QuickWidget/QuickWidget";
import messages from "./Messages";

const descriptor = {
  widgetKey: "FollowingWidget",
  label: messages.title,
  targets: [WidgetDataTarget.user],
  minWidth: 3,
  minHeight: 3,
  defaultWidth: 6,
  defaultHeight: 10,
};

const FollowingWidget = (props) => {
  const [tab, setTab] = useState("following");
  const {
    isLoading: loading,
    error,
    data,
    refetch,
  } = useQuery([USER, props.user.id], () => fetchFollowData(props.user.id));

  // Refresh the user when this component updates to avoid stale data if the user
  // leaves the dashboard and returns later. It's throttled down to one request
  // at most every 5 seconds to avoid rapid refreshing
  useEffect(() => refreshUser(refetch));

  useEffect(() => {
    subscribeToFollowUpdates((message) => {
      if (
        message.data.followedId === props.user.id ||
        message.data.followerId === props.user.id ||
        _find(data?.user?.followers, (f) => f.user.id === message.data.followerId) ||
        _find(data?.user?.following, { id: message.data.followedId })
      ) {
        refetch();
      }
    }, "FollowingWidget");

    return () => unsubscribeFromFollowUpdates("FollowingWidget");
  });

  if (!props.user) {
    return null;
  }

  if (error) {
    throw error;
  }

  if (loading) {
    return <BusySpinner />;
  }

  let ActiveView = null;
  let title = null;
  switch (tab) {
    case "followers":
      ActiveView = ViewFollowers;
      title = messages.followersTitle;
      break;
    case "following":
    default:
      ActiveView = ViewFollowing;
      title = messages.followingTitle;
      break;
  }

  return (
    <QuickWidget
      {...props}
      className=""
      widgetTitle={<FormattedMessage {...title} />}
      noMain
      rightHeaderControls={
        <div className="mr-flex mr-justify-end mr-items-center mr-links-green-lighter mr-leading-none mr-uppercase mr-text-xs">
          <a
            className="mr-mr-2 mr-pr-2 mr-border-r-2 mr-border-white-10"
            onClick={() => setTab("following")}
          >
            <FormattedMessage {...messages.followingLabel} />
          </a>
          <a onClick={() => setTab("followers")}>
            <FormattedMessage {...messages.followersLabel} />
          </a>
        </div>
      }
    >
      <ActiveView {...props} data={data} />
    </QuickWidget>
  );
};

const refreshUser = _throttle(
  (refetch) => {
    refetch();
  },
  5000,
  { leading: true, trailing: false },
);

registerWidgetType(FollowingWidget, descriptor);
export default FollowingWidget;
