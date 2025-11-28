/**
 * Rapid Editor Plugin for MapRoulette
 * Integrates the Rapid editor into the task map for direct OSM editing
 */

import { Pencil } from 'lucide-react'
import type { Plugin, TaskMapEditor } from '@/types/Plugin'
import { RapidEditorView } from './RapidEditorView'

/**
 * Rapid Editor Plugin Definition
 * This plugin provides the Rapid editor as a task map overlay
 */
export const RapidEditorPlugin: Plugin = {
  metadata: {
    id: 'rapid-editor-plugin',
    name: 'Rapid Editor',
    description:
      'Integrates the Rapid editor into MapRoulette task map for direct OpenStreetMap editing',
    version: '1.0.0',
    author: 'MapRoulette Team',
  },

  initialize: async (context) => {
    console.log('[RapidEditorPlugin] Initializing with context:', context)
  },

  cleanup: async () => {
    console.log('[RapidEditorPlugin] Cleaning up')
  },

  getTaskMapEditors: (): TaskMapEditor[] => {
    return [
      {
        id: 'rapid',
        label: 'Edit in Rapid',
        icon: <Pencil className="size-4" />,
        component: RapidEditorView,
        order: 10,
      },
    ]
  },
}
