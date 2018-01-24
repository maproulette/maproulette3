import { ChallengePriority, challengePriorityLabels }
       from '../../../../../services/Challenge/ChallengePriority/ChallengePriority'
import { TaskStatus, statusLabels }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import { map as _map, values as _values } from 'lodash'
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
export const jsSchema = intl => {
  const localizedPriorityLabels = challengePriorityLabels(intl)
  const localizedStatusLabels = statusLabels(intl)

  const schemaFields = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    type: "object",
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
      priority: {
        title: intl.formatMessage(messages.priorityLabel),
        description: intl.formatMessage(messages.priorityDescription),
        type: "number",
        enum: _values(ChallengePriority),
        enumNames: _map(ChallengePriority, (value, key) => localizedPriorityLabels[key]),
        default: ChallengePriority.high,
      },
      status: {
        title: intl.formatMessage(messages.statusLabel),
        description: intl.formatMessage(messages.statusDescription),
        type: "number",
        enum: _values(TaskStatus),
        enumNames: _map(TaskStatus, (value, key) => localizedStatusLabels[key]),
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
    "ui:widget": "textarea",
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
