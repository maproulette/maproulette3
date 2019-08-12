import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _isArray from 'lodash/isArray'
import _compact from 'lodash/compact'
import _trim from 'lodash/trim'

/**
 * Prepares a group of priority rules from the server to the representation
 * expected by the edit form
 */
export const preparePriorityRuleGroupForForm = (ruleObject, isNested=false) => {
  const preparedGroup = {
    ruleGroup: {},
  }

  if (isNested) {
    preparedGroup.valueType = 'nested rule'
  }

  if (!_isEmpty(ruleObject)) {
    if (_isArray(ruleObject.rules)) {
      preparedGroup.ruleGroup.condition = ruleObject.condition
      preparedGroup.ruleGroup.rules = _map(ruleObject.rules, rule => {
        if (_isArray(rule.rules)) {
          return preparePriorityRuleGroupForForm(rule, true)
        }

        // Key and Value are represented as a single `value` field, dot
        // separated.
        let [key, ...value] = rule.value.split('.')
        return {
          key,
          valueType: rule.type,
          operator: rule.operator,
          value: _trim(value.join('.')),
        }
      })
    }
  }

  return preparedGroup
}

/**
 * Prepares a group of priority rules for saving, converting it to the
 * (stringified) JSON representation expected by the server.
 */
export const preparePriorityRuleGroupForSaving = ruleGroup => {
  return JSON.stringify(normalizeRuleGroupForSaving(ruleGroup))
}

export const normalizeRuleGroupForSaving = ruleGroup => {
  const normalizedGroup = {}

  const rules = _compact(_map(ruleGroup.rules, rule => {
    if (rule.valueType === "nested rule") {
      return normalizeRuleGroupForSaving(rule.ruleGroup)
    }

    if (_isEmpty(rule.key)) {
      return null
    }

    // Due to react-jsonschema-form bug #768, the default operator values
    // don't get populated if the user doesn't change their selection, so we
    // set the operator to the default here if needed
    if (!rule.operator && rule.valueType) {
      if (rule.valueType === "string") {
        rule.operator = "equal" // default string operator
      }
      else {
        rule.operator = "==" // default numeric operator
      }
    }

    // The server expects the Key and Value to be represented as a single
    // `value` string, dot-separated. To work-around an MR2 bug, we set
    // empty values to a single space for now.
    return {
      value: `${rule.key}.${_isEmpty(rule.value) ? ' ' : rule.value}`,
      type: rule.valueType,
      operator: rule.operator,
    }
  }))

  if (rules.length > 0) {
    normalizedGroup.condition = ruleGroup.condition
    normalizedGroup.rules = rules
  }

  return normalizedGroup
}
