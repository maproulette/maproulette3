import messages from "../Messages";

export const jsSchema = (
  intl
) => {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      exportableProperties: {
        title: intl.formatMessage(messages.exportablePropertiesLabel),
        type: "string",
      },
    },
  };
};

export const uiSchema = (
  intl
) => {
  return {
    "ui:order": [
      "exportableProperties",
    ],
    exportableProperties: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.exportablePropertiesDescription),
      "ui:collapsed": false,
    },
  };
};
