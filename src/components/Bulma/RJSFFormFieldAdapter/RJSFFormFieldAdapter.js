import React from 'react'
import { get as _get,
         isString as _isString } from 'lodash'
import Dropzone from 'react-dropzone'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './RJSFFormFieldAdapter.css'

/**
 * CustomFieldTemplate returns an appropriate input field template for the
 * given react-jsonschema-form field data that is structured in a mostly
 * Bulma-compliant manner using Bulma classes. We don't have complete control
 * over the markup, so in some cases it's an approximation and we rely on the
 * css styling to fix things up.
 *
 * @see See [react-jsonschema-form](https://github.com/mozilla-services/react-jsonschema-form)
 */
export const CustomFieldTemplate = props => {
  // If the field has errors, mark the form context to let it know the
  // form is not valid. This is necessary because, even though RJSF performs
  // field-level validation at initialization, it does not inform any top-level
  // handlers of these errors until the data is actually modified by the user.
  if (_get(props, 'rawErrors.length', 0) > 0) {
    props.formContext.isValid = false
  }

  // RJSF starts with an artificial 'root' field. We basically ignore it,
  // just rendering the children within a wrapper div.
  if (props.id === 'root') {
    return <div className="form-fields-wrapper">{props.children}</div>
  }

  // Decide which template to render based on the ui:widget field in the
  // given uiSchema. It's recommended that an explicit widget type is set
  // in the uiSchema for anything other than a basic text input in order
  // to ensure the proper template is used.
  switch(_get(props, 'uiSchema.ui:widget')) {
    case 'select':
      return SelectField(props)
    case 'checkbox':
    case 'radio':
      return CheckboxField(props)
    default:
      return InputField(props)
  }
}

/**
 * SelectField is a Bulma template for RJSF select fields
 */
export const SelectField = ({id, label, required, rawDescription, children}) => (
  <div className="field is-horizontal">
    <div className="field-label">
      <label className="label">
        {label}
        {required ? <span className='required'>*</span> : null}
      </label>
    </div>
    <div className="field-body">
      <div className="field">
        <div className="control">
          <div className="select">{children}</div>
          {_isString(rawDescription) && <div className="help">{rawDescription}</div>}
        </div>
      </div>
    </div>
  </div>
)

/**
 * InputField is a Bulma template for RJSF text input fields. It's also compatible
 * with textarea fields with some css tweaks.
 */
export const InputField = ({id, label, required, rawDescription, rawErrors, children}) => (
  <div className="field is-horizontal">
    <div className="field-label">
      <label className="label">
        {label}
        {required ? <span className='required'>*</span> : null}
      </label>
    </div>
    <div className="field-body">
      <div className="field">
        <div className="control">
          {_get(rawErrors, 'length', 0) > 0 &&
           <div className="errors">{rawErrors.join('; ')}</div>
          }
          {children}
          {_isString(rawDescription) && <div className="help">{rawDescription}</div>}
        </div>
      </div>
    </div>
  </div>
)

/**
 * CheckboxField is a Bulma template for RJSF checkbox fields. It's also compatible
 * with radio group fields with some css tweaks.
 */
export const CheckboxField = ({id, label, required, rawDescription, children}) => (
  <div className="field is-horizontal">
    <div className="field-label">
      <label className="label">
        {label}
        {required ? <span className='required'>*</span> : null}
      </label>
    </div>
    <div className="field-body">
      <div className="field">
        <div className="control">
          {children}
          {_isString(rawDescription) && <div className="help">{rawDescription}</div>}
        </div>
      </div>
    </div>
  </div>
)

/**
 * Provides a custom Dropzone widget for extracting *text* content (like
 * GeoJSON) from a local file into a string field in the form. To use, this
 * function needs to be imported into the schema and passed directly as the
 * value of the uiSchema ui:widget field of the property in question (e.g.
 * `"ui:widget": DropzoneTextUpload`). The form field should be of type string,
 * and it will be set with the text content of the uploaded file.
 */
export const DropzoneTextUpload = ({required, onChange}) => (
  <Dropzone className="dropzone" acceptClassName="active" multiple={false} disablePreview
            onDrop={files =>
              extractFileContentAsString(files[0]).then(content => onChange(content))}>
    {({acceptedFiles}) => {
      if (acceptedFiles.length > 0) {
        return (
          <p>
            <SvgSymbol className="success" viewBox='0 0 20 20' sym="check-icon" />
          </p>
        )
      }
      else {
        return (
          <div>
            <FormattedMessage {...messages.prompt} />
            <p><SvgSymbol viewBox='0 0 20 20' sym="upload-icon" /></p>
          </div>
        )
      }
    }}
  </Dropzone>
)

/**
 * Helper function that returns a Promise that extracts the content from the
 * given file and resolves with the content as a string.
 */
const extractFileContentAsString = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.readyState === FileReader.DONE) {
        resolve(reader.result)
      }
    }
    reader.onabort = () => reject(new Error('upload-failed', 'File upload failed'))
    reader.onerror = () => reject(new Error('upload-failed', 'File upload failed'))

    reader.readAsText(file)
  })
}
