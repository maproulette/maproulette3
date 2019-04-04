import React, { Component } from 'react'
import classNames from 'classnames'
import _get from 'lodash/get'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import TagsInput from 'react-tagsinput'
import Dropzone from 'react-dropzone'
import OriginalSelectWidget
       from 'react-jsonschema-form/lib/components/widgets/SelectWidget'
import { FormattedMessage } from 'react-intl'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import 'react-tagsinput/react-tagsinput.css'
import './RJSFFormFieldAdapter.scss'

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
 * fieldset tags can't be styled using flexbox or grid in Chrome, so this
 * template attempts to render the fields the same way as the default but using
 * a div with class "fieldset" instead of a fieldset. To use it, set
 * `ObjectFieldTemplate={NoFieldsetObjectFieldTemplate}` in your Form
 *
 * > CAUTION: Support for expandable fields that would normally be rendered
 * > with an Add button has been removed, but it could be added back with a
 * > little work
 *
 * See: https://github.com/mozilla-services/react-jsonschema-form/issues/762
 */
export const NoFieldsetObjectFieldTemplate = function(props) {
  const { TitleField, DescriptionField } = props
  return (
    <div className="fieldset" id={props.idSchema.$id}>
      {(props.uiSchema['ui:title'] || props.title) && (
        <TitleField
          id={`${props.idSchema.$id}__title`}
          title={props.title || props.uiSchema['ui:title']}
          required={props.required}
          formContext={props.formContext}
        />
      )}
      {props.description && (
        <DescriptionField
          id={`${props.idSchema.$id}__description`}
          description={props.description}
          formContext={props.formContext}
        />
      )}
      {props.properties.map(prop => prop.content)}
    </div>
  )
}

export const CustomArrayFieldTemplate = props => {
  const itemFields = _map(props.items, element =>
    <div
      key={element.index}
      className={classNames("array-field__item", _get(props, 'uiSchema.items.classNames'))}
    >
      <div
        className={classNames({"inline": _get(props, 'uiSchema.items.ui:options.inline')})}
      >
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
 * A custom select widget with the new-ui styling (not Bulma)
 */
export const CustomSelectWidget = function(props) {
  return (
    <div className={classNames('form-select', props.className)}>
      <OriginalSelectWidget {...props} />
      <div className="mr-pointer-events-none mr-absolute mr-pin-y mr-pin-r mr-flex mr-items-center mr-px-2 mr-text-grey">
        <SvgSymbol
          sym="icon-cheveron-down"
          viewBox="0 0 20 20"
          className="mr-fill-current mr-w-4 mr-h-4"
        />
      </div>
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
      <React.Fragment>
        <label className="control-label">
          {this.props.schema.title}
          {this.props.required &&
           <span className="required">*</span>
          }
        </label>
        <div className="mr-grid mr-grid-columns-2 mr-grid-gap-8 mr-text-grey">
          <textarea className="form-control"
                    onChange={e => this.props.onChange(e.target.value)}
                    value={this.props.formData} />
          <MarkdownContent className="mr-markdown--light" markdown={this.props.formData} />
        </div>
      </React.Fragment>
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
export const DropzoneTextUpload = ({id, required, onChange, readonly, formContext}) => {
  if (readonly) {
    return (
      <div className="readonly-file">
        <FormattedMessage {...messages.readOnlyFile} />
      </div>
    )
  }

  return (
    <Dropzone
      className="dropzone mr-text-grey mr-p-4 mr-border-2 mr-rounded mr-mx-auto"
      acceptClassName="active"
      multiple={false}
      disablePreview
      onDrop={files => {
        formContext[id] = {file: files[0]}
        onChange(files[0].name)
      }}
    >
      {({acceptedFiles}) => {
        if (acceptedFiles.length > 0) {
          return <p>{acceptedFiles[0].name}</p>
        }
        else {
          return (
            <div>
              <SvgSymbol
                viewBox='0 0 20 20'
                sym="upload-icon"
                className="mr-fill-current mr-w-3 mr-h-3 mr-mr-4"
              />
              <FormattedMessage {...messages.uploadFilePrompt} />
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
