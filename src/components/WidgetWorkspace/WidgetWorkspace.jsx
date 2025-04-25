import classNames from "classnames";
import _cloneDeep from "lodash/cloneDeep";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component, Fragment } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import AppErrors from "../../services/Error/AppErrors";
import { importRecommendedConfiguration } from "../../services/Widget/Widget";
import BusySpinner from "../BusySpinner/BusySpinner";
import Button from "../Button/Button";
import ConfirmAction from "../ConfirmAction/ConfirmAction";
import Dropdown from "../Dropdown/Dropdown";
import WithErrors from "../HOCs/WithErrors/WithErrors";
import Header from "../Header/Header";
import ImportFileModal from "../ImportFileModal/ImportFileModal";
import QuickTextBox from "../QuickTextBox/QuickTextBox";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import WidgetGrid from "../WidgetGrid/WidgetGrid";
import ExportLayoutModal from "./ExportLayoutModal";
import messages from "./Messages";
import "./WidgetWorkspace.scss";

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
    workspaceContext: {},
    activeRecommendedLayout: false,
  };

  componentDidUpdate() {
    if (!this.state.activeRecommendedLayout && this.props.task?.parent?.taskWidgetLayout) {
      const { task, workspaceConfigurations, saveWorkspaceConfiguration } = this.props;
      let recommendedLayout = task.parent.taskWidgetLayout.workspace;

      if (this.props.workspaceConfigurations?.recommendedLayout) {
        this.props.deleteWorkspaceConfiguration(
          this.props.workspaceConfigurations.recommendedLayout.id,
        );
      }

      if (recommendedLayout && !workspaceConfigurations.recommendedLayout) {
        this.setState({ activeRecommendedLayout: true });
        recommendedLayout.id = "recommendedLayout";
        recommendedLayout.label = "Recommended Layout";
        recommendedLayout.name = "taskCompletion";
        importRecommendedConfiguration(recommendedLayout);
        saveWorkspaceConfiguration(recommendedLayout);
      }
    }
  }

  componentWillUnmount() {
    if (this.props.workspaceConfigurations?.recommendedLayout) {
      this.props.deleteWorkspaceConfiguration(
        this.props.workspaceConfigurations.recommendedLayout.id,
      );
    }
  }

  startEditingLayout = (closeDropdown, conf = this.props.currentConfiguration) => {
    this.setState({
      originalConfiguration: _cloneDeep(conf),
      isEditingId: conf.id,
      newConfigurationName: conf.label,
    });
    closeDropdown();
  };

  cancelEditingLayout = () => {
    // Restore original configuration
    if (this.state.originalConfiguration) {
      this.props.saveWorkspaceConfiguration(this.state.originalConfiguration);
    }

    this.setState({
      originalConfiguration: null,
      isEditingId: null,
      newConfigurationName: null,
    });
  };

  doneEditingLayout = () => {
    // Layout changes are automatically saved as they are made, but the
    // workspace name needs to be saved explicitly
    if (!_isEmpty(this.state.newConfigurationName)) {
      this.props.renameWorkspaceConfiguration(
        this.state.isEditingId,
        this.state.newConfigurationName,
      );
    }

    this.setState({
      originalConfiguration: null,
      isEditingId: null,
      newConfigurationName: null,
    });
  };

  isEditing = (conf = this.props.currentConfiguration) => {
    return this.state.isEditingId === conf.id;
  };

  setNewName = (newConfigurationName) => this.setState({ newConfigurationName });

  renameConfiguration = () => {
    this.props.renameWorkspaceConfiguration(
      this.state.isEditingId,
      this.state.newConfigurationName,
    );
    this.setState({ isEditingId: null });
  };

  addConfiguration = (closeDropdown) => {
    const newConf = this.props.addNewWorkspaceConfiguration(this.props.currentConfiguration);
    this.startEditingLayout(closeDropdown, newConf);
  };

  resetConfiguration = (closeDropdown) => {
    this.props.resetWorkspaceConfiguration(this.props.currentConfiguration.id);
    closeDropdown();
  };

  beginExportingConfiguration = (closeDropdown) => {
    this.setState({ isExportingLayout: true });
    closeDropdown();
  };

  exportConfiguration = (exportName) => {
    this.props.exportWorkspaceConfiguration(this.props.currentConfiguration.id, exportName);
    this.setState({ isExportingLayout: false });
  };

  importConfiguration = (closeDropdown) => {
    this.setState({ isImportingLayout: true });
    closeDropdown();
  };

  deleteConfiguration = (closeDropdown) => {
    this.props.deleteWorkspaceConfiguration(this.props.currentConfiguration.id);
    closeDropdown();
  };

  setupWorkspaceAlt = (closeDropdown) => {
    this.props.setupWorkspaceAlt(this.props.currentConfiguration);
    closeDropdown();
  };

  switchConfiguration = (configurationId, closeDropdown) => {
    this.props.switchWorkspaceConfiguration(configurationId, this.props.currentConfiguration);
    closeDropdown();
  };

  switchAltConfiguration = (configurationId, type = "rightPanel", closeDropdown) => {
    this.props.switchWorkspaceAltConfiguration(
      configurationId,
      this.props.currentConfiguration,
      type,
    );
    closeDropdown();
  };

  setWorkspaceContext = (updatedContext) => {
    this.setState({
      workspaceContext: Object.assign({}, this.state.workspaceContext, updatedContext),
    });
  };

  componentDidCatch() {
    // Mark this workspace configuration as broken. This can happen if a
    // widget has a problem. We'll be automatically switched to a working
    // layout (with a fresh one being generated if need be).
    this.props.markWorkspaceConfigurationBroken();
    this.props.addError(AppErrors.widgetWorkspace.renderFailure);
  }

  headerActions = () => {
    if (!this.isEditing()) {
      return (
        <div className="mr-text-xs mr-flex mr-pt-3 mr-whitespace-nowrap mr-ml-24">
          <Dropdown
            className="mr-dropdown--right"
            dropdownButton={(dropdown) => (
              <LayoutButton
                {...this.props}
                switchConfiguration={this.switchConfiguration}
                switchAltConfiguration={this.switchAltConfiguration}
                closeDropdown={dropdown.closeDropdown}
                toggleDropdownVisible={dropdown.toggleDropdownVisible}
              />
            )}
            dropdownContent={(dropdown) => (
              <ListLayoutItems
                workspaceConfigurations={this.props.workspaceConfigurations}
                currentConfiguration={this.props.currentConfiguration}
                switchConfiguration={this.switchConfiguration}
                switchAltConfiguration={this.switchAltConfiguration}
                startEditingLayout={this.startEditingLayout}
                addConfiguration={this.addConfiguration}
                resetConfiguration={this.resetConfiguration}
                beginExportingConfiguration={this.beginExportingConfiguration}
                importConfiguration={this.importConfiguration}
                deleteConfiguration={this.deleteConfiguration}
                closeDropdown={dropdown.closeDropdown}
                setupWorkspaceAlt={this.setupWorkspaceAlt}
                hasLeftPanelOption={this.props.hasLeftPanelOption}
              />
            )}
          ></Dropdown>
        </div>
      );
    }
  };

  render() {
    if (!this.props.currentConfiguration) {
      return (
        <div className="pane-loading">
          <BusySpinner />
        </div>
      );
    }

    let editNameBox = null;
    if (this.isEditing(this.props.currentConfiguration)) {
      editNameBox = (
        <Fragment>
          <label className="mr-text-greener mr-mr-2 mr-ml-8">
            <FormattedMessage {...messages.configurationNameLabel} />
          </label>
          <QuickTextBox
            suppressControls
            text={this.state.newConfigurationName}
            setText={this.setNewName}
          />
        </Fragment>
      );
    }

    return (
      <div className={classNames("mr-widget-workspace", this.props.className)}>
        <Header
          className="mr-px-4"
          eyebrow={this.props.workspaceEyebrow}
          title={this.props.workspaceTitle || ""}
          info={this.props.workspaceInfo}
          subheader={this.props.subheader}
          actions={this.headerActions()}
        />
        <WidgetGrid
          {...this.props}
          isEditing={this.isEditing()}
          editNameControl={editNameBox}
          doneEditingControl={
            <Button className="mr-mr-4" onClick={this.doneEditingLayout}>
              <FormattedMessage {...messages.saveConfigurationLabel} />
            </Button>
          }
          cancelEditingControl={
            <Button className="mr-button--white" onClick={this.cancelEditingLayout}>
              <FormattedMessage {...messages.cancelConfigurationLabel} />
            </Button>
          }
          workspace={this.props.currentConfiguration}
          workspaceContext={this.state.workspaceContext}
          setWorkspaceContext={this.setWorkspaceContext}
          enhancedMapWidget={this.props.enhancedMapWidget}
        />
        {this.state.isExportingLayout && (
          <ExportLayoutModal
            onCancel={() => this.setState({ isExportingLayout: false })}
            onDownload={this.exportConfiguration}
            exportName={this.props.currentConfiguration.label}
          />
        )}
        {this.state.isImportingLayout && (
          <ImportFileModal
            header={<FormattedMessage {...messages.importModalHeader} />}
            onCancel={() => this.setState({ isImportingLayout: false })}
            onUpload={(file) =>
              this.props.importWorkspaceConfiguration(file, this.props.currentConfiguration)
            }
          />
        )}
      </div>
    );
  }
}

