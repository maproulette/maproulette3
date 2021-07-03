import React, { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import Form from "@rjsf/core";
import _each from "lodash/each";
import _get from "lodash/get";
import _pick from "lodash/pick";
import _merge from "lodash/merge";
import _map from "lodash/map";
import _fromPairs from "lodash/fromPairs";
import _isUndefined from "lodash/isUndefined";
import _isEmpty from "lodash/isEmpty";
import _isFinite from "lodash/isFinite";
import _debounce from "lodash/debounce";
import _remove from "lodash/remove";
import _find from "lodash/find";
import _cloneDeep from "lodash/cloneDeep";
import _uniq from "lodash/uniq";
import _countBy from "lodash/countBy";
import _findLastIndex from "lodash/findLastIndex";
import _trim from "lodash/trim";
import { basemapLayerSources } from "../../../services/Challenge/ChallengeBasemap/ChallengeBasemap";
import { LayerSources } from "../../../services/VisibleLayer/LayerSources";
import {
  NotificationSubscriptionType,
  NotificationCountType,
  keysWithCountTypes,
} from "../../../services/Notification/NotificationType/NotificationType";
import { ChallengeBasemap } from "../../../services/Challenge/ChallengeBasemap/ChallengeBasemap";
import AsEditableUser from "../../../interactions/User/AsEditableUser";
import WithStatus from "../../../components/HOCs/WithStatus/WithStatus";
import BusySpinner from "../../../components/BusySpinner/BusySpinner";
import SvgSymbol from "../../../components/SvgSymbol/SvgSymbol";
import {
  CustomSelectWidget,
  NoFieldsetObjectFieldTemplate,
  CustomArrayFieldTemplate,
} from "../../../components/Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter";
import {
  jsSchema as settingsJsSchema,
  uiSchema as settingsUiSchema,
} from "./UserSettingsSchema";
import {
  jsSchema as notificationsJsSchema,
  uiSchema as notificationsUiSchema,
} from "./NotificationSettingsSchema";
import messages from "../Messages";

class UserSettings extends Component {
  state = {
    settingsFormData: {},
    notificationsFormData: {},
    isSaving: false,
    saveComplete: false,
  };

  /** Save the latest user settings modified by the user */
  saveUserSettings = _debounce((settings) => {
    // We cannot save the user settings if the basemap names are not unique.
    // Otherwise, this will mess up our attempts to match the server generated
    // id with the matching custom basemap with that name.
    if (!this.areBasemapNamesUnique(settings.customBasemaps)) {
      return;
    }

    this.setState({ isSaving: true, saveComplete: false });

    const editableUser = AsEditableUser(_cloneDeep(settings));

    // Massage customBasemaps json:
    // 1.don't send if name or url has not been completed yet
    // 2. insert id: -1 if it's a new customBasemap
    if (editableUser.customBasemaps) {
      _remove(
        editableUser.customBasemaps,
        (data) => _isEmpty(_trim(data.name)) || _isEmpty(_trim(data.url))
      );
      editableUser.customBasemaps.forEach((data) => {
        if (!data.id) {
          data.id = -1;
        }
      });
    }

    editableUser.normalizeDefaultBasemap(
      LayerSources,
      editableUser.customBasemaps
    );

    this.props
      .updateUserSettings(this.props.user.id, editableUser)
      .then((results) => {
        // Make sure the correct defaultBasemapId is set on the form.
        // If a custom basemap was removed that was also set as the default,
        // then this would be set back to None by the normalizeDefaultBasemap().
        const updatedUser = _get(results, "entities.users", [])[
          this.props.user.id
        ];
        const settingsFormData = _cloneDeep(this.state.settingsFormData);
        settingsFormData.defaultBasemap = _get(
          updatedUser,
          "settings.defaultBasemapId",
          "-1"
        );

        // If we have new customBasemaps data in our state then we need to update any
        // matching new mappings with the server generated id.
        if (_get(updatedUser, "settings.customBasemaps")) {
          const serverBasemaps = _get(updatedUser, "settings.customBasemaps");
          _each(settingsFormData.customBasemaps, (basemap) => {
            if (
              !basemap.id &&
              !_isEmpty(basemap.url) &&
              !_isEmpty(basemap.name) &&
              _find(serverBasemaps, (m) => m.name === basemap.name)
            ) {
              basemap.id = _find(
                serverBasemaps,
                (m) => m.name === basemap.name
              ).id;
            }
          });
        }

        // Save the customBasemaps frmo the server in state so we we can match
        // the newly generated
        this.setState({
          isSaving: false,
          saveComplete: true,
          settingsFormData: settingsFormData,
        });
      });
  }, 750);

  /** Save the latest notification settings modified by the user */
  saveNotificationSettings = _debounce((settings) => {
    if (_isEmpty(settings)) {
      return;
    }

    this.setState({ isSaving: true, saveComplete: false });
    this.props
      .updateNotificationSubscriptions(this.props.user.id, settings)
      .then(() => this.setState({ isSaving: false, saveComplete: true }));
  }, 750);

  /** Invoked when the form data is modified */
  settingsChangeHandler = ({ formData }) => {
    this.setState({ settingsFormData: formData, saveComplete: false });
    this.saveUserSettings(formData);
  };

  areBasemapNamesUnique = (basemaps) => {
    if (!basemaps) return true;
    return _uniq(_map(basemaps, "name")).length === basemaps.length;
  };

  validate = (formData, errors) => {
    // Validates that all custom basemap names are unique.
    const basemapNames = _countBy(formData.customBasemaps, (bm) => bm.name);
    _each(basemapNames, (count, name) => {
      if (count > 1) {
        const badIndex = _findLastIndex(
          formData.customBasemaps,
          (bm) => bm.name === name
        );
        if (errors.customBasemaps[badIndex]) {
          errors.customBasemaps[badIndex].addError(
            this.props.intl.formatMessage(messages.uniqueCustomBasemapError)
          );
        }
      }
    });

    return errors;
  };

  notificationsChangeHandler = (userSettings, { formData }) => {
    // The user's email address comes in from the notifications data even
    // though its technically a user setting

    const toUpdateSettings = _merge({}, userSettings, _pick(formData, "email"));
    if (this.state.settingsFormData.customBasemaps) {
      toUpdateSettings.customBasemaps =
        this.state.settingsFormData.customBasemaps;
    }
    this.settingsChangeHandler({ formData: toUpdateSettings });

    this.setState({
      notificationsFormData: formData,
      saveComplete: false,
    });

    const subscriptionsObject = _fromPairs(
      _map(formData.notificationSubscriptions, (setting, index) => [
        keysWithCountTypes[index],
        parseInt(setting, 10),
      ])
    );

    this.saveNotificationSettings(subscriptionsObject);
  };

  prepareNotificationsDataForForm = (settingsData, notificationsData) => {
    if (!notificationsData.notificationSubscriptions) {
      return notificationsData;
    }

    const notificationTypes = {
      ...NotificationSubscriptionType,
      ...NotificationCountType,
    };

    const subscriptionsArray = [];
    _each(notificationTypes, (constantValue, key) => {
      subscriptionsArray[constantValue] =
        notificationsData.notificationSubscriptions[key];
    });

    return {
      email: settingsData.email,
      notificationSubscriptions: subscriptionsArray,
    };
  };

  componentDidMount() {
    // Make sure our user info is current
    if (_get(this.props, "user.isLoggedIn")) {
      this.props.loadCompleteUser(this.props.user.id);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.user && this.props.user.id !== _get(prevProps, "user.id")) {
      if (this.props.user.isLoggedIn) {
        this.props.loadCompleteUser(this.props.user.id);
      }
    }
  }

  render() {
    // Setup a saving indicator if needed, which is a busy spinner during
    // saving and then a check-mark once saving is complete
    let saveIndicator = null;
    if (this.state.isSaving) {
      saveIndicator = <BusySpinner inline />;
    } else if (this.state.saveComplete) {
      saveIndicator = (
        <SvgSymbol
          sym="check-icon"
          className="mr-fill-green-lighter mr-w-4 mr-h-4"
          viewBox="0 0 20 20"
        />
      );
    }

    const userSettings = _merge(
      {},
      this.props.user.settings,
      this.state.settingsFormData
    );

    // The server uses two fields to represent the default basemap: a legacy
    // numeric identifier and a new optional string identifier for layers from
    // the OSM Editor Layer Index. If we're editing a legacy challenge that
    // doesn't use the layer index string identifiers, then we convert the
    // numeric id to an appropriate string identifier here (assuming it is
    // specifying a default layer at all).
    if (_isUndefined(this.state.settingsFormData.defaultBasemap)) {
      if (!_isEmpty(userSettings.defaultBasemapId)) {
        // layer index string
        userSettings.defaultBasemap = userSettings.defaultBasemapId;
      } else if (_isFinite(userSettings.defaultBasemap)) {
        // numeric identifier
        // Convert to corresponding layer-index string identifier for form if
        // possible. Otherwise just go with string representation of numerical
        // id, which is still used to represent things like a custom basemap
        // indicator (this is a bit of a hack to support everything in a single
        // form field)
        userSettings.defaultBasemap =
          basemapLayerSources()[userSettings.defaultBasemap] ||
          userSettings.defaultBasemap.toString();
      }
    }

    // Make sure the userSettings picks up the customBasemaps changes.
    // If a customBasemap is removed then then merge above will still include it
    // in the list.
    if (this.state.settingsFormData.customBasemaps) {
      userSettings.customBasemaps = this.state.settingsFormData.customBasemaps;
    }

    // If we still have no default basemap, let's set it to a default of "-1"
    if (!userSettings.defaultBasemap) {
      userSettings.defaultBasemap = ChallengeBasemap.none.toString();
    }

    const notificationSettings = _merge(
      this.prepareNotificationsDataForForm(userSettings, {
        notificationSubscriptions: this.props.user.notificationSubscriptions,
      }),
      this.state.notificationsFormData
    );

    return (
      <section className="mr-section mr-mt-0">
        <header className="mr-section__header mr-mt-0">
          <h2 className="mr-h4 mr-flex mr-items-baseline mr-text-white">
            <FormattedMessage {...messages.header} />
            <span className="mr-ml-4">{saveIndicator}</span>
          </h2>
        </header>

        <Form
          schema={settingsJsSchema(
            this.props.intl,
            this.props.user,
            this.props.editor
          )}
          uiSchema={settingsUiSchema(
            this.props.intl,
            this.props.user,
            this.props.editor
          )}
          widgets={{ SelectWidget: CustomSelectWidget }}
          className="form form--2-col"
          liveValidate
          noHtml5Validate
          showErrorList={false}
          validate={this.validate}
          formData={userSettings}
          onChange={this.settingsChangeHandler}
          ObjectFieldTemplate={NoFieldsetObjectFieldTemplate}
          ArrayFieldTemplate={CustomArrayFieldTemplate}
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
          widgets={{ SelectWidget: CustomSelectWidget }}
          className="form form--2-col"
          liveValidate
          noHtml5Validate
          showErrorList={false}
          formData={notificationSettings}
          onChange={(params) =>
            this.notificationsChangeHandler(userSettings, params)
          }
          ObjectFieldTemplate={NoFieldsetObjectFieldTemplate}
        >
          <div className="form-controls" />
        </Form>
      </section>
    );
  }
}

export default WithStatus(injectIntl(UserSettings));
