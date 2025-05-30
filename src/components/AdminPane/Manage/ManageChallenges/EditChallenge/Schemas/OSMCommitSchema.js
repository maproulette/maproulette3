import AsEditableChallenge from "../../../../../../interactions/Challenge/AsEditableChallenge";
import messages from "../Messages";

/**
 * Generates a JSON Schema describing OSM commit fields of Edit Challenge
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
export const jsSchema = (intl, user, challengeData) => {
  const properties = {
    checkinComment: {
      title: intl.formatMessage(messages.checkinCommentLabel),
      type: "string",
    },
    checkinSource: {
      title: intl.formatMessage(messages.checkinSourceLabel),
      type: "string",
    },
  };

  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties,
    required: ["checkinComment"],
  };

  // For new challenges, offer option to toggle #maproulette tag on commit comment.
  // The hashtag will be injected into the comment when the challenge is created, so
  // when editing challenges the user would just modify the commit comment if they
  // wish to add/remove the hashtag.
  if (AsEditableChallenge(challengeData).isNew()) {
    schemaFields.properties.includeCheckinHashtag = {
      title: " ", // blank title
      type: "boolean",
      enum: [true, false],
      enumNames: [
        intl.formatMessage(messages.includeCheckinHashtagTrueLabel),
        intl.formatMessage(messages.includeCheckinHashtagFalseLabel),
      ],
      default:
        challengeData.checkinComment === undefined || challengeData.includeCheckinHashtag
          ? true
          : false,
    };
  }

  return schemaFields;
};

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
export const uiSchema = (intl, user, challengeData, extraErrors, options = {}) => {
  const uiSchemaFields = {
    "ui:order": ["checkinComment", "includeCheckinHashtag", "checkinSource"],
    checkinComment: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.checkinCommentDescription),
      "ui:groupHeader": options.longForm
        ? intl.formatMessage(messages.osmCommitStepHeader)
        : undefined,
    },
    checkinSource: {
      "ui:help": intl.formatMessage(messages.checkinSourceDescription),
    },
    includeCheckinHashtag: {
      "ui:field": "columnRadio",
      "ui:help": intl.formatMessage(messages.includeCheckinHashtagDescription),
    },
  };

  return uiSchemaFields;
};
