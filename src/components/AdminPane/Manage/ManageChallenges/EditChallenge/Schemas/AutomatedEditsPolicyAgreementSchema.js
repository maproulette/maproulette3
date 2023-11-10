import messages from '../Messages'

/**
 * Generates a JSON Schema describing fields of Automated Edits Policy Agreement 
 * workflow step for use with react-jsonschema-form
 */

export const jsSchema = (intl) => {
  const schemaFields = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      policyAgreement: {
        title: intl.formatMessage(messages.automatedEditsPolicyAgreementLabel),
        type: "boolean",
        default: false,
        enum: [true, false]
        // description: intl.formatMessage(messages.automatedEditsPolicyAgreementDescription),
      }
    },
    required: ["policyAgreement"]
  }

  return schemaFields
}

export const uiSchema = (intl) => {
  const uiSchemaFields = {
    policyAgreement: {
      "ui:field": "checkbox",
      "ui:help": intl.formatMessage(messages.automatedEditsPolicyAgreementDescription)
    }
  }

  return uiSchemaFields
}