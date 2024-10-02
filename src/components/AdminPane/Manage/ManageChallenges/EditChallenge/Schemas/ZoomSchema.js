import { ZOOM_LEVELS, MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM }
       from '../../../../../../services/Challenge/ChallengeZoom/ChallengeZoom'
import _get from 'lodash/get'
import _isString from 'lodash/isString'
import messages from '../Messages'

const STEP_ID = "Zoom"

/**
 * Generates a JSON Schema describing zoom fields of Edit Challenge
 * workflow intended for consumption by react-jsonschema-form
 *
 * > Note that react-jsonschema-form only presents values for checkbox fields
 * > if they are checked, so it's best to specify radio buttons in the uiSchema
 * > for boolean fields if additional post-processing is to be avoided
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = (intl) => {
  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      defaultZoom: {
        title: intl.formatMessage(messages.defaultZoomLabel),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                   'VITE_INITIAL_CHALLENGE_DEFAULT_ZOOM',
                   DEFAULT_ZOOM),
      },
      minZoom: {
        title: intl.formatMessage(messages.minZoomLabel),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                   'VITE_INITIAL_CHALLENGE_MIN_ZOOM',
                   MIN_ZOOM),
      },
      maxZoom: {
        title: intl.formatMessage(messages.maxZoomLabel),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                  'VITE_INITIAL_CHALLENGE_MAX_ZOOM',
                  MAX_ZOOM),
      }
    },
  }
  
}

/**
 * uiSchema configuration to assist react-jsonschema-form in determining
 * how to render the schema fields
 *
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * > Note: for anything other than text inputs, specifying the ui:widget type in
 * > the form configuration will help the RJSFFormFieldAdapter generate the
 * > proper markup
 */
export const uiSchema = (intl, user, challengeData, extraErrors, options={}) => {
  const isCollapsed = options.longForm && (options.collapsedGroups || []).indexOf(STEP_ID) === -1
  const toggleCollapsed = options.longForm && options.toggleCollapsed ? () => options.toggleCollapsed(STEP_ID) : undefined

  return {
    defaultZoom: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.defaultZoomDescription),
      "ui:collapsed": isCollapsed,
      "ui:toggleCollapsed": toggleCollapsed,
      "ui:groupHeader": options.longForm ? intl.formatMessage(messages.zoomStepHeader) : undefined,
    },
    minZoom: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.minZoomDescription),
      "ui:collapsed": isCollapsed,
    },
    maxZoom: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.maxZoomDescription),
      "ui:collapsed": isCollapsed,
    },
  }
}

/**
 * Returns a numeric .env file setting as a numeric, converting from string if
 * necessary
 */
export const numericEnvSetting = (settingName, defaultValue) => {
  const setting = _get(import.meta.env, settingName, defaultValue)
  return _isString(setting) ? parseInt(setting, 10) : setting
}
