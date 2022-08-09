import { TaskPriority,
         taskPriorityLabels }
       from '../../../../../../services/Task/TaskPriority/TaskPriority'
import _map from 'lodash/map'
import _values from 'lodash/values'
import messages from '../Messages'

const STEP_ID = "Priorities"

/**
 * Generates a JSON Schema describing priority fields of Edit
 * Challenge workflow intended for consumption by react-jsonschema-form
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
export const jsSchema = (intl) => {
  const localizedPriorityLabels = taskPriorityLabels(intl)

  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    definitions: {
      tagRule: {
        type: "object",
        properties: {
          valueType: {
            title: "Property Type",
            type: "string",
            enum: ["string", "integer", "double", "long", "nested rule", "bounds"],
            enumNames: ["string", "integer", "double", "long", "nested rule", "location rule"],
          },
        },
        required: [ "valueType" ],
        dependencies: { // Show operators appropriate to value type
          valueType: {
            oneOf: [
              { // nested rules
                properties: {
                  valueType: {
                    enum: ["nested rule"],
                  },
                  ruleGroup: { $ref: "#/definitions/priorityRuleGroup" },
                },
              },
              { // string values
                properties: {
                  valueType: {
                    enum: ["string"],
                  },
                  key: {
                    title: "Property Name",
                    type: "string",
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
                    default: "equal",
                  },
                  value: {
                    title: "Property Value",
                    type: "string",
                  },
                },
              },
              { // numeric values
                properties: {
                  valueType: {
                    enum: ["integer", "double", "long"],
                  },
                  key: {
                    title: "Property Name",
                    type: "string",
                  },
                  operator: {
                    title: "Operator",
                    type: "string",
                    enum: ["==", "!=", "<", "<=", ">", ">="],
                    enumNames: ["=", "≠", "<", "<=", ">", ">="],
                    default: "==",
                  },
                  value: {
                    title: "Property Value",
                    type: "string",
                  },
                },
              },
              { // bounds values
                properties: {
                  valueType: {
                    enum: ["bounds"],
                  },
                  operator: {
                    title: "Operator",
                    type: "string",
                    enum: ["contains", "not_contains"],
                    enumNames: ["inside bounds", "outside bounds"],
                    default: "contains",
                  },
                  value: {
                    title: "Bounds Value",
                    type: "string",
                    withButton: "map"
                  },
                },
              }
            ]
          }
        },
      },
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
            items: { "$ref": "#/definitions/tagRule" }
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
        description: intl.formatMessage(messages.defaultPriorityDescription),
      },
      highPriorityRules: {
        title: intl.formatMessage(messages.highPriorityRulesLabel),
        type: "object",
        properties: {
          ruleGroup: { "$ref": "#/definitions/priorityRuleGroup" },
        },
      },
      mediumPriorityRules: {
        title: intl.formatMessage(messages.mediumPriorityRulesLabel),
        type: "object",
        properties: {
          ruleGroup: { "$ref": "#/definitions/priorityRuleGroup" },
        },
      },
      lowPriorityRules: {
        title: intl.formatMessage(messages.lowPriorityRulesLabel),
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
const priorityRuleGroupUISchema = (isCollapsed) => ({
  classNames: "priority-rule-group",
  condition: {
    "ui:widget": "select",
  },
  rules: {
    items: {
      "ui:options": { inline: true, label: false },
      classNames: "priority-rule",
      keyType: {
        "ui:widget": "select",
        "ui:displayLabel": false,
        "ui:collapsed": isCollapsed,
      },
      valueType: {
        "ui:widget": "select",
        "ui:displayLabel": false,
        "ui:collapsed": isCollapsed,
      },
      key: {
        "ui:placeholder": "Property Name",
        "ui:displayLabel": false,
        "ui:collapsed": isCollapsed,
      },
      operator: {
        "ui:widget": "select",
        "ui:displayLabel": false,
        "ui:collapsed": isCollapsed,
      },
      value: {
        "ui:placeholder": "Property Value",
        "ui:displayLabel": false,
        "ui:collapsed": isCollapsed,
      },
      ruleGroup: {
        classNames: "nested-rule-group mr-border mr-border-white-25 mr-p-2 mr-mt-4 mr-flex mr-w-full",
        rules: {
          items: {
            key: {
              "ui:placeholder": "Property Name",
              "ui:displayLabel": false,
              "ui:collapsed": isCollapsed,
            },
            value: {
              "ui:placeholder": "Property Value",
              "ui:displayLabel": false,
              "ui:collapsed": isCollapsed,
            },
            ruleGroup: {
              classNames: "nested-rule-group mr-border mr-border-white-25 mr-p-2 mr-mt-4 mr-flex mr-w-full",
              rules: {
                items: {
                  key: {
                    "ui:placeholder": "Property Name",
                    "ui:displayLabel": false,
                    "ui:collapsed": isCollapsed,
                  },
                  value: {
                    "ui:placeholder": "Property Value",
                    "ui:displayLabel": false,
                    "ui:collapsed": isCollapsed,
                  },
                },
              },
            }
          }
        }
      },
      "ui:order": [ "valueType", "key", "operator", "value", "*" ],
    },
  },
})

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type
 * > in the form configuration will help the RJSFFormFieldAdapter generate the
 * > proper markup
 */
export const uiSchema = (intl, user, challengeData, extraErrors, options={}) => {
  const isCollapsed = options.longForm && (options.collapsedGroups || []).indexOf(STEP_ID) !== -1
  const toggleCollapsed = options.longForm && options.toggleCollapsed ? () => options.toggleCollapsed(STEP_ID) : undefined

  return {
    defaultPriority: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.defaultPriorityDescription),
      "ui:collapsed": isCollapsed,
      "ui:toggleCollapsed": toggleCollapsed,
      "ui:groupHeader": options.longForm ? intl.formatMessage(messages.prioritiesStepHeader) : undefined,
    },
    highPriorityRules: {
      ruleGroup: priorityRuleGroupUISchema(isCollapsed),
      "ui:collapsed": isCollapsed,
    },
    mediumPriorityRules: {
      ruleGroup: priorityRuleGroupUISchema(isCollapsed),
      "ui:collapsed": isCollapsed,
    },
    lowPriorityRules: {
      ruleGroup: priorityRuleGroupUISchema(isCollapsed),
      "ui:collapsed": isCollapsed,
    },
  }
}