const LayoutButton = function (props) {
  return (
    <div className="mr-normal-case mr-flex">
      {props.workspaceConfigurations.recommendedLayout ? (
        <h3 className="mr-text-base mr-font-bold mr-mr-2">
          {props.workspaceConfigurations.recommendedLayout.id === props.currentConfiguration.id &&
            "✓"}
          <a
            className="mr-ml-2"
            onClick={() =>
              props.switchConfiguration(
                props.workspaceConfigurations.recommendedLayout.id,
                props.closeDropdown,
              )
            }
          >
            <FormattedMessage {...messages.useRecommendedLayoutLabel} />
          </a>
        </h3>
      ) : null}
      {props.setupWorkspaceAlt &&
        props.hasLeftPanelOption &&
        (props.currentConfiguration.type === "leftPanel" ? (
          <button
            type="button"
            className="mr-button mr-button--small mr-mr-4"
            onClick={() =>
              props.switchAltConfiguration(
                props.currentConfiguration?.id,
                "rightPanel",
                props.closeDropdown,
              )
            }
          >
            Switch to Right Panel
          </button>
        ) : props.currentConfiguration.type === "rightPanel" ? (
          <button
            type="button"
            className="mr-button mr-button--small mr-mr-4"
            onClick={() =>
              props.switchAltConfiguration(
                props.currentConfiguration?.id,
                "leftPanel",
                props.closeDropdown,
              )
            }
          >
            Switch to Left Panel
          </button>
        ) : null)}
      <button className="mr-dropdown__button" onClick={props.toggleDropdownVisible}>
        <SvgSymbol
          sym="cog-icon"
          viewBox="0 0 20 20"
          className="mr-fill-green-lighter mr-w-4 mr-h-4"
        />
      </button>
    </div>
  );
};

