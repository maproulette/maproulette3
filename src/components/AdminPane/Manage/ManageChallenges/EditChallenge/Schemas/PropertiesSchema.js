import AsEditableChallenge from "../../../../../../interactions/Challenge/AsEditableChallenge";
import messages from "../Messages";

const STEP_ID = "Properties";

/**
 * Generates a JSON Schema describing property fields of Edit Challenge
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
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      taskBundleIdProperty: {
        title: intl.formatMessage(messages.taskBundleIdPropertyLabel),
        type: challengeData.source === "Overpass Query" ? null : "string",
      },
      osmIdProperty: {
        title: intl.formatMessage(messages.osmIdPropertyLabel),
        type: "string",
      },
      customTaskStyles: {
        title: intl.formatMessage(messages.customTaskStyleLabel),
        type: "boolean",
        default: false,
        enumNames: [intl.formatMessage(messages.yesLabel), intl.formatMessage(messages.noLabel)],
      },
      exportableProperties: {
        title: intl.formatMessage(messages.exportablePropertiesLabel),
        type: "string",
      },
    },
  };
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
  const sourceReadOnly = !AsEditableChallenge(challengeData);
  const isCollapsed = options.longForm && (options.collapsedGroups || []).indexOf(STEP_ID) === -1;
  const toggleCollapsed =
    options.longForm && options.toggleCollapsed
      ? () => options.toggleCollapsed(STEP_ID)
      : undefined;

  return {
    taskBundleIdProperty: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.taskBundleIdPropertyHelp),
      "ui:collapsed": isCollapsed,
      "ui:toggleCollapsed": toggleCollapsed,
      "ui:groupHeader": options.longForm
        ? intl.formatMessage(messages.propertiesStepHeader)
        : undefined,
      "ui:description":
        challengeData.source === "Overpass Query"
          ? intl.formatMessage(messages.taskBundleIdPropertyOverpassWarning)
          : null,
    },
    osmIdProperty: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.osmIdPropertyDescription),
      "ui:collapsed": isCollapsed,
      "ui:description": intl.formatMessage(messages.disableOsmIdProperty),
      "ui:readonly": sourceReadOnly,
    },
    customTaskStyles: {
      "ui:field": "configureCustomTaskStyles",
      "ui:help": intl.formatMessage(messages.customTaskStylesDescription),
      "ui:collapsed": isCollapsed,
    },
    exportableProperties: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.exportablePropertiesDescription),
      "ui:collapsed": isCollapsed,
    },
  };
};
