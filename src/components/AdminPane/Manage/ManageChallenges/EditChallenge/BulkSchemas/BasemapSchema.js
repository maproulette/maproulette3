import { ChallengeBasemapBulkEdit,
         challengeOwnerBasemapLayerLabels }
       from '../../../../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { LayerSources } from '../../../../../../services/VisibleLayer/LayerSources'
import _without from 'lodash/without'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import messages from '../Messages'

const STEP_ID = "Basemap"

export const jsSchema = (intl) => {
  const localizedBasemapLabels = challengeOwnerBasemapLayerLabels(intl)

  const defaultBasemapChoices = [
    { id: ChallengeBasemapBulkEdit.unchanged.toString(), name: " " },
    { id: ChallengeBasemapBulkEdit.none.toString(), name: localizedBasemapLabels.none }
  ].concat(_map(_filter(LayerSources, source => !source.overlay),
                source => ({id: source.id.toString(), name: source.name}))).concat([
    { id: ChallengeBasemapBulkEdit.custom.toString(), name: localizedBasemapLabels.custom }
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
        default: ChallengeBasemapBulkEdit.unchanged.toString(),
      },
    },
    dependencies: { // Only show customBasemap if defaultBasemap set to Custom
      defaultBasemap: {
        oneOf: [
          {
            properties: {
              defaultBasemap: {
                enum: _without(_map(defaultBasemapChoices, 'id'), ChallengeBasemapBulkEdit.custom.toString()),
              }
            }
          },
          {
            properties: {
              defaultBasemap: {
                enum: [ChallengeBasemapBulkEdit.custom.toString()],
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

export const uiSchema = (intl, user, challengeData, extraErrors, options={}) => {
  const isCollapsed = options.longForm && (options.collapsedGroups || []).indexOf(STEP_ID) !== -1
  const toggleCollapsed = options.longForm && options.toggleCollapsed ? () => options.toggleCollapsed(STEP_ID) : undefined

  return {
    "ui:order": ["defaultBasemap", "customBasemap"],
    defaultBasemap: {
      "ui:widget": "select",
      "ui:help": intl.formatMessage(messages.defaultBasemapDescription),
      "ui:collapsed": isCollapsed,
      "ui:toggleCollapsed": toggleCollapsed,
      "ui:groupHeader": options.longForm ? intl.formatMessage(messages.basemapStepHeader) : undefined,
    },
    customBasemap: {
      "ui:emptyValue": "",
      "ui:help": intl.formatMessage(messages.customBasemapDescription),
      "ui:collapsed": isCollapsed,
    },
  }
}
