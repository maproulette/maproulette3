import _find from "lodash/find";
import _omit from "lodash/omit";
import { Component } from "react";
import { Redirect } from "react-router";
import SignIn from "../../../pages/SignIn/SignIn";
import AppErrors from "../../../services/Error/AppErrors";
import {
  ensurePermanentWidgetsAdded,
  exportWorkspaceConfiguration,
  generateWidgetId,
  importWorkspaceConfiguration,
  migrateWidgetGridConfiguration,
  nextAvailableConfigurationLabel,
  pruneDecommissionedWidgets,
  pruneWidgets,
  widgetDescriptor,
} from "../../../services/Widget/Widget";
import BusySpinner from "../../BusySpinner/BusySpinner";
import WithCurrentUser from "../WithCurrentUser/WithCurrentUser";
import WithErrors from "../WithErrors/WithErrors";
import WithStatus from "../WithStatus/WithStatus";

/**
 * WithWidgetWorkspaces provides the WrappedComponent with access to the saved
 * workspace configurations as well as various workspace-configuration
 * management functions.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithWidgetWorkspacesInternal = function (
  WrappedComponent,
  targets,
  workspaceName,
  defaultConfiguration,
  defaultConfigurationAlt,
) {
  return class extends Component {
    state = {
      currentConfigurationId: null,
      defaultWorkspace: null,
      defaultWorkspaceAlt: null,
    };

    componentDidMount() {
      if (this.props.user) {
        const configurations = this.workspaceConfigurations();
        const currentWorkspace = this.currentConfiguration(configurations);
        if (!currentWorkspace) {
          this.setState({ defaultWorkspace: this.setupWorkspace(defaultConfiguration) });
        }
      }
    }

    /**
     * Sets up a brand-new workspace based on the given default configuration
     * function
     */
    setupWorkspace = (defaultConfiguration) => {
      const conf = defaultConfiguration();
      // Ensure default layout honors properties from each widget's descriptor
      for (let i = 0; i < conf.widgets.length; i++) {
        const widget = conf.widgets[i];
        if (widget) {
          conf.layout[i] = Object.assign(
            {},
            {
              minW: widget.minWidth,
              maxW: widget.maxWidth,
              minH: widget.minHeight,
              maxH: widget.maxHeight,
            },
            conf.layout[i],
          );
        }
      }

      return conf;
    };

    /**
     * switch to alternative workspace default
     */
    setupWorkspaceAlt = (currentConfig) => {
      const newConfiguration = this.setupWorkspace(defaultConfigurationAlt);
      newConfiguration.label = nextAvailableConfigurationLabel(
        newConfiguration.label,
        this.workspaceConfigurationLabels(),
      );

      this.saveWorkspaceConfiguration(newConfiguration);
      setTimeout(() => {
        this.switchWorkspaceConfiguration(newConfiguration.id, currentConfig);
      }, 500);
      return newConfiguration;
    };

    /**
     * Retrieves all workspaces from the user's app settings
     *
     * @private
     */
    allUserWorkspaces = () => {
      // workspaces used to be stored as "dashboards", so continue to look
      // there too for legacy reasons
      return (
        this.props.getUserAppSetting(this.props.user, "workspaces") ||
        this.props.getUserAppSetting(this.props.user, "dashboards") ||
        {}
      );
    };

    /**
     * Retrieves all configurations for the current workspace
     *
     * @private
     */
    workspaceConfigurations = () => {
      return this.allUserWorkspaces()[workspaceName] || {};
    };

    /**
     * Retrieves all configuration labels in use for the current workspace
     *
     * @private
     */
    workspaceConfigurationLabels = () => {
      return Object.values(this.workspaceConfigurations()).map((conf) => conf.label);
    };

    /**
     * Completes a given workspace configuration, filling in missing fields
     * with reasonable default values
     *
     * @private
     */
    completeWorkspaceConfiguration = (initialWorkspace) => {
      const defaultConfig =
        initialWorkspace.type === "leftPanel" || initialWorkspace.type === "rightPanel"
          ? defaultConfigurationAlt
          : defaultConfiguration;

      let configuration = Object.assign(
        {
          id: generateWidgetId(),
          targets: Array.isArray(targets) ? targets : [targets], // store as array
          cols: 12,
          rowHeight: 30,
          widgets: [],
          layout: [],
        },
        initialWorkspace,
      );

      // Generate a simple layout if none provided, with one widget per row
      if (configuration.layout.length === 0) {
        let nextY = 0;
        for (const widgetConf of configuration.widgets) {
          configuration.layout.push({
            i: generateWidgetId(),
            x: 0,
            y: nextY,
            w: widgetConf.defaultWidth,
            minW: widgetConf.minWidth,
            maxW: widgetConf.maxWidth,
            h: widgetConf.defaultHeight,
            minH: widgetConf.minHeight,
            maxH: widgetConf.maxHeight,
          });

          nextY += widgetConf.defaultHeight;
        }
      } else {
        // A layout was provided. If heights and/or widths were omitted or don't meet
        // current minimums, fill them in from the widget descriptors
        for (const [index, widgetLayout] of configuration.layout.entries()) {
          if (!configuration.widgets || !configuration.widgets[index]) {
            continue; // Skip this layout item instead of returning
          }

          const descriptor = widgetDescriptor(configuration.widgets[index].widgetKey);
          if (!descriptor) {
            continue; // Skip this layout item instead of returning
          }

          if (!Number.isFinite(widgetLayout.w)) {
            widgetLayout.w = descriptor.defaultWidth;
          } else if (Number.isFinite(descriptor.minWidth) && widgetLayout.w < descriptor.minWidth) {
            widgetLayout.w = descriptor.minWidth;
          }

          if (!Number.isFinite(widgetLayout.h)) {
            widgetLayout.h = descriptor.defaultHeight;
          } else if (
            Number.isFinite(descriptor.minHeight) &&
            widgetLayout.h < descriptor.minHeight
          ) {
            widgetLayout.h = descriptor.minHeight;
          }
        }
      }

      // Make sure workspace is upgraded to latest data model
      configuration = migrateWidgetGridConfiguration(configuration, () =>
        this.setupWorkspace(defaultConfig),
      );

      // Prune any widgets that have been decommissioned
      configuration = pruneDecommissionedWidgets(configuration);

      // Make sure excludedWidgets reflects latest from default configuration,
      // and prune any newly excluded widgets if necessary
      configuration.excludeWidgets = defaultConfig().excludeWidgets;
      if (configuration.excludeWidgets && configuration.excludeWidgets.length > 0) {
        configuration = pruneWidgets(configuration, configuration.excludeWidgets);
      }

      // Make sure any new permanent widgets are added into the configuration
      configuration.permanentWidgets = defaultConfig().permanentWidgets;
      configuration = ensurePermanentWidgetsAdded(configuration, defaultConfig());

      // Make sure conditionalWidgets reflect the latest from default configuration
      configuration.conditionalWidgets = defaultConfig().conditionalWidgets;

      return configuration;
    };

    /**
     * Change the active workspace configuration
     */
    switchWorkspaceConfiguration = (workspaceConfigurationId, currentConfig) => {
      const userWorkspaces = this.allUserWorkspaces();
      const newConfig = userWorkspaces[currentConfig.name][workspaceConfigurationId];

      userWorkspaces[currentConfig.name] = Object.assign({}, userWorkspaces[currentConfig.name], {
        [currentConfig.id]: { ...currentConfig, active: false },
      });

      userWorkspaces[newConfig.name] = Object.assign({}, userWorkspaces[newConfig.name], {
        [newConfig.id]: { ...newConfig, active: true },
      });

      this.props.updateUserAppSetting(this.props.user.id, {
        workspaces: userWorkspaces,
        dashboards: undefined, // clear out any legacy settings
      });

      this.setState({ currentConfigurationId: workspaceConfigurationId });
    };

    /**
     * switch to alternative workspace variant
     */
    switchWorkspaceAltConfiguration = (
      workspaceConfigurationId,
      currentConfig,
      type = "rightPanel",
    ) => {
      const userWorkspaces = this.allUserWorkspaces();
      const newConfig = userWorkspaces[currentConfig.name][workspaceConfigurationId];

      // Mark current config as inactive
      userWorkspaces[currentConfig.name] = Object.assign({}, userWorkspaces[currentConfig.name], {
        [currentConfig.id]: { ...currentConfig, active: false },
      });

      // Create updated version of the target config with the new type
      const updatedConfig = {
        ...newConfig,
        type: type,
        name: workspaceName,
        active: true,
      };

      // Save the updated config
      userWorkspaces[workspaceName] = Object.assign({}, userWorkspaces[workspaceName], {
        [workspaceConfigurationId]: updatedConfig,
      });

      // Update the app settings
      this.props.updateUserAppSetting(this.props.user.id, {
        workspaces: userWorkspaces,
        dashboards: undefined, // clear out any legacy settings
      });

      this.setState({ currentConfigurationId: workspaceConfigurationId });
    };

    /**
     * Persist the given workspace configuration object to the user's app
     * settings.
     */
    saveWorkspaceConfiguration = (workspaceConfiguration) => {
      // Assign an id if needed
      if (!workspaceConfiguration.id) {
        workspaceConfiguration.id = generateWidgetId();
      }

      const userWorkspaces = this.allUserWorkspaces();
      userWorkspaces[workspaceConfiguration.name] = Object.assign(
        {},
        userWorkspaces[workspaceConfiguration.name],
        { [workspaceConfiguration.id]: workspaceConfiguration },
      );

      this.props.updateUserAppSetting(this.props.user.id, {
        workspaces: userWorkspaces,
        dashboards: undefined, // clear out any legacy settings
      });
    };

    /**
     * Delete the given workspace configuration.
     */
    deleteWorkspaceConfiguration = (workspaceConfigurationId) => {
      const userWorkspaces = this.allUserWorkspaces();

      if (userWorkspaces[workspaceName]) {
        delete userWorkspaces[workspaceName][workspaceConfigurationId];
        this.props.updateUserAppSetting(this.props.user.id, { workspaces: userWorkspaces });
      }

      if (this.state.currentConfigurationId === workspaceConfigurationId) {
        this.setState({ currentConfigurationId: null });
      }
    };

    /**
     * Assign a new name to the given workspace configuration
     */
    renameWorkspaceConfiguration = (workspaceConfigurationId, newLabel) => {
      const configuration = this.workspaceConfigurations()[workspaceConfigurationId];

      if (configuration) {
        this.saveWorkspaceConfiguration(Object.assign({}, configuration, { label: newLabel }));
      }
    };

    /**
     * Reset the given workspace back to its default configuration, preserving
     * its label and id
     */
    resetWorkspaceConfiguration = (workspaceConfigurationId) => {
      const oldConfiguration = this.workspaceConfigurations()[workspaceConfigurationId];

      if (oldConfiguration) {
        const newConfiguration = this.setupWorkspace(defaultConfiguration);
        this.saveWorkspaceConfiguration(
          Object.assign({}, newConfiguration, {
            id: workspaceConfigurationId,
            label: oldConfiguration.label,
          }),
        );
      }
    };

    /**
     * Export a downloadable copy of the given workspace
     */
    exportWorkspaceConfiguration = (workspaceConfigurationId, exportName) => {
      return exportWorkspaceConfiguration(
        this.workspaceConfigurations()[workspaceConfigurationId],
        exportName,
      );
    };

    /**
     * Import a workspace layout for the given workspace from the given file
     */
    importWorkspaceConfiguration = (importFile, currentConfig) => {
      return importWorkspaceConfiguration(workspaceName, importFile)
        .then((importedConfiguration) => {
          const newConfiguration = this.completeWorkspaceConfiguration(importedConfiguration);
          newConfiguration.label = nextAvailableConfigurationLabel(
            newConfiguration.label,
            this.workspaceConfigurationLabels(),
          );
          this.saveWorkspaceConfiguration(newConfiguration);

          setTimeout(() => {
            this.switchWorkspaceConfiguration(newConfiguration.id, currentConfig);
          }, 500);
          return newConfiguration;
        })
        .catch((error) => {
          this.props.addErrorWithDetails(AppErrors.widgetWorkspace.importFailure, error.message);
          return null;
        });
    };

    /**
     * Retrieve the current, active configuration or a default configuration if
     * there is no active configuration
     */
    currentConfiguration = (configurations) => {
      const currentWorkspace =
        configurations[this.state.currentConfigurationId] ||
        _find(configurations, ({ active, isBroken }) => active && !isBroken) ||
        _find(configurations, ({ isBroken }) => !isBroken) ||
        this.state.defaultWorkspace;

      return currentWorkspace ? this.completeWorkspaceConfiguration(currentWorkspace) : null;
    };

    /**
     * Add a new, default workspace configuration
     */
    addNewWorkspaceConfiguration = (currentConfig) => {
      const newConfiguration = this.setupWorkspace(defaultConfiguration);
      newConfiguration.label = nextAvailableConfigurationLabel(
        newConfiguration.label,
        this.workspaceConfigurationLabels(),
      );

      this.saveWorkspaceConfiguration(newConfiguration);
      setTimeout(() => {
        this.switchWorkspaceConfiguration(newConfiguration.id, currentConfig);
      }, 500);
      return newConfiguration;
    };

    /**
     * Mark the current active workspace as broken.
     */
    markWorkspaceConfigurationBroken = () => {
      if (this.state.currentConfigurationId) {
        this.saveWorkspaceConfiguration(
          Object.assign({}, this.currentConfiguration(this.workspaceConfigurations()), {
            isBroken: true,
          }),
        );
        this.setState({ currentConfigurationId: null });
      }
    };

    render() {
      // Render public task page if user is not logged in.
      if (!this.props.user?.isLoggedIn) {
        return this.props.checkingLoginStatus ? (
          <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
            <BusySpinner />
          </div>
        ) : this.props.match.path !== "/challenge/:challengeId/task/:taskId" &&
          this.props.match.path !== "/task/:taskId" ? (
          <SignIn {...this.props} />
        ) : (
          <Redirect to={`${this.props.match.url}`} />
        );
      }

      const configurations = this.workspaceConfigurations();
      const currentConfiguration = this.currentConfiguration(configurations);
      const remainingConfigurations = currentConfiguration
        ? _omit(configurations, [currentConfiguration.id])
        : configurations;

      return (
        <WrappedComponent
          {...this.props}
          name={workspaceName}
          targets={targets}
          defaultConfiguration={defaultConfiguration}
          workspaceConfigurations={configurations}
          currentConfiguration={currentConfiguration}
          remainingConfigurations={remainingConfigurations}
          switchWorkspaceConfiguration={this.switchWorkspaceConfiguration}
          switchWorkspaceAltConfiguration={this.switchWorkspaceAltConfiguration}
          markWorkspaceConfigurationBroken={this.markWorkspaceConfigurationBroken}
          renameWorkspaceConfiguration={this.renameWorkspaceConfiguration}
          addNewWorkspaceConfiguration={this.addNewWorkspaceConfiguration}
          saveWorkspaceConfiguration={this.saveWorkspaceConfiguration}
          resetWorkspaceConfiguration={this.resetWorkspaceConfiguration}
          exportWorkspaceConfiguration={this.exportWorkspaceConfiguration}
          importWorkspaceConfiguration={this.importWorkspaceConfiguration}
          deleteWorkspaceConfiguration={this.deleteWorkspaceConfiguration}
          setupWorkspaceAlt={this.setupWorkspaceAlt}
        />
      );
    }
  };
};

const WithWidgetWorkspaces = (
  WrappedComponent,
  targets,
  workspaceName,
  defaultConfiguration,
  defaultConfigurationAlt,
) =>
  WithStatus(
    WithCurrentUser(
      WithErrors(
        WithWidgetWorkspacesInternal(
          WrappedComponent,
          targets,
          workspaceName,
          defaultConfiguration,
          defaultConfigurationAlt,
        ),
      ),
    ),
  );

export default WithWidgetWorkspaces;
