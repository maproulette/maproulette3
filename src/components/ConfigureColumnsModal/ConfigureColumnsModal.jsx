import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormattedMessage } from "react-intl";
import External from "../External/External";
import Modal from "../Modal/Modal";
import messages from "./Messages";

// SortableItem component for draggable columns
const SortableItem = ({ column, columnKey, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: columnKey,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="mr-flex">
        <div className="mr-flex-grow mr-text-base mr-text-white mr-my-2">{column.message}</div>

        {!column.permanent && (
          <div className="mr-text-sm mr-text-green-lighter mr-my-2">
            <button className="mr-text-current" onClick={() => onRemove(columnKey)}>
              <FormattedMessage {...messages.removeLabel} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ConfigureColumnsModal renders a modal for configuring table columns
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ConfigureColumnsModal extends Component {
  handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find indexes for the source and destination
    let sourceIndex = -1;
    let destinationIndex = -1;

    Object.keys(this.props.addedColumns).forEach((key, index) => {
      if (key === active.id) sourceIndex = index;
      if (key === over.id) destinationIndex = index;
    });

    if (sourceIndex !== -1 && destinationIndex !== -1) {
      this.props.reorderAddedColumn(sourceIndex, destinationIndex);
    }
  };

  close = () => {
    this.props.saveColumnSettings();
    this.props.onClose();
  };

  buildSortableColumnList() {
    const columnItems = [];
    const columnIds = [];

    Object.entries(this.props.addedColumns).forEach(([key, column]) => {
      columnItems.push(
        <SortableItem
          key={`added-${key}`}
          column={column}
          columnKey={key}
          onRemove={this.props.removeColumn}
        />,
      );
      columnIds.push(key);
    });

    return { columnItems, columnIds };
  }

  render() {
    // Wrap DndContext in a function component since hooks can't be used in class components
    const DraggableColumnList = () => {
      const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        }),
      );

      const { columnItems, columnIds } = this.buildSortableColumnList();

      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={this.handleDragEnd}
        >
          <SortableContext items={columnIds} strategy={verticalListSortingStrategy}>
            {columnItems}
          </SortableContext>
        </DndContext>
      );
    };

    const availableColumns = _map(this.props.availableColumns, (column, key) => (
      <li key={`available-${key}`} className="mr-flex mr-my-4">
        <div className="mr-flex-grow mr-text-base mr-text-white">{column.message}</div>

        <div className="mr-text-sm mr-text-green-lighter">
          <button className="mr-text-current" onClick={() => this.props.addColumn(key)}>
            <FormattedMessage {...messages.addLabel} />
          </button>
        </div>
      </li>
    ));

    return (
      <External>
        <Modal isActive wide onClose={this.close}>
          <div className="mr-overflow-y-auto mr-cards-inverse">
            <h3 className="">
              <FormattedMessage {...messages.configureColumnsHeader} />
            </h3>
            <div className="md:mr-grid md:mr-grid-gap-2 md:mr-grid-columns-2">
              <div className="mr-h-100 mr-mx-4 mr-bg-black-15 mr-my-4 mr-p-4 mr-rounded">
                <section className="mr-flex mr-flex-col mr-h-full mr-text-white">
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
              <div className="mr-h-100 mr-mx-4 mr-bg-black-15 mr-my-4 mr-p-4 mr-rounded">
                <section className="mr-flex mr-flex-col mr-h-full mr-text-white">
                  <header className="mr-card-widget__header">
                    <div className="mr-flex mr-items-center mr-justify-between">
                      <h2 className="mr-card-widget__title">
                        <FormattedMessage {...messages.showingColumnsHeader} />
                      </h2>
                    </div>
                  </header>
                  <div className="mr-card-widget__content">
                    <DraggableColumnList />
                  </div>
                </section>
              </div>
            </div>
            <div className="mr-flex mr-justify-end">
              <button className="mr-button" onClick={this.close}>
                <FormattedMessage {...messages.doneLabel} />
              </button>
            </div>
          </div>
        </Modal>
      </External>
    );
  }
}

ConfigureColumnsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  saveColumnSettings: PropTypes.func.isRequired,
  addedColumns: PropTypes.object.isRequired,
  availableColumns: PropTypes.object.isRequired,
  reorderAddedColumn: PropTypes.func.isRequired,
  removeColumn: PropTypes.func.isRequired,
};
