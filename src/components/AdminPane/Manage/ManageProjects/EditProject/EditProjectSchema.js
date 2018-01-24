import messages from './Messages'

/**
 * Generates a JSON Schema describing editable Project fields intended for
 * consumption by react-jsonschema-form.
 *
 * @param intl - intl instance from react-intl
 * @param isNewProject - true if editing a brand new project, false otherwise.
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl, isNewProject=false) => {
  const schemaFields = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    type: "object",
    properties: {
      displayName: {
        title: intl.formatMessage(messages.displayNameLabel),
        description: intl.formatMessage(messages.displayNameDescription),
        type: "string",
        minLength: 3,
      },
      enabled: {
        title: intl.formatMessage(messages.enabledLabel),
        description: intl.formatMessage(messages.enabledDescription),
        type: "boolean",
        default: false,
      },
      description: {
        title: intl.formatMessage(messages.descriptionLabel),
        description: intl.formatMessage(messages.descriptionDescription),
        type: "string",
      },
    },
    required: ["displayName"],
  }

  if (isNewProject) {
    // Add name field for new projects. Use Object.assign to push it to the
    // front.
    schemaFields.properties = Object.assign({
      name: {
        title: intl.formatMessage(messages.nameLabel),
        description: intl.formatMessage(messages.nameDescription),
        type: "string",
        minLength: 3,
      }
    }, schemaFields.properties)
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
export const uiSchema = {
  enabled: {
    "ui:widget": "radio",
  },
  description: {
    "ui:widget": "textarea",
  },
}
