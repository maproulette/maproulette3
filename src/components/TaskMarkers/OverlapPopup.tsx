import type { TaskMarker } from '@/types/Task'
import { STATUS_CONFIG } from './const'

interface OverlapPopupProps {
  tasks: TaskMarker[]
  challengeNames: string[]
}

export const createOverlapPopupContent = ({ tasks, challengeNames }: OverlapPopupProps): string => {
  const taskCount = tasks.length
  const tasksList = tasks
    .slice(0, 10) // Limit to first 10 tasks to avoid overwhelming UI
    .map((task) => {
      const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
      return `
        <div 
          style="
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            padding: 6px 8px; 
            margin: 2px 0; 
            background-color: #f9fafb; 
            border-radius: 4px;
            border-left: 3px solid ${statusConfig.color};
            cursor: pointer;
            transition: background-color 0.2s;
            min-width: 0;
          "
          onmouseover="this.style.backgroundColor='#f3f4f6'"
          onmouseout="this.style.backgroundColor='#f9fafb'"
          onclick="window.location.href='/tasks/${task.id}'"
        >
          <div style="flex: 1; min-width: 0; margin-right: 8px;">
            <div style="font-size: 13px; font-weight: 500; color: #1f2937; word-wrap: break-word; overflow-wrap: break-word;">Task #${task.id}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 1px; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;">${task.challengeName}</div>
          </div>
          <div style="display: flex; align-items: center; flex-shrink: 0;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${statusConfig.color}; margin-right: 4px;"></div>
            <span style="font-size: 10px; color: #6b7280; white-space: nowrap;">${statusConfig.label}</span>
          </div>
        </div>
      `
    })
    .join('')

  const remainingCount = taskCount - 10
  const remainingText =
    remainingCount > 0
      ? `<div style="text-align: center; font-size: 11px; color: #6b7280; margin-top: 8px; font-style: italic;">
         +${remainingCount} more task${remainingCount === 1 ? '' : 's'}
       </div>`
      : ''

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; width: auto; box-sizing: border-box;">
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
        <div style="min-width: 0; flex: 1;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; word-wrap: break-word; overflow-wrap: break-word;">
            ${taskCount} Overlapping Tasks
          </h3>
          <div style="font-size: 11px; color: #6b7280; word-wrap: break-word; overflow-wrap: break-word;">
            ${challengeNames.length === 1 ? challengeNames[0] : `${challengeNames.length} challenges`}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 6px;">Tasks:</div>
        <div style="max-height: 200px; overflow-y: auto;">
          ${tasksList}
          ${remainingText}
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button 
          onclick="window.location.href='/tasks/${tasks[0]?.id || ''}'" 
          style="
            flex: 1;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 500;
            color: #ffffff;
            background-color: #22c55e;
            border: 1px solid #22c55e;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          "
          onmouseover="this.style.backgroundColor='#16a34a'"
          onmouseout="this.style.backgroundColor='#22c55e'"
        >
          Start First Task
        </button>
      </div>
    </div>
  `
}

export const createSingleTaskPopupContent = (task: TaskMarker): string => {
  const statusInfo = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0]
  console.log(task)
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; width: auto; box-sizing: border-box;">
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
        <div style="min-width: 0; flex: 1;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; word-wrap: break-word; overflow-wrap: break-word;">
            Task #${task.id}
          </h3>
          ${
            task.challengeName !== 'undefined'
              ? `
            <div style="font-size: 11px; color: #6b7280; word-wrap: break-word; overflow-wrap: break-word;">
              Challenge: ${task.challengeName}
            </div>
          `
              : ''
          }
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 6px;">Status:</div>
        <div style="display: flex; align-items: center; padding: 6px 8px; background-color: #f9fafb; border-radius: 4px; border-left: 3px solid ${statusInfo.color};">
          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${statusInfo.color}; margin-right: 6px;"></div>
          <span style="font-size: 13px; color: #374151;">${statusInfo.label}</span>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button 
          onclick="window.location.href='/tasks/${task.id}'" 
          style="
            flex: 1;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 500;
            color: #ffffff;
            background-color: #22c55e;
            border: 1px solid #22c55e;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          "
          onmouseover="this.style.backgroundColor='#16a34a'"
          onmouseout="this.style.backgroundColor='#22c55e'"
        >
          Start Task
        </button>
      </div>
    </div>
  `
}
