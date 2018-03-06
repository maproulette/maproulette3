import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Form from 'react-jsonschema-form'
import _debounce from 'lodash/debounce'
import _merge from 'lodash/merge'
import { FormattedMessage, injectIntl } from 'react-intl'
import { CustomFieldTemplate } from '../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import { jsSchema, uiSchema } from './UserSettingsSchema'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../BusySpinner/BusySpinner'
import messages from './Messages'

/**
 * UserSettings provides a simple form for editing a user's settings. It
 * makse use of a json-schema standard schema that define the fields and basic
 * validation requirements, and react-jsonschema-forms library to render the
 * form from the schemas. We utilize our own field adapter to massage the form
 * markup and class names into something that is roughly Bulma-compliant.
 *
 * @see See UserSettingsSchema.js
 * @see See http://json-schema.org/
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 * @see See RJSFFormFieldAdapter
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class UserSettings extends Component {
  state = {
    formData: {},
    isSaving: false,
    saveComplete: false,
  }

  /**
   * Save the latest settings modified by the user. Debounced to save
   * at most once per second.
   */
  saveLatestSettings = _debounce(settings => {
    this.setState({isSaving: true, saveComplete: false})
    this.props.updateUserSettings(this.props.user.id, settings).then(() =>
      this.setState({isSaving: false, saveComplete: true})
    )
  }, 750, {leading: true})

  /** Invoked when the form data is modified */
  changeHandler = ({formData}) => {
    this.setState({formData, saveComplete: false})
    this.saveLatestSettings(formData)
  }

  render() {
    const userSettings = _merge({}, this.props.user.settings, this.state.formData)

    let saveIndicator = null
    if (this.state.isSaving) {
      saveIndicator = <BusySpinner inline />
    }
    else if (this.state.saveComplete) {
      saveIndicator = <SvgSymbol sym="check-icon" viewBox="0 0 20 20" />
    }

    return (
      <div className="user-settings">
        <h2 className="subtitle">
          <FormattedMessage {...messages.header} />
          {saveIndicator}
        </h2>

        <Form schema={jsSchema(this.props.intl)}
              uiSchema={uiSchema}
              FieldTemplate={CustomFieldTemplate}
              liveValidate
              noHtml5Validate
              showErrorList={false}
              formData={userSettings}
              onChange={this.changeHandler}>
          <div className="form-controls" />
        </Form>
      </div>
    )
  }
}

UserSettings.propTypes = {
  /** The user for which settings are to be modified */
  user: PropTypes.object,
  /** Invoked when the user modifies a user setting */
  updateUserSettings: PropTypes.func.isRequired,
}

export default injectIntl(UserSettings)
