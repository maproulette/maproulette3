export interface Challenge {
  id: number
  name: string
  created: string
  modified: string
  description: string
  deleted: boolean
  isGlobal: boolean
  requireConfirmation: boolean
  requireRejectReason: boolean
  infoLink: string
  owner: number
  parent: number
  instruction: string
  difficulty: number
  blurb: string
  enabled: boolean
  featured: boolean
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

export interface ExtendedFindParams {
  showArchived?: boolean
  showGlobal?: boolean
  showOnMap?: boolean
  sortBy?: 'popularity' | 'created' | 'modified' | 'name'
  limit?: number
}

export interface ChallengeActivity {
  date: string
  status: number
  statusName: string
  count: number
}

export interface ChallengeStats {
  id: number
  name: string
  actions: {
    total: number
    available: number
    fixed: number
    falsePositive: number
    skipped: number
    deleted: number
    alreadyFixed: number
    tooHard: number
    answered: number
    validated: number
    disabled: number
    avgTimeSpent: number
    tasksWithTime: number
  }
  priorityActions: {
    [key: string]: {
      total: number
      available: number
      fixed: number
      falsePositive: number
      skipped: number
      deleted: number
      alreadyFixed: number
      tooHard: number
      answered: number
      validated: number
      disabled: number
      avgTimeSpent: number
      tasksWithTime: number
    }
  }
}

export interface ChallengeData {
  id: number
  name: string
  actions: {
    total: number
    available: number
    fixed: number
    falsePositive: number
    skipped: number
    deleted: number
    alreadyFixed: number
    tooHard: number
    answered: number
    validated: number
    disabled: number
    avgTimeSpent: number
    tasksWithTime: number
  }
}
