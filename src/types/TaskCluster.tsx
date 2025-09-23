export interface TaskCluster {
  id: number;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  taskCount: number;
  bounds?: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
  tasks?: Array<{
    id: number;
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    status: number;
    priority: number;
  }>;
}

export interface TaskClusterParams {
  ca?: boolean; // cluster aggregation
  cid: number; // challenge id
  invf?: string; // inverse filter
  points: number; // number of points
  tbb: string; // tile bounding box (minLng,minLat,maxLng,maxLat)
}

export const TASK_CLUSTER_KEY = (params: TaskClusterParams) => ['taskCluster', params] as const;
