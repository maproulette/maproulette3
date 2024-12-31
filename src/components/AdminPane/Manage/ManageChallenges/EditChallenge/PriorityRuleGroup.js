import _clone from "lodash/clone";
import _compact from "lodash/compact";
import _flatten from "lodash/flatten";
import _groupBy from "lodash/groupBy";
import _isArray from "lodash/isArray";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _remove from "lodash/remove";
import _trim from "lodash/trim";

/**
 * Prepares a group of priority rules from the server to the representation
 * expected by the edit form
 */
export const preparePriorityRuleGroupForForm = (ruleObject, isNested = false) => {
  const preparedGroup = {
    ruleGroup: {},
  };

  if (isNested) {
    preparedGroup.valueType = "nested rule";
  }

  if (!_isEmpty(ruleObject)) {
    if (_isArray(ruleObject.rules)) {
      preparedGroup.ruleGroup.condition = ruleObject.condition;
      preparedGroup.ruleGroup.rules = combineRulesForForm(
        _map(ruleObject.rules, (rule) => preparePriorityRuleForForm(rule)),
      );

      if (
        isNested &&
        ruleObject.rules.length !== preparedGroup.ruleGroup.rules &&
        preparedGroup.ruleGroup.rules.length === 1
      ) {
        // We did some combining so let's submit the un-nested rule
        return preparedGroup.ruleGroup.rules[0];
      }
    }
  }

  return preparedGroup;
};

/**
 * Format a single priority rule from the server to the representation
 * expected by the edit form
 */
export const preparePriorityRuleForForm = (rule) => {
  if (_isArray(rule.rules)) {
    return preparePriorityRuleGroupForForm(rule, true);
  }

  // Key and Value are represented as a single `value` field, dot separated
  let [key, ...value] = rule.value.split(".");
  return {
    key,
    valueType: rule.type,
    operator: rule.operator,
    value: _trim(value.join(".")),
  };
};

/**
 * Combine multiple rules from the same group that match against the same
 * property and operator into a single rule with comma-separated values
 */
export const combineRulesForForm = (rules) => {
  const allRules = _clone(rules);
  const locationRules = _remove(allRules, (rule) => rule.valueType === "bounds");
  const rulesByProperty = _groupBy(allRules, (rule) => `${rule.key}:::${rule.operator}`);

  return _map(rulesByProperty, (groupedRules) =>
    groupedRules.length === 1
      ? groupedRules[0]
      : Object.assign({}, groupedRules[0], {
          // Quote any strings with literal commas prior to combining, and then join together
          value: _map(groupedRules, (rule) =>
            /,/.test(rule.value) ? `"${rule.value}"` : rule.value,
          ).join(","),
        }),
  ).concat(locationRules);
};

/**
 * Prepares a group of priority rules for saving, converting it to the
 * (stringified) JSON representation expected by the server.
 */
export const preparePriorityRuleGroupForSaving = (ruleGroup) => {
  return JSON.stringify(normalizeRuleGroupForSaving(ruleGroup));
};

/**
 * Format a group of rules for the server
 */
export const normalizeRuleGroupForSaving = (ruleGroup) => {
  const normalizedGroup = {};

  const rules = _compact(_flatten(_map(ruleGroup.rules, (rule) => normalizeRuleForSaving(rule))));

  if (rules.length > 0) {
    normalizedGroup.condition = ruleGroup.condition;
    normalizedGroup.rules = rules;
  }

  return normalizedGroup;
};

/**
 * Format a single rule for the server. Note that this can return an array of
 * multiple rules if comma-separated values were used and the rule needs to be
 * split
 */
export const normalizeRuleForSaving = (rule, allowCSV = true) => {
  if (rule.valueType === "nested rule") {
    return normalizeRuleGroupForSaving(rule.ruleGroup);
  }

  if (rule.valueType === "bounds") {
    rule.key = "location";
  }

  if (_isEmpty(rule.key)) {
    return null;
  }

  // If there are multiple, comma-separated values, split into separate rules
  // (ignoring commas in quoted strings)
  if (allowCSV && /,/.test(rule.value) && rule.valueType !== "bounds") {
    let condition = "OR";

    // Negative conditions need to be "AND" (eg. value not 1 AND not 2)
    if (rule.operator === "not_equal" || rule.operator === "not_contains") {
      condition = "AND";
    }

    let csvRule = {
      condition,
      rules: _flatten(csvStringToArray(rule.value)).map((value) =>
        normalizeRuleForSaving(Object.assign({}, rule, { value }), false),
      ),
    };
    return csvRule;
  }

  // Due to react-jsonschema-form bug #768, the default operator values
  // don't get populated if the user doesn't change their selection, so we
  // set the operator to the default here if needed
  if (!rule.operator && rule.valueType) {
    if (rule.valueType === "string") {
      rule.operator = "equal"; // default string operator
    } else if (rule.valueType === "bounds") {
      rule.operator = "contains"; // default bounds operator
    } else {
      rule.operator = "=="; // default numeric operator
    }
  }

  // The server expects the Key and Value to be represented as a single
  // `value` string, dot-separated. To work-around an MR2 bug, we set
  // empty values to a single space for now.
  return {
    value: `${rule.key}.${_isEmpty(rule.value) ? " " : rule.value}`,
    type: rule.valueType,
    operator: rule.operator,
  };
};

/**
 * Parse CSV, handling quoted strings and escaped characters
 * From https://gist.github.com/Jezternz/c8e9fafc2c114e079829974e3764db75
 */
const csvStringToArray = (strData) => {
  const objPattern = new RegExp(
    '(\\,|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^\\,\\r\\n]*))',
    "gi",
  );
  let arrMatches = null,
    arrData = [[]];
  while ((arrMatches = objPattern.exec(strData))) {
    if (arrMatches[1].length && arrMatches[1] !== ",") arrData.push([]);
    arrData[arrData.length - 1].push(
      arrMatches[2] ? arrMatches[2].replace(new RegExp('""', "g"), '"') : arrMatches[3],
    );
  }
  return arrData;
};
