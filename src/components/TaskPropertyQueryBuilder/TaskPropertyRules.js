import _each from "lodash/each";
import _filter from "lodash/filter";
import _slice from "lodash/slice";
import _values from "lodash/values";
import {
  TaskPropertyOperationType,
  TaskPropertySearchTypeNumber,
  TaskPropertySearchTypeString,
} from "../../services/Task/TaskProperty/TaskProperty";

export const PROPERTY_RULE_ERRORS = Object.freeze({
  missingRightRule: "missingRightRule",
  missingLeftRule: "missingLeftRule",
  missingKey: "missingKey",
  missingValue: "missingValue",
  missingPropertyType: "missingPropertyType",
  notNumericValue: "notNumericValue",
  missingStyleName: "missingStyleName",
  missingStyleValue: "missingStyleValue",
});

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
export const preparePropertyRulesForSaving = (rule) => {
  if (!rule) {
    return null;
  }

  // Due to react-jsonschema-form bug #768, the default operator values
  // don't get populated if the user doesn't change their selection, so we
  // set the defaults here if needed
  if (!rule.operator) {
    rule.operator = TaskPropertySearchTypeString.equals;
  }

  if (!rule.condition) {
    rule.condition = TaskPropertyOperationType.and;
  }

  // Reset to default valid search type
  if (
    rule.valueType === "number" &&
    !_values(TaskPropertySearchTypeNumber).find((o) => o === rule.operator)
  ) {
    rule.operator = TaskPropertySearchTypeNumber.equals;
  } else if (
    rule.valueType === "string" &&
    !_values(TaskPropertySearchTypeString).find((o) => o === rule.operator)
  ) {
    rule.operator = TaskPropertySearchTypeString.equals;
  }

  const values = _filter(rule.value, (v) => v !== undefined);
  if (!rule.left && rule.value && values.length > 0) {
    // We have multiple value so we need to build our own compound rule.
    const buildOrValues = (key, value, valueType, searchType, commaSeparate) => {
      if (value.length === 1) {
        // Comma Separate Value into multiple "or" conditions
        if (commaSeparate && value[0].indexOf(",") > 0) {
          return {
            commaSeparate: commaSeparate,
            key: null,
            value: null,
            valueType: null,
            searchType: null,
            operationType: TaskPropertyOperationType.or, // OR values together
            left: buildOrValues(
              key,
              [value[0].substring(0, value[0].indexOf(","))],
              valueType,
              searchType,
              commaSeparate,
            ),
            right: buildOrValues(
              key,
              [value[0].slice(value[0].indexOf(",") + 1)],
              valueType,
              searchType,
              commaSeparate,
            ),
          };
        }
        // Just handle as single value
        else {
          return {
            commaSeparate: commaSeparate,
            key: key,
            value: value[0],
            valueType: valueType,
            searchType: searchType,
            operationType: null,
            left: null,
            right: null,
          };
        }
      }

      // Assign first value to left and build right rules with everything else
      return {
        key: null,
        value: null,
        valueType: null,
        searchType: null,
        operationType: TaskPropertyOperationType.or, // OR values together
        left: buildOrValues(key, _slice(value, 0, 1), valueType, searchType, false),
        right: buildOrValues(key, _slice(value, 1), valueType, searchType, false),
      };
    };

    return buildOrValues(rule.key, values, rule.valueType, rule.operator, rule.commaSeparate);
  }

  /// Assign value if appropriate
  let value = null;
  if (!rule.left) {
    if (
      rule.operator !== TaskPropertySearchTypeString.exists &&
      rule.operator !== TaskPropertySearchTypeString.missing
    ) {
      value = (rule.value?.length ?? 0) < 1 ? null : rule.value[0];
    }
  }

  return {
    commaSeparate: rule.commaSeparate,
    key: rule.left ? null : rule.key,
    value: value,
    valueType: rule.left ? null : rule.valueType,
    searchType: rule.left ? null : rule.operator,
    operationType: rule.left ? rule.condition : null,
    left: preparePropertyRulesForSaving(rule.left),
    right: preparePropertyRulesForSaving(rule.right),
  };
};

