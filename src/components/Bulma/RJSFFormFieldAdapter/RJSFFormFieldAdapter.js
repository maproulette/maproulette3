import React, { Component } from 'react'
import classNames from 'classnames'
import _get from 'lodash/get'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _isArray from 'lodash/isArray'
import TagsInput from 'react-tagsinput'
import Dropzone from 'react-dropzone'
import OriginalSelectWidget
       from 'react-jsonschema-form/lib/components/widgets/SelectWidget'
import { FormattedMessage } from 'react-intl'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import MarkdownTemplate from '../../MarkdownContent/MarkdownTemplate'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import 'react-tagsinput/react-tagsinput.css'
import './RJSFFormFieldAdapter.scss'

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
 * MarkdownEditField renders a textarea and markdown preview side-by-side.
 */
export class MarkdownEditField extends Component {
  render() {
    const showMustacheNote = /{{/.test(this.props.formData) // tags present

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
          <div>
            {showMustacheNote &&
              <div className="mr-italic mr-text-xs">
                <FormattedMessage {...messages.addMustachePreviewNote} />
              </div>
            }
            <MarkdownTemplate content={this.props.formData || ""}
                              properties={{}}
                              completionResponses={{}}
                              setCompletionResponse={() => {}}
                              lightMode={this.props.uiSchema["ui:lightMode"]}
                              disableTemplate={true}/>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export const TagsInputField = props => {
  let tags = []
  if (_isArray(props.formData)) {
    tags = _map(props.formData, (tag) => tag.name ? tag.name : tag)
  }
  else if (_isString(props.formData) && props.formData !== "") {
    tags = props.formData.split(',')
  }

  return (
    <div className="tags-field">
      <TagsInput {...props}
                 inputProps={{placeholder: "Add keyword"}}
                 value={tags}
                 onChange={tags => props.onChange(tags.join(','))}
                 addOnBlur />
    </div>
  )
}

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
      <div className="readonly-file mr-text-pink">
        <FormattedMessage {...messages.readOnlyFile} />
      </div>
    )
  }

  return (
    <Dropzone
      acceptClassName="active"
      multiple={false}
      disablePreview
      onDrop={files => {
        formContext[id] = {file: files[0]}
        onChange(files[0].name)
      }}
    >
      {({acceptedFiles, getRootProps, getInputProps, ...params}) => {
        const body = acceptedFiles.length > 0 ? <p>{acceptedFiles[0].name}</p> : (
          <React.Fragment>
            <SvgSymbol
              viewBox='0 0 20 20'
              sym="upload-icon"
              className="mr-fill-current mr-w-3 mr-h-3 mr-mr-4"
            />
            <FormattedMessage {...messages.uploadFilePrompt} />
            <input {...getInputProps()} />
          </React.Fragment>
        )

        return (
          <div
            className="dropzone mr-text-grey mr-p-4 mr-border-2 mr-rounded mr-mx-auto"
            {...getRootProps()}
          >
            {body}
          </div>
        )
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
      <MarkdownContent markdown={description} lightMode />
    </div>
  )
}
