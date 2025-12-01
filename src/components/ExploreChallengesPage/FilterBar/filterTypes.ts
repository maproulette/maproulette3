export type DifficultyLevel = 'Any' | 'Easy' | 'Normal' | 'Expert'

export type WorkOnCategory =
  | 'Anything'
  | 'Roads / Pedestrian / Cycleways'
  | 'Water'
  | 'Points / Areas of Interest'
  | 'Buildings'
  | 'Land Use / Administrative Boundaries'
  | 'Transit'

export type ViewMode = 'grid' | 'list' | 'grid-map'

export interface FilterBarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}
