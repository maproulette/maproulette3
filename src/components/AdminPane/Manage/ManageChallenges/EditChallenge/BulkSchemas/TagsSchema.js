import messages from "../Messages";

const STEP_ID = "Tags";

export const jsSchema = (intl) => {
  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      taskTags: {
        title: intl.formatMessage(messages.preferredTagsLabel),
        type: "string",
      },
    },
  };

  return schemaFields;
};

export const uiSchema = (intl, user, challengeData, extraErrors, options = {}) => {
  const isCollapsed = options.longForm && (options.collapsedGroups || []).indexOf(STEP_ID) !== -1;
  const toggleCollapsed =
    options.longForm && options.toggleCollapsed
      ? () => options.toggleCollapsed(STEP_ID)
      : undefined;

  const uiSchemaFields = {
    "ui:order": ["taskTags"],
    taskTags: {
      "ui:field": "taskTags",
      "ui:help": intl.formatMessage(messages.preferredTagsDescription),
      "ui:collapsed": isCollapsed,
      "ui:toggleCollapsed": toggleCollapsed,
      tagType: "tasks",
    },
  };

  return uiSchemaFields;
};
