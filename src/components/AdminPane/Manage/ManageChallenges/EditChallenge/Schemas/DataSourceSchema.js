import { DropzoneTextUpload }
       from '../../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import AsEditableChallenge
       from '../../../../../../interactions/Challenge/AsEditableChallenge'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import messages from '../Messages'

/**
 * Generates a JSON Schema describing datasource fields of Edit Challenge
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
export const jsSchema = (intl, user, challengeData, extraErrors, options={}) => {
  const sourceReadOnly = AsEditableChallenge(challengeData).isSourceReadOnly()

  const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      name: {
        title: intl.formatMessage(messages.nameLabel),
        type: "string",
        minLength: 3,
      },
    },
    required: ["name"],
  }

  const overpass = {
    properties: {
      source: { enum: ["Overpass Query"] },
      overpassQL: {
        title: " ",
        description: intl.formatMessage(messages.overpassQLDescription),
        type: "string",
      },
    },
  }

  const localUpload = {
    properties: {
      source: { enum: ["Local File"] },
      localGeoJSON: {
        title: " ",
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
        title: " ",
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
      enumNames: [
        intl.formatMessage(messages.overpassQLLabel),
        intl.formatMessage(messages.localGeoJsonLabel),
        intl.formatMessage(messages.remoteGeoJsonLabel),
      ],
      default: "Overpass Query",
    }

    if (extraErrors && extraErrors.localGeoJSON) {
      schema.properties.ignoreSourceErrors = {
        title: intl.formatMessage(messages.ignoreSourceErrorsLabel),
        type: "boolean",
        default: false,
      }
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
    schema.properties = Object.assign(
      schema.properties,
      _omit(overpass.properties, ['dataOriginDate'])
    )
  }
  else if (!_isEmpty(challengeData.remoteGeoJson)) {
    schema.properties = Object.assign(
      schema.properties,
      _omit(remoteUrl.properties, ['source'])
    )
  }
  else {
    schema.properties = Object.assign(
      schema.properties,
      _omit(localUpload.properties, ['source'])
    )
  }

  return schema
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
  const sourceReadOnly = AsEditableChallenge(challengeData).isSourceReadOnly()

  return {
    name: {
      "ui:help": intl.formatMessage(messages.nameDescription),
      "ui:groupHeader": options.longForm ? intl.formatMessage(messages.dataSourceStepHeader) : undefined,
    },
    source: {
      "ui:field": "columnRadio",
      "ui:help": intl.formatMessage(messages.dataSourceDescription),
    },
    overpassQL: {
      "ui:widget": "textarea",
      "ui:placeholder": intl.formatMessage(messages.overpassQLPlaceholder),
      "ui:readonly": sourceReadOnly,
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
    "ui:order": [
      "name", "source", "overpassQL", "localGeoJSON", "remoteGeoJson",
      "ignoreSourceErrors", "dataOriginDate"
    ],
  }
}
