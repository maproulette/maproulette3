import React, { Component } from 'react'
import { FormattedMessage, injectIntl }
       from 'react-intl'
import Form from 'react-jsonschema-form'
import _each from 'lodash/each'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
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
import { jsSchema, uiSchema } from './UserSettingsSchema'
import messages from '../Messages'

class UserSettings extends Component {
  state = {
    formData: {},
    isSaving: false,
    saveComplete: false,
  }

  /** Save the latest settings modified by the user */
  saveLatestSettings = _debounce((settings, subscriptions) => {
    this.setState({isSaving: true, saveComplete: false})

    const editableUser = AsEditableUser(settings)
    editableUser.normalizeDefaultBasemap()

    Promise.all([
      this.props.updateUserSettings(this.props.user.id, editableUser),
      this.props.updateNotificationSubscriptions(this.props.user.id, subscriptions),
    ]).then(() =>
      this.setState({isSaving: false, saveComplete: true})
    )
  }, 750)

  /** Invoked when the form data is modified */
  changeHandler = ({formData}) => {
    this.setState({formData, saveComplete: false})
    const preparedData = this.prepareDataForSaving(formData)
    this.saveLatestSettings(_omit(preparedData, ['notificationSubscriptions']),
                            preparedData.notificationSubscriptions)
  }

  prepareDataForForm = userData => {
    if (!userData.notificationSubscriptions) {
      return userData
    }

    const subscriptionsArray = []
    _each(NotificationType, (constantValue, key) => {
      subscriptionsArray[constantValue] = userData.notificationSubscriptions[key]
    })

    return {...userData, notificationSubscriptions: subscriptionsArray}
  }

  prepareDataForSaving = formData => {
    const subscriptionsObject =
      _fromPairs(_map(formData.notificationSubscriptions, (setting, index) =>
        [keysByNotificationType[index], parseInt(setting, 10)]
    ))
    return {...formData, notificationSubscriptions: subscriptionsObject}
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

    const userSettings = _merge(this.prepareDataForForm({
      ...this.props.user.settings,
      notificationSubscriptions: this.props.user.notificationSubscriptions,
    }), this.state.formData)

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
      <section className="mr-section">
        <header className="mr-section__header">
          <h2 className="mr-h4">
            <FormattedMessage {...messages.header} />
          </h2>
          {saveIndicator}
        </header>

        <Form
          schema={jsSchema(this.props.intl, this.props.user, this.props.editor)}
          uiSchema={uiSchema(this.props.intl, this.props.user, this.props.editor)}
          widgets={{SelectWidget: CustomSelectWidget}}
          className="form form--2-col"
          liveValidate
          noHtml5Validate
          showErrorList={false}
          formData={userSettings}
          onChange={this.changeHandler}
          ObjectFieldTemplate={NoFieldsetObjectFieldTemplate}
        >
          <div className="form-controls" />
        </Form>
      </section>
    )
  }
}

export default WithStatus(injectIntl(UserSettings))
