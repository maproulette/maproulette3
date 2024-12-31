import messages from "../Messages";

export const jsSchema = (intl) => {
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      dataOriginDate: {
        title: intl.formatMessage(messages.dataOriginDateLabel),
        type: "string",
        format: "date",
      },
    },
  };

  return schema;
};

export const uiSchema = (intl) => {
  return {
    dataOriginDate: {
      "ui:help": intl.formatMessage(messages.dataOriginDateDescription),
    },
    "ui:order": ["dataOriginDate"],
  };
};
