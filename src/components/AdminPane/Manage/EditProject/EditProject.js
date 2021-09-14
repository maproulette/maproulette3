import React, { Component } from "react";
import Form from "@rjsf/core";
import _merge from "lodash/merge";
import _get from "lodash/get";
import _isFinite from "lodash/isFinite";
import _isObject from "lodash/isObject";
import _snakeCase from "lodash/snakeCase";
import classNames from "classnames";
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { CustomSelectWidget } from "../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter";
import WithManageableProjects from "../../HOCs/WithManageableProjects/WithManageableProjects";
import WithCurrentProject from "../../HOCs/WithCurrentProject/WithCurrentProject";
import BusySpinner from "../../../BusySpinner/BusySpinner";
import { jsSchema, uiSchema } from "./EditProjectSchema";
import manageMessages from "../Messages";
import messages from "./Messages";
import "./EditProject.scss";

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
  };

  changeHandler = ({ formData }) => this.setState({ formData });

  finish = ({ formData, errors }) => {
    if (!this.state.isSaving && errors.length === 0) {
      this.setState({ isSaving: true });

      // For new projects, generate a project name based on the display name.
      // It cannot start with "home_".
      if (!_isFinite(formData.id)) {
        formData.name = _snakeCase(formData.displayName).replace(
          /^home_/,
          "project_"
        );
      }

      this.props.saveProject(formData, this.props.user).then((project) => {
        if (project) {
          this.props.history.push(`/admin/project/${project.id}`);
        } else {
          this.setState({ isSaving: false });
        }
      });
    }
  };

  cancel = () => {
    _isObject(this.props.project)
      ? this.props.history.push(`/admin/project/${this.props.project.id}`)
      : this.props.history.push("/admin/projects");
  };

  render() {
    // If a project id was specified, but there is no project, don't render
    // the form.
    if (_isFinite(this.props.routedProjectId) && !this.props.project) {
      return (
        <h1>
          <FormattedMessage {...messages.projectUnavailable} />
        </h1>
      );
    }

    const projectData = _merge({}, this.props.project, this.state.formData);

    return (
      <div className="admin__manage edit-project">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li className="nav-title">
              <Link to="/admin/projects">
                <FormattedMessage {...manageMessages.manageHeader} />
              </Link>
            </li>
            {_isObject(this.props.project) && (
              <li>
                <Link to={`/admin/project/${this.props.project.id}`}>
                  {_get(
                    this.props,
                    "project.displayName",
                    this.props.project.name
                  )}
                </Link>
              </li>
            )}
            <li className="is-active">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a aria-current="page">
                {_isObject(this.props.project) ? (
                  <FormattedMessage {...messages.editProject} />
                ) : (
                  <FormattedMessage {...messages.newProject} />
                )}
              </a>
              {this.props.loadingProject && <BusySpinner inline />}
            </li>
          </ul>
        </nav>

        <div className="mr-max-w-2xl mr-mx-auto mr-bg-black-15 mr-mt-8 mr-p-4 md:mr-p-8 mr-rounded">
          <Form
            schema={jsSchema(
              this.props.intl,
              this.props.user,
              this.props.project
            )}
            uiSchema={uiSchema(
              this.props.intl,
              this.props.user,
              this.props.project
            )}
            widgets={{ SelectWidget: CustomSelectWidget }}
            className="form"
            liveValidate
            noHtml5Validate
            showErrorList={false}
            formData={projectData}
            onChange={this.changeHandler}
            onSubmit={this.finish}
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
                  { "is-loading": this.state.isSaving }
                )}
                onClick={this.props.finish}
              >
                <FormattedMessage {...messages.save} />
              </button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

export default WithManageableProjects(
  WithCurrentProject(injectIntl(EditProject), { restrictToGivenProjects: true })
);
