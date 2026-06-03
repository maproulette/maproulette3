import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

type ActiveView = 'map' | 'id'

export interface EditorViewport {
  lat: number
  lng: number
  zoom: number
}

interface EditorContextType {
  activeView: ActiveView
  idEditorMounted: boolean
  idUnsavedCount: number
  idViewportRef: React.RefObject<EditorViewport | null>
  /** Ref populated by IdEditorView — call .current(osmEntityId) to highlight, .current(null) to clear */
  highlightIdEntityRef: React.RefObject<((osmEntityId: string | null) => void) | null>
  /** Ref populated by IdEditorView — maps MapRoulette task ID → iD entity ID (e.g. "n123") */
  taskToOsmIdRef: React.RefObject<Record<number, string> | null>
  /** Ref populated by IdEditorView — call .current(osmEntityIds) to select entities in iD via modeSelect */
  selectIdEntitiesRef: React.RefObject<((osmEntityIds: string[]) => void) | null>
  openIdEditor: () => void
  showMap: () => void
  setIdUnsavedCount: (count: number) => void
}

const EditorContext = createContext<EditorContextType | null>(null)

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeView, setActiveView] = useState<ActiveView>('map')
  const [idEditorMounted, setIdEditorMounted] = useState(false)
  const [idUnsavedCount, setIdUnsavedCount] = useState(0)
  const idViewportRef = useRef<EditorViewport | null>(null)
  const highlightIdEntityRef = useRef<((osmEntityId: string | null) => void) | null>(null)
  const taskToOsmIdRef = useRef<Record<number, string> | null>({})
  const selectIdEntitiesRef = useRef<((osmEntityIds: string[]) => void) | null>(null)

  const openIdEditor = useCallback(() => {
    setIdEditorMounted(true)
    setActiveView('id')
  }, [])

  const showMap = useCallback(() => {
    setActiveView('map')
  }, [])

  const value = useMemo(
    () => ({
      activeView,
      idEditorMounted,
      idUnsavedCount,
      idViewportRef,
      highlightIdEntityRef,
      taskToOsmIdRef,
      selectIdEntitiesRef,
      openIdEditor,
      showMap,
      setIdUnsavedCount,
    }),
    [activeView, idEditorMounted, idUnsavedCount, openIdEditor, showMap]
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export const useEditorContext = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider')
  }
  return context
}
