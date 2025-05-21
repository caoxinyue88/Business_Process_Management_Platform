export interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'active' | 'deprecated' | 'pending';
  owner: string;
  lastUpdated: string;
  expiryDate: string;
} 