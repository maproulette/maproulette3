import { useMemo } from 'react'
import {
  type KeyboardShortcut,
  useRegisterShortcuts,
} from '@/components/Pages/TaskEditPage/KeyboardShortcutsContext'
import { useTaskBundleContext } from '../TaskBundleContext'
import { useTaskMapContext } from '../TaskMapContext'

export const useTaskMapShortcuts = () => {
  const { activeBundle, showBundleOnly, setShowBundleOnly, setShowDeleteDialog } =
    useTaskBundleContext()
  const { markersHidden, setMarkersHidden, drawingMode, startDrawing, cancelDrawing } =
    useTaskMapContext()

  const taskMapShortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        key: 'D',
        description: 'Start drawing to add tasks',
        category: 'Multi-task',
        handler: () => {
          if (!drawingMode) {
            startDrawing('select')
          }
        },
        enabled: !drawingMode,
      },
      {
        key: 'F',
        description: 'Toggle filter (show bundled tasks only)',
        category: 'Map',
        handler: () => setShowBundleOnly(!showBundleOnly),
        enabled: !!activeBundle,
      },
      {
        key: 'H',
        description: 'Toggle all markers visibility',
        category: 'Map',
        handler: () => setMarkersHidden(!markersHidden),
        enabled: true,
      },
      {
        key: 'Delete',
        description: 'Exit multi-task mode',
        category: 'Multi-task',
        handler: () => setShowDeleteDialog(true),
        enabled: !!activeBundle,
      },
      {
        key: 'Esc',
        description: 'Cancel drawing',
        category: 'Map',
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
    ]
  )
  useRegisterShortcuts('task-map', taskMapShortcuts)
}
