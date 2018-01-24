import { DropzoneTextUpload } from '../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
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
export const jsSchema = intl => {
  return {
    "$schema": "http://json-schema.org/draft-06/schema#",
    title: intl.formatMessage(messages.step2Label),
    description: intl.formatMessage(messages.step2Description),
    type: "object",
    properties: {
      source: {
        title: intl.formatMessage(messages.sourceLabel),
        type: "string",
        enum: [
          "Overpass Query",
          "Local File",
          "Remote URL",
        ],
        default: "Overpass Query",
      }
    },
    required: ["source"],
    dependencies: {
      source: {
        oneOf: [
          {
            properties: {
              source: { enum: ["Overpass Query"] },
              overpassQL: {
                title: intl.formatMessage(messages.overpassQLLabel),
                description: intl.formatMessage(messages.overpassQLDescription),
                type: "string",
              },
            },
            required: ["overpassQL"],
          },
          {
            properties: {
              source: { enum: ["Local File"] },
              localGeoJSON: {
                title: intl.formatMessage(messages.localGeoJsonLabel),
                description: intl.formatMessage(messages.localGeoJsonDescription),
                type: "string",
              },
            },
            required: ["localGeoJSON"],
          },
          {
            properties: {
              source: { enum: ["Remote URL"] },
              remoteGeoJson: {
                title: intl.formatMessage(messages.remoteGeoJsonLabel),
                description: intl.formatMessage(messages.remoteGeoJsonDescription),
                type: "string",
              },
            },
            required: ["remoteGeoJson"],
          },
        ],
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
  source: {
    "ui:widget": "radio",
  },
  overpassQL: {
    "ui:widget": "textarea",
    "ui:placeholder": "Enter Overpass API query here...",
  },
  localGeoJSON: {
    "ui:widget": DropzoneTextUpload,
  },
  remoteGeoJson: {
    "ui:placeholder": "http://www.example.com/geojson.json",
  },
}
