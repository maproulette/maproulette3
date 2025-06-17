import classNames from "classnames";
import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component, Fragment, createRef } from "react";
import ReactGridLayout, { WidthProvider } from "react-grid-layout";
import { widgetComponent } from "../../services/Widget/Widget";
import WithWidgetManagement from "../HOCs/WithWidgetManagement/WithWidgetManagement";
import WidgetPicker from "../WidgetPicker/WidgetPicker";
import "../../../node_modules/react-grid-layout/css/styles.css";
import "../../../node_modules/react-resizable/css/styles.css";
import "./WidgetGrid.scss";
import WithKeyboardShortcuts from "../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts";
import { TaskMapWidget } from "../Widgets/widget_registry";

const EnhancedTaskMap = WithKeyboardShortcuts(TaskMapWidget);

const GridLayout = WidthProvider(ReactGridLayout);

export class WidgetGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelWidth: 32, // Initial panel width percentage
      isDragging: false,
      startX: 0,
      startWidth: 32,
      isPanelCollapsed: false, // Track if the panel is collapsed
      prevPanelWidth: 32, // Initialize with default width
    };
    this.dragHandleRef = createRef();
    this.contentPanelRef = createRef();

    // Bind the handlers to make sure they're properly defined
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mouseup", this.handleMouseUp);
    document.addEventListener("mousemove", this.handleMouseMove);
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseUp);
    document.removeEventListener("mousemove", this.handleMouseMove);
  }

  handleMouseDown(e) {
    e.preventDefault();
    // Store the starting position and width
    this.setState({
      isDragging: true,
      startX: e.clientX,
      startWidth: this.state.panelWidth,
    });
  }

  handleMouseUp() {
    if (this.state.isDragging) {
      this.setState({ isDragging: false });
    }
  }

  handleMouseMove(e) {
    if (!this.state.isDragging || !this.contentPanelRef.current) {
      return;
    }

    const containerRect = this.contentPanelRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const isLeftPanel = this.props.currentConfiguration?.type === "leftPanel";

    // Calculate width difference based on mouse movement
    const deltaX = e.clientX - this.state.startX;
    const deltaPercent = (deltaX / containerWidth) * 100;

    let newWidth;
    if (isLeftPanel) {
      // For left panel, moving right increases width
      newWidth = this.state.startWidth + deltaPercent;
    } else {
      // For right panel, moving left increases width (negate deltaPercent)
      newWidth = this.state.startWidth - deltaPercent;
    }

    // Constrain to reasonable values
    newWidth = Math.max(20, Math.min(newWidth, 80));

    this.setState({ panelWidth: newWidth });
  }

  togglePanel() {
    this.setState((prevState) => {
      if (prevState.isPanelCollapsed) {
        // When expanding, restore the previous width
        return {
          isPanelCollapsed: false,
          panelWidth: prevState.prevPanelWidth || 32,
        };
      } else {
        // When collapsing, store the current width
        return {
          isPanelCollapsed: true,
          prevPanelWidth: prevState.panelWidth,
        };
      }
    });
  }

  render() {
    // Setup each widget. Note that we assign a z-index to each widget so that
    // widgets closer to the top of the page have a higher z-index than widgets
    // closer to the bottom of the page. This is so that an open dropdown menu
    // in a widget can extend below it and overlap the widget immediately
    // below. The z-index is necessary because react-grid-layout starts a new
    // stacking context for each widget, so by default widgets lower on the
    // page would be rendered on top of widgets higher on the page since they
    // appear lower in the DOM, thus breaking drop-down menus that extend below
    // a widget
    const workspaceType = this.props.currentConfiguration?.type;
    const altWorkspaceType = workspaceType === "leftPanel" || workspaceType === "rightPanel";

    const highestY = Math.max(
      ..._map(this.props.workspace.widgets, (w, i) => this.props.workspace.layout[i].y),
    );

    const GridFilters = this.props.filterComponent;
    const conditionalWidgets = this.props.workspace.conditionalWidgets || [];
    const permanentWidgets = this.props.workspace.permanentWidgets || [];
    const widgetInstances = _map(this.props.workspace.widgets, (widgetConfiguration, index) => {
      const widgetPermanent = permanentWidgets.indexOf(widgetConfiguration.widgetKey) !== -1;
      let widgetHidden = false;
      const WidgetComponent = widgetComponent(widgetConfiguration);
      if (!WidgetComponent) {
        throw new Error(`Missing component for widget: ${widgetConfiguration.widgetKey}`);
      }

      const widgetLayout = this.props.workspace.layout[index];

      // In alternate workspaces, ensure widgets take the full width
      if (altWorkspaceType) {
        widgetLayout.w = 1; // Force full width for single column layout
        // Also ensure minW doesn't exceed the forced width to prevent PropTypes warnings
        if (widgetLayout.minW && widgetLayout.minW > 1) {
          widgetLayout.minW = 1;
        }
      }

      // Hide conditional widgets that shouldn't be shown
      if (conditionalWidgets.indexOf(widgetConfiguration.widgetKey) !== -1) {
        if (WidgetComponent.hideWidget?.(this.props)) {
          widgetHidden = true;
          if (widgetLayout.h > 0) {
            widgetConfiguration.priorHeight = widgetLayout.h;
            widgetLayout.minH = 0;
            widgetLayout.h = 0;
          }
        } else if (widgetLayout.h === 0) {
          widgetLayout.minH = widgetConfiguration.minHeight;
          widgetLayout.h =
            widgetConfiguration.priorHeight > 0
              ? widgetConfiguration.priorHeight
              : widgetConfiguration.defaultHeight;
        }
      }

      const widgetStyle = {
        zIndex: widgetHidden ? 0 : highestY - widgetLayout.y, // higher values towards top of page
      };

      // Prevent the editing layout from rendering an empty resizable elememnt for "permanent but conditionally shown" widgets
      // that are currently hidden.
      if (widgetHidden && widgetPermanent && this.props.isEditing) widgetStyle["display"] = "none";

      return (
        <div
          key={widgetLayout.i}
          className={classNames("mr-card-widget", {
            "mr-card-widget--editing": this.props.isEditing,
            "mr-card-widget--top-row": widgetLayout.y === 0,
          })}
          style={widgetStyle}
        >
          <WidgetComponent
            {...this.props}
            widgetLayout={widgetLayout}
            widgetConfiguration={widgetConfiguration?.defaultConfiguration ?? {}}
            updateWidgetConfiguration={(conf) => this.props.updateWidgetConfiguration(index, conf)}
            widgetHidden={widgetHidden}
            widgetPermanent={widgetPermanent}
            removeWidget={() => this.props.removeWidget(index)}
          />
        </div>
      );
    });

    if (altWorkspaceType) {
      const isLeftPanel = workspaceType === "leftPanel";
      const { isPanelCollapsed } = this.state;

      // Set panel width to collapsed (minimal) state or normal state
      const panelStyle = {
        maxWidth: isPanelCollapsed ? "0%" : `${this.state.panelWidth}%`,
        width: isPanelCollapsed ? "0%" : `${this.state.panelWidth}%`,
        overflow: "hidden",
        opacity: isPanelCollapsed ? 0 : 1,
      };

      const resizeClass = classNames("panel-resize-handle", {
        "is-dragging": this.state.isDragging,
        "is-hidden": isPanelCollapsed,
      });

      // Toggle button styles and direction based on panel state and position
      const toggleButtonClass = classNames("panel-toggle-button", {
        "is-collapsed": isPanelCollapsed,
        "left-panel": isLeftPanel,
        "right-panel": !isLeftPanel,
      });

      const toggleIconClass = classNames("panel-toggle-icon", {
        "icon-chevron-left":
          (isLeftPanel && !isPanelCollapsed) || (!isLeftPanel && isPanelCollapsed),
        "icon-chevron-right":
          (isLeftPanel && isPanelCollapsed) || (!isLeftPanel && !isPanelCollapsed),
      });

      return (
        <div
          className={classNames("widget-grid-side-panel", {
            "widget-grid--editing": this.props.isEditing,
            "panel-collapsed": isPanelCollapsed,
          })}
        >
          <div className="widget-grid-side-panel__header_side-panel">
            {GridFilters && <GridFilters {...this.props} />}
            {this.props.isEditing && (
              <Fragment>
                {this.props.editNameControl}
                <WidgetPicker {...this.props} isRight onWidgetSelected={this.props.addWidget} />
                {this.props.doneEditingControl}
                {this.props.cancelEditingControl}
              </Fragment>
            )}
          </div>
          {this.props.subHeader && (
            <div className={classNames({ "mr-mt-24": this.props.isEditing })}>
              {this.props.subHeader}
            </div>
          )}

          <div
            className="widget-grid-side-panel__content_side-panel"
            style={{
              flexDirection: isLeftPanel ? "row" : "row-reverse",
              justifyContent: "space-between",
              position: "relative", // Add position relative for absolute toggle positioning
            }}
            ref={this.contentPanelRef}
          >
            {/* If panel is collapsed, show toggle button outside the panel */}
            {isPanelCollapsed && (
              <div
                className={toggleButtonClass}
                onClick={this.togglePanel}
                title="Expand panel"
                style={{
                  position: "absolute",
                  zIndex: 1001,
                }}
              >
                <span className={toggleIconClass}></span>
              </div>
            )}

            {/* Panel content */}
            <div
              className="widget-grid-side-panel__layout_side-panel"
              style={{ ...panelStyle, marginTop: 0, flexShrink: 0 }}
            >
              {/* Toggle button inside panel - only show when not collapsed */}
              {!isPanelCollapsed && (
                <div
                  className={toggleButtonClass}
                  onClick={this.togglePanel}
                  title="Collapse panel"
                  style={{ flexShrink: 0 }}
                >
                  <span className={toggleIconClass}></span>
                </div>
              )}

              <GridLayout
                className={"widget-grid-side-panel__grid_side-panel"}
                cols={1}
                rowHeight={this.props.workspace.rowHeight || 30}
                layout={this.props.workspace.layout || []}
                margin={[0, 16]}
                isDraggable={this.props.isEditing}
                isResizable={this.props.isEditing}
                onLayoutChange={this.props.isEditing ? this.props.onLayoutChange : () => null}
              >
                {widgetInstances}
              </GridLayout>
            </div>

            {/* Resizable handle */}
            <div
              className={resizeClass}
              onMouseDown={this.handleMouseDown}
              ref={this.dragHandleRef}
              style={{ flexShrink: 0 }}
            >
              <span className="panel-resize-handle__grip">
                <span className="panel-resize-handle__grip-line"></span>
              </span>
            </div>

            {/* Map content */}
            {this.props.enhancedMapWidget && (
              <div className="widget-grid-side-panel__enhanced-map">
                <EnhancedTaskMap {...this.props} onLayoutChange={() => null} />
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={classNames("widget-grid", { "widget-grid--editing": this.props.isEditing })}>
        <div className="widget-grid__controls">
          {GridFilters && <GridFilters {...this.props} />}
          {this.props.isEditing && (
            <Fragment>
              {this.props.editNameControl}
              <WidgetPicker {...this.props} isRight onWidgetSelected={this.props.addWidget} />
              {this.props.doneEditingControl}
              {this.props.cancelEditingControl}
            </Fragment>
          )}
        </div>
        {this.props.subHeader && (
          <div className={classNames({ "mr-mt-24": this.props.isEditing })}>
            {this.props.subHeader}
          </div>
        )}

        <GridLayout
          className="widget-grid"
          cols={this.props.workspace.cols || 12}
          rowHeight={this.props.workspace.rowHeight || 30}
          layout={this.props.workspace.layout || []}
          margin={[16, 16]}
          isDraggable={this.props.isEditing}
          isResizable={this.props.isEditing}
          onLayoutChange={this.props.onLayoutChange}
        >
          {widgetInstances}
        </GridLayout>
      </div>
    );
  }
}

WidgetGrid.propTypes = {
  workspace: PropTypes.shape({
    widgets: PropTypes.array.isRequired,
    cols: PropTypes.number,
    rowHeight: PropTypes.number,
    layout: PropTypes.array,
  }).isRequired,
  onLayoutChange: PropTypes.func.isRequired,
};

export default WithWidgetManagement(WidgetGrid);
