import { Fragment, useEffect } from 'react'

/**
 * Expands checkbox shortcode containing label and name to a checkbox form
 * input, e.g. `[checkbox "some text" name="propertyName"]`
 */
const CheckboxFormHandler = {
  checkboxRegex: "checkbox[/ ]?\"([^\"]+)\"\\s+name=\"([^\"]+)\"",

  handlesShortCode(shortCode, props) {
    return props.allowFormFields && new RegExp(this.checkboxRegex).test(shortCode)
  },

  expandShortCode(shortCode, props) {
    const match = new RegExp(this.checkboxRegex).exec(shortCode)
    return match ?
      <CheckboxFormField {...props} label={match[1]} propertyName={match[2]} /> :
      shortCode
  },
}

const CheckboxFormField = props => {
  // Record that a response from mapper is desired
  const { setNeedsResponses } = props
  useEffect(() => {
    if (setNeedsResponses) {
      setNeedsResponses(true)
    }
  }, [setNeedsResponses])

  const isChecked = Object.assign({}, props.completionResponses)[props.propertyName]
  return (
    <Fragment>
      <input
        id="checkbox-label"
        type="checkbox"
        className="checkbox"
        defaultChecked={isChecked}
        disabled={props.disableTemplate}
        onChange={() => props.setCompletionResponse(props.propertyName, !isChecked)}
      />
      <label htmlFor="checkbox-label" className="mr-pl-2">{props.label}</label>
    </Fragment>
  );
}

export default CheckboxFormHandler
