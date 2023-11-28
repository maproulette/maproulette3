import React, { useState } from 'react'
import classNames from 'classnames'
import _get from 'lodash/get'
import _isString from 'lodash/isString'
import _map from 'lodash/map'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _isEmpty from 'lodash/isEmpty'
import _trim from 'lodash/trim'
import TagsInput from 'react-tagsinput'
import Dropzone from 'react-dropzone'
import OriginalSelectWidget
      from '@rjsf/core/lib/components/widgets/SelectWidget'
import OriginalTextWidget
      from '@rjsf/core/lib/components/widgets/TextWidget'
import OriginalCheckboxWidget 
      from '@rjsf/core/lib/components/widgets/CheckboxWidget'
import { FormattedMessage } from 'react-intl'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import Dropdown from '../../Dropdown/Dropdown'
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
  const addLabel = props.uiSchema["ui:addLabel"] ||
    <FormattedMessage {...messages.addPriorityRuleLabel} />
  const deleteLabel = props.uiSchema["ui:deleteLabel"]
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
          <button className={classNames(
            "is-clear array-field__item__control remove-item-button",
            !deleteLabel ? "button" : "mr-button mr-button mr-button--small")}
            onClick={element.onDropIndexClick(element.index)}>
           {deleteLabel ||
             <span className="icon is-danger">
               <SvgSymbol sym="trash-icon" viewBox='0 0 20 20' className="mr-w-5 mr-h-5"/>
             </span>
           }
          </button>
        }
      </div>
    </div>
  )

  return (
    <div className="array-field">
      {props.title &&
        <label className="control-label">{props.title}</label>
      }
      {itemFields}
      {props.canAdd &&
       <div className="array-field__block-controls">
         <button
           className="mr-button mr-button--small"
           onClick={props.onAddClick}
         >
           {addLabel}
         </button>
       </div>
      }
    </div>
  )
}

export const CustomFieldTemplate = function(props) {
  const {classNames, children, description, uiSchema, errors} = props
  const isCollapsed = _get(uiSchema, "ui:collapsed", false)
  return (
    <div className={classNames}>
      {uiSchema && uiSchema["ui:groupHeader"] &&
       <div className="mr-flex mr-justify-end mr-text-teal mr-text-lg mr-pt-4 mr-my-4 mr-border-t mr-border-teal-40">
         <span>{uiSchema["ui:groupHeader"]}</span>
         {uiSchema && uiSchema["ui:toggleCollapsed"] &&
           <button type="button" onClick={() => uiSchema["ui:toggleCollapsed"]()}>
             <SvgSymbol
               sym={isCollapsed ? "icon-cheveron-right" : "icon-cheveron-down"}
               viewBox="0 0 20 20"
               className="mr-fill-green-lighter mr-w-6 mr-h-6 mr-ml-2"
             />
           </button>
         }
       </div>
      }
      {uiSchema && uiSchema["ui:fieldGroupHeader"] && uiSchema["ui:toggleCollapsed"] &&
       <div
         className="mr-flex mr-text-mango mr-uppercase mr-text-md mr-mb-2 mr-cursor-pointer"
         onClick={() => uiSchema["ui:toggleCollapsed"]()}
       >
         <span>{uiSchema["ui:fieldGroupHeader"]}</span>
         <SvgSymbol
           sym={isCollapsed ? "icon-cheveron-right" : "icon-cheveron-down"}
           viewBox="0 0 20 20"
           className="mr-fill-green-lighter mr-w-6 mr-h-6 mr-ml-2"
         />
       </div>
      }
      {!isCollapsed &&
       <React.Fragment>
         <LabelWithHelp {...props} />
         {children}
         {errors}
         {description}
       </React.Fragment>
      }
    </div>
  )
}

export const CustomNotificationFieldTemplate = function(props) {
  const {classNames, children, description, errors} = props
  return (
    <div className={classNames}>
       <React.Fragment>
         <LabelWithHelp {...props} control />
         {children}
         {errors}
         {description}
       </React.Fragment>
    </div>
  )
}


/**
 * A custom select widget with the new-ui styling
 */
