import React from "react";
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
import { CustomFieldTemplate } from '../../../components/Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter';

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
  };
};

export const transformErrors = (intl) => (errors) => {
  console.log('errors', errors)
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


  const notificationObject = {}
  items.forEach((item, i) => {
    notificationObject[i] = item
  })

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      // notificationSubscriptions: {
      //   title: intl.formatMessage(messages.notificationSubscriptionsLabel),
      //   type: "array",
      //   items: items,
      // },
      notificationSubscriptions: {
        title: intl.formatMessage(messages.notificationSubscriptionsLabel),
        properties: notificationObject,
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
        0: {
          "ui:help": intl.formatMessage(messages.systemNotificationsDescription),
          "ui:FieldTemplate": CustomFieldTemplate,
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


