import messages from '../Messages'

const STEP_ID = "Tags"

/**
 * Generates a JSON Schema describing MR tag fields of Edit Challenge
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
  const schemaFields = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      taskTags: {
        title: intl.formatMessage(messages.preferredTagsLabel),
        type: "string",
      },
      limitTags: {
        type: "boolean",
        default: false,
      },
      reviewTaskTags: {
        title: intl.formatMessage(messages.preferredReviewTagsLabel),
        type: "string",
      },
      limitReviewTags: {
        type: "boolean",
        default: false,
      },
    },
  }

  return schemaFields
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
export const uiSchema = (intl, user, challengeData, extraErrors, options={}) => {
  const isCollapsed = (options.collapsedGroups || []).indexOf(STEP_ID) !== -1
  const toggleCollapsed = options.toggleCollapsed ? () => options.toggleCollapsed(STEP_ID) : undefined

  const uiSchemaFields = {
    taskTags: {
      "ui:field": "taskTags",
      "ui:help": intl.formatMessage(messages.preferredTagsDescription),
      "ui:collapsed": isCollapsed,
      "ui:toggleCollapsed": toggleCollapsed,
      "ui:groupHeader": options.longForm ? intl.formatMessage(messages.tagsStepHeader) : undefined,
      "tagType": "tasks",
    },
    limitTags: {
      "ui:field": "limitTags",
      "ui:help": intl.formatMessage(messages.limitTagsDescription),
      "ui:collapsed": isCollapsed,
    },
    reviewTaskTags: {
      "ui:field": "taskTags",
      "ui:help": intl.formatMessage(messages.preferredReviewTagsDescription),
      "tagType": "review",
      "ui:collapsed": isCollapsed,
    },
    limitReviewTags: {
      "ui:field": "limitTags",
      "ui:help": intl.formatMessage(messages.limitReviewTagsDescription),
      "ui:collapsed": isCollapsed,
    },
  }

  return uiSchemaFields
}
