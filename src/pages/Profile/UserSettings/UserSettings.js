import React, { Component } from 'react'
import { FormattedMessage, injectIntl }
       from 'react-intl'
import Form from '@rjsf/core'
import _each from 'lodash/each'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _isUndefined from 'lodash/isUndefined'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _debounce from 'lodash/debounce'
import { basemapLayerSources }
       from '../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { NotificationType, keysByNotificationType }
       from '../../../services/Notification/NotificationType/NotificationType'
import AsEditableUser from '../../../interactions/User/AsEditableUser'
import WithStatus from '../../../components/HOCs/WithStatus/WithStatus'
import BusySpinner from '../../../components/BusySpinner/BusySpinner'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import { CustomSelectWidget, NoFieldsetObjectFieldTemplate }
       from '../../../components/Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import { jsSchema as settingsJsSchema, uiSchema as settingsUiSchema }
       from './UserSettingsSchema'
import { jsSchema as notificationsJsSchema, uiSchema as notificationsUiSchema }
       from './NotificationSettingsSchema'
import messages from '../Messages'

class UserSettings extends Component {
  state = {
    settingsFormData: {},
    notificationsFormData: {},
    isSaving: false,
    saveComplete: false,
  }

  /** Save the latest user settings modified by the user */
  saveUserSettings = _debounce((settings) => {
    this.setState({isSaving: true, saveComplete: false})

    const editableUser = AsEditableUser(settings)
    editableUser.normalizeDefaultBasemap()

    this.props.updateUserSettings(
      this.props.user.id, editableUser
    ).then(() => this.setState({isSaving: false, saveComplete: true}))
  }, 750)

  /** Save the latest notification settings modified by the user */
  saveNotificationSettings = _debounce((settings) => {
    if (_isEmpty(settings)) {
      return
    }

    this.setState({isSaving: true, saveComplete: false})
    this.props.updateNotificationSubscriptions(
      this.props.user.id, settings
    ).then(() => this.setState({isSaving: false, saveComplete: true}))
  }, 750)

  /** Invoked when the form data is modified */
  settingsChangeHandler = ({formData}) => {
    this.setState({settingsFormData: formData, saveComplete: false})
    this.saveUserSettings(formData)
  }

  notificationsChangeHandler = (userSettings, {formData}) => {
    // The user's email address comes in from the notifications data even
    // though its technically a user setting
    this.settingsChangeHandler({formData: _merge(userSettings, _pick(formData, 'email'))})

    this.setState({
      notificationsFormData: formData,
      saveComplete: false,
    })

    const subscriptionsObject =
      _fromPairs(_map(formData.notificationSubscriptions, (setting, index) =>
        [keysByNotificationType[index], parseInt(setting, 10)]
    ))
    this.saveNotificationSettings(subscriptionsObject)
  }

  prepareNotificationsDataForForm = (settingsData, notificationsData) => {
    if (!notificationsData.notificationSubscriptions) {
      return notificationsData
    }

    const subscriptionsArray = []
    _each(NotificationType, (constantValue, key) => {
      subscriptionsArray[constantValue] = notificationsData.notificationSubscriptions[key]
    })

    return {
      email: settingsData.email,
      notificationSubscriptions: subscriptionsArray,
    }
  }

  componentDidMount() {
    // Make sure our user info is current
    if (_get(this.props, 'user.isLoggedIn')) {
      this.props.loadCompleteUser(this.props.user.id)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.user && this.props.user.id !== _get(prevProps, 'user.id')) {
      if (this.props.user.isLoggedIn) {
        this.props.loadCompleteUser(this.props.user.id)
      }
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

    const userSettings = _merge(this.props.user.settings, this.state.settingsFormData)

    // The server uses two fields to represent the default basemap: a legacy
    // numeric identifier and a new optional string identifier for layers from
    // the OSM Editor Layer Index. If we're editing a legacy challenge that
    // doesn't use the layer index string identifiers, then we convert the
    // numeric id to an appropriate string identifier here (assuming it is
    // specifying a default layer at all).
    if (_isUndefined(this.state.settingsFormData.defaultBasemap)) {
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

    const notificationSettings = _merge(
      this.prepareNotificationsDataForForm(userSettings, {
        notificationSubscriptions: this.props.user.notificationSubscriptions,
      }),
      this.state.notificationsFormData
    )

    return (
      <section className="mr-section mr-mt-0">
        <header className="mr-section__header mr-mt-0">
          <h2 className="mr-h4 mr-flex mr-items-baseline mr-text-white">
            <FormattedMessage {...messages.header} />
            <span className="mr-ml-4">{saveIndicator}</span>
          </h2>
        </header>

        <Form
          schema={settingsJsSchema(this.props.intl, this.props.user, this.props.editor)}
          uiSchema={settingsUiSchema(this.props.intl, this.props.user, this.props.editor)}
          widgets={{SelectWidget: CustomSelectWidget}}
          className="form form--2-col"
          liveValidate
          noHtml5Validate
          showErrorList={false}
          formData={userSettings}
          onChange={this.settingsChangeHandler}
          ObjectFieldTemplate={NoFieldsetObjectFieldTemplate}
        >
          <div className="form-controls" />
        </Form>

        <div className="mr-border-t-2 mr-border-white-15 mr-my-12" />

        <header className="mr-section__header">
          <h2 className="mr-h4 mr-flex mr-items-baseline mr-text-white">
            <FormattedMessage {...messages.notificationSubscriptionsLabel} />
            <span className="mr-ml-4">{saveIndicator}</span>
          </h2>
        </header>

        <Form
          schema={notificationsJsSchema(this.props.intl)}
          uiSchema={notificationsUiSchema(this.props.intl)}
          widgets={{SelectWidget: CustomSelectWidget}}
          className="form form--2-col"
          liveValidate
          noHtml5Validate
          showErrorList={false}
          formData={notificationSettings}
          onChange={params => this.notificationsChangeHandler(userSettings, params)}
          ObjectFieldTemplate={NoFieldsetObjectFieldTemplate}
        >
          <div className="form-controls" />
        </Form>
      </section>
    )
  }
}

export default WithStatus(injectIntl(UserSettings))
