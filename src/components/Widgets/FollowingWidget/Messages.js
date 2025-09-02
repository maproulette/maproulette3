import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with FollowingWidget
 */
export default defineMessages({
  title: {
    id: "Notification.type.follow",
    defaultMessage: "Follow",
  },

  followingTitle: {
    id: "Following.ViewFollowing.header",
    defaultMessage: "You are Following",
  },

  followersTitle: {
    id: "Followers.ViewFollowers.header",
    defaultMessage: "Your Followers",
  },

  activityTitle: {
    id: "Widgets.FollowingWidget.header.activity",
    defaultMessage: "Activity You're Following",
  },

  followingLabel: {
    id: "Followers.ViewFollowers.indicator.following",
    defaultMessage: "Following",
  },

  followersLabel: {
    id: "Widgets.FollowersWidget.controls.followers.label",
    defaultMessage: "Followers",
  },

  activityLabel: {
    id: "Widgets.FollowersWidget.controls.activity.label",
    defaultMessage: "Activity",
  },

  toggleExactDatesLabel: {
    id: "Widgets.ActivityListingWidget.controls.toggleExactDates.label",
    defaultMessage: "Show Exact Dates",
  },
});
