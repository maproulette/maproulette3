import React from 'react'
import _map from 'lodash/map'
import _values from 'lodash/values'
import { NotificationType, notificationTypeLabels }
       from '../../../services/Notification/NotificationType/NotificationType'
import { SubscriptionType, subscriptionTypeLabels }
       from '../../../services/Notification/NotificationSubscription/NotificationSubscription'
import MarkdownContent from '../../../components/MarkdownContent/MarkdownContent'
import messages from '../Messages'

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
  const localizedNotificationLabels = notificationTypeLabels(intl)
  const localizedSubscriptionLabels = subscriptionTypeLabels(intl)

  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      notificationSubscriptions: {
        title: intl.formatMessage(messages.notificationSubscriptionsLabel),
        type: "array",
        items: _map(NotificationType, (type, name) => ({
          title: `${localizedNotificationLabels[`${name}Long`] || localizedNotificationLabels[name]} ${intl.formatMessage(messages.notificationLabel)}`,
          type: "number",
          enum: _values(SubscriptionType),
          enumNames: _map(SubscriptionType, (value, key) => localizedSubscriptionLabels[key]),
          default: SubscriptionType.noEmail,
        })),
      },
      email: {
        title: intl.formatMessage(messages.emailLabel),
        type: "string",
        format: "email",
      },
    },
  }
}

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields.
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type in
 * > the form configuration will help the Bulma/RJSFFormFieldAdapter generate the
 * > proper Bulma-compliant markup.
 */
export const uiSchema = (intl) => {
  return {
    email: {
      "ui:emptyValue": "",
      "ui:help": <MarkdownContent markdown={intl.formatMessage(messages.emailDescription)} />,
    },
    notificationSubscriptions: {
      classNames: "no-legend",
    },
    "ui:order": [
      "email", "notificationSubscriptions",
    ],
    "ui:showTitle": false,
  }
}
