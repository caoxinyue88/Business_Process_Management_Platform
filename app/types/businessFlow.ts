export interface BusinessFlow {
  id: string;
  name: string;
  description: string;
  detailPageId: string;
  parentId?: string;
  projects: number;
  resources: number;
  lastAccessed: string;
  children: BusinessFlow[];
} 