import MarkdownContent from "../MarkdownContent/MarkdownContent";
import messages from "./Messages";

/**
 * Generates a JSON Schema describing Custom URL fields for consumption by
 * react-jsonschema-form
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl) => ({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: {
      title: intl.formatMessage(messages.nameLabel),
      type: "string",
    },
    description: {
      title: intl.formatMessage(messages.descriptionLabel),
      type: "string",
    },
    url: {
      title: intl.formatMessage(messages.urlLabel),
      type: "string",
    },
  },
});

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields.
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 */
export const uiSchema = (intl) => ({
  name: {
    "ui:help": intl.formatMessage(messages.nameDescription),
  },
  description: {
    "ui:help": intl.formatMessage(messages.descriptionDescription),
  },
  url: {
    "ui:help": <MarkdownContent markdown={intl.formatMessage(messages.urlDescription)} />,
  },
});
