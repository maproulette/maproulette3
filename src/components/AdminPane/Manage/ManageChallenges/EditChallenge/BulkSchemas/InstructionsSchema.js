import messages from '../Messages'

export const jsSchema = (intl) => {
  const instructionsLength = process.env.REACT_APP_CHALLENGE_INSTRUCTIONS_LENGTH || 150
  const schemaFields = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      instruction: {
        title: intl.formatMessage(messages.instructionLabel),
        type: "string",
        minLength: instructionsLength,
        description: intl.formatMessage(messages.instructionsDescription, {details: `${instructionsLength}`})
      },
    },
  }

  return schemaFields
}

export const uiSchema = (intl) => {
  const uiSchemaFields = {
    "ui:order": [ "instruction" ],
    instruction: {
      "ui:field": "markdown",
      "ui:help": intl.formatMessage(messages.instructionDescription),
      "ui:previewNote": intl.formatMessage(messages.addMustachePreviewNote),
    },
  }

  return uiSchemaFields
}
