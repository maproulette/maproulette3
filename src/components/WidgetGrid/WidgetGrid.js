import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
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
    const GridFilters = this.props.filterComponent

    const widgetInstances =
      _compact(_map(this.props.workspace.widgets, (widgetConfiguration, index) => {
        const WidgetComponent = widgetComponent(widgetConfiguration)
        return (
          <div
            key={this.props.workspace.layout[index].i}
            className={classNames(
              "mr-card-widget", {
                'mr-card-widget--editing': this.props.isEditing,
                'mr-card-widget--top-row': this.props.workspace.layout[index].y === 0,
              })}
          >
            <WidgetComponent {...this.props}
                            widgetLayout={this.props.workspace.layout[index]}
                            widgetConfiguration={_get(widgetConfiguration, 'defaultConfiguration', {})}
                            updateWidgetConfiguration={conf => this.props.updateWidgetConfiguration(index, conf)}
                            removeWidget={() => this.props.removeWidget(index)} />
          </div>
        )
      }))

    return (
      <div className={classNames("widget-grid", {"widget-grid--editing": this.props.isEditing})}>
        <div className="widget-grid__controls">
          {GridFilters && <GridFilters {...this.props} />}
          {this.props.isEditing &&
           <React.Fragment>
             {this.props.editNameControl}
             <WidgetPicker {...this.props} isRight onWidgetSelected={this.props.addWidget} />
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
