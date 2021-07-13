import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with OwnerContactLink
 */
export default defineMessages({
  contactOwnerLabel: {
    id: 'Task.controls.contactOwner.label',
    defaultMessage: 'Contact Challenge Owner',
  },

  contactLinkLabel: {
    id: 'Task.controls.contactLink.label',
    defaultMessage: 'Message {owner} through OSM',
  },

  noOwnerFound: {
    id: 'Task.controls.noOwnerFound.label',
    defaultMessage: 'Challenge Owner could not be found',
  },

  joinChallengeDiscussionLabel: {
    id: 'Task.controls.joinChallengeDiscussion.label',
    defaultMessage: 'Join Challenge Discussion',
  }
})
