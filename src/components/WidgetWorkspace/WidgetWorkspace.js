import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import AppErrors from '../../services/Error/AppErrors'
import WithErrors from '../HOCs/WithErrors/WithErrors'
import WidgetGrid from '../WidgetGrid/WidgetGrid'
import QuickTextBox from '../QuickTextBox/QuickTextBox'
import ConfirmAction from '../ConfirmAction/ConfirmAction'
import Button from '../Button/Button'
import Dropdown from '../Dropdown/Dropdown'
import Header from '../Header/Header'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import ExportLayoutModal from './ExportLayoutModal'
import ImportLayoutModal from './ImportLayoutModal'
import messages from './Messages'
import './WidgetWorkspace.scss'

/**
 * Renders a widget workspace with the given configuration, expanding it with
 * default settings as needed. Only widgets compatible with the given data
 * targets will be shown or offered.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class WidgetWorkspace extends Component {
  state = {
    isEditingId: null,
    isExportingLayout: false,
    isImportingLayout: false,
  }

  startEditingLayout = (conf=this.props.currentConfiguration) => {
    this.setState({isEditingId: conf.id, newConfigurationName: conf.label})
  }

  doneEditingLayout = () => {
    // Layout changes are automatically saved as they are made, but the
    // workspace name needs to be saved explicitly
    if (!_isEmpty(this.state.newConfigurationName)) {
      this.props.renameWorkspaceConfiguration(this.state.isEditingId,
                                              this.state.newConfigurationName)
    }

    this.setState({isEditingId: null, newConfigurationName: null})
  }

  isEditing = (conf=this.props.currentConfiguration) => {
    return this.state.isEditingId === conf.id
  }

  setNewName = newConfigurationName => this.setState({newConfigurationName})

  renameConfiguration = () => {
    this.props.renameWorkspaceConfiguration(this.state.isEditingId,
                                            this.state.newConfigurationName)
    this.setState({isEditingId: null})
  }

  addConfiguration = closeDropdown => {
    const newConf = this.props.addNewWorkspaceConfiguration()
    this.startEditingLayout(newConf)
    closeDropdown()
  }

  resetConfiguration = closeDropdown => {
    this.props.resetWorkspaceConfiguration(this.props.currentConfiguration.id)
    closeDropdown()
  }

  beginExportingConfiguration = closeDropdown => {
    this.setState({isExportingLayout: true})
    closeDropdown()
  }

  exportConfiguration = exportName => {
    this.props.exportWorkspaceConfiguration(this.props.currentConfiguration.id, exportName)
    this.setState({isExportingLayout: false})
  }

  importConfiguration = closeDropdown => {
    this.setState({isImportingLayout: true})
    closeDropdown()
  }

  deleteConfiguration = closeDropdown => {
    this.props.deleteWorkspaceConfiguration(this.props.currentConfiguration.id)
    closeDropdown()
  }

  switchConfiguration = (configurationId, closeDropdown) => {
    this.props.switchWorkspaceConfiguration(configurationId)
    closeDropdown()
  }

  componentDidCatch(error, info) {
    // Mark this workspace configuration as broken. This can happen if a
    // widget has a problem. We'll be automatically switched to a working
    // layout (with a fresh one being generated if need be).
    this.props.markWorkspaceConfigurationBroken()
    this.props.addError(AppErrors.widgetWorkspace.renderFailure)
  }

  headerActions = () => {
    if (!this.isEditing()) {
      return (
        <React.Fragment>
          <Button onClick={() => this.startEditingLayout()}>
            <FormattedMessage {...messages.editConfigurationLabel} />
          </Button>
          <div className="mr-text-xs mr-flex mr-pt-2 mr-whitespace-no-wrap">
            <span className="mr-mr-1">
              <FormattedMessage {...messages.currentlyUsing} />
            </span>
            <Dropdown
              className="mr-dropdown--right"
              dropdownButton={dropdown =>
                <LayoutButton
                  {...this.props}
                  toggleDropdownVisible={dropdown.toggleDropdownVisible}
                />
              }
              dropdownContent={dropdown =>
                <ListLayoutItems
                  workspaceConfigurations={this.props.workspaceConfigurations}
                  currentConfiguration={this.props.currentConfiguration}
                  switchConfiguration={this.switchConfiguration}
                  addConfiguration={this.addConfiguration}
                  resetConfiguration={this.resetConfiguration}
                  beginExportingConfiguration={this.beginExportingConfiguration}
                  importConfiguration={this.importConfiguration}
                  deleteConfiguration={this.deleteConfiguration}
                  closeDropdown={dropdown.closeDropdown}
                />
              }
            >
            </Dropdown>
          </div>
        </React.Fragment>
      )
    }
  }

  render() {
    if (!this.props.currentConfiguration) {
      return (
        <div className="pane-loading">
          <BusySpinner />
        </div>
      )
    }

    let editNameBox = null
    if (this.isEditing(this.props.currentConfiguration)) {
      editNameBox = (
        <React.Fragment>
          <label className="mr-text-greener mr-mr-2">Layout Name:</label>
          <QuickTextBox suppressControls
                        text={this.state.newConfigurationName}
                        setText={this.setNewName}
          />
        </React.Fragment>
      )
    }


    return (
      <div className={classNames("mr-widget-workspace", this.props.className)}>
        <Header
          className="mr-px-8"
          eyebrow={this.props.workspaceEyebrow}
          title={this.props.workspaceTitle || ''}
          info={this.props.workspaceInfo}
          actions={this.headerActions()}
        />
        <WidgetGrid
          {...this.props}
          isEditing={this.isEditing()}
          editNameControl={editNameBox}
          doneEditingControl={
            <Button className="mr-button--white" onClick={this.doneEditingLayout}>
              <FormattedMessage {...messages.saveConfigurationLabel} />
            </Button>
          }
          workspace={this.props.currentConfiguration}
        />
        {this.state.isExportingLayout &&
         <ExportLayoutModal
           onCancel={() => this.setState({isExportingLayout: false})}
           onDownload={this.exportConfiguration}
           exportName={this.props.currentConfiguration.label}
         />
        }
        {this.state.isImportingLayout &&
         <ImportLayoutModal
           onCancel={() => this.setState({isImportingLayout: false})}
           onUpload={file => this.props.importWorkspaceConfiguration(file)}
         />
        }
      </div>
    )
  }
}

const LayoutButton = function(props) {
  return (
    <button
      className="mr-dropdown__button"
      onClick={props.toggleDropdownVisible}
    >
      <span className="mr-flex">
        <b className="mr-mr-1">{props.currentConfiguration.label}</b>
        <SvgSymbol
          sym="cog-icon"
          viewBox="0 0 15 15"
          className="mr-fill-green-lighter mr-w-3 mr-h-3"
        />
      </span>
    </button>
  )
}

const ListLayoutItems = function(props) {
  const configurationItems = _map(props.workspaceConfigurations, conf => (
    <li
      key={conf.id}
      className={classNames(
        {"active": conf.id === props.currentConfiguration.id}
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a onClick={() => props.switchConfiguration(conf.id, props.closeDropdown)}>
        {conf.label}
      </a>
    </li>
  ))

  return (
    <React.Fragment>
      <h3 className="mr-text-base mr-font-bold mr-mb-2">
        <FormattedMessage {...messages.switchTo} />
      </h3>
      <ol className="mr-list-dropdown">
        {configurationItems}
      </ol>
      <hr className="mr-rule-dropdown" />
      <ol className="mr-list-dropdown mr-links-inverse">
        <li>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => props.addConfiguration(props.closeDropdown)}>
            <FormattedMessage {...messages.addConfigurationLabel} />
          </a>
        </li>
        <li>
          <ConfirmAction>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => props.resetConfiguration(props.closeDropdown)}>
              <FormattedMessage {...messages.resetConfigurationLabel} />
            </a>
          </ConfirmAction>
        </li>
        <li>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => props.beginExportingConfiguration(props.closeDropdown)}>
            <FormattedMessage {...messages.exportConfigurationLabel} />
          </a>
        </li>
        <li>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => props.importConfiguration(props.closeDropdown)}>
            <FormattedMessage {...messages.importConfigurationLabel} />
          </a>
        </li>
        <li>
          <ConfirmAction>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => props.deleteConfiguration(props.closeDropdown)}>
              <FormattedMessage {...messages.deleteConfigurationLabel} />
            </a>
          </ConfirmAction>
        </li>
      </ol>
    </React.Fragment>
  )
}

WidgetWorkspace.propTypes = {
  name: PropTypes.string.isRequired,
  workspaceTitle: PropTypes.node,
  targets: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]).isRequired,
  defaultConfiguration: PropTypes.func.isRequired,
}

WidgetWorkspace.defaultProps = {
  singleConfiguration: false,
}

export default WithErrors(injectIntl(WidgetWorkspace))
