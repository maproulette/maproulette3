import { useMemo } from 'react'
import {
  type KeyboardShortcut,
  useRegisterShortcuts,
} from '@/components/Pages/TaskEditPage/contexts/KeyboardShortcutsContext'
import { useIntl } from '@/i18n'
import { useTaskBundleContext } from '../contexts/TaskBundleContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'

export const useTaskMapShortcuts = () => {
  const { activeBundle, showBundleOnly, setShowBundleOnly, setShowDeleteDialog } =
    useTaskBundleContext()
  const { markersHidden, setMarkersHidden, drawingMode, startDrawing, cancelDrawing } =
    useTaskMapContext()
  const { t } = useIntl()

  // Reason: stable shortcut definitions for keyboard handler registration
  const taskMapShortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        key: 'D',
        description: t('taskMap.shortcuts.startDrawing', undefined, 'Start drawing to add tasks'),
        category: t('taskMap.shortcuts.categoryMultiTask', undefined, 'Multi-task'),
        handler: () => {
          if (!drawingMode) {
            startDrawing('select')
          }
        },
        enabled: !drawingMode,
      },
      {
        key: 'F',
        description: t(
          'taskMap.shortcuts.toggleFilter',
          undefined,
          'Toggle filter (show bundled tasks only)'
        ),
        category: t('common.map', undefined, 'Map'),
        handler: () => setShowBundleOnly(!showBundleOnly),
        enabled: !!activeBundle,
      },
      {
        key: 'H',
        description: t(
          'taskMap.shortcuts.toggleMarkers',
          undefined,
          'Toggle all markers visibility'
        ),
        category: t('common.map', undefined, 'Map'),
        handler: () => setMarkersHidden(!markersHidden),
        enabled: true,
      },
      {
        key: 'Delete',
        description: t('taskMap.shortcuts.exitMultiTask', undefined, 'Exit multi-task mode'),
        category: t('taskMap.shortcuts.categoryMultiTask', undefined, 'Multi-task'),
        handler: () => setShowDeleteDialog(true),
        enabled: !!activeBundle,
      },
      {
        key: 'Esc',
        description: t('taskMap.shortcuts.cancelDrawing', undefined, 'Cancel drawing'),
        category: t('common.map', undefined, 'Map'),
        handler: () => cancelDrawing(),
        enabled: !!drawingMode,
      },
    ],
    [
      activeBundle,
      showBundleOnly,
      setShowBundleOnly,
      markersHidden,
      setMarkersHidden,
      drawingMode,
      cancelDrawing,
      startDrawing,
      setShowDeleteDialog,
      t,
    ]
  )
  useRegisterShortcuts('task-map', taskMapShortcuts)
}
