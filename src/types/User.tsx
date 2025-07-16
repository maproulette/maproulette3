export interface User {
  id: number;
  achievements: Achievement[];
  apiKey: string;
  created: Date;
  modified: Date;
  grants: Grant[];
  guest: boolean;
  osmProfile: OsmProfile;
  properties: MrUserProperties;
  settings: UserSettings;
  score: number;
}

export type Achievement = number[];

export type Grant = {
  id: number;
  name: string;
  role: number;
  grantee: {
    granteeId: number;
    granteeType: number;
  };
  target: {
    objectType: number;
    objectId: number;
  };
};

export type OsmProfile = {
  id: number;
  displayName: string;
  description: string;
  avatarURL: string;
  homeLocation: {
    latitude: number;
    longitude: number;
  };
  created: Date;
  requestToken: string;
};

export type UserSettings = {
  defaultEditor: number;
  defaultBasemap: number;
  defaultBasemapId: string;
  locale: string;
  email: string;
  emailOptIn: boolean;
  leaderboardOptOut: boolean;
  needsReview: number;
  isReviewer: boolean;
  allowFollowing: boolean;
  theme: number;
  seeTagFixSuggestions: boolean;
  disableTaskConfirm: boolean;
};

export type MrUserProperties = {
  mr3Frontend: {
    meta: {
      revision: number;
    };
    settings: {
      isEditMode: boolean;
      tallied: Record<number, number[]>;
      taskBundleFilters: string;
      workspaces: UserWorkspaces;
    };
  };
  score: number;
};

export type UserWorkspaces = {
  projects: Record<string, Workspace>;
  challenge: Record<string, Workspace>;
  taskCompletion: Record<string, Workspace>;
  userDashboard: Record<string, Workspace>;
  project: Record<string, Workspace>;
  globalActivity: Record<string, Workspace>;
  reviewOverview: Record<string, Workspace>;
  taskReview: Record<string, Workspace>;
};

export type Workspace = {
  id: string;
  targets: string[];
  cols: number;
  rowHeight: number;
  widgets: Widget[];
  layout: LayoutItem[];
  dataModelVersion: number;
  name: string;
  label: string;
  filters?: WorkspaceFilters;
  permanentWidgets?: string[];
  conditionalWidgets?: string[];
  excludeWidgets?: string[];
  type?: string;
  active?: boolean;
  defaultConfiguration?: Record<string, unknown>;
};

export type Widget = {
  widgetKey: string;
  label: {
    id: string;
    defaultMessage: string;
  };
  targets: string[];
  minWidth: number;
  defaultWidth: number;
  minHeight?: number;
  defaultHeight: number;
  defaultConfiguration?: Record<string, unknown>;
  priorHeight?: number;
};

export type LayoutItem = {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  minW: number;
  minH?: number;
  moved: boolean;
  static: boolean;
};

export type WorkspaceFilters = {
  visible?: boolean;
  owner?: boolean;
  pinned?: boolean;
  archived?: boolean;
};
