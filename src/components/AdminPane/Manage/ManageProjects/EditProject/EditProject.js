import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import _merge from 'lodash/merge'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { CustomFieldTemplate } from '../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import WithCurrentProject from '../../../HOCs/WithCurrentProject/WithCurrentProject'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import { jsSchema, uiSchema } from './EditProjectSchema'
import messages from './Messages'
import './EditProject.css'

/**
 * EditProject provies a simple form for creating/editing a Project. We
 * make use of a json-schema standard schema that define the fields and basic
 * validation requirements, and react-jsonschema-forms library to render the
 * form from the schemas. We utilize our own field adapter to massage the form
 * markup and class names into something that is roughly Bulma-compliant.
 *
 * @see See http://json-schema.org/
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 * @see See RJSFFormFieldAdapter
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class EditProject extends Component {
  state = {
    formData: {},
    isSaving: false,
  }

  changeHandler = ({formData}) => this.setState({formData})

  finish = ({formData, errors}) => {
    if (!this.state.isSaving && errors.length === 0) {
      this.setState({isSaving: true})

      this.props.saveProject(formData).then(project =>
        this.props.history.push(`/admin/project/${project.id}`)
      )
    }
  }

  render() {
    const projectData = _merge({}, this.props.project, this.state.formData)

    return (
      <div className="admin__manage edit-project">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li>
              <Link to={`/admin/manage/${_get(this.props, 'project.id', '')}`}>Manage</Link>
            </li>
            {_isObject(this.props.project) &&
            <li>
              <Link to={`/admin/project/${this.props.project.id}`}>
                {_get(this.props, 'project.displayName', this.props.project.name)}
              </Link>
            </li>
            }
            <li className="is-active">
              <a aria-current="page">
                {
                  _isObject(this.props.project) ?
                  <FormattedMessage {...messages.editProject} /> :
                  <FormattedMessage {...messages.newProject} />
                }
              </a>
              {this.props.loadingProject && <BusySpinner inline />}
            </li>
          </ul>
        </nav>

        <Form schema={jsSchema(this.props.intl, !_isNumber(projectData.id))}
              uiSchema={uiSchema}
              FieldTemplate={CustomFieldTemplate}
              liveValidate
              noHtml5Validate
              showErrorList={false}
              formData={projectData}
              onChange={this.changeHandler}
              onSubmit={this.finish}>
          <div className="form-controls">
            <button className={classNames("button is-primary is-outlined has-svg-icon",
                                          {"is-loading": this.state.isSaving})}
                    onClick={this.props.finish}>
              <SvgSymbol viewBox='0 0 20 20' sym="check-icon" />
              <FormattedMessage {...messages.save} />
            </button>
          </div>
        </Form>
      </div>
    )
  }
}

export default WithCurrentProject(injectIntl(EditProject))
