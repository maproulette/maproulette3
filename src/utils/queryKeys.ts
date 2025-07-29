export const QUERY_KEYS = {
  auth: {
    user: ["user"] as const,
    redirectUrl: ["auth", "redirectUrl"] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    byId: (notificationId: string | number) =>
      ["notification", notificationId] as const,
  },

  challenges: {
    preferred: ["preferred-challenges"] as const,
    byId: (challengeId: string | number) => ["challenge", challengeId] as const,
  },

  projects: {
    byId: (projectId: string | number) => ["project", projectId] as const,
  },

  tasks: {
    byId: (taskId: string | number) => ["task", taskId] as const,
  },
} as const;
