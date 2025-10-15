export interface Project {
  id: number
  name: string
  created: string
  modified: string
  description: string
  deleted: boolean
  isGlobal: boolean
  enabled: boolean
  featured: boolean
  owner: number
  parent: number
  instruction: string
  difficulty: number
  blurb: string
  infoLink: string
  requireConfirmation: boolean
  requireRejectReason: boolean
  cooperativeType: number
  popularity: number
  checkinComment: string
  checkinSource: string
  requiresLocal: boolean
  overpassQL: string
  remoteGeoJson: string
  overpassTargetType: string
  defaultPriority: number
  highPriorityRule: Record<string, unknown>
  mediumPriorityRule: Record<string, unknown>
  lowPriorityRule: Record<string, unknown>
  highPriorityBounds: unknown[]
  mediumPriorityBounds: unknown[]
  lowPriorityBounds: unknown[]
  defaultZoom: number
  minZoom: number
  maxZoom: number
  defaultBasemap: number
  defaultBasemapId: string
  customBasemap: string
  updateTasks: boolean
  exportableProperties: string
  osmIdProperty: string
  limitTags: boolean
  limitReviewTags: boolean
  taskStyles: unknown[]
  taskBundleIdProperty: string
  isArchived: boolean
  reviewSetting: number
  taskWidgetLayout: Record<string, unknown>
  datasetUrl: string
  status: number
  statusMessage: string
  lastTaskRefresh: string
  dataOriginDate: string
  location: {
    type: string
    coordinates: [number, number]
  }
  bounding: {
    type: string
    coordinates: number[][][]
  }
  completionPercentage: number
  tasksRemaining: number
  tags: string[]
}
