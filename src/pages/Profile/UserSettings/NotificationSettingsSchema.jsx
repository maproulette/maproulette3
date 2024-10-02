import _map from "lodash/map";
import _values from "lodash/values";
import {
  NotificationSubscriptionType,
  NotificationCountType,
  notificationTypeLabels,
  notificationCountTypeLabels,
  NOTIFICATION_TYPE_REVISION_COUNT,
} from "../../../services/Notification/NotificationType/NotificationType";
import {
  SubscriptionType,
  SubscriptionFrequencyType,
  subscriptionTypeLabels,
  subscriptionFrequencyTypeLabels,
} from "../../../services/Notification/NotificationSubscription/NotificationSubscription";
import MarkdownContent from "../../../components/MarkdownContent/MarkdownContent";
import messages from "../Messages";
import { CustomNotificationFieldTemplate } from '../../../components/Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter';

const createSubscriptionInput = (
  name,
  notificationLabels,
  subscriptionTypes,
  subscriptionLabels,
  intl,
  defaultSelection,
) => {
  return {
      name: name,
        title: `${
          notificationLabels[`${name}Long`] || notificationLabels[name]
        } ${intl.formatMessage(messages.notificationLabel)}`,
        type: "number",
        enum: _values(subscriptionTypes),
        enumNames: _map(subscriptionTypes, (value, key) => subscriptionLabels[key]),
        default: defaultSelection,
      
    }
  }
export const transformErrors = (intl) => (errors) => {
  return errors.map(error => {
    if (error.name === "format") {
      const formatMessage = intl.formatMessage(messages.errorFormatMessage)

      if (error.params?.format === "email") {
        const emailMessage = intl.formatMessage(messages.errorFormatEmail)
        error.message = `${formatMessage} "${emailMessage}"`;
      }
    }
    return error;
  });
}

/**
 * Generates a JSON Schema describing editable Notification Settings fields
 * intended for consumption by react-jsonschema-form.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl) => {
  const localizedNotificationLabels = notificationTypeLabels(intl);
  const localizedNotificationCountLabels = notificationCountTypeLabels(intl);
  const localizedSubscriptionLabels = subscriptionTypeLabels(intl);
  const localizedSubscriptionFrequencyLabels =
    subscriptionFrequencyTypeLabels(intl);

  const items = new Array(NOTIFICATION_TYPE_REVISION_COUNT).fill({});

  _map(NotificationSubscriptionType, (type, name) => {
    items[type] = createSubscriptionInput(
      name,
      localizedNotificationLabels,
      SubscriptionType,
      localizedSubscriptionLabels,
      intl,
      SubscriptionType.noEmail,
    );
  });

  _map(NotificationCountType, (type, name) => {
    items[type] = createSubscriptionInput(
      name,
      localizedNotificationCountLabels,
      SubscriptionFrequencyType,
      localizedSubscriptionFrequencyLabels,
      intl,
      SubscriptionFrequencyType.ignore,
    );
  });

  // items are generated as array from all subscription and count types 
  const notificationObject = {}
  items.filter(item => Boolean(item.name)).forEach((item) => {
    notificationObject[item.name] = item
  })

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      notificationSubscriptions: {
        title: intl.formatMessage(messages.notificationSubscriptionsLabel),
        type: "object",
        properties: {
          system: notificationObject.system,
          mention: notificationObject.mention,
          reviewApproved: notificationObject.reviewApproved,
          reviewRejected: notificationObject.reviewRejected,
          reviewAgain: notificationObject.reviewAgain,
          challengeCompleted: notificationObject.challengeCompleted,
          team: notificationObject.team,
          follow: notificationObject.follow,
          metaReview: notificationObject.metaReview,
          reviewCount: notificationObject.reviewCount,
          revisionCount: notificationObject.revisionCount,
        }
      },

      email: {
        title: intl.formatMessage(messages.emailLabel),
        type: "string",
        format: "email",
      },
    },
  };
};

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields.
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type in
 * > the form configuration will help the RJSFFormFieldAdapter generate the
 * > proper markup.
 */
export const uiSchema = (intl) => {
 
  return {
    email: {
      classNames: "notification-email",
      "ui:emptyValue": "",
      "ui:help": (
        <MarkdownContent
          markdown={intl.formatMessage(messages.emailDescription)}
        />
      ),
    },
    
    notificationSubscriptions: {
      classNames: "no-legend notification-subscriptions",
      system: {
        "ui:help": intl.formatMessage(messages.systemNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      mention: {
        "ui:help": intl.formatMessage(messages.mentionNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      reviewApproved: {
         "ui:help": intl.formatMessage(messages.reviewApprovedNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      reviewRejected: {
        "ui:help": intl.formatMessage(messages.reviewRejectedNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      reviewAgain: {
        "ui:help": intl.formatMessage(messages.reviewAgainNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      challengeCompleted: {
        "ui:help": intl.formatMessage(messages.challengeCompletedNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      team: {
        "ui:help": intl.formatMessage(messages.teamNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      follow: {
        "ui:help": intl.formatMessage(messages.followNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      metaReview: {
        "ui:help": intl.formatMessage(messages.metaReviewNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      reviewCount: {
        "ui:help": intl.formatMessage(messages.reviewCountNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
      revisionCount: {
        "ui:help": intl.formatMessage(messages.revisionCountNotificationsDescription),
        "ui:FieldTemplate": CustomNotificationFieldTemplate,
      },
    },
          
    "ui:options": {
      orderable: false,
      removable: false,
    },
    "ui:order": ["email", "notificationSubscriptions"],
    "ui:showTitle": false,
  };
};


