import React, { useEffect, useRef } from 'react'
import { WidgetDataTarget, registerWidgetType } from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskMap from '../../TaskPane/TaskMap/TaskMap'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'
import { FormattedMessage } from 'react-intl'
import EditSwitch from './RapidEditor/EditSwitch'
import RapidEditor from './RapidEditor/RapidEditor'
import WithKeyboardShortcuts from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import AsCooperativeWork from '../../../interactions/Task/AsCooperativeWork'

const descriptor = {
  widgetKey: 'TaskMapWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 9,
  minHeight: 5,
  defaultHeight: 19,
}

const TaskMapWidget = (props) => {
  const iframeRef = useRef(null);
  const { user, task, getUserAppSetting, resumeKeyboardShortcuts, pauseKeyboardShortcuts } = props

  useEffect(() => {
    return () => {
      resumeKeyboardShortcuts()
    }
  }, [resumeKeyboardShortcuts])

  useEffect(() => {
    const prevEditMode = getUserAppSetting ? getUserAppSetting(user, 'isEditMode') : false
    const currentEditMode = getUserAppSetting ? getUserAppSetting(user, 'isEditMode') : false

    if (currentEditMode !== prevEditMode) {
      currentEditMode ? pauseKeyboardShortcuts() : resumeKeyboardShortcuts()
    }
  }, [getUserAppSetting, user, pauseKeyboardShortcuts, resumeKeyboardShortcuts])

  const handleRenderRapid = () => {
    return (
      <RapidEditor
        token={user.osmProfile.requestToken}
        task={task}
        comment={task?.parent?.checkinComment ?? "#mapRoulette"}
      />
    )
  }

  const cooperative = AsCooperativeWork(task).isTagType() || task.cooperativeWork
  const isReviewing = task?.reviewClaimedBy === user?.id && task?.reviewStatus === 0
  const disableRapid = cooperative ||
    props.taskReadOnly || (
      ![0, 3, 6].includes(task?.status) &&
      ![2, 4, 5].includes(task?.reviewStatus) &&
      !isReviewing &&
      !props.asMetaReview
    )

  const editMode = disableRapid ?
    false :
    getUserAppSetting ?
      getUserAppSetting(user, 'isEditMode') :
      false

  if (!task.geometries.features) {
    return (
      <QuickWidget
        {...props}
        className="task-map-widget"
        noMain
        permanent
      >
        <div className="mr-text-lg mr-text-red-light mr-flex">
          <FormattedMessage {...messages.rapidFailed} />
        </div>
      </QuickWidget>
    )
  }

  return (
    <QuickWidget
      {...props}
      className="task-map-widget"
      noMain
      permanent
    >
      <div
        className="mr-mt-2"
        style={{ height: "calc(100% - 3rem)" }}
      >
        {
          getUserAppSetting ?
            <>
              <div className="mr-flex mr-items-center ">
                <div className="mr-text-yellow mr-mr-1 mr-mt-1 mr-mb-2">
                  <FormattedMessage {...messages.editMode} />
                </div>
                <div className="mr-mt-1 mr-mb-2">
                  <EditSwitch {...props} disableRapid={disableRapid} editMode={editMode} />
                </div>
              </div>
            </>
            : null
        }
        {
          editMode
            ? handleRenderRapid()
            : <MapPane {...props}>
                <TaskMap {...props} challenge={task.parent} />
              </MapPane>
        }
      </div>
    </QuickWidget>
  )
}

registerWidgetType(WithKeyboardShortcuts(TaskMapWidget), descriptor)

export default TaskMapWidget
