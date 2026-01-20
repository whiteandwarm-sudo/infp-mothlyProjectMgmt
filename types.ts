
export interface Project {
  id: number;
  name: string;
  color: string;
  archived?: boolean;
  archivedAt?: number;
}

export interface Idea {
  id: string;
  text: string;
  projectIds: number[]; // 支持多個項目關聯
  timestamp: number;
  hidden?: boolean; // 新增：隱藏標記
}

// Key format: "YYYY-MM-DD-projectId" (e.g. "2024-03-15-3")
export type MatrixData = Record<string, string>;

export type Tab = 'matrix' | 'dashboard' | 'ideas' | 'settings';

export interface AppState {
  projects: Project[];
  matrix: MatrixData;
  ideas: Idea[];
}
