import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with FollowingWidget
 */
export default defineMessages({
  title: {
    id: "Widgets.FollowingWidget.label",
    defaultMessage: "Follow",
  },

  followingTitle: {
    id: "Widgets.FollowingWidget.header.following",
    defaultMessage: "You are Following",
  },

  followersTitle: {
    id: "Widgets.FollowingWidget.header.followers",
    defaultMessage: "Your Followers",
  },

  activityTitle: {
    id: "Widgets.FollowingWidget.header.activity",
    defaultMessage: "Activity You're Following",
  },

  followingLabel: {
    id: "Widgets.FollowingWidget.controls.following.label",
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
    id: "Widgets.FollowersWidget.controls.toggleExactDates.label",
    defaultMessage: "Show Exact Dates",
  },
});
