import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _isArray from 'lodash/isArray'
import _compact from 'lodash/compact'
import _trim from 'lodash/trim'

/**
  * Prepares a group of priority rules for saving, converting it to the
  * (stringified) JSON representation expected by the server.
  */
export const preparePriorityRuleGroupForForm = ruleObject => {
  const preparedGroup = {
    ruleGroup: {},
  }

  if (!_isEmpty(ruleObject)) {
    if (_isArray(ruleObject.rules)) {
      preparedGroup.ruleGroup.condition = ruleObject.condition
      preparedGroup.ruleGroup.rules = _map(ruleObject.rules, rule => {
        // Key and Value are represented as a single `value` field, dot
        // separated.
        let [key, ...value] = rule.value.split('.')
        return {
          key,
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
  const preparedGroup = {}

  const rules = _compact(_map(ruleGroup.rules, rule => {
    if (_isEmpty(rule.key)) {
      return null
    }

    // The server expects the Key and Value to be represented as a single
    // `value` string, dot-separated. To work-around an MR2 bug, we set
    // empty values to a single space for now.
    const value = `${rule.key}.${_isEmpty(rule.value) ? ' ' : rule.value}`

    return {
      field: "tag", // only tags are currently supported
      type: "string", // only strings are currently supported
      operator: rule.operator,
      value,
    }
  }))

  if (rules.length > 0) {
    preparedGroup.condition = ruleGroup.condition
    preparedGroup.rules = rules
  }

  return JSON.stringify(preparedGroup)
}
