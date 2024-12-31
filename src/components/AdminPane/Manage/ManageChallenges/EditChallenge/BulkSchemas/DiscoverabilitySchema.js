import messages from "../Messages";

const STEP_ID = "Discoverability";

export const jsSchema = (intl) => {
  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      additionalKeywords: {
        title: intl.formatMessage(messages.additionalKeywordsLabel),
        type: "string",
      },
    },
  };

  return schemaFields;
};

export const uiSchema = (intl, user, challengeData, extraErrors, options = {}) => {
  const isCollapsed = options.longForm && (options.collapsedGroups || []).indexOf(STEP_ID) !== -1;

  const uiSchemaFields = {
    "ui:order": ["additionalKeywords"],
    additionalKeywords: {
      "ui:field": "tags",
      "ui:help": intl.formatMessage(messages.additionalKeywordsDescription),
      "ui:collapsed": isCollapsed,
    },
  };

  return uiSchemaFields;
};