export const CustomSelectWidget = function(props) {
  return (
    <div className={classNames('form-select', props.className)}>
      <OriginalSelectWidget {...props} />
      <div className="mr-pointer-events-none mr-absolute mr-inset-y-0 mr-right-0 mr-flex mr-items-center mr-px-2 mr-text-grey">
        <SvgSymbol
          sym="icon-cheveron-down"
          viewBox="0 0 20 20"
          className="mr-fill-current mr-w-4 mr-h-4"
        />
      </div>
    </div>
  )
}

export const CustomCheckboxField = function(props) {
  return (
    <div className="mr-space-y-4">
      <p className="mr-text-mango mr-text-md mr-uppercase">  
        {props.schema.title}
        {props.required && <span className="mr-text-red-light mr-ml-1">*</span>}
      </p>
      <div className="mr-bg-blue-firefly-75 mr-pt-4 mr-px-4 mr-pb-6 mr-rounded">
        <MarkdownContent markdown={props.schema.agreementDescription} lightMode={false} />
        <div className="mr-items-center mr-flex mr-space-x-2">
          <OriginalCheckboxWidget {...props} label=""/>
          <p className="mr-text-mango mr-text-sm">
            <FormattedMessage {...props.schema.checkboxLabel} />
          </p>
        </div>
      </div>
    </div>
  )
}


/**
 * A custom text widget with the new-ui styling
 */
export const CustomTextWidget = function(props) {
  const ButtonAction = props.formContext.buttonAction

  return (
    <div>
      <OriginalTextWidget {...props} />
      {props.schema.withButton &&
        <ButtonAction buttonName={props.schema.withButton}
                      onChange={props.onChange}
                      value={props.value}
                      {...props.formContext} />
      }
    </div>
  )
}

export const ColumnRadioField = function(props) {
  return (
    <React.Fragment>
      <LabelWithHelp {...props} />
      {props.schema.enum.map((option, index) =>
        <div key={option} className="mr-flex mr-items-center mr-my-2">
          <input
            type="radio"
            name={props.name}
            value={option}
            checked={props.formData === option}
            className="mr-radio mr-mr-2"
            onChange={() => props.onChange(option)}
          />
          <label onClick={() => props.onChange(option)}>
            <MarkdownContent
              compact
              markdown={
                props.schema.enumNames ?
                props.schema.enumNames[index] :
                props.schema.enum[index]
              }
            />
          </label>
        </div>
      )}
    </React.Fragment>
  )
}

/**
 * MarkdownEditField renders a textarea and markdown preview side-by-side.
 */
