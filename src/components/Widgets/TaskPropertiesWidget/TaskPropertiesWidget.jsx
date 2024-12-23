import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import PropertyList from '../../EnhancedMap/PropertyList/PropertyList'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskPropertiesWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 4,
  defaultHeight: 6,
}

const TaskPropertiesWidget = (props) => {
  const taskList = _get(props.taskBundle, 'tasks') || [props.task];
  const initialCollapsedState = {};

  taskList.forEach((task) => {
    const featurePropertiesList = AsMappableTask(task).osmFeatureProperties(props.osmElements);
    featurePropertiesList.forEach((_, index) => {
      initialCollapsedState[`${task.id}-${index}`] = true;
    });
  });

  const [collapsed, setCollapsed] = useState(initialCollapsedState); 
  const [allCollapsed, setAllCollapsed] = useState(true); 

  const toggleCollapseAll = () => {
    const newCollapsedState = {};
    taskList.forEach((task) => {
      const featurePropertiesList = AsMappableTask(task).osmFeatureProperties(props.osmElements);
      featurePropertiesList.forEach((_, index) => {
        newCollapsedState[`${task.id}-${index}`] = !allCollapsed;
      });
    });
    setCollapsed(newCollapsedState);
    setAllCollapsed(!allCollapsed); 
  }

  const toggleCollapse = (index) => {
    setCollapsed(prevState => ({
      ...prevState,
      [index]: !prevState[index], 
    }));
  }

  const propertyLists = _map(taskList, (task) => {
    const featurePropertiesList = AsMappableTask(task).osmFeatureProperties(props.osmElements)

    return (
      <div key={task.id} className="mr-mb-4 border-b mr-border-gray-300 pb-2">
        {
          featurePropertiesList.map((feature, index) => {
            const featureIndex = `${task.id}-${index}`; 
            const isCollapsed = collapsed[featureIndex]; 
            return (
              <div key={featureIndex} className="mr-pb-2 mr-border-b mr-bg-gray-100">
                <div className="mr-text-yellow mr-cursor-pointer mr-p-1 mr-rounded mr-flex mr-justify-between mr-items-center" onClick={() => toggleCollapse(featureIndex)}>
                  <div className="mr-flex mr-items-center">
                    <div className="mr-text-yellow mr-font-bold mr-text-lg">
                      <FormattedMessage {...messages.taskLabel} values={{taskId: task.id}}/>
                    </div>
                    <span className="mr-text-grey-lighter mr-mx-2 mr-mt-1">
                      {feature.properties?.id || feature.geometry?.type}
                    </span>
                  </div>
                  <div className="mr-cursor-pointer">
                    {isCollapsed ? '▼' : '▲'}
                  </div>
                </div>
                {!isCollapsed && ( 
                  <PropertyList featureProperties={feature.properties} hideHeader
                    lightMode={false} {...props} />
                )}
              </div>
            )
          })
        }
      </div>
    )
  })

  return (
    <QuickWidget
      {...props}
      className="task-properties-widget"
      widgetTitle={<FormattedMessage {...messages.title} />}
      rightHeaderControls={
        <div onClick={toggleCollapseAll} className="mr-cursor-pointer mr-button mr-button--small mr-text-sm mr-ml-4">
          {allCollapsed ? <FormattedMessage {...messages.expandAll} /> : <FormattedMessage {...messages.collapseAll} />}
        </div>
      }
    >
      {propertyLists}
    </QuickWidget>
  )
}

registerWidgetType(TaskPropertiesWidget, descriptor)

export default TaskPropertiesWidget;
