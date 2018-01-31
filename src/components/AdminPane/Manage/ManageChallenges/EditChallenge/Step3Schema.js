import { ChallengePriority,
         challengePriorityLabels }
       from '../../../../../services/Challenge/ChallengePriority/ChallengePriority'
import _map from 'lodash/map'
import _values from 'lodash/values'
import messages from './Messages'

/**
 * Generates a JSON Schema describing Step 3 (task priorities) of Edit
 * Challenge workflow intended for consumption by react-jsonschema-form.
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
export const jsSchema = intl => {
  const localizedPriorityLabels = challengePriorityLabels(intl)

  return {
    "$schema": "http://json-schema.org/draft-06/schema#",
    title: intl.formatMessage(messages.step3Label),
    description: intl.formatMessage(messages.step3Description),
    type: "object",
    properties: {
      defaultPriority: {
        title: intl.formatMessage(messages.defaultPriorityLabel),
        description: intl.formatMessage(messages.defaultPriorityDescription),
        type: "number",
        enum: _values(ChallengePriority),
        enumNames: _map(ChallengePriority, (value, key) => localizedPriorityLabels[key]),
        default: ChallengePriority.high,
      },
    },
  }
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
  defaultPriority: {
    "ui:widget": "select",
  }
}
