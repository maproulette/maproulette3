import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
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

  addConfiguration = () => {
    const newConf = this.props.addNewWorkspaceConfiguration()
    this.startEditingLayout(newConf)
  }

  deleteConfiguration = () => {
    this.props.deleteWorkspaceConfiguration(this.props.currentConfiguration.id)
  }

  componentDidCatch(error, info) {
    // Mark this workspace configuration as broken. This can happen if a
    // widget has a problem. We'll be automatically switched to a working
    // layout (with a fresh one being generated if need be).
    this.props.markWorkspaceConfigurationBroken()
    this.props.addError(AppErrors.widgetWorkspace.renderFailure)
  }

  configurationItems = () => {
    return _map(this.props.workspaceConfigurations, conf => (
      <li key={conf.id}
          className={classNames({"is-active": conf.id === this.props.currentConfiguration.id})}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a onClick={() => this.props.switchWorkspaceConfiguration(conf.id)}>
          {conf.label}
        </a>
      </li>
    ))
  }

  headerActions = () => {
    if (this.isEditing()) {
      return (
        <ul className="mr-list-buttons mr-mb-3">
          <li>
            <Button className="mr-button--white" onClick={this.doneEditingLayout}>
              <FormattedMessage {...messages.saveConfigurationLabel} />
            </Button>
          </li>
        </ul>
      )
    }
    else {
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
              button={<LayoutButton {...this.props} />}
            >
              <h3 className="mr-text-base mr-font-bold mr-mb-2">
                <FormattedMessage {...messages.switchTo} />
              </h3>
              <ol className="mr-list-dropdown">
                {this.configurationItems()}
              </ol>
              <hr className="mr-rule-dropdown" />
              <ol className="mr-list-dropdown mr-links-inverse">
                <li>
                  <ConfirmAction>
                    <Link to={{}} onClick={this.deleteConfiguration}>
                      <FormattedMessage {...messages.deleteConfigurationLabel} />
                    </Link>
                  </ConfirmAction>
                </li>
                <li>
                  <Link to={{}} onClick={() => this.addConfiguration()}>
                    <FormattedMessage {...messages.addConfigurationLabel} />
                  </Link>
                </li>
              </ol>
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
        <div className="mr-flex mr-justify-start mr-items-center">
          <label className="mr-text-greener mr-mr-2">Layout Name:</label>
          <QuickTextBox suppressControls
                        text={this.state.newConfigurationName}
                        setText={this.setNewName}
          />
        </div>
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
        <WidgetGrid {...this.props}
                    isEditing={this.isEditing()}
                    editNameControl={editNameBox}
                    workspace={this.props.currentConfiguration} />
      </div>
    )
  }
}

const LayoutButton = function(props) {
  return (
    <span className="mr-flex">
      <b className="mr-mr-1">{props.currentConfiguration.label}</b>
      <SvgSymbol
        sym="cog-icon"
        viewBox="0 0 15 15"
        className="mr-fill-green-lighter mr-w-3 mr-h-3"
      />
    </span>
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
