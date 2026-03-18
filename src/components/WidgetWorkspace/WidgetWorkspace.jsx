import classNames from "classnames";
import _cloneDeep from "lodash/cloneDeep";
import _find from "lodash/find";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _map from "lodash/map";
import _omit from "lodash/omit";
import PropTypes from "prop-types";
import { Component, Fragment } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import AppErrors from "../../services/Error/AppErrors";
import {
  generateWidgetId,
  importRecommendedConfiguration,
  nextAvailableConfigurationLabel,
} from "../../services/Widget/Widget";
import BusySpinner from "../BusySpinner/BusySpinner";
import Button from "../Button/Button";
import ConfirmAction from "../ConfirmAction/ConfirmAction";
import Dropdown from "../Dropdown/Dropdown";
import External from "../External/External";
import WithErrors from "../HOCs/WithErrors/WithErrors";
import Header from "../Header/Header";
import ImportFileModal from "../ImportFileModal/ImportFileModal";
import Modal from "../Modal/Modal";
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
    showRecommendedModal: false,
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

  /**
   * Returns the widget keys for a given configuration, used for comparing layouts.
   */
  configWidgetKeys = (conf) => {
    if (!conf?.widgets) return [];
    return conf.widgets.map((w) => w?.widgetKey).filter(Boolean);
  };

  /**
   * Checks if a saved (non-recommended) configuration matches the recommended
   * layout by comparing widget keys.
   */
  findMatchingSavedLayout = () => {
    const recommended = this.props.workspaceConfigurations?.recommendedLayout;
    if (!recommended) return null;

    const recommendedKeys = this.configWidgetKeys(recommended);
    const savedConfigs = _omit(this.props.workspaceConfigurations, ["recommendedLayout"]);

    return _find(savedConfigs, (conf) => _isEqual(this.configWidgetKeys(conf), recommendedKeys));
  };

  /**
   * Returns true if the current configuration already matches the recommended
   * layout (either it IS the transient recommended layout, or it's a saved
   * layout with the same widget keys).
   */
  isUsingRecommended = () => {
    const { currentConfiguration, workspaceConfigurations } = this.props;
    if (!workspaceConfigurations?.recommendedLayout || !currentConfiguration) return false;

    if (currentConfiguration.id === "recommendedLayout") return true;

    const recommendedKeys = this.configWidgetKeys(workspaceConfigurations.recommendedLayout);
    const currentKeys = this.configWidgetKeys(currentConfiguration);
    return _isEqual(currentKeys, recommendedKeys);
  };

  showRecommendedLayoutModal = (closeDropdown) => {
    if (this.isUsingRecommended()) {
      closeDropdown();
      return;
    }

    // If there's already a saved layout matching the recommended one, just switch to it
    const matchingSaved = this.findMatchingSavedLayout();
    if (matchingSaved) {
      this.props.switchWorkspaceConfiguration(matchingSaved.id, this.props.currentConfiguration);
      closeDropdown();
      return;
    }

    this.setState({ showRecommendedModal: true });
    closeDropdown();
  };

  useRecommendedTemporarily = () => {
    this.setState({ showRecommendedModal: false });
    const recommended = this.props.workspaceConfigurations?.recommendedLayout;
    if (recommended) {
      this.props.switchWorkspaceConfiguration(recommended.id, this.props.currentConfiguration);
    }
  };

  saveRecommendedAsMyLayout = () => {
    this.setState({ showRecommendedModal: false });
    const recommended = this.props.workspaceConfigurations?.recommendedLayout;
    if (!recommended) return;

    // Check if there's already a saved layout matching the recommended one
    const matchingSaved = this.findMatchingSavedLayout();
    if (matchingSaved) {
      this.props.switchWorkspaceConfiguration(matchingSaved.id, this.props.currentConfiguration);
      return;
    }

    const existingLabels = Object.values(
      _omit(this.props.workspaceConfigurations, ["recommendedLayout"]),
    ).map((conf) => conf.label);
    const newLayout = _cloneDeep(recommended);
    newLayout.id = generateWidgetId();
    newLayout.label = nextAvailableConfigurationLabel("Recommended Layout", existingLabels);
    newLayout.active = true;
    this.props.saveWorkspaceConfiguration(newLayout);
    setTimeout(() => {
      this.props.switchWorkspaceConfiguration(newLayout.id, this.props.currentConfiguration);
    }, 500);
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
                isUsingRecommended={this.isUsingRecommended()}
                switchConfiguration={this.switchConfiguration}
                switchAltConfiguration={this.switchAltConfiguration}
                showRecommendedLayoutModal={this.showRecommendedLayoutModal}
                closeDropdown={dropdown.closeDropdown}
                toggleDropdownVisible={dropdown.toggleDropdownVisible}
              />
            )}
            dropdownContent={(dropdown) => (
              <ListLayoutItems
                workspaceConfigurations={this.props.workspaceConfigurations}
                currentConfiguration={this.props.currentConfiguration}
                isUsingRecommended={this.isUsingRecommended()}
                switchConfiguration={this.switchConfiguration}
                switchAltConfiguration={this.switchAltConfiguration}
                showRecommendedLayoutModal={this.showRecommendedLayoutModal}
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
        {this.state.showRecommendedModal && (
          <External>
            <Modal narrow isActive onClose={() => this.setState({ showRecommendedModal: false })}>
              <div className="mr-flex mr-flex-col mr-items-center mr-px-8 mr-pt-12">
                <SvgSymbol
                  className="mr-fill-green-lighter mr-h-10 mr-mb-4"
                  viewBox="0 0 20 20"
                  sym="cog-icon"
                />
                <h2 className="mr-text-white mr-text-3xl mr-mb-4">
                  <FormattedMessage {...messages.recommendedLayoutLabel} />
                </h2>
                <p className="mr-text-white mr-font-medium mr-text-center">
                  <FormattedMessage {...messages.saveRecommendedPrompt} />
                </p>
              </div>
              <div className="mr-mt-8 mr-bg-blue-cloudburst mr-p-8 mr-flex mr-justify-center mr-items-center">
                <button
                  className="mr-button mr-button--white mr-mr-4"
                  onClick={this.useRecommendedTemporarily}
                >
                  <FormattedMessage {...messages.useTemporarilyLabel} />
                </button>
                <button
                  className="mr-button mr-button--green-lighter"
                  onClick={this.saveRecommendedAsMyLayout}
                >
                  <FormattedMessage {...messages.saveAsDefaultLabel} />
                </button>
              </div>
            </Modal>
          </External>
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
          {props.isUsingRecommended && "✓"}
          <a
            className="mr-ml-2"
            onClick={() => props.showRecommendedLayoutModal(props.closeDropdown)}
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
        {props.isUsingRecommended && props.workspaceConfigurations.recommendedLayout ? (
          <li className="mr-normal-case mr-flex">
            <div className="mr-text-white mr-w-4">{"✓"}</div>
            <FormattedMessage {...messages.recommendedLayoutLabel} />
          </li>
        ) : props.workspaceConfigurations.recommendedLayout ? (
          <>
            <li className="mr-normal-case mr-flex">
              <a onClick={() => props.showRecommendedLayoutModal(props.closeDropdown)}>
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
