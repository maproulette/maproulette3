import { useEffect, useState } from 'react'
import { usePluginContext } from '@/contexts/PluginContext'
import type { TaskMapEditor } from '@/types/Plugin'

/**
 * Manages plugin editor UI components
 */
export const PluginEditorsManager = () => {
  const { getTaskMapEditors } = usePluginContext()
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null)
  const [availableEditors, setAvailableEditors] = useState<TaskMapEditor[]>([])

  useEffect(() => {
    const loadEditors = async () => {
      const editors = await getTaskMapEditors()
      setAvailableEditors(editors)
    }
    loadEditors()
  }, [getTaskMapEditors])

  const handleCloseEditor = () => {
    setActiveEditorId(null)
  }

  const activeEditor = availableEditors.find((editor) => editor.id === activeEditorId)

  return (
    <>
      {!activeEditorId && availableEditors.length > 0 && (
        <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2">
          {availableEditors.map((editor) => (
            <button
              key={editor.id}
              type="button"
              onClick={() => setActiveEditorId(editor.id)}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white shadow-lg transition-colors hover:bg-purple-700"
              title={editor.label}
            >
              {editor.icon}
              <span className="font-medium">{editor.label}</span>
            </button>
          ))}
        </div>
      )}

      {activeEditor && (
        <div className="absolute inset-0 z-50">
          <activeEditor.component onClose={handleCloseEditor} />
        </div>
      )}
    </>
  )
}
