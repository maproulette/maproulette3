import React, { Component } from 'react'
import Form from '@rjsf/core'
import _merge from 'lodash/merge'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _filter from 'lodash/filter'
import _isEmpty from 'lodash/isEmpty'
import _split from 'lodash/split'
import _cloneDeep from 'lodash/cloneDeep'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { CustomSelectWidget,
         MarkdownDescriptionField,
         MarkdownEditField }
       from '../../../../Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import KeywordAutosuggestInput
      from '../../../../KeywordAutosuggestInput/KeywordAutosuggestInput'
import WithCurrentProject
       from '../../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge
       from '../../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithCurrentTask from '../../../HOCs/WithCurrentTask/WithCurrentTask'
import WithTaskTags from '../../../../HOCs/WithTaskTags/WithTaskTags'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import { jsSchema, uiSchema } from './EditTaskSchema'
import manageMessages from '../../Messages'
import messages from './Messages'

/**
 * EditTask provies a simple form for creating/editing a Task. We
 * make use of a json-schema standard schema that define the fields and basic
 * validation requirements, and react-jsonschema-forms library to render the
 * form from the schemas.
 *
 * @see See http://json-schema.org/
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 * @see See RJSFFormFieldAdapter
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class EditTask extends Component {
  challengeState = null

  state = {
    formData: {},
    isSaving: false,
  }

  /** Receive updates to the form data, along with any validation errors */
  changeHandler = ({formData}) => this.setState({formData})

  /**
   * Reroute after challenge owner is done, either to Task Inspect if we came
   * from there, or to View Challenge if not.
   */
  rerouteAfterCompletion = () => {
    if (_get(this.props, 'location.state.fromTaskInspect')) {
      this.props.history.push({
        pathname: `/admin/project/${this.props.projectId}/` +
          `challenge/${this.props.challengeId}/task/${this.props.task.id}/inspect`,
        state: this.challengeState
      })
    }
    else {
      const challengeState = _cloneDeep(this.challengeState)
      if (challengeState) {
        challengeState.refreshAfterSave = true
      }

      this.props.history.push({
        pathname:`/admin/project/${this.props.projectId}/` +
          `challenge/${this.props.challengeId}`,
        state: challengeState
      })
    }
  }

  /** Save modified task data */
  finish = ({formData, errors}) => {
    if (!this.state.isSaving && errors.length === 0) {
      this.setState({isSaving: true})

      this.props.saveTask(formData).then(() =>
        this.rerouteAfterCompletion()
      )
    }
  }

  /** Cancel editing */
  cancel = () => this.rerouteAfterCompletion()

  componentDidMount() {
    this.challengeState = this.props.history.location.state
    window.scrollTo(0, 0)
  }

  render() {
    // We may have a task id lying around in redux, but at least make sure we
    // have a task status and geometries before proceeding to load the form
    if (!_isFinite(_get(this.props, 'task.status')) ||
        !_isObject(_get(this.props, 'task.geometries')) ||
        !this.props.challenge || !this.props.project) {
      return (
        <div className="admin__manage edit-task">
          <div className="admin__manage__pane-wrapper">
            <div className="admin__manage__primary-content">
              <BusySpinner />
            </div>
          </div>
        </div>
      )
    }

    const taskData = _merge({}, this.props.task, this.state.formData)

    // Present the geometries as a string rather than object
    if (_isObject(taskData.geometries)) {
      taskData.geometries = JSON.stringify(taskData.geometries)
    }

    // Override the standard form-field description renderer with our own that
    // supports Markdown. We pass this in to the `fields` prop on the Form.
    const customFields = {
      DescriptionField: MarkdownDescriptionField,
      markdown: MarkdownEditField,
      tags: (props) => {
        const preferredTags =
          _filter(
            _split(_get(this.props.task, 'parent.preferredTags'), ','),
            (result) => !_isEmpty(result)
          )

        return (
          <KeywordAutosuggestInput
            {...props}
            inputClassName="mr-p-2 mr-border-2 mr-border-grey-light-more mr-text-grey mr-rounded"
            tagType={"tasks"}
            preferredResults={preferredTags}
            placeholder={this.props.intl.formatMessage(messages.addTagsPlaceholder)}
          />
        )
      },
    }

    return (
      <div className="admin__manage edit-task">
        <div className="admin__manage__pane-wrapper">
          <div className="admin__manage__primary-content">
            <div className="admin__manage__header">
              <nav className="breadcrumb" aria-label="breadcrumbs">
                <ul>
                  <li className="nav-title">
                    <Link to='/admin/projects'>
                      <FormattedMessage {...manageMessages.manageHeader} />
                    </Link>
                  </li>
                  <li>
                    <Link to={`/admin/project/${this.props.project.id}`}>
                      {this.props.project.displayName ||
                      this.props.project.name}
                    </Link>
                  </li>
                  {_isObject(this.props.challenge) &&
                    <li>
                      <Link to={{
                        pathname: `/admin/project/${this.props.project.id}/challenge/${this.props.challenge.id}`,
                        state: this.challengeState
                      }}>
                        {this.props.challenge.name}
                      </Link>
                    </li>
                  }
                  <li className="is-active">
                    <a aria-current="page">
                      {
                        _isObject(this.props.task) ?
                        <FormattedMessage {...messages.editTask} /> :
                        <FormattedMessage {...messages.newTask} />
                      }
                    </a>
                    {this.props.loading && <BusySpinner inline />}
                  </li>
                </ul>
              </nav>
            </div>

            <div className="mr-max-w-2xl mr-mx-auto mr-bg-black-15 mr-mt-8 mr-p-4 md:mr-p-8 mr-rounded">
              <Form
                schema={jsSchema(this.props.intl, this.props.task)}
                uiSchema={uiSchema(this.props.intl)}
                widgets={{SelectWidget: CustomSelectWidget}}
                className="form"
                fields={customFields}
                liveValidate
                noHtml5Validate
                showErrorList={false}
                formData={taskData}
                onChange={this.changeHandler}
                onSubmit={this.finish}
                tagType="tasks"
              >
                <div className="mr-flex mr-justify-between mr-items-center mr-mt-8">
                  <button
                    className="mr-button mr-button--white"
                    disabled={this.state.isSaving}
                    onClick={this.cancel}
                  >
                    <FormattedMessage {...messages.cancel} />
                  </button>

                  <button
                    className={classNames(
                      "mr-button mr-button--green-lighter mr-ml-4",
                      {"is-loading": this.state.isSaving}
                    )}
                    onClick={this.props.finish}
                  >
                    <FormattedMessage {...messages.save} />
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WithCurrentProject(
  WithCurrentChallenge(
    WithCurrentTask(
      WithTaskTags(injectIntl(EditTask)))
  )
)
