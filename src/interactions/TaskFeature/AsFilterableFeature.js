import _isString from "lodash/isString";
import _isUndefined from "lodash/isUndefined";
import _toFinite from "lodash/toFinite";
import _trim from "lodash/trim";

import {
  TaskPropertyOperationType,
  TaskPropertySearchTypeNumber,
  TaskPropertySearchTypeString,
} from "../../services/Task/TaskProperty/TaskProperty";

// value types (data types)
const STRING = "string";
const NUMBER = "number";

/**
 * AsFilterableFeature adds functionality for determining if a feature matches
 * filter rules
 */
export class AsFilterableFeature {
  constructor(feature) {
    Object.assign(this, feature);
  }

  /**
   * Determines if this feature matches the given property filter rules
   */
  matchesPropertyFilter(rules) {
    if (!rules) {
      return false;
    }

    // If there is an operationType then that means we're AND'ing or OR'ing
    // the results of two sets of rules, a left and right
    if (rules.operationType) {
      switch (rules.operationType.toLowerCase()) {
        case TaskPropertyOperationType.and:
          return this.matchesPropertyFilter(rules.left) && this.matchesPropertyFilter(rules.right);
        case TaskPropertyOperationType.or:
          return this.matchesPropertyFilter(rules.left) || this.matchesPropertyFilter(rules.right);
        default:
          throw new Error(`Unrecognized filter rule operation type: ${rules.operationType}`);
      }
    }

    // Otherwise evaluate the filter based on the value type (data type)
    switch (rules.valueType.toLowerCase()) {
      case STRING:
        return this.matchesStringFilter(rules);
      case NUMBER:
        return this.matchesNumberFilter(rules);
      default:
        throw new Error(`Unsupported value type: ${rules.valueType}`);
    }
  }

  /**
   * Determine if these properties match the given string type filter
   */
  matchesStringFilter(rule) {
    if (
      rule.searchType.toLowerCase() !== TaskPropertySearchTypeString.exists &&
      rule.searchType.toLowerCase() !== TaskPropertySearchTypeString.missing
    ) {
      if (!_isString(rule.value)) {
        return false;
      }
    }

    // searchType represents the comparison operation to perform
    switch (rule.searchType.toLowerCase()) {
      case TaskPropertySearchTypeString.equals:
        return this.properties[rule.key] === rule.value;
      case TaskPropertySearchTypeString.contains:
        return (
          _isString(this.properties[rule.key]) &&
          rule.value.length > 0 &&
          this.properties[rule.key].includes(rule.value)
        );
      case TaskPropertySearchTypeString.notEqual:
        return this.properties[rule.key] !== rule.value;
      case TaskPropertySearchTypeString.exists:
        return this.properties[rule.key];
      case TaskPropertySearchTypeString.missing:
        return !this.properties[rule.key];
      default:
        throw new Error(`Unsupported string operator: ${rule.searchType}`);
    }
  }

  /**
   * Determine if these properties match the given number type filter
s   */
  matchesNumberFilter(rule) {
    // No empty rule values allowed for numeric comparison
    if (_trim(rule.value) === "") {
      return false;
    }

    // If property is undefined or empty, return true for NOT_EQUAL comparator
    // and false for everything else
    if (
      _isUndefined(this.properties[rule.key]) ||
      this.properties[rule.key] === null ||
      _trim(this.properties[rule.key]) === ""
    ) {
      return rule.searchType.toLowerCase() === TaskPropertySearchTypeString.notEqual;
    }

    // Make sure we're dealing with finite numbers
    const propertyValue = _toFinite(this.properties[rule.key]);
    if (!Number.isFinite(propertyValue)) {
      return false;
    }

    const ruleValue = _toFinite(rule.value);
    if (!Number.isFinite(ruleValue)) {
      return false;
    }

    // searchType represents the comparison operation to perform
    switch (rule.searchType.toLowerCase()) {
      case TaskPropertySearchTypeNumber.equals:
        return propertyValue === ruleValue;
      case TaskPropertySearchTypeNumber.notEquals:
        return propertyValue !== ruleValue;
      case TaskPropertySearchTypeNumber.greaterThan:
        return propertyValue > ruleValue;
      case TaskPropertySearchTypeNumber.lessThan:
        return propertyValue < ruleValue;
      default:
        throw new Error(`Unsupported numeric operator: ${rule.searchType}`);
    }
  }
}

export default (feature) => new AsFilterableFeature(feature);
