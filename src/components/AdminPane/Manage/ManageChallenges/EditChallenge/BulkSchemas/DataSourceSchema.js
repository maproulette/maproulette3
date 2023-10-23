import _isEmpty from "lodash/isEmpty";
import _omit from "lodash/omit";
import messages from "../Messages";

export const jsSchema = (
  intl,
  user,
  challengeData,
  extraErrors,
) => {
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

export const uiSchema = (
  intl,
  user,
  challengeData,
  extraErrors,
  options = {}
) => {
  return {
    dataOriginDate: {
      "ui:help": intl.formatMessage(messages.dataOriginDateDescription),
    },
    "ui:order": [
      "dataOriginDate",
    ],
  };
};
