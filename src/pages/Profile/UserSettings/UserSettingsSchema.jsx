import _filter from "lodash/filter";
import _map from "lodash/map";
import _values from "lodash/values";
import MarkdownContent from "../../../components/MarkdownContent/MarkdownContent";
import AsManager from "../../../interactions/User/AsManager";
import {
  ChallengeBasemap,
  basemapLayerLabels,
} from "../../../services/Challenge/ChallengeBasemap/ChallengeBasemap";
import { Editor, editorLabels } from "../../../services/Editor/Editor";
import {
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  defaultLocale,
} from "../../../services/User/Locale/Locale";
import { needsReviewType } from "../../../services/User/User";
import { LayerSources } from "../../../services/VisibleLayer/LayerSources";
import messages from "../Messages";

/**
 * Generates a JSON Schema describing editable User Settings fields intended
 * for consumption by react-jsonschema-form.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl, user, editor) => {
  const localizedEditorLabels = editorLabels(intl);
  const localizedBasemapLabels = basemapLayerLabels(intl);

  const customBasemaps = _filter(
    _map(user.settings.customBasemaps, (basemap) => ({
      id: basemap.name,
      name: basemap.name,
      overlay: basemap.overlay,
    })),
    (basemap) => !basemap.overlay,
  );

  const defaultBasemapChoices = [
    { id: ChallengeBasemap.none.toString(), name: localizedBasemapLabels.none },
  ].concat(
    _map(
      _filter(LayerSources, (source) => !source.overlay),
      (source) => ({ id: source.id, name: source.name }),
    ),
  );

  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    definitions: {
      customBasemapRule: {
        type: "object",
        properties: {
          name: {
            title: intl.formatMessage(messages.customBasemapNameLabel),
            type: "string",
          },
          url: {
            title: intl.formatMessage(messages.customBasemapURLLabel),
            type: "string",
          },
          overlay: {
            title: intl.formatMessage(messages.customBasemapOverlayLabel),
            type: "boolean",
            default: false,
            enumNames: [
              intl.formatMessage(messages.yesLabel),
              intl.formatMessage(messages.noLabel),
            ],
          },
        },
        required: ["name", "url"],
      },
    },
    properties: {
      defaultEditor: {
        title: intl.formatMessage(messages.defaultEditorLabel),
        type: "number",
        enum: _values(Editor),
        enumNames: _map(Editor, (value, key) => localizedEditorLabels[key]),
        default: Editor.none,
      },
      locale: {
        title: intl.formatMessage(messages.localeLabel),
        type: "string",
        enum: SUPPORTED_LOCALES,
        enumNames: SUPPORTED_LOCALES.map((locale) => LOCALE_NAMES[locale]),
        default: defaultLocale(),
      },
      defaultBasemap: {
        title: intl.formatMessage(messages.defaultBasemapLabel),
        type: "string",
        enum: _map(defaultBasemapChoices.concat(customBasemaps), "id"),
        enumNames: _map(defaultBasemapChoices.concat(customBasemaps), "name"),
        default: ChallengeBasemap.none.toString(),
      },
      customBasemaps: {
        title: intl.formatMessage(messages.customBasemapsLabel),
        type: "array",
        items: { $ref: "#/definitions/customBasemapRule" },
      },
      leaderboardOptOut: {
        title: intl.formatMessage(messages.leaderboardOptOutLabel),
        type: "boolean",
        default: false,
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      },
      isReviewer: {
        title: intl.formatMessage(messages.isReviewerLabel),
        type: "boolean",
        default: false,
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      },
      allowFollowing: {
        title: intl.formatMessage(messages.allowFollowingLabel),
        type: "boolean",
        default: false,
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      },
      seeTagFixSuggestions: {
        title: intl.formatMessage(messages.seeTagFixSuggestionsLabel),
        type: "boolean",
        default: true,
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      },
      disableTaskConfirm: {
        title: intl.formatMessage(messages.disableTaskConfirmLabel),
        type: "boolean",
        default: false,
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      },
    },
  };

  // Show 'needsReview' option if value is not REVIEW_MANDATORY or to superusers
  if (AsManager(editor).isSuperUser()) {
    schemaFields.properties.needsReview = {
      title: intl.formatMessage(messages.needsReviewLabel),
      type: "number",
      enum: [needsReviewType.needed, needsReviewType.notNeeded, needsReviewType.mandatory],
      enumNames: [
        intl.formatMessage(messages.yesLabel),
        intl.formatMessage(messages.noLabel),
        intl.formatMessage(messages.mandatoryLabel),
      ],
      default: needsReviewType.notNeeded,
    };
  } else if (
    AsManager(user).isSuperUser() ||
    user.settings.needsReview !== needsReviewType.mandatory
  ) {
    schemaFields.properties.needsReview = {
      title: intl.formatMessage(messages.needsReviewLabel),
      type: "number",
      enum: [needsReviewType.needed, needsReviewType.notNeeded],
      enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      default: needsReviewType.notNeeded,
    };
  }

  return schemaFields;
};

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields.
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type in
 * > the form configuration will help the RJSFFormFieldAdapter generate the
 * > proper markup.
 */
export const uiSchema = (intl, user, editor) => {
  const uiSchemaFields = {
    defaultEditor: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.defaultEditorDescription),
    },
    defaultBasemap: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.defaultBasemapDescription),
    },
    customBasemaps: {
      "ui:addLabel": intl.formatMessage(messages.addCustomBasemapLabel),
      "ui:deleteLabel": intl.formatMessage(messages.deleteCustomBasemapLabel),
      "ui:emptyValue": "",
      "ui:help": (
        <MarkdownContent markdown={intl.formatMessage(messages.customBasemapDescription)} />
      ),
      items: {
        "ui:options": { inline: false },
        classNames: ["custom-basemaps-item"],
      },
    },
    locale: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.localeDescription),
    },
    leaderboardOptOut: {
      "ui:widget": "radio",
      "ui:help": (
        <MarkdownContent markdown={intl.formatMessage(messages.leaderboardOptOutDescription)} />
      ),
    },
    needsReview: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.needsReviewDescription),
    },
    isReviewer: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.isReviewerDescription),
    },
    allowFollowing: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.allowFollowingDescription),
    },
    seeTagFixSuggestions: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.seeTagFixSuggestionsDescription),
    },
    disableTaskConfirm: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.disableTaskConfirmDescription),
    },
    "ui:order": [
      "locale",
      "allowFollowing",
      "defaultEditor",
      "leaderboardOptOut",
      "defaultBasemap",
      "isReviewer",
      "customBasemaps",
      "seeTagFixSuggestions",
      "disableTaskConfirm",
    ],
  };

  // Show 'needsReview' option if value is not REVIEW_MANDATORY or to superusers
  if (
    AsManager(editor).isSuperUser() ||
    AsManager(user).isSuperUser() ||
    user.settings.needsReview !== needsReviewType.mandatory
  ) {
    uiSchemaFields["ui:order"].push("needsReview");
  }

  return uiSchemaFields;
};
