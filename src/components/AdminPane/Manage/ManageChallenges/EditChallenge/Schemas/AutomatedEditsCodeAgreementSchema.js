import messages from "../Messages";

/**
 * Generates a JSON Schema describing fields of Automated Edits Policy Agreement
 * workflow step for use with react-jsonschema-form
 */

export const jsSchema = (intl) => {
  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      automatedEditsCodeAgreement: {
        title: intl.formatMessage(messages.automatedEditsCodeLabel),
        type: "boolean",
        default: false,
        enum: [true],
        agreementDescription: intl.formatMessage(messages.automatedEditsCodeDescription),
        checkboxLabel: messages.automatedEditsCodeUICheckboxLabel,
      },
    },
    required: ["automatedEditsCodeAgreement"],
  };

  return schemaFields;
};

export const uiSchema = (intl, user, challengeData, extraErrors, options = {}) => {
  const uiSchemaFields = {
    automatedEditsCodeAgreement: {
      "ui:widget": "automatedEditsCheckbox",
      "ui:help": intl.formatMessage(messages.automatedEditsCodeDescription),
      "ui:groupHeader": options.longForm
        ? intl.formatMessage(messages.automatedEditsCodeStepHeader)
        : undefined,
      "ui:displayLabel": false,
    },
  };

  return uiSchemaFields;
};
