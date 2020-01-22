import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Form from 'react-jsonschema-form-async';
import Modal from '../Modal/Modal'
import External from '../External/External'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import { CustomSelectWidget }
       from '../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _head from 'lodash/head'
import _cloneDeep from 'lodash/cloneDeep'
import { jsSchema, uiSchema } from './TaskPropertiesSchema'
import { preparePropertyRulesForSaving,
         validatePropertyRules } from './TaskPropertyRules'
import messages from './Messages'
import './TaskPropertiesSchema.scss'

/**
 * TaskPropertyFilter builds a dropdown for searching by task properties
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskPropertyFilter extends Component {
  state = {
    showForm: false
  }

  clearForm = (e) => {
    this.props.clearTaskPropertyCriteria()
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

      this.setState({preparedData, errors: null, showForm: false})
      this.props.updateTaskPropertyCriteria(preparedData)
    }
    else {
      this.setState({errors})
    }
  }

  componentDidUpdate(prevProps) {
    // Clear form data if filters.taskPropertySearch has been cleared.
    if (_isEmpty(_get(this.props, 'criteria.filters.taskPropertySearch')) &&
        !_isEmpty(this.state.preparedData)) {
      this.setState({formData: null, preparedData: null})
    }
  }

  render() {
    const data = this.state.formData
    const formSearch =
      <div className="task-properties-form mr-w-full mr-pt-4">
        <Form schema={jsSchema(this.props.intl, this.props.taskPropertyKeys)}
              className="mr-bg-white"
              onAsyncValidate={this.validateGeoJSONSource}
              uiSchema={uiSchema(this.props.intl, this.props.user, data)}
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
          <button className="mr-button mr-button--green mr-ml-4 mr-mb-2"
                  onClick={this.clearForm}>
            <FormattedMessage {...messages.clearButton} />
          </button>
          <button className="mr-button mr-button--green mr-ml-4 mr-mb-2"
                  onClick={this.finish}>
            <FormattedMessage {...messages.searchButton} />
          </button>
        </Form>
      </div>

    return (
      <div className="mr-dropdown mr-dropdown--right">
        <button className="mr-flex mr-items-center mr-text-blue-light"
                onClick={() => this.setState({showForm: !this.state.showForm})}>
          <span className="mr-text-base mr-uppercase mr-mr-1">
            <span><FormattedMessage {...messages.filterByPropertyLabel} /></span>
          </span>
          <SvgSymbol
            sym="icon-cheveron-down"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-5 mr-h-5"
          />
        </button>
        {this.state.showForm &&
          <External>
            <Modal isActive wide onClose={() => this.setState({showForm: false})}>
              <div className="mr-max-h-screen75">
                {formSearch}
              </div>
            </Modal>
          </External>
        }
      </div>
    )
  }
}
