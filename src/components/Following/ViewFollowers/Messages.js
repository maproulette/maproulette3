import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ViewFollowers
 */
export default defineMessages({
  header: {
    id: "Followers.ViewFollowers.header",
    defaultMessage: "Your Followers",
  },

  followingIndicator: {
    id: "Followers.ViewFollowers.indicator.following",
    defaultMessage: "Following",
  },

  blockedHeader: {
    id: "Followers.ViewFollowers.blockedHeader",
    defaultMessage: "Blocked Followers",
  },

  followBackLabel: {
    id: "Followers.controls.followBack.label",
    defaultMessage: "Follow back",
  },

  blockFollowerLabel: {
    id: "Followers.controls.block.label",
    defaultMessage: "Block",
  },

  unblockFollowerLabel: {
    id: "Followers.controls.unblock.label",
    defaultMessage: "Unblock",
  },

  noFollowers: {
    id: "Followers.ViewFollowers.noFollowers",
    defaultMessage: "Nobody is following you",
  },

  followersNotAllowed: {
    id: "Followers.ViewFollowers.followersNotAllowed",
    defaultMessage: "You are not allowing followers (this can be changed in your user settings)",
  },

  noBlockedFollowers: {
    id: "Followers.ViewFollowers.noBlockedFollowers",
    defaultMessage: "You have not blocked any followers",
  },
});
