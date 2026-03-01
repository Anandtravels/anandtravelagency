export type CollaborationType = 'company' | 'travel_agency';

export interface Collaboration {
  id: string;
  name: string;
  type: CollaborationType;
  description?: string;
  logo: string;
  website?: string;
  order: number;
  isActive: boolean;
  created_at?: any;
  updated_at?: any;
}

export interface CompanyDocument {
  id: string;
  title: string;
  description?: string;
  documentUrl: string;
  thumbnailUrl?: string;
  order: number;
  isActive: boolean;
  created_at?: any;
  updated_at?: any;
}
