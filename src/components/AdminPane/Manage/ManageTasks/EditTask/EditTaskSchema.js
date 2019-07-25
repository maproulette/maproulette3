import { TaskStatus, messagesByStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import _map from 'lodash/map'
import _values from 'lodash/values'
import messages from './Messages'

/**
 * Generates a JSON Schema describing editable Task fields intended for
 * consumption by react-jsonschema-form.
 *
 * @param intl - intl fields from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl, task) => {
  const allowedStatuses = _values(TaskStatus)
  const allowedStatusLabels = _map(
    allowedStatuses,
    status => intl.formatMessage(messagesByStatus[status])
  )

  const schemaFields = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      name: {
        title: intl.formatMessage(messages.nameLabel),
        type: "string",
        minLength: 3,
      },
      instruction: {
        title: intl.formatMessage(messages.instructionLabel),
        type: "string",
      },
      geometries: {
        title: intl.formatMessage(messages.geometriesLabel),
        type: "string",
      },
      status: {
        title: intl.formatMessage(messages.statusLabel),
        type: "number",
        enum: allowedStatuses,
        enumNames: allowedStatusLabels,
        default: TaskStatus.created,
      },
      tags: {
        title: intl.formatMessage(messages.additionalTagsLabel),
      }
    },
    required: ["name", "geometries"],
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
export const uiSchema = intl => ({
  name: {
    "ui:help": intl.formatMessage(messages.nameDescription),
  },
  instruction: {
    "ui:field": "markdown",
    "ui:help": intl.formatMessage(messages.instructionDescription),
  },
  geometries: {
    "ui:widget": "textarea",
    "ui:help": intl.formatMessage(messages.geometriesDescription),
  },
  status: {
    "ui:widget": "select",
    "ui:help": intl.formatMessage(messages.statusDescription),
  },
  tags: {
    "ui:field": "tags",
    "ui:help": intl.formatMessage(messages.additionalTagsDescription),
  },
})
