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
    "$schema": "http://json-schema.org/draft-06/schema#",
    type: "object",
    title: intl.formatMessage(messages.formTitle),
    properties: {
      name: {
        title: intl.formatMessage(messages.nameLabel),
        description: intl.formatMessage(messages.nameDescription),
        type: "string",
        minLength: 3,
      },
      instruction: {
        title: intl.formatMessage(messages.instructionLabel),
        description: intl.formatMessage(messages.instructionDescription),
        type: "string",
      },
      geometries: {
        title: intl.formatMessage(messages.geometriesLabel),
        description: intl.formatMessage(messages.geometriesDescription),
        type: "string",
      },
      status: {
        title: intl.formatMessage(messages.statusLabel),
        description: intl.formatMessage(messages.statusDescription),
        type: "number",
        enum: allowedStatuses,
        enumNames: allowedStatusLabels,
        default: TaskStatus.created,
      },
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
export const uiSchema = {
  instruction: {
    "ui:field": "markdown",
  },
  geometries: {
    "ui:widget": "textarea",
  },
  priority: {
    "ui:widget": "select",
  },
  status: {
    "ui:widget": "select",
  },
}
