import _map from "lodash/map";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import PropertyList from "../../EnhancedMap/PropertyList/PropertyList";
import QuickWidget from "../../QuickWidget/QuickWidget";
import messages from "./Messages";
import "./TaskPropertiesWidget.scss";

const descriptor = {
  widgetKey: "TaskPropertiesWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 4,
  defaultHeight: 6,
};

const TaskPropertiesWidget = (props) => {
  const taskList = props.taskBundle?.tasks || [props.task];
  const [collapsed, setCollapsed] = useState();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const propertyLists = _map(taskList, (task) => {
    const featurePropertiesList = AsMappableTask(task).osmFeatureProperties(props.osmElements);

    return (
      <div key={task.id} className="mr-mb-4 border-b mr-border-gray-300 pb-2">
        {featurePropertiesList.map((feature, index) => {
          const featureIndex = `${task.id}-${index}`;
          return (
            <details
              key={featureIndex}
              open={!collapsed}
              className="mr-pb-2 mr-border-b mr-bg-gray-100"
            >
              <summary className="mr-text-yellow mr-cursor-pointer mr-p-1 mr-rounded mr-flex mr-justify-between mr-items-center">
                <div className="mr-flex mr-items-center">
                  <div className="mr-text-yellow mr-font-bold mr-text-lg">
                    <FormattedMessage {...messages.taskLabel} values={{ taskId: task.id }} />
                  </div>
                  <span className="mr-text-grey-lighter mr-mx-2 mr-mt-1">
                    {feature.properties?.id || feature.geometry?.type}
                  </span>
                </div>
              </summary>
              <PropertyList
                featureProperties={feature.properties}
                hideHeader
                lightMode={false}
                {...props}
              />
            </details>
          );
        })}
      </div>
    );
  });

  return (
    <QuickWidget
      {...props}
      className="task-properties-widget"
      widgetTitle={<FormattedMessage {...messages.title} />}
      rightHeaderControls={
        <div
          onClick={toggleCollapsed}
          className="mr-cursor-pointer mr-button mr-button--small mr-text-sm mr-ml-4"
        >
          {collapsed ? (
            <FormattedMessage {...messages.expandAll} />
          ) : (
            <FormattedMessage {...messages.collapseAll} />
          )}
        </div>
      }
    >
      {propertyLists}
    </QuickWidget>
  );
};

registerWidgetType(TaskPropertiesWidget, descriptor);

export default TaskPropertiesWidget;
