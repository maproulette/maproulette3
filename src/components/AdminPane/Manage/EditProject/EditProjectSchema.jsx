import AsManager from "../../../../interactions/User/AsManager";
import MarkdownContent from "../../../MarkdownContent/MarkdownContent";
import messages from "./Messages";

/**
 * Generates a JSON Schema describing editable Project fields intended for
 * consumption by react-jsonschema-form.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl, user, project) => {
  const schemaFields = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      displayName: {
        title: intl.formatMessage(messages.displayNameLabel),
        type: "string",
        minLength: 3,
      },
      enabled: {
        title: intl.formatMessage(messages.enabledLabel),
        type: "boolean",
        default: false,
      },
      description: {
        title: intl.formatMessage(messages.descriptionLabel),
        type: "string",
      },
      requireConfirmation: {
        title: intl.formatMessage(messages.requireConfirmationLabel),
        type: "boolean",
        default: false,
      },
    },
    required: ["displayName"],
  };

  // Only show Featured option to superusers
  if (AsManager(user).isSuperUser()) {
    schemaFields.properties.featured = {
      title: intl.formatMessage(messages.featuredLabel),
      type: "boolean",
      default: false,
    };
  }

  // Show 'isVirtual' option only if this is a new project
  if (!project) {
    schemaFields.properties.isVirtual = {
      title: intl.formatMessage(messages.isVirtualLabel),
      type: "boolean",
      default: false,
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
export const uiSchema = (intl) => {
  const uiSchemaFields = {
    featured: {
      "ui:widget": "radio",
      "ui:help": <MarkdownContent markdown={intl.formatMessage(messages.featuredDescription)} />,
    },
    displayName: {
      "ui:help": intl.formatMessage(messages.displayNameDescription),
    },
    enabled: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.enabledDescription),
    },
    isVirtual: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.isVirtualDescription),
    },
    description: {
      "ui:widget": "textarea",
      "ui:help": intl.formatMessage(messages.descriptionDescription),
    },
    requireConfirmation: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.requireConfirmationDescription),
    },
    "ui:order": [
      "featured",
      "displayName",
      "enabled",
      "description",
      "requireConfirmation",
      "isVirtual",
    ],
  };

  return uiSchemaFields;
};
