import { Component, createRef } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import Form from '@rjsf/core'
import { CustomSelectWidget }
       from '../Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _head from 'lodash/head'
import _cloneDeep from 'lodash/cloneDeep'
import { jsSchema, uiSchema, ArrayFieldTemplate } from './TaskPropertiesSchema'
import { preparePropertyRulesForSaving,
         preparePropertyRulesForForm,
         validatePropertyRules } from './TaskPropertyRules'
import { TaskPropertySearchTypeString }
       from '../../services/Task/TaskProperty/TaskProperty'
import messages from './Messages'
import './TaskPropertiesSchema.scss'

/**
 * TaskPropertyQueryBuilder allows for assembling a query to filter task properties
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskPropertyQueryBuilder extends Component {
  state = {
  }

  formRef = createRef()

  clearForm = (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.props.clearTaskPropertyQuery()
    this.setState({formData:{}, errors: null})
    
  }

  /** Receive updates to the form data, along with any validation errors */
  changeHandler = ({formData}) => {
    const rootRule = _cloneDeep(_get(formData, 'propertyRules.rootRule'))

    const moveLeft = (data, prevData) => {
      // We've changed value type to compound rule so
      // let's move over any assigned key/values.
      if (data.valueType === "compound rule" &&
          (prevData && _get(prevData, 'valueType') !== "compound rule")) {
        data.left = {
          valueType: prevData.valueType,
          key: prevData.key,
          value: prevData.value,
          operator: prevData.operator,
        }
        data.key = undefined
        data.value = undefined
        data.operator = undefined
      }
      else if (data.valueType !== "compound rule" &&
               _get(prevData, 'valueType') === "compound rule")
      {
        data.key = _get(prevData, 'left.key')
        data.value = _get(prevData, 'left.value')
        data.operator = _get(prevData, 'left.operator')
        data.left = undefined
        data.right = undefined
      }
      else {
        if (data.left) {
          moveLeft(data.left, _get(prevData, 'left'))
        }
        if (data.right) {
          moveLeft(data.right, _get(prevData, 'right'))
        }
        if (data.valueType && data.valueType !== "compound rule") {
          data.value = data.value || [""]
          data.operator = data.operator || "equals"
        }
      }
    }

    moveLeft(rootRule, _get(this.state.formData, 'propertyRules.rootRule'))
    this.setState({formData: {propertyRules: {rootRule}}, errors: null})

    if (!!this.props.updateAsChange && rootRule) {
      // This is for when an array of values has already been setup and then
      // someone tries to change the key. If the key goes null or undefined
      // it will cause the values to be uncompacted (as they no longer have a
      // key to group by) so instead we set it to "".
      const checkForEmptyKeys = (rule) => {
        if (rule.left) {
          checkForEmptyKeys(rule.left)
        }
        if (rule.right) {
          checkForEmptyKeys(rule.right)
        }
        if (_get(rule.value, 'length', 0) > 1) {
          if (!rule.key) {
            rule.key = ""
          }
        }
      }
      checkForEmptyKeys(rootRule)
      const errors = validatePropertyRules(rootRule)
      const preparedData = preparePropertyRulesForSaving(rootRule)
      this.props.updateTaskPropertyQuery(preparedData, errors)
    }
  }

  /** Receive errors from form validation */
  errorHandler = (e) => {
    console.log(e)
  }

  finish = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const rootRule = _get(this.state.formData, 'propertyRules.rootRule')
    const errors = validatePropertyRules(rootRule)

    if (errors.length === 0) {
      const preparedData = preparePropertyRulesForSaving(rootRule)

      this.setState({preparedData, errors: null})
      this.props.updateTaskPropertyQuery(preparedData)
    }
    else {
      this.setState({errors})
    }
  }

  setupFormData = (taskPropertyQuery) => {
    const rules = preparePropertyRulesForForm(taskPropertyQuery)
    this.setState({formData: {
      propertyRules: {
        rootRule: taskPropertyQuery ? rules : {}
      }
    }})
  }

  // For property rule value text inputs, we want to prevent return key presses from
  // clearing triggering the nearest submit button and clearing the entire form. 
  onFormTextInputKeyDown = (e) => {
    const alphaRegex = /[0-9]{1,}/

    if(e.keyCode === 13 && e.target.type === "text") {
      e.preventDefault()
      e.stopPropagation()

      const inputId = e.target.id
      const rootId = inputId.split("_").filter(item => {
          if(item !== "value") {
            return !alphaRegex.test(item)
          }
          return false
      }).join("_")

      const inputParentFieldset = document.getElementById(rootId)

      // If event target and parent idx match, the input is used in the challenge edit
      // to enter a new property key, so we should return early instead of attempting to
      // add multiple keys.
      if(inputParentFieldset.id === e.target.id) return

      const fieldsetArray = Array.from(inputParentFieldset.elements)
      const addButton = fieldsetArray.filter(item => item.type === "button").pop()

      addButton.click()

      const nextId = inputId.replace(alphaRegex, (match) => {
        const incremented = parseInt(match, 10) + 1
        return incremented.toString()
      })
      
      // Focusing the next property value input field is useful to streamline the workflow.
      const nextInput = document.getElementById(nextId)
      nextInput.focus()
    }
  }

  componentDidMount() {
    if (this.props.taskPropertyQuery) {
      this.setupFormData(this.props.taskPropertyQuery)
    }
    if(this.formRef) {
      this.formRef.current.formElement.addEventListener('keydown', this.onFormTextInputKeyDown)
    }
  }

  componentDidUpdate() {
    // Clear form data if filters.taskPropertyQuery has been cleared.
    if (_isEmpty(this.props.taskPropertyQuery) &&
        !_isEmpty(this.state.preparedData)) {
      this.setState({formData: null, preparedData: null})
    }
  }

  componentWillUnmount() {
    if(this.formRef) {
      this.formRef.current.formElement.removeEventListener('keydown', this.onFormTextInputKeyDown)
    }
  }

  render() {
    const data = this.state.formData || this.props.taskPropertyStyleRules

    // We have to clear out any values defined if the operator is "exists" or
    // "missing" otherwise the schema for will erroneously show the
    // "comma separate values" checkbox
    if (_get(data, 'propertyRules.rootRule')) {
      const clearOutValues = (rule) => {
        if (rule.valueType === "compound rule") {
          rule.value = undefined
        }
        else if (rule.operator === TaskPropertySearchTypeString.missing ||
                 rule.operator === TaskPropertySearchTypeString.exists) {
          rule.value = undefined
        }
        if (rule.left) {
          clearOutValues(rule.left)
        }
        if (rule.right) {
          clearOutValues(rule.right)
        }
      }

      clearOutValues(data.propertyRules.rootRule)
    }

    return (
      <div className="task-properties-form mr-w-full mr-pt-4">
        <Form
          ref={this.formRef}
          submitOnEnter={false}
          schema={jsSchema(this.props.intl, this.props.taskPropertyKeys)}
          className="mr-bg-black-15 mr-p-2"
          uiSchema={uiSchema(this.props.intl, this.props.taskPropertyKeys)}
          ArrayFieldTemplate={ArrayFieldTemplate}
          tagType={"taskProperties"}
          widgets={{SelectWidget: CustomSelectWidget}}
          noHtml5Validate
          showErrorList={false}
          formData={data}
          onChange={this.changeHandler}
          onError={this.errorHandler}
        >
          {this.state.errors &&
            <div className="mr-ml-4 mr-mb-4 mr-text-red-light">
              {this.props.intl.formatMessage(messages[_head(this.state.errors)])}
            </div>
          }
          {!this.props.updateAsChange &&
            <div className="mr-pt-2 mr-pb-4 mr-pl-1">
              <button
                className="mr-button mr-button--green-lighter mr-mr-4"
                onClick={this.clearForm}
              >
                <FormattedMessage {...messages.clearButton} />
              </button>
              <button
                type="submit"
                className="mr-button mr-button--green-lighter"
                onClick={this.finish}
              >
                <FormattedMessage {...messages.searchButton} />
              </button>
            </div>
          }
        </Form>
      </div>
    )
  }
}

export default injectIntl(TaskPropertyQueryBuilder)
