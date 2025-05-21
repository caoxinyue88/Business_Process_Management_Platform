export interface Project {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'completed' | 'pending';
  department: string;
  owner: string;
  startDate: string;
  endDate?: string;
} 