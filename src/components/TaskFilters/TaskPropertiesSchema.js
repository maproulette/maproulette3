import { TaskPropertySearchTypeString,
         TaskPropertySearchTypeNumber, messagesByPropertySearchType,
         TaskPropertyOperationType, messagesByPropertyOperationType }
       from '../../services/Task/TaskProperty/TaskProperty'
import _map from 'lodash/map'
import _values from 'lodash/values'
import messages from './Messages'

/**
 * Generates a JSON Schema describing compound rules for searching by
 * task properties.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const jsSchema = (intl, taskPropertyKeys) => {
  const operationTypeMessages =
    _map(TaskPropertyOperationType, opType =>
      intl.formatMessage(messagesByPropertyOperationType[opType])
    )

  const searchTypeStringMessages =
    _map(TaskPropertySearchTypeString, type =>
      intl.formatMessage(messagesByPropertySearchType[type])
    )

  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    definitions: {
      tagRule: {
        title: "",
        type: "object",
        properties: {
          valueType: {
            title: "Property Type ",
            type: "string",
            enum: ["string", "number", "compound rule"],
            enumNames: [intl.formatMessage(messages.stringType),
                        intl.formatMessage(messages.numberType),
                        intl.formatMessage(messages.compoundRuleType)],
          },
        },
        dependencies: { // Show operators appropriate to value type
          valueType: {
            oneOf: [
              { // nested rules
                properties: {
                  valueType: {
                    enum: ["compound rule"],
                  },
                  left: { $ref: "#/definitions/tagRule" },
                  condition: {
                    title: " ", // empty title
                    type: "string",
                    enum: _values(TaskPropertyOperationType),
                    enumNames: operationTypeMessages,
                    default: _values(TaskPropertyOperationType)[0],
                  },
                  right: { $ref: "#/definitions/tagRule" },
                },
              },
              { // string values
                properties: {
                  valueType: {
                    enum: ["string"],
                  },
                  key: {
                    enum: taskPropertyKeys,
                  },
                  operator: {
                    type: "string",
                    enum: _values(TaskPropertySearchTypeString),
                    enumNames: searchTypeStringMessages,
                    default: "equals",
                  },
                  value: {
                    title: "Value",
                    type: "string",
                  },
                },
              },
              { // numeric values
                properties: {
                  valueType: {
                    enum: ["number"],
                  },
                  key: {
                    enum: taskPropertyKeys,
                  },
                  operator: {
                    type: "string",
                    enum: _values(TaskPropertySearchTypeNumber),
                    enumNames: ["=", "≠", ">", "<"],
                    default: "equals",
                  },
                  value: {
                    title: "Value",
                    type: "string",
                  },
                },
              }
            ]
          }
        },
      }
    },
    properties: {
      propertyRules: {
        title: "",
        type: "object",
        properties: {
          rootRule: { "$ref": "#/definitions/tagRule" },
        },
      },
    },
  }
}

function buildUISchema(deepness) {
  if (deepness === 0 ) {
    return {}
  }

  return {
    classNames: "property-rule mr-border mr-border-green-light mr-p-2 mr-m-1 mr-pl-4 mr-flex",
    valueType: {
      classNames:  "mr-text-green mr-w-48",
      "ui:widget": "select",
      "ui:options": { inline: true, label: true },
    },
    condition: {
      classNames: "mr-ml-4 mr-w-24",
      "ui:widget": "select",
      "ui:options": { inline: true, label: false },
    },
    key: {
      classNames: "inline-selector mr-inline",
      "ui:widget": "select",
      "ui:options": { inline: true, label: false },
    },
    operator: {
      classNames: "inline-selector mr-inline",
      "ui:widget": "select",
      "ui:options": { inline: true, label: false },
    },
    value: {
      classNames: "inline-selector mr-inline",
      "ui:options": { inline: true, label: false },
    },
    left: buildUISchema(deepness - 1),
    right: buildUISchema(deepness - 1),
  }
}

/**
 * react-jsonschema-form doesn't currently support uiSchema entries for
 * definitions, so we define a schema snippet here for the property rules
 * definition that can be used in the uiSchema without duplicating it over and
 * over for each field referencing a property rule.
 *
 * @private
 */
 const tagRuleUISchema = buildUISchema(7)

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
  propertyRules: {
    rootRule: tagRuleUISchema,
  },
})
