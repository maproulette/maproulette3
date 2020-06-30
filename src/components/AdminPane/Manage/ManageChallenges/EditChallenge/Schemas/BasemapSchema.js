import { ChallengeBasemap,
         challengeOwnerBasemapLayerLabels }
       from '../../../../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { LayerSources } from '../../../../../../services/VisibleLayer/LayerSources'
import _without from 'lodash/without'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import messages from '../Messages'

/**
 * Generates a JSON Schema describing Basemap fields of Edit Challenge
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
    type: "object",
    properties: {
      defaultBasemap: {
        title: intl.formatMessage(messages.defaultBasemapLabel),
        type: "string",
        enum: _map(defaultBasemapChoices, 'id'),
        enumNames: _map(defaultBasemapChoices, 'name'),
        default: ChallengeBasemap.none.toString(),
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
 * > the form configuration will help the RJSFFormFieldAdapter generate the
 * > proper markup
 */
export const uiSchema = intl => ({
  defaultBasemap: {
    "ui:widget": "select",
    "ui:help": intl.formatMessage(messages.defaultBasemapDescription),
  },
  customBasemap: {
    "ui:emptyValue": "",
    "ui:help": intl.formatMessage(messages.customBasemapDescription),
  },
})
