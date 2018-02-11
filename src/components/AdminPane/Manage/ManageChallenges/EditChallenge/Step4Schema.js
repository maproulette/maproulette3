import { ZOOM_LEVELS,
         MIN_ZOOM,
         MAX_ZOOM,
         DEFAULT_ZOOM }
       from '../../../../../services/Challenge/ChallengeZoom/ChallengeZoom'
import { CHALLENGE_BASEMAP_NONE,
         ChallengeBasemap,
         basemapLayerLabels }
       from '../../../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _map from 'lodash/map'
import _isString from 'lodash/isString'
import messages from './Messages'

/**
 * Generates a JSON Schema describing Step 4 (extra info) of Edit Challenge
 * workflow intended for consumption by react-jsonschema-form.
 *
 * > Note that react-jsonschema-form only presents values for checkbox fields
 * > if they are checked, so it's best to specify radio buttons in the uiSchema
 * > for boolean fields if additional post-processing is to be avoided.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = intl => {
  const localizedBasemapLabels = basemapLayerLabels(intl)

  return {
    "$schema": "http://json-schema.org/draft-06/schema#",
    title: intl.formatMessage(messages.step4Label),
    type: "object",
    properties: {
      updateTasks: {
        title: intl.formatMessage(messages.updateTasksLabel),
        description: intl.formatMessage(messages.updateTasksDescription),
        type: "boolean",
        default: false,
      },
      defaultZoom: {
        title: intl.formatMessage(messages.defaultZoomLabel),
        description: intl.formatMessage(messages.defaultZoomDescription),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                   'REACT_APP_INITIAL_CHALLENGE_DEFAULT_ZOOM',
                   DEFAULT_ZOOM),
      },
      minZoom: {
        title: intl.formatMessage(messages.minZoomLabel),
        description: intl.formatMessage(messages.minZoomDescription),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                   'REACT_APP_INITIAL_CHALLENGE_MIN_ZOOM',
                   MIN_ZOOM),
      },
      maxZoom: {
        title: intl.formatMessage(messages.maxZoomLabel),
        description: intl.formatMessage(messages.maxZoomDescription),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                  'REACT_APP_INITIAL_CHALLENGE_MAX_ZOOM',
                  MAX_ZOOM),
      },
      defaultBasemap: {
        title: intl.formatMessage(messages.defaultBasemapLabel),
        description: intl.formatMessage(messages.defaultBasemapDescription),
        type: "number",
        enum: _values(ChallengeBasemap),
        enumNames: _map(ChallengeBasemap, (value, key) => localizedBasemapLabels[key]),
        default: CHALLENGE_BASEMAP_NONE,
      }
    },
  }
}

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields.
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type in
 * > the form configuration will help the Bulma/RJSFFormFieldAdapter generate the
 * > proper Bulma-compliant markup.
 */
export const uiSchema = {
  updateTasks: {
    "ui:widget": "radio",
  },
  defaultZoom: {
    "ui:widget": "select",
  },
  minZoom: {
    "ui:widget": "select",
  },
  maxZoom: {
    "ui:widget": "select",
  },
  defaultBasemap: {
    "ui:widget": "select",
  }
}

export const numericEnvSetting = (settingName, defaultValue) => {
  const setting = _get(process.env, settingName, defaultValue)
  return _isString(setting) ? parseInt(setting, 10) : setting
}
