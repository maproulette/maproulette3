import messages from '../Messages'

/**
 * Generates a JSON Schema describing property fields of Edit Challenge
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
  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      osmIdProperty: {
        title: intl.formatMessage(messages.osmIdPropertyLabel),
        type: "string",
      },
      customTaskStyles: {
        title: intl.formatMessage(messages.customTaskStyleLabel),
        type: "boolean",
        default: false,
      },
      exportableProperties: {
        title: intl.formatMessage(messages.exportablePropertiesLabel),
        type: "string",
      },
    },
  }
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
export const uiSchema = (intl, user, challengeData, extraErrors, options={}) => ({
  osmIdProperty: {
    "ui:emptyValue": "",
    "ui:help": intl.formatMessage(messages.osmIdPropertyDescription),
    "ui:groupHeader": options.longForm ? intl.formatMessage(messages.propertiesStepHeader) : undefined,
  },
  customTaskStyles: {
    "ui:field": "configureCustomTaskStyles",
    "ui:help": intl.formatMessage(messages.customTaskStylesDescription),
  },
  exportableProperties: {
    "ui:emptyValue": "",
    "ui:help": intl.formatMessage(messages.exportablePropertiesDescription),
  },
})
