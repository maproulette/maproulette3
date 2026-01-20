import type { TaskMarker } from '@/types/Task';

export type PopupInfo =
  | { type: 'single'; task: TaskMarker }
  | { type: 'overlap'; tasks: TaskMarker[]; center: [number, number]; selectedTaskId?: number | null }
  | null
