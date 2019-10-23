import _map from 'lodash/map'
import _keys from 'lodash/keys'
import _values from 'lodash/values'
import AsManager from '../../../../../interactions/User/AsManager'
import { ChallengeDifficulty,
         difficultyLabels }
       from '../../../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import { ChallengeCategoryKeywords,
         keywordLabels }
       from '../../../../../services/Challenge/ChallengeKeywords/ChallengeKeywords'
import AsEditableChallenge
       from '../../../../../interactions/Challenge/AsEditableChallenge'
import messages from './Messages'

/**
 * Generates a JSON Schema describing Step 1 (general info) of Edit Challenge
 * workflow intended for consumption by react-jsonschema-form.
 *
 * > Note that react-jsonschema-form only presents values for checkbox fields
 * > if they are checked, so it's best to specify radio buttons in the uiSchema
 * > for boolean fields if additional post-processing is to be avoided.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl, user, challengeData) => {
  const localizedDifficultyLabels = difficultyLabels(intl)
  const localizedKeywordLabels = keywordLabels(intl)

  const schemaFields = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    title: intl.formatMessage(messages.step1Label),
    type: "object",
    properties: {
      enabled: {
        title: intl.formatMessage(messages.visibleLabel),
        type: "boolean",
        default: false,
      },
      name: {
        title: intl.formatMessage(messages.nameLabel),
        type: "string",
        minLength: 3,
      },
      description: {
        title: intl.formatMessage(messages.descriptionLabel),
        type: "string",
      },
      blurb: {
        title: intl.formatMessage(messages.blurbLabel),
        type: "string",
      },
      instruction: {
        title: intl.formatMessage(messages.instructionLabel),
        type: "string",
      },
      checkinComment: {
        title: intl.formatMessage(messages.checkinCommentLabel),
        type: "string",
      },
      checkinSource: {
        title: intl.formatMessage(messages.checkinSourceLabel),
        type: "string",
      },
      difficulty: {
        title: intl.formatMessage(messages.difficultyLabel),
        type: "number",
        enum: _values(ChallengeDifficulty),
        enumNames: _map(ChallengeDifficulty, (value, key) => localizedDifficultyLabels[key]),
        default: ChallengeDifficulty.normal,
      },
      category: {
        title: intl.formatMessage(messages.categoryLabel),
        type: "string",
        enum: _keys(ChallengeCategoryKeywords),
        enumNames: _map(ChallengeCategoryKeywords, (value, key) => localizedKeywordLabels[key]),
        default: "other",
      },
      additionalKeywords: {
        title: intl.formatMessage(messages.additionalKeywordsLabel),
        type: "string",
      }
    },
    required: ["name", "instruction"],
  }

  // Only show Featured option to superusers
  if (AsManager(user).isSuperUser()) {
    schemaFields.properties.featured = {
      title: intl.formatMessage(messages.featuredLabel),
      type: "boolean",
      default: false,
    }
  }

  // For new challenges, offer option to toggle #maproulette tag on commit comment.
  // The hashtag will be injected into the comment when the challenge is created, so
  // when editing challenges the user would just modify the commit comment if they
  // wish to add/remove the hashtag.
  if (AsEditableChallenge(challengeData).isNew()) {
    schemaFields.properties.includeCheckinHashtag = {
      title: " ", // blank title
      type: "boolean",
      enum: [true, false],
      enumNames: [intl.formatMessage(messages.includeCheckinHashtagTrueLabel),
                  intl.formatMessage(messages.includeCheckinHashtagFalseLabel)],
      default: true,
    }
  }

  return schemaFields
}

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields.
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type in
 * > the form configuration will help the Bulma/RJSFFormFieldAdapter generate the
 * > proper Bulma-compliant markup.
 */
export const uiSchema = (intl, user, challengeData) => {
  const uiSchemaFields = {
    "ui:order": [
      "featured", "enabled", "name", "description", "blurb", "instruction",
      "checkinComment", "includeCheckinHashtag", "checkinSource",
      "difficulty", "category", "additionalKeywords",
    ],
    featured: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.featuredDescription),
    },
    enabled: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.visibleDescription),
    },
    name: {
      "ui:help": intl.formatMessage(messages.nameDescription),
    },
    description: {
      "ui:field": "markdown",
      "ui:help": intl.formatMessage(messages.descriptionDescription),
      "ui:lightMode": true,
    },
    blurb: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.blurbDescription),
    },
    instruction: {
      "ui:field": "markdown",
      "ui:help": intl.formatMessage(messages.instructionDescription, {dummy: ''}),
      "ui:lightMode": true,
    },
    difficulty: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.difficultyDescription),
    },
    category: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.categoryDescription),
    },
    additionalKeywords: {
      "ui:field": "tags",
      "ui:help": intl.formatMessage(messages.additionalKeywordsDescription),
    },
    checkinComment: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.checkinCommentDescription),
    },
    checkinSource: {
      "ui:help": intl.formatMessage(messages.checkinSourceDescription),
    },
    includeCheckinHashtag: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.includeCheckinHashtagDescription),
    },
  }

  return uiSchemaFields
}