/**
 * Tasks setup task property rules and turns them into
 * the expected form format.
 */
export const preparePropertyRulesForForm = (data) => {
  if (!data) {
    return null;
  }

  if (!data.key && !data.value && !data.left && !data.right && !data.valueType) {
    // We have an empty rule.
    return {};
  }

  if (!data.key && data.left && data.right) {
    const compactKey = (rule, values) => {
      if (rule.operationType === TaskPropertyOperationType.or) {
        if (rule?.left?.key === rule?.right?.key) {
          if (rule.commaSeparate) {
            values[0] = values[0] ? values[0] + "," : "";
            values[0] = values[0] + rule.left.value + "," + rule.right.value;
          } else {
            values.push(rule.left.value);
            values.push(rule.right.value);
          }
          return rule.left.key;
        }

        if (rule?.left?.key === compactKey(rule.right, values)) {
          values.unshift(rule.left.value);
          return rule.left.key;
        }
      }
      return null;
    };

    // Test to see if we can compact
    const compactedValues = [];
    const compactedKey = compactKey(data, compactedValues);
    if (compactedKey !== null && compactedKey !== undefined) {
      return {
        commaSeparate: data.commaSeparate,
        key: compactedKey,
        value: compactedValues,
        valueType: data.left.valueType,
        operator: data.left.searchType,
      };
    }
  }

  const value =
    data.searchType === TaskPropertySearchTypeString.exists ||
    data.searchType === TaskPropertySearchTypeString.missing
      ? [""]
      : data.value
        ? [data.value]
        : [""];
  return {
    key: data.key ? data.key : undefined,
    value: value,
    valueType: data.valueType ? data.valueType : data.left ? "compound rule" : undefined,
    operator: data.searchType ? data.searchType : undefined,
    condition: data.operationType ? data.operationType : undefined,
    left: data.left ? preparePropertyRulesForForm(data.left) : undefined,
    right: data.right ? preparePropertyRulesForForm(data.right) : undefined,
  };
};

/**
 * Validates the property rules and returns any errors.
 */
export const validatePropertyRules = (rule, errors = []) => {
  if (!rule) {
    errors.push(PROPERTY_RULE_ERRORS.missingPropertyType);
    return errors;
  }

  if (!rule.key && !rule.value && !rule.left && !rule.right && !rule.valueType) {
    // We have an empty rule.
    errors.push(PROPERTY_RULE_ERRORS.missingPropertyType);
    return errors;
  }

  if (!rule.valueType) {
    errors.push(PROPERTY_RULE_ERRORS.missingPropertyType);
  } else {
    if (rule.left) {
      errors = validatePropertyRules(rule.left, errors);
      if (!rule.right) {
        errors.push(PROPERTY_RULE_ERRORS.missingRightRule);
      } else {
        errors = validatePropertyRules(rule.right, errors);
      }
    }

    if (!rule.left && rule.right) {
      errors.push(PROPERTY_RULE_ERRORS.missingLeftRule);
    }

    if (!rule.left && !rule.right) {
      if (rule.valueType === "compound rule") {
        errors.push(PROPERTY_RULE_ERRORS.missingPropertyType);
      } else {
        if (!rule.key) {
          errors.push(PROPERTY_RULE_ERRORS.missingKey);
        }

        if (
          !rule.value &&
          rule.operator !== TaskPropertySearchTypeString.exists &&
          rule.operator !== TaskPropertySearchTypeString.missing
        ) {
          errors.push(PROPERTY_RULE_ERRORS.missingValue);
        }

        if (rule.valueType === "number") {
          _each(rule.value, (v) => {
            if (isNaN(v)) {
              errors.push(PROPERTY_RULE_ERRORS.notNumericValue);
            }
          });
        }
      }
    }
  }

  return errors;
};
