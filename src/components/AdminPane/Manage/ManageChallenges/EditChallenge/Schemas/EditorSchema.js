import idPresets from "@openstreetmap/id-tagging-schema/dist/preset_categories.json";
import _fromPairs from "lodash/fromPairs";
import _intersection from "lodash/intersection";
import _map from "lodash/map";
import _startCase from "lodash/startCase";
import _values from "lodash/values";
import AsEditableChallenge from "../../../../../../interactions/Challenge/AsEditableChallenge";
import { ChallengeReviewSetting } from "../../../../../../services/Challenge/ChallengeReviewSetting/ChallengeReviewSetting";
import { DropzoneTextUpload } from "../../../../../Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter";
import messages from "../Messages";

const STEP_ID = "Editor";

/**
 * Generates a JSON Schema describing editor-setting fields of Edit Challenge
 * workflow intended for consumption by react-jsonschema-form
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl) => {
  const presetSchemas = _fromPairs(
    _map(idPresets, (presetCategory, categoryName) => {
      return [
        categoryName,
        {
          type: "array",
          title: " ",
          items: {
            type: "string",
            enum: presetCategory.members,
          },
          uniqueItems: true,
        },
      ];
    }),
  );

  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    properties: {
      reviewSetting: {
        title: intl.formatMessage(messages.reviewSettingLabel),
        type: "number",
        enum: _values(ChallengeReviewSetting),
        enumNames: [
          intl.formatMessage(messages.reviewSettingRequested),
          intl.formatMessage(messages.reviewSettingNotRequired),
        ],
        default: ChallengeReviewSetting.notRequired,
      },
      requireConfirmation: {
        title: intl.formatMessage(messages.requireConfirmationLabel),
        type: "boolean",
        enum: [true, false],
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
        default: false,
      },
      requireRejectReason: {
        title: intl.formatMessage(messages.requireRejectReasonLabel),
        type: "boolean",
        enum: [true, false],
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
        default: false,
      },
      presets: {
        title: intl.formatMessage(messages.presetsLabel),
        type: "boolean",
        enum: [true, false],
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
        default: false,
      },
      taskWidgetLayout: {
        title: "Layout File",
        type: "string",
        description: intl.formatMessage(messages.taskWidgetLayoutReadOnly),
      },
    },
    dependencies: {
      presets: {
        oneOf: [
          {
            properties: {
              presets: {
                enum: [false],
              },
            },
          },
          {
            properties: Object.assign(
              {},
              {
                presets: {
                  enum: [true],
                },
              },
              presetSchemas,
            ),
          },
        ],
      },
    },
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
  const isGroupCollapsed =
    options.longForm && (options.collapsedGroups || []).indexOf(STEP_ID) === -1;
  const toggleGroupCollapsed =
    options.longForm && options.toggleCollapsed
      ? () => options.toggleCollapsed(STEP_ID)
      : undefined;
  const sourceReadOnly = AsEditableChallenge(challengeData).isSourceReadOnly();

  const presetUiSchemas = _fromPairs(
    _map(idPresets, (presetCategory, categoryName) => {
      // We normally render each preset category as collapsed by default, but
      // want to show it expanded if there are selected presets in the category
      // (until the user gets involved and toggles it)
      const showCollapsed =
        options.expandedFieldGroups[categoryName] === undefined
          ? // no user interaction
            _intersection(presetCategory.members, challengeData[categoryName]).length === 0
          : !options.expandedFieldGroups[categoryName];

      return [
        categoryName,
        {
          "ui:widget": "checkboxes",
          "ui:collapsed": showCollapsed,
          "ui:fieldGroupHeader": _startCase(categoryName),
          "ui:toggleCollapsed": () => options.setFieldGroupExpanded(categoryName, showCollapsed),
        },
      ];
    }),
  );

  const uiSchemaFields = Object.assign(
    {},
    {
      reviewSetting: {
        "ui:groupHeader": options.longForm
          ? intl.formatMessage(messages.editorStepHeader)
          : undefined,
        "ui:help": intl.formatMessage(messages.reviewSettingDescription),
        "ui:collapsed": isGroupCollapsed,
        "ui:toggleCollapsed": toggleGroupCollapsed,
        "ui:widget": "radio",
      },
      presets: {
        "ui:collapsed": isGroupCollapsed,
        "ui:toggleCollapsed": toggleGroupCollapsed,
        "ui:widget": "radio",
        "ui:help": intl.formatMessage(messages.presetsDescription),
      },
      requireConfirmation: {
        "ui:widget": "radio",
        "ui:help": intl.formatMessage(messages.requireConfirmationDescription),
        "ui:collapsed": isGroupCollapsed,
        "ui:toggleCollapsed": toggleGroupCollapsed,
        "ui:widget": "radio",
      },
      requireRejectReason: {
        "ui:widget": "radio",
        "ui:help": intl.formatMessage(messages.requireRejectReasonDescription),
        "ui:collapsed": isGroupCollapsed,
        "ui:toggleCollapsed": toggleGroupCollapsed,
        "ui:widget": "radio",
      },
      taskWidgetLayout: {
        "ui:widget": DropzoneTextUpload,
        "ui:readonly": sourceReadOnly,
        "ui:collapsed": isGroupCollapsed,
      },
      presetUiSchemas,
    },
  );

  return uiSchemaFields;
};
