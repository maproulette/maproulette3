import React from 'react'
import _map from 'lodash/map'
import _values from 'lodash/values'
import _without from 'lodash/without'
import _filter from 'lodash/filter'
import AsManager from '../../../interactions/User/AsManager'
import { Locale, localeLabels, defaultLocale }
       from '../../../services/User/Locale/Locale'
import { NotificationType, notificationTypeLabels }
       from '../../../services/Notification/NotificationType/NotificationType'
import { SubscriptionType, subscriptionTypeLabels }
       from '../../../services/Notification/NotificationSubscription/NotificationSubscription'
import { Editor, editorLabels } from '../../../services/Editor/Editor'
import { ChallengeBasemap, basemapLayerLabels }
       from '../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { LayerSources } from '../../../services/VisibleLayer/LayerSources'
import MarkdownContent from '../../../components/MarkdownContent/MarkdownContent'
import { needsReviewType } from '../../../services/User/User'
import messages from '../Messages'

/**
 * Generates a JSON Schema describing editable User Settings fields intended
 * for consumption by react-jsonschema-form.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl, user, editor) => {
  const localizedLocaleLabels = localeLabels(intl)
  const localizedEditorLabels = editorLabels(intl)
  const localizedBasemapLabels = basemapLayerLabels(intl)
  const localizedNotificationLabels = notificationTypeLabels(intl)
  const localizedSubscriptionLabels = subscriptionTypeLabels(intl)

  const defaultBasemapChoices = [
    { id: ChallengeBasemap.none.toString(), name: localizedBasemapLabels.none }
  ].concat(_map(_filter(LayerSources, source => !source.overlay),
                source => ({id: source.id, name: source.name}))).concat([
    { id: ChallengeBasemap.custom.toString(), name: localizedBasemapLabels.custom }
  ])

  const schemaFields = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      defaultEditor: {
        title: intl.formatMessage(messages.defaultEditorLabel),
        type: "number",
        enum: _values(Editor),
        enumNames: _map(Editor, (value, key) => localizedEditorLabels[key]),
        default: Editor.none,
      },
      locale: {
        title: intl.formatMessage(messages.localeLabel),
        type: "string",
        enum: _values(Locale),
        enumNames: _map(Locale, value => localizedLocaleLabels[value]),
        default: defaultLocale(),
      },
      defaultBasemap: {
        title: intl.formatMessage(messages.defaultBasemapLabel),
        type: "string",
        enum: _map(defaultBasemapChoices, 'id'),
        enumNames: _map(defaultBasemapChoices, 'name'),
        default: ChallengeBasemap.none.toString(),
      },
      leaderboardOptOut: {
        title: intl.formatMessage(messages.leaderboardOptOutLabel),
        type: "boolean",
        default: false,
      },
      isReviewer: {
        title: intl.formatMessage(messages.isReviewerLabel),
        type: "boolean",
        default: false,
      },
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
    dependencies: { // Only show customBasemap if defaultBasemap set to Custom
      defaultBasemap: {
        oneOf: [
          {
            properties: {
              defaultBasemap: {
                enum: _without(_map(defaultBasemapChoices, 'id'), ChallengeBasemap.custom.toString()),
              }
            }
          },
          {
            properties: {
              defaultBasemap: {
                enum: [ChallengeBasemap.custom.toString()],
              },
              customBasemap: {
                title: intl.formatMessage(messages.customBasemapLabel),
                type: "string",
              },
            },
            required: ['customBasemap']
          }
        ]
      }
    }
  }

  // Show 'needsReview' option if value is not REVIEW_MANDATORY or to superusers
  if (AsManager(editor).isSuperUser()) {
    schemaFields.properties.needsReview = {
      title: intl.formatMessage(messages.needsReviewLabel),
      type: "number",
      enum: [needsReviewType.needed, needsReviewType.notNeeded, needsReviewType.mandatory],
      enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel),
                  intl.formatMessage(messages.mandatoryLabel)],
      default: needsReviewType.notNeeded,
    }
  }
  else if (AsManager(user).isSuperUser() || user.settings.needsReview !== needsReviewType.mandatory) {
    schemaFields.properties.needsReview = {
      title: intl.formatMessage(messages.needsReviewLabel),
      type: "number",
      enum: [needsReviewType.needed, needsReviewType.notNeeded],
      enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      default: needsReviewType.notNeeded,
    }
  }

  return schemaFields
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
export const uiSchema = (intl, user, editor) => {
  const uiSchemaFields = {
    defaultEditor: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.defaultEditorDescription),
    },
    defaultBasemap: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.defaultBasemapDescription),
    },
    customBasemap: {
      "ui:emptyValue": "",
      "ui:help": <MarkdownContent markdown={intl.formatMessage(messages.customBasemapDescription, {dummy: ''})} />,
    },
    locale: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.localeDescription),
    },
    leaderboardOptOut: {
      "ui:widget": "radio",
      "ui:help": <MarkdownContent markdown={intl.formatMessage(messages.leaderboardOptOutDescription)} />,
    },
    email: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.emailDescription),
    },
    notificationSubscriptions: {
      "ui:help": intl.formatMessage(messages.notificationSubscriptionsDescription),
    },
    needsReview: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.needsReviewDescription),
    },
    isReviewer: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.isReviewerDescription),
    },
    "ui:order": [
      "defaultEditor", "locale", "defaultBasemap", "leaderboardOptOut", "customBasemap", "isReviewer",
    ],
  }

  // Show 'needsReview' option if value is not REVIEW_MANDATORY or to superusers
  if (AsManager(editor).isSuperUser() || AsManager(user).isSuperUser() ||
      user.settings.needsReview !== needsReviewType.mandatory) {
    uiSchemaFields["ui:order"].push("needsReview")
    uiSchemaFields["ui:order"].push("notificationSubscriptions")
    uiSchemaFields["ui:order"].push("email")
  }
  else {
    uiSchemaFields["ui:order"].push("email")
    uiSchemaFields["ui:order"].push("notificationSubscriptions")
  }

  return uiSchemaFields
}
