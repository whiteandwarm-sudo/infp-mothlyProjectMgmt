
// types.ts - Core data structures for the app

export interface Project {
  id: number;
  name: string;
  color: string;
  archived: boolean;
  archivedAt?: string;
}

export interface Idea {
  id: string;
  text: string;
  timestamp: number;
  projectIds: number[];
  hidden?: boolean;
}

export interface MatrixData {
  [key: string]: string;
}