export const MarkdownEditField = props => {
  const [showingPreview, setShowingPreview] = useState(false)
  const [formValues, setFormValues] = useState({})

  return (
    <React.Fragment>
      <LabelWithHelp {...props} />
      <div className="mr-flex mr-items-center mr-mb-2 mr-leading-tight mr-text-xxs">
        <button
          type="button"
          className={classNames(
            "mr-pr-2 mr-mr-2 mr-border-r mr-border-green mr-uppercase mr-font-medium",
            showingPreview ? "mr-text-green-lighter" : "mr-text-white"
          )}
          onClick={() => setShowingPreview(false)}
        >
          <FormattedMessage {...messages.writeLabel} />
        </button>
        <button
          type="button"
          className={classNames(
            "mr-uppercase mr-font-medium",
            !showingPreview ? "mr-text-green-lighter" : "mr-text-white"
          )}
          onClick={() => setShowingPreview(true)}
        >
          <FormattedMessage {...messages.previewLabel} />
        </button>
      </div>

      {showingPreview ?
       <React.Fragment>
         {props.uiSchema["ui:previewNote"] &&
           <div className="mr-text-sm mr-text-grey-light mr-italic">
             {props.uiSchema["ui:previewNote"]}
           </div>
         }
         <div
           className={
            props.previewClassName ?
            props.previewClassName :
            "mr-rounded mr-bg-black-15 mr-px-2 mr-py-1 mr-min-h-8"
           }
         >
           <MarkdownContent
             {...props}
             markdown={props.formData || ""}
             properties={{}}
             completionResponses={formValues}
             setCompletionResponse={(name, value) => {
               setFormValues(Object.assign({}, formValues, {[name]: value}))
             }}
             allowShortCodes
             allowFormFields
             allowPropertyReplacement
           />
         </div>
       </React.Fragment> :
       <textarea
         className="form-control mr-font-mono mr-text-sm"
         onChange={e => props.onChange(e.target.value)}
         value={props.formData}
       />
      }
    </React.Fragment>
  )
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
                 value={_map(tags, tag => (_isObject(tag) ? tag.name : tag))}
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
export const DropzoneTextUpload = ({id, onChange, readonly, formContext, dropAreaClassName}) => {
  const idRequirements = (id !== "root_taskWidgetLayout" && id !== "root")

  if (readonly && idRequirements) {
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
        onChange(files[0] ? files[0].name : files[0])
      }}
    >
      {({acceptedFiles, getRootProps, getInputProps}) => {
        const [uploadErrorText, setUploadErrorText] = useState('')

        if (acceptedFiles.length > 0) {
          const fileName = acceptedFiles[0].name;
          if (!fileName.endsWith('.geojson') && !fileName.endsWith('.json')) {
            acceptedFiles.pop();
            setUploadErrorText(
              <span className="mr-mr-4 mr-text-red-light mr-ml-1">
                { idRequirements ?
                  <FormattedMessage {...messages.uploadErrorGeoJSON} /> :
                  <FormattedMessage {...messages.uploadErrorJSON} />
                } 
              </span>
            );
          }
        }
        const body = acceptedFiles.length > 0 ? <p>{acceptedFiles[0].name}<input {...getInputProps()} /></p> : (
          <span className="mr-flex mr-items-center">
            <SvgSymbol
              viewBox='0 0 20 20'
              sym="upload-icon"
              className="mr-fill-current mr-w-3 mr-h-3 mr-mr-4"
            />
            {uploadErrorText}
              { idRequirements ?
                <FormattedMessage {...messages.uploadFilePromptGeoJSON} /> :
                <FormattedMessage {...messages.uploadFilePromptJSON} />
              } 
            <input {...getInputProps()} />
          </span>
        )

        return (
          <div
            className={
              dropAreaClassName ? dropAreaClassName : "dropzone mr-text-grey-lighter mr-p-4 mr-border-2 mr-rounded mr-mx-auto"
            }
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
    <div id={id} className="mr-text-grey-light mr-my-2">
      <MarkdownContent compact markdown={description} lightMode={false} />
    </div>
  )
}

export const LabelWithHelp = props => {
  const {id, displayLabel, label, required, control, rawHelp, schema, uiSchema} = props
  if (displayLabel === false || uiSchema["ui:displayLabel"] === false) {
    return null
  }

  const normalizedLabel = label ? _trim(label) : _trim(schema.title)
  if (_isEmpty(normalizedLabel)) {
    return null
  }

  const normalizedHelp = rawHelp ? rawHelp : uiSchema["ui:help"]

  return (
    <div className="mr-mb-2 mr-flex">
      <label htmlFor={id} className={control ? "mr-text-base mr-text-mango" : "mr-text-mango mr-text-md mr-uppercase mr-mb-2"}>  
        {normalizedLabel}
        {required && <span className="mr-text-red-light mr-ml-1">*</span>}
      </label>
      {!_isEmpty(normalizedHelp) &&
       <Dropdown
         className="mr-dropdown--offsetright"
         innerClassName="mr-bg-blue-darker"
         dropdownButton={dropdown => (
           <button
             type="button"
             onClick={dropdown.toggleDropdownVisible}
             className="mr-ml-4 mr-flex"
           >
             <SvgSymbol
               sym="info-icon"
               viewBox="0 0 20 20"
               className="mr-fill-green-lighter mr-w-4 mr-h-4"
             />
           </button>
         )}
         dropdownContent={() => (
           <div className="mr-w-96 mr-max-w-screen60 mr-whitespace-normal">
             <MarkdownContent markdown={normalizedHelp} lightMode={false} />
           </div>
         )}
       />
      }
    </div>
  )
}
