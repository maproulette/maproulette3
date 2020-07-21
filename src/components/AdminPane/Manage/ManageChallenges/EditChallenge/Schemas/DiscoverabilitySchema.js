import AsManager from '../../../../../../interactions/User/AsManager'
import messages from '../Messages'

/**
 * Generates a JSON Schema describing discoverability fields of Edit Challenge
 * workflow intended for consumption by react-jsonschema-form
 *
 * > Note that react-jsonschema-form only presents values for checkbox fields
 * > if they are checked, so it's best to specify radio buttons in the uiSchema
 * > for boolean fields if additional post-processing is to be avoided
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl, user, challengeData, extraErrors, options={}) => {
  const schemaFields = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      enabled: {
        title: intl.formatMessage(messages.visibleLabel),
        type: "boolean",
        default: true,
      },
      additionalKeywords: {
        title: intl.formatMessage(messages.additionalKeywordsLabel),
        type: "string",
      },
      requiresLocal: {
        title: intl.formatMessage(messages.requiresLocalLabel),
        type: "boolean",
        default: false,
      },
    },
  }

  // Only show Featured option to superusers
  if (AsManager(user).isSuperUser()) {
    schemaFields.properties.featured = {
      title: intl.formatMessage(messages.featuredLabel),
      type: "boolean",
      default: false,
    }
  }

  return schemaFields
}

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type in
 * > the form configuration will help the RJSFFormFieldAdapter generate the
 * > proper markup
 */
export const uiSchema = (intl, user, challengeData, extraErrors, options={}) => {
  const uiSchemaFields = {
    "ui:order": [
      "featured", "enabled", "additionalKeywords", "requiresLocal",
    ],
    featured: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.featuredDescription),
      "ui:groupHeader": options.longForm ? intl.formatMessage(messages.discoverabilityStepHeader) : undefined,
    },
    enabled: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.visibleDescription),
    },
    additionalKeywords: {
      "ui:field": "tags",
      "ui:help": intl.formatMessage(messages.additionalKeywordsDescription),
    },
    requiresLocal: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.requiresLocalDescription),
    }
  }

  return uiSchemaFields
}