const ListLayoutItems = function (props) {
  const configurationItems = _map(props.workspaceConfigurations, (conf) => {
    if (conf.id !== "recommendedLayout") {
      return (
        <li key={conf.id} className="mr-normal-case mr-flex">
          <div className="mr-text-white mr-w-4">
            {conf.id === props.currentConfiguration.id && "✓"}
          </div>
          <a onClick={() => props.switchConfiguration(conf.id, props.closeDropdown)}>
            {conf.label}
          </a>
        </li>
      );
    }
    return null;
  });

  return (
    <Fragment>
      <h3 className="mr-text-base mr-font-bold mr-mb-2">
        <FormattedMessage {...messages.switchTo} />
      </h3>
      <ol className="mr-list-dropdown">{configurationItems}</ol>
      <hr className="mr-rule-dropdown" />
      <ol className="mr-list-dropdown">
        {props.currentConfiguration.id === "recommendedLayout" ? (
          <li className="mr-normal-case mr-flex">
            <div className="mr-text-white mr-w-4">{"✓"}</div>
            <FormattedMessage {...messages.recommendedLayoutLabel} />
          </li>
        ) : props.workspaceConfigurations.recommendedLayout ? (
          <>
            <li className="mr-normal-case mr-flex">
              <a
                onClick={() =>
                  props.switchConfiguration(
                    props.workspaceConfigurations.recommendedLayout.id,
                    props.closeDropdown,
                  )
                }
              >
                <FormattedMessage {...messages.recommendedLayoutLabel} />
              </a>
            </li>
            <li>
              <a onClick={() => props.startEditingLayout(props.closeDropdown)}>
                <FormattedMessage {...messages.editConfigurationLabel} />
              </a>
            </li>
            <li>
              <ConfirmAction>
                <a onClick={() => props.resetConfiguration(props.closeDropdown)}>
                  <FormattedMessage {...messages.resetConfigurationLabel} />
                </a>
              </ConfirmAction>
            </li>
          </>
        ) : (
          <>
            <li>
              <a onClick={() => props.startEditingLayout(props.closeDropdown)}>
                <FormattedMessage {...messages.editConfigurationLabel} />
              </a>
            </li>
            <li>
              <ConfirmAction>
                <a onClick={() => props.resetConfiguration(props.closeDropdown)}>
                  <FormattedMessage {...messages.resetConfigurationLabel} />
                </a>
              </ConfirmAction>
            </li>
          </>
        )}
        <li>
          <a onClick={() => props.addConfiguration(props.closeDropdown)}>
            <FormattedMessage {...messages.addConfigurationLabel} />
          </a>
        </li>
        {props.setupWorkspaceAlt && props.hasLeftPanelOption ? (
          <li>
            <a onClick={() => props.setupWorkspaceAlt(props.closeDropdown)}>
              Add Static Map Layout
            </a>
          </li>
        ) : null}
        <li>
          <a onClick={() => props.beginExportingConfiguration(props.closeDropdown)}>
            <FormattedMessage {...messages.exportConfigurationLabel} />
          </a>
        </li>
        <li>
          <a onClick={() => props.importConfiguration(props.closeDropdown)}>
            <FormattedMessage {...messages.importConfigurationLabel} />
          </a>
        </li>
        {props.currentConfiguration.id !== "recommendedLayout" ? (
          <li>
            <ConfirmAction>
              <a onClick={() => props.deleteConfiguration(props.closeDropdown)}>
                <FormattedMessage {...messages.deleteConfigurationLabel} />
              </a>
            </ConfirmAction>
          </li>
        ) : null}
      </ol>
    </Fragment>
  );
};

WidgetWorkspace.propTypes = {
  name: PropTypes.string.isRequired,
  workspaceTitle: PropTypes.node,
  targets: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  defaultConfiguration: PropTypes.func.isRequired,
};

WidgetWorkspace.defaultProps = {
  singleConfiguration: false,
};

export default WithErrors(injectIntl(WidgetWorkspace));
