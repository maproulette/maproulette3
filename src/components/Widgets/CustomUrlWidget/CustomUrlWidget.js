import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import FileSaver from 'file-saver'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import AppErrors from '../../../services/Error/AppErrors'
import useMRProperties from '../../../hooks/UseMRProperties/UseMRProperties'
import CustomUrlList from '../../CustomUrlList/CustomUrlList'
import EditCustomUrl from '../../CustomUrlList/EditCustomUrl'
import ImportFileModal from '../../ImportFileModal/ImportFileModal'
import QuickWidget from '../../QuickWidget/QuickWidget'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import Dropdown from '../../Dropdown/Dropdown'
import messages from './Messages'

const CUSTOM_URL_SETTING = 'customUrls'

const descriptor = {
  widgetKey: 'CustomUrlWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 2,
  defaultHeight: 6,
}

/**
 * Widget that allows users to setup their own custom URLs/links that make use
 * of mustache tags for property replacement, making it easy to view 3rd-party
 * web pages (such as OpenStreetMap or OSMCha) that can show additional details
 * about the current task element, mapped area, etc.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const CustomUrlWidget = props => {
  const [editingUrl, setEditingUrl] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const mrProperties = useMRProperties(props.workspaceContext)

  const saveCustomUrl = urlFields => {
    if (!urlFields.id) {
      urlFields.id = uuidv4()
    }
    const urls = Object.assign({}, props.getUserAppSetting(props.user, CUSTOM_URL_SETTING))
    urls[urlFields.id] = urlFields
    props.updateUserAppSetting(props.user.id, {[CUSTOM_URL_SETTING]: urls})
  }

  const editCustomUrl = id => {
    setEditingUrl(id ? props.getUserAppSetting(props.user, CUSTOM_URL_SETTING)[id] : {})
  }

  const deleteCustomUrl = id => {
    const urls = Object.assign({}, props.getUserAppSetting(props.user, CUSTOM_URL_SETTING))
    delete urls[id]
    props.updateUserAppSetting(props.user.id, {[CUSTOM_URL_SETTING]: urls})
  }

  const exportUrls = () => {
    const urls = Object.assign({}, props.getUserAppSetting(props.user, CUSTOM_URL_SETTING))
    const exportData = {
      meta: {
        exportFormatVersion: 1,
        exportTimestamp: (new Date()).toISOString(),
      },
      customUrls: urls,
    }
    const exportBlob = new Blob(
      [JSON.stringify(exportData)],
      {type: "application/json;charset=utf-8"}
    )

    FileSaver.saveAs(exportBlob, "custom-urls.json")
  }

  const importUrls = importFile => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        let data = null
        try {
          data = JSON.parse(reader.result)
        }
        catch(error) {
          props.addError(AppErrors.file.formatIncorrect)
          reject()
          setIsImporting(false)
          return
        }

        if (!data || !data.customUrls || !data.meta || data.meta.exportFormatVersion !== 1) {
          props.addError(AppErrors.file.formatIncorrect)
          reject()
          setIsImporting(false)
          return
        }

        const urls = Object.assign(
          {},
          props.getUserAppSetting(props.user, CUSTOM_URL_SETTING),
          data.customUrls
        )
        props.updateUserAppSetting(props.user.id, {[CUSTOM_URL_SETTING]: urls})
        resolve(urls)
      }
      reader.readAsText(importFile)
    })
  }

  let headerControls = null
  let currentView = null

  if (editingUrl) {
    currentView = (
      <EditCustomUrl
        {...props}
        url={editingUrl}
        finish={urlFields => {
          if (urlFields) {
            saveCustomUrl(urlFields)
          }
          setEditingUrl(null)
        }}
      />
    )
  }
  else {
    currentView = (
      <CustomUrlList
        {...props}
        urls={props.getUserAppSetting(props.user, CUSTOM_URL_SETTING)}
        properties={mrProperties}
        editCustomUrl={editCustomUrl}
        deleteCustomUrl={deleteCustomUrl}
      />
    )

    headerControls=(
      <Dropdown
        className="mr-dropdown--right"
        dropdownButton={dropdown => (
          <button
            onClick={dropdown.toggleDropdownVisible}
            className="mr-flex mr-items-center mr-text-green-lighter"
          >
            <SvgSymbol
              sym="cog-icon"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-4 mr-h-4"
            />
          </button>
        )}
        dropdownContent={(dropdown) => (
          <ul className="mr-list-dropdown">
            <li>
              <button
                className="mr-text-current"
                onClick={() => setEditingUrl({})}
              >
                <FormattedMessage {...messages.createUrlLabel} />
              </button>
            </li>
            <li>
              <button
                className="mr-text-current"
                onClick={() => {
                  dropdown.closeDropdown()
                  exportUrls()
                }}
              >
                <FormattedMessage {...messages.exportUrlsLabel} />
              </button>
            </li>
            <li>
              <button
                className="mr-text-current"
                onClick={() => {
                  setIsImporting(true)
                  dropdown.closeDropdown()
                }}
              >
                <FormattedMessage {...messages.importUrlsLabel} />
              </button>
            </li>
          </ul>
        )}
      />
    )
  }

  return (
    <QuickWidget
      {...props}
      className=""
      widgetTitle={<FormattedMessage {...messages.title} />}
      rightHeaderControls={headerControls}
    >
      {currentView}
      {isImporting &&
        <ImportFileModal
          header={<FormattedMessage {...messages.importUrlsLabel} />}
          onCancel={() => setIsImporting(false)}
          onUpload={file => importUrls(file)}
        />
      }
    </QuickWidget>
  )
}

registerWidgetType(CustomUrlWidget, descriptor)
export default CustomUrlWidget
