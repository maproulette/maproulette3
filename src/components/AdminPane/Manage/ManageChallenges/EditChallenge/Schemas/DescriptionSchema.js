import _keys from "lodash/keys";
import _map from "lodash/map";
import {
  ChallengeCategoryKeywords,
  keywordLabels,
} from "../../../../../../services/Challenge/ChallengeKeywords/ChallengeKeywords";
import messages from "../Messages";

/**
 * Generates a JSON Schema describing description fields of Edit Challenge
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
export const jsSchema = (intl) => {
  const localizedKeywordLabels = keywordLabels(intl);

  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      description: {
        title: intl.formatMessage(messages.descriptionLabel),
        type: "string",
      },
      category: {
        title: intl.formatMessage(messages.categoryLabel),
        type: "string",
        enum: _keys(ChallengeCategoryKeywords),
        enumNames: _map(ChallengeCategoryKeywords, (value, key) => localizedKeywordLabels[key]),
        default: "other",
      },
    },
    required: ["description"],
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
    "ui:order": ["description", "category"],
    description: {
      "ui:field": "markdown",
      "ui:help": intl.formatMessage(messages.descriptionDescription),
      "ui:lightMode": true,
      "ui:groupHeader": options.longForm
        ? intl.formatMessage(messages.descriptionStepHeader)
        : undefined,
    },
    category: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.categoryDescription),
    },
  };

  return uiSchemaFields;
};
