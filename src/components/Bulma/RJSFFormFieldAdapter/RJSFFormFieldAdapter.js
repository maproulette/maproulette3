import React, { Component } from 'react'
import classNames from 'classnames'
import _get from 'lodash/get'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import TagsInput from 'react-tagsinput'
import Dropzone from 'react-dropzone'
import { FormattedMessage } from 'react-intl'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import 'react-tagsinput/react-tagsinput.css'
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

export const CustomArrayFieldTemplate = props => {
  const itemFields = _map(props.items, element =>
    <div key={element.index} className="array-field__item">
      <div className={classNames({
        inline: _get(props, 'uiSchema.items.ui:options.inline')}
      )}>
        {element.children}

        {element.hasRemove &&
        <button className="button is-clear array-field__item__control remove-item-button"
                onClick={element.onDropIndexClick(element.index)}>
          <span className="icon is-danger">
            <SvgSymbol sym="trash-icon" viewBox='0 0 20 20' />
          </span>
        </button>
        }
      </div>
    </div>
  )

  return (
    <div className="array-field">
      {itemFields}
      {props.canAdd &&
       <div className="array-field__block-controls">
         <button className="button add-item-button" onClick={props.onAddClick}>
           <FormattedMessage {...messages.addPriorityRuleLabel} />
         </button>
       </div>
      }
    </div>
  )
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
          <MarkdownContent className="help" markdown={rawDescription} />
        </div>
      </div>
    </div>
  </div>
)

/**
 * MarkdownEditField renders a textarea and markdown preview side-by-side.
 */
export class MarkdownEditField extends Component {
  render() {
    return (
      <div className="markdown-edit-field">
        <textarea className="form-control"
                  onChange={e => this.props.onChange(e.target.value)}
                  value={this.props.formData} />
        <MarkdownContent className="markdown-preview" markdown={this.props.formData} />
      </div>
    )
  }
}

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
            <div className="errors">
              {_map(rawErrors, (error, index) =>
                <div className="error" key={index}>{error}</div>
              )}
            </div>
          }
          {children}
          <MarkdownContent className="help" markdown={rawDescription} />
        </div>
      </div>
    </div>
  </div>
)

export const TagsInputField = props => {
  return (
    <div className="tags-field">
      <TagsInput {...props}
                 inputProps={{placeholder: "Add keyword"}}
                 value={props.formData ? props.formData.split(',') : []}
                 onChange={tags => props.onChange(tags.join(','))}
                 addOnBlur />
    </div>
  )
}

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
          <MarkdownContent className="help" markdown={rawDescription} />
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
export const DropzoneTextUpload = ({required, onChange, readonly}) => {
  if (readonly) {
    return (
      <div className="readonly-file">
        <FormattedMessage {...messages.readOnlyFile} />
      </div>
    )
  }

  return (
    <Dropzone className="dropzone" acceptClassName="active" multiple={false} disablePreview
              onDrop={files =>
                extractFileContentAsString(files[0]).then(content => onChange(content))}>
      {({acceptedFiles}) => {
        if (acceptedFiles.length > 0) {
          return <p>{acceptedFiles[0].name}</p>
        }
        else {
          return (
            <div>
              <FormattedMessage {...messages.uploadFilePrompt} />
              <p><SvgSymbol viewBox='0 0 20 20' sym="upload-icon" /></p>
            </div>
          )
        }
      }}
    </Dropzone>
  )
}

/**
 * Interprets and renders the given field description as Markdown
 */
export const MarkdownDescriptionField = ({id, description}) => {
  if (!_isString(description)) {
    return null
  }

  return (
    <div id={id} className="field-description">
      <MarkdownContent markdown={description} />
    </div>
  )
}

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
