import { ZOOM_LEVELS,
         MIN_ZOOM,
         MAX_ZOOM,
         DEFAULT_ZOOM }
       from '../../../../../services/Challenge/ChallengeZoom/ChallengeZoom'
import { ChallengeBasemap,
         challengeOwnerBasemapLayerLabels }
       from '../../../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { LayerSources } from '../../../../../services/VisibleLayer/LayerSources'
import _get from 'lodash/get'
import _without from 'lodash/without'
import _map from 'lodash/map'
import _isString from 'lodash/isString'
import _filter from 'lodash/filter'
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
  const localizedBasemapLabels = challengeOwnerBasemapLayerLabels(intl)

  const defaultBasemapChoices = [
    { id: ChallengeBasemap.none.toString(), name: localizedBasemapLabels.none }
  ].concat(_map(_filter(LayerSources, source => !source.overlay),
                source => ({id: source.id.toString(), name: source.name}))).concat([
    { id: ChallengeBasemap.custom.toString(), name: localizedBasemapLabels.custom }
  ])

  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    title: intl.formatMessage(messages.step4Label),
    type: "object",
    properties: {
      updateTasks: {
        title: intl.formatMessage(messages.updateTasksLabel),
        type: "boolean",
        default: false,
      },
      defaultZoom: {
        title: intl.formatMessage(messages.defaultZoomLabel),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                   'REACT_APP_INITIAL_CHALLENGE_DEFAULT_ZOOM',
                   DEFAULT_ZOOM),
      },
      minZoom: {
        title: intl.formatMessage(messages.minZoomLabel),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                   'REACT_APP_INITIAL_CHALLENGE_MIN_ZOOM',
                   MIN_ZOOM),
      },
      maxZoom: {
        title: intl.formatMessage(messages.maxZoomLabel),
        type: "number",
        enum: ZOOM_LEVELS,
        default: numericEnvSetting(
                  'REACT_APP_INITIAL_CHALLENGE_MAX_ZOOM',
                  MAX_ZOOM),
      },
      defaultBasemap: {
        title: intl.formatMessage(messages.defaultBasemapLabel),
        type: "string",
        enum: _map(defaultBasemapChoices, 'id'),
        enumNames: _map(defaultBasemapChoices, 'name'),
        default: ChallengeBasemap.none.toString(),
      },
      exportableProperties: {
        title: intl.formatMessage(messages.exportablePropertiesLabel),
        type: "string",
      },
    },
    dependencies: { // Only show customBasemap if defaultBasemap set to Custom
      defaultBasemap: {
        oneOf: [
          {
            properties: {
              defaultBasemap: {
                enum: _without(_map(defaultBasemapChoices, 'id'), ChallengeBasemap.custom.toString()),
              }
            }
          },
          {
            properties: {
              defaultBasemap: {
                enum: [ChallengeBasemap.custom.toString()],
              },
              customBasemap: {
                title: intl.formatMessage(messages.customBasemapLabel),
                type: "string",
              },
            },
            required: ['customBasemap']
          }
        ]
      }
    }
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
export const uiSchema = intl => ({
  updateTasks: {
    "ui:widget": "radio",
    "ui:help": intl.formatMessage(messages.updateTasksDescription),
  },
  defaultZoom: {
    "ui:widget": "select",
    "ui:help": intl.formatMessage(messages.defaultZoomDescription),
  },
  minZoom: {
    "ui:widget": "select",
    "ui:help": intl.formatMessage(messages.minZoomDescription),
  },
  maxZoom: {
    "ui:widget": "select",
    "ui:help": intl.formatMessage(messages.maxZoomDescription),
  },
  defaultBasemap: {
    "ui:widget": "select",
    "ui:help": intl.formatMessage(messages.defaultBasemapDescription),
  },
  customBasemap: {
    "ui:emptyValue": "",
    "ui:help": intl.formatMessage(messages.customBasemapDescription, {dummy: ''}),
  },
  exportableProperties: {
    "ui:emptyValue": "",
    "ui:help": intl.formatMessage(messages.exportablePropertiesDescription),
  },
})

export const numericEnvSetting = (settingName, defaultValue) => {
  const setting = _get(process.env, settingName, defaultValue)
  return _isString(setting) ? parseInt(setting, 10) : setting
}
