export interface Task {
  id: number;
  name: string;
  created: string;
  modified: string;
  parent: number;
  instruction: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  geometries: {
    type: string;
    features: Array<{
      id: string;
      type: string;
      geometry: {
        type: string;
        coordinates: [number, number];
      };
      properties: Record<string, unknown>;
    }>;
  };
  status: number;
  review: Record<string, unknown>;
  priority: number;
  changesetId: number;
  errorTags: string;
}

export const TASK_BY_ID_KEY = (taskId: string) => ['task', taskId] as const;
