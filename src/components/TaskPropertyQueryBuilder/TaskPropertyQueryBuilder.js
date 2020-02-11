import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import Form from 'react-jsonschema-form-async'
import { CustomSelectWidget }
       from '../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _head from 'lodash/head'
import _cloneDeep from 'lodash/cloneDeep'
import { jsSchema, uiSchema } from './TaskPropertiesSchema'
import { preparePropertyRulesForSaving,
         preparePropertyRulesForForm,
         validatePropertyRules } from './TaskPropertyRules'
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

  clearForm = (e) => {
    this.props.clearTaskPropertyQuery()
    this.setState({formData:{}, errors: null})
    e.preventDefault()
    e.stopPropagation()
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
      }
    }

    moveLeft(rootRule, _get(this.state.formData, 'propertyRules.rootRule'))
    this.setState({formData: {propertyRules: {rootRule}}, errors: null})

    if (!!this.props.updateAsChange && _get(this.state.formData, 'propertyRules.rootRule')) {
      const rootRule = _get(this.state.formData, 'propertyRules.rootRule')
      const errors = validatePropertyRules(rootRule)
      const preparedData = preparePropertyRulesForSaving(rootRule)
      this.props.updateTaskPropertyQuery(preparedData, errors)
    }
  }

  /** Receive errors from form validation */
  errorHandler = (errors, err, formData) => {
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
    this.setState({formData: {
      propertyRules: {
        rootRule: taskPropertyQuery ? preparePropertyRulesForForm(taskPropertyQuery) : {}
      }
    }})
  }

  componentDidMount() {
    if (this.props.taskPropertyQuery) {
      this.setupFormData(this.props.taskPropertyQuery)
    }
  }

  componentDidUpdate(prevProps) {
    // Clear form data if filters.taskPropertyQuery has been cleared.
    if (_isEmpty(this.props.taskPropertyQuery) &&
        !_isEmpty(this.state.preparedData)) {
      this.setState({formData: null, preparedData: null})
    }
    else if (!_isEqual(this.props.taskPropertyQuery, prevProps.taskPropertyQuery)) {
      this.setupFormData(this.props.taskPropertyQuery)
    }
  }

  render() {
    const data = this.state.formData
    return (
      <div className="task-properties-form mr-w-full mr-pt-4">
        <Form schema={jsSchema(this.props.intl, this.props.taskPropertyKeys)}
              className="mr-bg-white"
              onAsyncValidate={this.validateGeoJSONSource}
              uiSchema={uiSchema(this.props.intl, this.props.taskPropertyKeys)}
              tagType={"taskProperties"}
              widgets={{SelectWidget: CustomSelectWidget}}
              noHtml5Validate
              showErrorList={false}
              formData={data}
              onChange={this.changeHandler}
              onError={this.errorHandler}
        >
          {this.state.errors &&
            <div className="mr-ml-4 mr-mb-4 mr-text-red">
              {this.props.intl.formatMessage(messages[_head(this.state.errors)])}
            </div>
          }
          {!this.props.updateAsChange &&
            <React.Fragment>
              <button className="mr-button mr-button--green mr-ml-4 mr-mb-2"
                      onClick={this.clearForm}>
                <FormattedMessage {...messages.clearButton} />
              </button>
              <button className="mr-button mr-button--green mr-ml-4 mr-mb-2"
                      onClick={this.finish}>
                <FormattedMessage {...messages.searchButton} />
              </button>
            </React.Fragment>
          }
        </Form>
      </div>
    )
  }
}

export default injectIntl(TaskPropertyQueryBuilder)
