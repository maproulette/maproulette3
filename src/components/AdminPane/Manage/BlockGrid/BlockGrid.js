import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import WithGridBlockManagement
       from '../GridBlocks/WithGridBlockManagement/WithGridBlockManagement'
import GridBlockPicker from '../GridBlockPicker/GridBlockPicker'
import { blockComponent } from '../GridBlocks/BlockTypes'
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import '../GridBlocks/block_registry.js'
import './BlockGrid.scss'

const GridLayout = WidthProvider(ReactGridLayout)

export class BlockGrid extends Component {
  render() {
    const GridBlockFilters = this.props.filterComponent

    const blockInstances =
      _compact(_map(this.props.dashboard.blocks, (blockConfiguration, index) => {
        const BlockComponent = blockComponent(blockConfiguration)
        if (!BlockComponent) {
          console.log(`No block "${blockConfiguration.blockKey || blockConfiguration}" found. Ignoring.`)
          return null
        }

        if (!this.props.dashboard.layout[index]) {
          console.log("No layout found at index", index, `for "${blockConfiguration.blockKey}". Ignoring.`)
          return null
        }

        return (
          <div key={this.props.dashboard.layout[index].i}>
            <BlockComponent {...this.props}
                            blockConfiguration={_get(blockConfiguration, 'defaultConfiguration', {})}
                            updateBlockConfiguration={conf => this.props.updateBlockConfiguration(index, conf)}
                            removeBlock={() => this.props.removeBlock(index)} />
          </div>
        )
      }))

    return (
      <div className="block-grid">
        <div className="block-grid__controls">
          {GridBlockFilters && <GridBlockFilters {...this.props} />}
          <GridBlockPicker {...this.props} isRight onBlockSelected={this.props.addBlock} />
        </div>

        <GridLayout className="block-grid"
                    cols={this.props.dashboard.cols || 12}
                    rowHeight={this.props.dashboard.rowHeight || 30}
                    layout={this.props.dashboard.layout || []}
                    onLayoutChange={this.props.onLayoutChange}
                    draggableHandle=".grid-block__header__title-row__title"
                  >
          {blockInstances}
        </GridLayout>
      </div>
    )
  }
}

BlockGrid.propTypes = {
  dashboard: PropTypes.shape({
    blocks: PropTypes.array.isRequired,
    cols: PropTypes.number,
    rowHeight: PropTypes.number,
    layout: PropTypes.array,
  }).isRequired,
  onLayoutChange: PropTypes.func.isRequired,
}

export default WithGridBlockManagement(BlockGrid)
