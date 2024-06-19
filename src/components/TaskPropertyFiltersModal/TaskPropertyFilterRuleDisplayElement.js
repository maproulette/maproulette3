import React from 'react'
import classNames from 'classnames'

const SavedTaskPropertyFilterRuleDisplayElement = ({formattedRule}) => {
  /**
   * @param rule
   * @param operationType
   * @param isChildTier
   * 
   * Outputs the JSX necessary to render a task property rule as readable text. Any hierarchy (compound rules)
   * will be indented as appropriate. The rule must be formatted properly by the preparePropertyRulesForForm
   * function. Compound rule JSX is built recursively and any multi-value rules will have values displayed as
   * comma separated.
   */
  const renderTaskPropertyRuleForDisplay = (rule, operationType = null, isChildTier = false) => {
    if(rule.key && rule.operator) {
      if(rule.value && rule.value.length > 1) {
        return (
          <div className="mr-flex mr-space-x-1">
            <span className="mr-bg-mango-30 mr-px-1 mr-rounded">{rule.key}</span>
            <span>{rule.operator}</span>
            <div className="mr-flex mr-space-x-1 mr-bg-blue-light-75 mr-px-1 mr-rounded-sm">
              {rule.value.map((val, i) => {
                return <span key={`${rule.value} ${i}`}>{i === rule.value.length - 1 ? val : `${val}, `}</span>
              })}
            </div>
          </div>
        )
      }
      return (
        <div className="mr-flex mr-space-x-1">
          <span className="mr-bg-mango-30 mr-px-1">{rule.key}</span>
          <span>{rule.operator}</span>
          {rule.value && rule.value.length > 0 && rule.value[0].length > 0 && 
            <span className="mr-bg-blue-light-75 mr-px-1">{rule.value[0]}</span>
          }
          {operationType && <span>{operationType}</span>}
        </div>
      )
    }

    if(!rule.key && rule.left && rule.right) {
      if(rule.left.key && rule.right.key) {
        return (
          <div className={`mr-flex mr-space-x-1 ${isChildTier ? "mr-pl-4" : ""}`}>
            <span>
              {renderTaskPropertyRuleForDisplay(rule.left, rule.operator)}
            </span>
            <span>{rule.condition}</span>
            <span>
              {renderTaskPropertyRuleForDisplay(rule.right)}
            </span>
          </div>
        )
      } else if(!rule.left.key || !rule.right.key) {
          return (
            <div>
              <div className={classNames({
                "mr-pl-4" : !rule.left.key && !rule.left.valueType === "compound rule",
                "mr-flex mr-space-x-1" : rule.right.valueType === "compound rule"
              })}>
                {renderTaskPropertyRuleForDisplay(rule.left, rule.operator)}
                {rule.right.valueType === "compound rule" && <span>{rule.condition}</span>}
              </div>
              <div className="mr-pl-4">
                {renderTaskPropertyRuleForDisplay(rule.right, rule.operator, isChildTier)}
              </div>
            </div>
          )
      }
    }
    return (
      <div>
        {renderTaskPropertyRuleForDisplay(rule)}
      </div>
    )
  }

  return renderTaskPropertyRuleForDisplay(formattedRule)
}

export default SavedTaskPropertyFilterRuleDisplayElement

