import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _get from 'lodash/get'
import _map from 'lodash/map'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { widgetComponent } from '../../services/Widget/Widget'
import WithWidgetManagement
       from '../HOCs/WithWidgetManagement/WithWidgetManagement'
import WidgetPicker from '../WidgetPicker/WidgetPicker'
import "../../../node_modules/react-grid-layout/css/styles.css"
import "../../../node_modules/react-resizable/css/styles.css"
import './WidgetGrid.scss'

const GridLayout = WidthProvider(ReactGridLayout)

export class WidgetGrid extends Component {
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
    const highestY = Math.max(
      ..._map(this.props.workspace.widgets, (w, i) => this.props.workspace.layout[i].y)
    )

    const GridFilters = this.props.filterComponent
    const widgetInstances =
      _map(this.props.workspace.widgets, (widgetConfiguration, index) => {
        const WidgetComponent = widgetComponent(widgetConfiguration)
        const widgetY = this.props.workspace.layout[index].y
        return (
          <div
            key={this.props.workspace.layout[index].i}
            className={classNames(
              "mr-card-widget", {
                'mr-card-widget--editing': this.props.isEditing,
                'mr-card-widget--top-row': widgetY === 0,
              })}
            style={{
              "zIndex": (highestY - widgetY), // higher values towards top of page
            }}
          >
            <WidgetComponent {...this.props}
                            widgetLayout={this.props.workspace.layout[index]}
                            widgetConfiguration={_get(widgetConfiguration, 'defaultConfiguration', {})}
                            updateWidgetConfiguration={conf => this.props.updateWidgetConfiguration(index, conf)}
                            removeWidget={() => this.props.removeWidget(index)} />
          </div>
        )
      })

    return (
      <div className={classNames("widget-grid", {"widget-grid--editing": this.props.isEditing})}>
        <div className="widget-grid__controls">
          {GridFilters && <GridFilters {...this.props} />}
          {this.props.isEditing &&
           <React.Fragment>
             {this.props.editNameControl}
             <WidgetPicker {...this.props} isRight onWidgetSelected={this.props.addWidget} />
             {this.props.doneEditingControl}
           </React.Fragment>
          }
        </div>

        <GridLayout
          className="widget-grid"
          cols={this.props.workspace.cols || 12}
          rowHeight={this.props.workspace.rowHeight || 30}
          layout={this.props.workspace.layout || []}
          margin={[30, 15]}
          isDraggable={this.props.isEditing}
          isResizable={this.props.isEditing}
          onLayoutChange={this.props.onLayoutChange}
        >
          {widgetInstances}
        </GridLayout>
      </div>
    )
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
}

export default WithWidgetManagement(WidgetGrid)
