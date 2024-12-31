import _values from "lodash/values";
import { ChallengeDifficulty } from "../../../../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty";
import messages from "../Messages";

/**
 * Generates a JSON Schema describing instruction fields of Edit Challenge
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

const validateMinLength = (val) => {
  if (!val) {
    // Handle undefined. null and empty string case and default to 150:
    if (typeof val === "string" && val.length === 0) return 0;
    if (val === 0) return 0;
    return 150;
  }
  // Handle 0 separately. Non-strict equals will be true for '0' string value:
  if (val == 0) return 0;

  // Bitwise operator coerces to number value:
  return val | 0;
};

export const jsSchema = (intl) => {
  const minLengthEnvValue = window.env.REACT_APP_CHALLENGE_INSTRUCTIONS_MIN_LENGTH;
  const instructionsMinLength = validateMinLength(minLengthEnvValue);

  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      instruction: {
        title: intl.formatMessage(messages.instructionLabel),
        type: "string",
        minLength: instructionsMinLength,
        description: intl.formatMessage(messages.instructionsDescription, {
          minLength: `${instructionsMinLength}`,
        }),
      },
      difficulty: {
        title: intl.formatMessage(messages.difficultyLabel),
        type: "number",
        enum: _values(ChallengeDifficulty),
        enumNames: [
          "Easy: a novice can do them",
          "Normal: a little experience helps",
          "Expert: experienced mappers only",
        ],
        default: ChallengeDifficulty.normal,
      },
    },
    required: ["instruction"],
  };

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
    "ui:order": ["instruction", "difficulty"],
    instruction: {
      "ui:field": "markdown",
      "ui:help": intl.formatMessage(messages.instructionDescription),
      "ui:previewNote": intl.formatMessage(messages.addMustachePreviewNote),
      "ui:groupHeader": options.longForm
        ? intl.formatMessage(messages.instructionsStepHeader)
        : undefined,
    },
    difficulty: {
      "ui:field": "columnRadio",
      "ui:help": intl.formatMessage(messages.difficultyDescription),
    },
  };

  return uiSchemaFields;
};
