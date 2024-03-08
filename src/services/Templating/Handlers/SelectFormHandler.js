import React, { useEffect } from 'react'
import _map from 'lodash/map'

/**
 * Expands select shortcode containing label and values to a select form
 * input, e.g. `[select "some label" values="foo,bar,baz"]`
 */
const SelectFormHandler = {
  selectRegex: "select[/ ]?\"([^\"]+)\"\\s+name=\"([^\"]+)\"\\s+values=\"([^\"]+)\"",

  handlesShortCode(shortCode, props) {
    return props.allowFormFields && new RegExp(this.selectRegex).test(shortCode)
  },

  expandShortCode(shortCode, props) {
    const match = new RegExp(this.selectRegex).exec(shortCode)
    if (!match) {
      return shortCode
    }

    const values = match[3].split(/,\s*/)
    return match ?
      <SelectFormField
        {...props}
        label={match[1]}
        propertyName={match[2]}
        values={values}
      /> :
      shortCode
  },
}

const SelectFormField = props => {
  // Record that a response from mapper is desired
  const { setNeedsResponses } = props
  useEffect(() => {
    if (setNeedsResponses) {
      setNeedsResponses(true)
    }
  }, [setNeedsResponses])

  const currentValue = Object.assign({}, props.completionResponses)[props.propertyName]
  return (
    <React.Fragment>
      <select
        id="select-label" 
        onChange={e => props.setCompletionResponse(props.propertyName, e.target.value)}
        className="select mr-text-black mr-text-xs"
        defaultValue={currentValue}
        disabled={props.disableTemplate}
      >
        <option key="0" value=""></option>
        {_map(props.values, (value, i) => <option key={i} value={value}>{value}</option>)}
      </select>
      <label htmlFor="select-label" className="mr-pl-2">{props.label}</label>
    </React.Fragment>
  )
}

export default SelectFormHandler
