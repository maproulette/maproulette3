import { TaskPropertySearchTypeNumber,
         TaskPropertySearchTypeString }
         from '../../services/Task/TaskProperty/TaskProperty'
import _values from 'lodash/values'

export const PROPERTY_RULE_ERRORS = Object.freeze({
  missingRightRule: "missingRightRule",
  missingLeftRule: "missingLeftRule",
  missingKey: "missingKey",
  missingValue: "missingValue",
  missingPropertyType: "missingPropertyType",
  notNumericValue: "notNumericValue",
  missingStyleName: "missingStyleName",
  missingStyleValue: "missingStyleValue"
})

/**
 * Prepares a group of priority rules for saving.
 *
 * Example Property Search JSON
  "taskPropertySearch": {
		"operationType": "or",
		"left": {
			"key": "id",
			"value": "test1''",
			"valueType": "string",
			"searchType": "equals"
		},
		"right": {
			"operationType": "and",
			"left": {
				"key": "id",
				"value": "test",
				"valueType": "string",
				"searchType": "contains"
			},
			"right": {
				"key": "version",
				"value": "0",
				"valueType": "number",
				"searchType": "greater_than"
			}
		}
	}
 **/
export const preparePropertyRulesForSaving = rule => {
  if (!rule) {
    return null
  }

  // Due to react-jsonschema-form bug #768, the default operator values
  // don't get populated if the user doesn't change their selection, so we
  // set the defaults here if needed
  if (!rule.operator) {
    rule.operator = "equals"
  }

  if (!rule.condition) {
    rule.condition = "and"
  }

  // Reset to default valid search type
  if (rule.valueType === "number" &&
      !_values(TaskPropertySearchTypeNumber).find(o => o === rule.operator)) {
    rule.operator = "equals"
  }
  else if (rule.valueType === "string" &&
           !_values(TaskPropertySearchTypeString).find(o => o === rule.operator)) {
    rule.operator = "equals"
  }

  return {
    key: rule.left ? null : rule.key,
    value: rule.left ? null : rule.value,
    valueType: rule.left ? null : rule.valueType,
    searchType: rule.left ? null : rule.operator,
    operationType: rule.left ? rule.condition : null,
    left: preparePropertyRulesForSaving(rule.left),
    right: preparePropertyRulesForSaving(rule.right)
  }
}

/**
 * Tasks setup task property rules and turns them into
 * the expected form format.
 */
export const preparePropertyRulesForForm = data => {
  if (!data) {
    return null
  }

  if (!data.key && !data.value && !data.left && !data.right &&
           !data.valueType) {
    // We have an empty rule.
    return {}
  }


  return {
    key: data.key ? data.key : undefined,
    value: data.value ? data.value : undefined,
    valueType: data.valueType ? data.valueType : (data.left ? "compound rule" : undefined),
    operator: data.searchType ? data.searchType : undefined,
    condition: data.operationType ? data.operationType : undefined,
    left: data.left ? preparePropertyRulesForForm(data.left) : undefined,
    right: data.right ? preparePropertyRulesForForm(data.right) : undefined
  }
}

/**
 * Validates the property rules and returns any errors.
 */
export const validatePropertyRules = (rule, errors=[]) => {
  if (!rule) {
    return errors
  }

  if (!rule.key && !rule.value && !rule.left && !rule.right &&
           !rule.valueType) {
    // We have an empty rule.
    return errors
  }

  if (!rule.valueType) {
    errors.push(PROPERTY_RULE_ERRORS.missingPropertyType)
  }
  else {
    if (rule.left) {
      errors = validatePropertyRules(rule.left, errors)
      if (!rule.right) {
        errors.push(PROPERTY_RULE_ERRORS.missingRightRule)
      }
      else {
        errors = validatePropertyRules(rule.right, errors)
      }
    }

    if (!rule.left && rule.right) {
      errors.push(PROPERTY_RULE_ERRORS.missingLeftRule)
    }

    if (!rule.left && !rule.right) {
      if (rule.valueType === "compound rule") {
        errors.push(PROPERTY_RULE_ERRORS.missingPropertyType)
      }
      else {
        if (!rule.key) {
          errors.push(PROPERTY_RULE_ERRORS.missingKey)
        }

        if (!rule.value) {
          errors.push(PROPERTY_RULE_ERRORS.missingValue)
        }

        if (rule.valueType === "number") {
          if (isNaN(rule.value)) {
            errors.push(PROPERTY_RULE_ERRORS.notNumericValue)
          }
        }
      }
    }
  }


  return errors
}
