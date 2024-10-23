import { Component } from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { widgetComponent } from '../../services/Widget/Widget'
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'
import './PublicWidgetGrid.scss'

const GridLayout = WidthProvider(ReactGridLayout)

export class PublicWidgetGrid extends Component {
  render() {
    const widgetInstances = _map(
      this.props.workspace.widgets,
      (widgetConfiguration, index) => {
        const WidgetComponent = widgetComponent(widgetConfiguration)
        if (!WidgetComponent) {
          throw new Error(
            `Missing component for widget: ${widgetConfiguration.widgetKey}`
          )
        }
 
        const widgetLayout = this.props.workspace.layout[index]
        return (
          <div key={widgetLayout.i} className='mr-card-widget'>
            <WidgetComponent
              {...this.props}
            />
          </div>
        )
      }
    )

    return (
      <GridLayout
        className='widget-grid'
        cols={this.props.workspace.cols || 12}
        rowHeight={this.props.workspace.rowHeight || 30}
        layout={this.props.workspace.layout || []}
        margin={[16, 16]}
        isDraggable={false}
        isResizable={false}
      >
        {widgetInstances}
      </GridLayout>
    )
  }
}

PublicWidgetGrid.propTypes = {
  workspace: PropTypes.shape({
    widgets: PropTypes.array.isRequired,
    cols: PropTypes.number,
    rowHeight: PropTypes.number,
    layout: PropTypes.array,
  }).isRequired,
}

export default PublicWidgetGrid
