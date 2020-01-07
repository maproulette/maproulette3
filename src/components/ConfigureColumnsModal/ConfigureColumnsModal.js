import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import _map from 'lodash/map'
import External from '../External/External'
import Modal from '../Modal/Modal'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

/**
 * ConfigureColumnsModal renders a modal for configuring table columns
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ConfigureColumnsModal extends Component {
  onDragEnd = (result) => {
    // dropped outside the list or on itself
    if (!result.destination ||
        result.source.index === result.destination.index ) {
      return
    }

    this.props.reorderAddedColumn(
      result.source.index,
      result.destination.index
    )
  }

  close = () => {
    this.props.saveColumnSettings()
    this.props.onClose()
  }

  buildDraggableColumnList(provided) {
    let index = -1
    return _map(this.props.addedColumns, (column, key) => {
        index += 1
        return (
          <Draggable key={`added-${key}`} draggableId={key} index={index}>
            {(provided, snapshot) => (
              <div
                 ref={provided.innerRef}
                 {...provided.draggableProps}
                 {...provided.dragHandleProps}
               >
                  <div className='mr-flex'>
                    <div className='mr-flex-grow mr-text-base mr-text-grey mr-my-2'>
                      {column.message}
                    </div>

                    {!column.permanent &&
                      <div className="mr-text-sm mr-text-green mr-my-2">
                        <button className="mr-text-current" onClick={() => this.props.removeColumn(key)}>
                          <FormattedMessage {...messages.removeLabel} />
                        </button>
                      </div>
                    }
                  </div>
              </div>
            )}
          </Draggable>
        )
      })
  }

  render() {
    const availableColumns = _map(this.props.availableColumns, (column, key) =>
      <li key={`available-${key}`} className='mr-flex mr-my-4'>
        <div className='mr-flex-grow mr-text-base mr-text-grey'>
          {column.message}
        </div>

        <div className="mr-text-sm mr-text-green">
          <button className="mr-text-current" onClick={() => this.props.addColumn(key)}>
            <FormattedMessage {...messages.addLabel} />
          </button>
        </div>
      </li>
    )

    return (
      <External>
        <Modal isActive wide onClose={this.close}>
          <div className="mr-overflow-y-auto">
            <h3 className="">
              <FormattedMessage {...messages.configureColumnsHeader} />
            </h3>
            <div className="md:mr-grid md:mr-grid-gap-2 md:mr-grid-columns-2">
              <div className="mr-h-100 mr-mx-4 mr-bg-white mr-my-4 mr-p-4 mr-rounded">
                <section className="mr-flex mr-flex-col mr-h-full mr-text-black">
                  <header className="mr-card-widget__header">
                    <div className="mr-flex mr-items-center mr-justify-between">
                      <h2 className="mr-card-widget__title">
                        <FormattedMessage {...messages.availableColumnsHeader} />
                      </h2>
                    </div>
                  </header>
                  <div className="mr-card-widget__content">
                    <ul>{availableColumns}</ul>
                  </div>
                </section>
              </div>
              <div className="mr-h-100 mr-mx-4 mr-bg-white mr-my-4 mr-p-4 mr-rounded">
                <section className="mr-flex mr-flex-col mr-h-full mr-text-black">
                  <header className="mr-card-widget__header">
                    <div className="mr-flex mr-items-center mr-justify-between">
                      <h2 className="mr-card-widget__title">
                        <FormattedMessage {...messages.showingColumnsHeader} />
                      </h2>
                    </div>
                  </header>
                  <div className="mr-card-widget__content">
                  <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="added-column-droppable">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {this.buildDraggableColumnList(provided)}
                        {provided.placeholder}
                      </div>
                    )}
                    </Droppable>
                  </DragDropContext>
                  </div>
                </section>
              </div>
            </div>
            <div className="mr-text-right">
              <button className="mr-button" onClick={this.close}>Done</button>
            </div>
          </div>
        </Modal>
      </External>
    )
  }
}

ConfigureColumnsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  saveColumnSettings: PropTypes.func.isRequired,
  addedColumns: PropTypes.object.isRequired,
  availableColumns: PropTypes.object.isRequired,
  reorderAddedColumn: PropTypes.func.isRequired,
}
