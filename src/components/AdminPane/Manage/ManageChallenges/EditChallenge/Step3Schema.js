import { TaskPriority,
         taskPriorityLabels }
       from '../../../../../services/Task/TaskPriority/TaskPriority'
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
  const localizedPriorityLabels = taskPriorityLabels(intl)

  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    title: intl.formatMessage(messages.step3Label),
    description: intl.formatMessage(messages.step3Description),
    type: "object",
    definitions: {
      priorityRuleGroup: {
        title: " ", // empty title
        type: "object",
        properties: {
          condition: {
            title: " ", // empty title
            type: "string",
            enum: ["AND", "OR"],
            default: "AND",
          },
          rules: {
            title: " ", // empty title
            type: "array",
            items: {
              type: "object",
              properties: {
                valueType: {
                  title: "Property Type",
                  type: "string",
                  enum: ["string", "integer", "double", "long"],
                  default: "string",
                },
                key: {
                  title: "Property Name",
                  type: "string",
                },
                value: {
                  title: "Property Value",
                  type: "string",
                },
              },
              required: [ "valueType" ],
              dependencies: { // Show operators appropriate to value type
                valueType: {
                  oneOf: [
                    {
                      properties: {
                        valueType: {
                          enum: ["string"],
                        },
                        operator: {
                          title: "Operator",
                          type: "string",
                          enum: ["equal", "not_equal",
                                "contains", "not_contains",
                                "is_empty", "is_not_empty"],
                          enumNames: ["equals", "doesn't equal",
                                      "contains", "doesn't contain",
                                      "is empty", "isn't empty"],
                          default: "equal", // doesn't work, rjsf bug #768
                        },
                      },
                    },
                    {
                      properties: {
                        valueType: {
                          enum: ["integer", "double", "long"],
                        },
                        operator: {
                          title: "Operator",
                          type: "string",
                          enum: ["==", "!=", "<", "<=", ">", ">="],
                          enumNames: ["=", "≠", "<", "<=", ">", ">="],
                          default: "==", // doesn't work, rjsf bug #768
                        },
                      },
                    }
                  ]
                }
              },
            },
          },
        },
      },
    },
    properties: {
      defaultPriority: {
        title: intl.formatMessage(messages.defaultPriorityLabel),
        type: "number",
        enum: _values(TaskPriority),
        enumNames: _map(TaskPriority, (value, key) => localizedPriorityLabels[key]),
        default: TaskPriority.high,
      },
      highPriorityRules: {
        title: "High Priority Rules",
        type: "object",
        properties: {
          ruleGroup: { "$ref": "#/definitions/priorityRuleGroup" },
        },
      },
      mediumPriorityRules: {
        title: "Medium Priority Rules",
        type: "object",
        properties: {
          ruleGroup: { "$ref": "#/definitions/priorityRuleGroup" },
        },
      },
      lowPriorityRules: {
        title: "Low Priority Rules",
        type: "object",
        properties: {
          ruleGroup: { "$ref": "#/definitions/priorityRuleGroup" },
        },
      },
    },
  }
}

/**
 * react-jsonschema-form doesn't currently support uiSchema entries for
 * definitions, so we define a schema snippet here for the priorityRuleGroup
 * definition that can be used in the uiSchema without duplicating it over and
 * over for each field referencing a priorityRuleGroup.
 *
 * @private
 */
const priorityRuleGroupUISchema = {
  condition: {
    "ui:widget": "select",
  },
  rules: {
    items: {
      "ui:options": { inline: true, label: false },
      classNames: "priority-rule",
      keyType: {
        "ui:widget": "select",
      },
      valueType: {
        "ui:widget": "select",
      },
      key: {
        "ui:placeholder": "Property Name",
      },
      operator: {
        "ui:widget": "select",
      },
      value: {
        "ui:placeholder": "Property Value",
      },
      "ui:order": [ "valueType", "key", "operator", "value" ],
    },
  },
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
  defaultPriority: {
    "ui:widget": "select",
    "ui:help": intl.formatMessage(messages.defaultPriorityDescription),
  },
  highPriorityRules: {
    ruleGroup: priorityRuleGroupUISchema,
  },
  mediumPriorityRules: {
    ruleGroup: priorityRuleGroupUISchema,
  },
  lowPriorityRules: {
    ruleGroup: priorityRuleGroupUISchema,
  },
})
