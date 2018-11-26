import React, { Component } from 'react'
import { FormattedMessage, FormattedDate, injectIntl }
       from 'react-intl'
import Form from 'react-jsonschema-form'
import _get from 'lodash/get'
import _merge from 'lodash/merge'
import _isUndefined from 'lodash/isUndefined'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _debounce from 'lodash/debounce'
import { basemapLayerSources }
       from '../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import AsEditableUser from '../../interactions/User/AsEditableUser'
import WithCurrentUser from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import SvgSymbol from '../../components/SvgSymbol/SvgSymbol'
import ApiKey from './ApiKey'
import { CustomSelectWidget }
       from '../../components/Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import { jsSchema, uiSchema } from './ProfileSchema'
import messages from './Messages'

class Profile extends Component {
  state = {
    formData: {},
    isSaving: false,
    saveComplete: false,
  }

  /** Save the latest settings modified by the user */
  saveLatestSettings = _debounce(settings => {
    this.setState({isSaving: true, saveComplete: false})

    const editableUser = AsEditableUser(settings)
    editableUser.normalizeDefaultBasemap()

    this.props.updateUserSettings(this.props.user.id, editableUser).then(() =>
      this.setState({isSaving: false, saveComplete: true})
    )
  }, 750, {leading: true})

  /** Invoked when the form data is modified */
  changeHandler = ({formData}) => {
    this.setState({formData, saveComplete: false})
    this.saveLatestSettings(formData)
  }

  componentDidMount() {
    // Make sure our user info is current
    if (_get(this.props, 'user.isLoggedIn')) {
      this.props.loadCompleteUser(this.props.user.id)
    }
  }

  render() {
    // Setup a saving indicator if needed, which is a busy spinner during
    // saving and then a check-mark once saving is complete
    let saveIndicator = null
    if (this.state.isSaving) {
      saveIndicator = <BusySpinner inline />
    }
    else if (this.state.saveComplete) {
      saveIndicator =
        <SvgSymbol
          sym="check-icon"
          className="mr-fill-green-lighter mr-w-4 mr-h-4"
          viewBox="0 0 20 20"
        />
    }

    const userSettings = _merge({}, this.props.user.settings, this.state.formData)

    // The server uses two fields to represent the default basemap: a legacy
    // numeric identifier and a new optional string identifier for layers from
    // the OSM Editor Layer Index. If we're editing a legacy challenge that
    // doesn't use the layer index string identifiers, then we convert the
    // numeric id to an appropriate string identifier here (assuming it is
    // specifying a default layer at all).
    if (_isUndefined(this.state.formData.defaultBasemap)) {
      if (!_isEmpty(userSettings.defaultBasemapId)) { // layer index string
        userSettings.defaultBasemap = userSettings.defaultBasemapId
      }
      else if (_isFinite(userSettings.defaultBasemap)) { // numeric identifier
        // Convert to corresponding layer-index string identifier for form if
        // possible. Otherwise just go with string representation of numerical
        // id, which is still used to represent things like a custom basemap
        // indicator (this is a bit of a hack to support everything in a single
        // form field)
        userSettings.defaultBasemap =
          basemapLayerSources()[userSettings.defaultBasemap] ||
          userSettings.defaultBasemap.toString()
      }
    }

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 lg:mr-py-20">
        <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-p-4 md:mr-p-8 mr-rounded">
          <header className="mr-max-w-xs mr-mx-auto mr-text-center">
            <img
              className="mr-block mr-mx-auto mr-mb-4 mr-rounded-full md:mr-w-30 md:mr-h-30 md:mr--mt-23"
              src={`${this.props.user.osmProfile.avatarURL}?s=120`}
              srcSet={`${this.props.user.osmProfile.avatarURL}?s=120 1x, ${this.props.user.osmProfile.avatarURL}?s=240 2x"`}
              alt={this.props.user.osmProfile.displayName}
            />
            <h1 className="mr-h3 mr-text-blue mr-mb-1">{this.props.user.osmProfile.displayName}</h1>
            <p className="mr-text-grey mr-text-sm mr-font-mono">
              <FormattedMessage {...messages.userSince} /> <b>
                <FormattedDate
                  month='long'
                  year='numeric'
                  value={new Date(this.props.user.created)}
                />
              </b>
            </p>
          </header>
          <section className="mr-section">
            <header className="mr-section__header">
              <h2 className="mr-h4">
                <FormattedMessage {...messages.header} />
              </h2>
              {saveIndicator}
            </header>

            <Form schema={jsSchema(this.props.intl)}
                  uiSchema={uiSchema(this.props.intl)}
                  widgets={{SelectWidget: CustomSelectWidget}}
                  className="form form--2-col"
                  liveValidate
                  noHtml5Validate
                  showErrorList={false}
                  formData={userSettings}
                  onChange={this.changeHandler}>
              <div className="form-controls" />
            </Form>
          </section>

          <ApiKey {...this.props} />
        </div>
      </div>
    )
  }
}

export default WithCurrentUser(injectIntl(Profile))
