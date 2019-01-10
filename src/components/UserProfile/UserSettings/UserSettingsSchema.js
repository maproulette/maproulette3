import _map from 'lodash/map'
import _values from 'lodash/values'
import _without from 'lodash/without'
import _filter from 'lodash/filter'
import { Locale,
         localeLabels,
         defaultLocale } from '../../../services/User/Locale/Locale'
import { Editor,
         editorLabels } from '../../../services/Editor/Editor'
import { ChallengeBasemap,
         basemapLayerLabels }
       from '../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { LayerSources } from '../../../services/VisibleLayer/LayerSources'
import messages from './Messages'

/**
 * Generates a JSON Schema describing editable User Settings fields intended
 * for consumption by react-jsonschema-form.
 *
 * @param intl - intl instance from react-intl
 *
 * @see See http://json-schema.org
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const jsSchema = intl => {
  const localizedLocaleLabels = localeLabels(intl)
  const localizedEditorLabels = editorLabels(intl)
  const localizedBasemapLabels = basemapLayerLabels(intl)

  const defaultBasemapChoices = [
    { id: ChallengeBasemap.none.toString(), name: localizedBasemapLabels.none }
  ].concat(_map(_filter(LayerSources, source => !source.overlay),
                source => ({id: source.id, name: source.name}))).concat([
    { id: ChallengeBasemap.custom.toString(), name: localizedBasemapLabels.custom }
  ])

  return {
    "$schema": "http://json-schema.org/draft-06/schema#",
    type: "object",
    properties: {
      defaultEditor: {
        title: intl.formatMessage(messages.defaultEditorLabel),
        description: intl.formatMessage(messages.defaultEditorDescription),
        type: "number",
        enum: _values(Editor),
        enumNames: _map(Editor, (value, key) => localizedEditorLabels[key]),
        default: Editor.none,
      },
      locale: {
        title: intl.formatMessage(messages.localeLabel),
        description: intl.formatMessage(messages.localeDescription),
        type: "string",
        enum: _values(Locale),
        enumNames: _map(Locale, value => localizedLocaleLabels[value]),
        default: defaultLocale(),
      },
      defaultBasemap: {
        title: intl.formatMessage(messages.defaultBasemapLabel),
        description: intl.formatMessage(messages.defaultBasemapDescription),
        type: "string",
        enum: _map(defaultBasemapChoices, 'id'),
        enumNames: _map(defaultBasemapChoices, 'name'),
        default: ChallengeBasemap.none,
      },
      leaderboardOptOut: {
        title: intl.formatMessage(messages.leaderboardOptOutLabel),
        description: intl.formatMessage(messages.leaderboardOptOutDescription),
        type: "boolean",
        default: false,
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
                description: intl.formatMessage(messages.customBasemapDescription, {dummy: ''}),
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
export const uiSchema = {
  defaultEditor: {
    "ui:widget": "select",
  },
  defaultBasemap: {
    "ui:widget": "select",
  },
  customBasemap: {
    "ui:emptyValue": "",
  },
  locale: {
    "ui:widget": "select",
  },
  leaderboardOptOut: {
    "ui:widget": "radio",
  },
}
