import { DropzoneTextUpload }
       from '../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import AsEditableChallenge
       from '../../../../../interactions/Challenge/AsEditableChallenge'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import messages from './Messages'

/**
 * Generates a JSON Schema describing Step 2 (GeoJSON) of Edit Challenge
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
export const jsSchema = (intl, user, challengeData) => {
  const sourceReadOnly = AsEditableChallenge(challengeData).isSourceReadOnly()

  const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    title: intl.formatMessage(messages.step2Label),
    description: intl.formatMessage(messages.step2Description),
    type: "object",
    properties: {}
  }

  const overpass = {
    properties: {
      source: { enum: ["Overpass Query"] },
      overpassQL: {
        title: intl.formatMessage(messages.overpassQLLabel),
        type: "string",
      },
    },
  }

  const localUpload = {
    properties: {
      source: { enum: ["Local File"] },
      localGeoJSON: {
        title: intl.formatMessage(messages.localGeoJsonLabel),
        type: "string",
      },
      dataOriginDate: {
        title: intl.formatMessage(messages.dataOriginDateLabel),
        type: "string",
        format: "date",
        default: new Date().toISOString().substring(0, 10),
      }
    },
  }

  const remoteUrl = {
    properties: {
      source: { enum: ["Remote URL"] },
      remoteGeoJson: {
        title: intl.formatMessage(messages.remoteGeoJsonLabel),
        type: "string",
      },
      dataOriginDate: {
        title: intl.formatMessage(messages.dataOriginDateLabel),
        type: "string",
        format: "date",
        default: new Date().toISOString().substring(0, 10),
      }
    },
  }

  if (!sourceReadOnly) {
    schema.properties.source = {
      title: intl.formatMessage(messages.sourceLabel),
      type: "string",
      enum: [
        "Overpass Query",
        "Local File",
        "Remote URL",
      ],
      default: "Overpass Query",
    }

    schema.properties.ignoreSourceErrors = {
      title: intl.formatMessage(messages.ignoreSourceErrorsLabel),
      type: "boolean",
      default: false,
    }

    schema.dependencies = {
      source: {
        oneOf: [
          overpass,
          localUpload,
          remoteUrl,
        ],
      }
    }
  }
  else if (!_isEmpty(challengeData.overpassQL)) {
    schema.properties = _omit(overpass.properties, ['source'])
    schema.properties = _omit(overpass.properties, ['dataOriginDate'])
  }
  else if (!_isEmpty(challengeData.remoteGeoJson)) {
    schema.properties = _omit(remoteUrl.properties, ['source'])
  }
  else {
    schema.properties = _omit(localUpload.properties, ['source'])
  }

  return schema
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
export const uiSchema = (intl, user, challengeData) => {
  const sourceReadOnly = AsEditableChallenge(challengeData).isSourceReadOnly()

  return {
    source: {
      "ui:widget": "radio",
    },
    overpassQL: {
      "ui:widget": "textarea",
      "ui:placeholder": intl.formatMessage(messages.overpassQLPlaceholder),
      "ui:readonly": sourceReadOnly,
      "ui:help": intl.formatMessage(messages.overpassQLDescription),
    },
    localGeoJSON: {
      "ui:widget": DropzoneTextUpload,
      "ui:readonly": sourceReadOnly,
    },
    remoteGeoJson: {
      "ui:placeholder": intl.formatMessage(messages.remoteGeoJsonPlaceholder),
      "ui:readonly": sourceReadOnly,
      "ui:help": intl.formatMessage(messages.remoteGeoJsonDescription),
    },
    dataOriginDate: {
      "ui:help": intl.formatMessage(messages.dataOriginDateDescription),
    },
    ignoreSourceErrors: {
      "ui:widget": "radio",
      "ui:help": intl.formatMessage(messages.ignoreSourceErrorsDescription),
    },
    "ui:order": [ "*", "ignoreSourceErrors" ],
  }
}
