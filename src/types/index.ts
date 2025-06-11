export interface Ad {
  id: number;
  account: string;
  brand: string;
  industry: string;
  campaign: string;
  creative_id: string;
  creative_name: string;
  device: string;
  format: string;
  template: string;
  adLink: string;
  impressions: string;
  clicks: string;
  filtered_click: string;
  engagement: string;
  features: string;
  first_impression_date: string;
  universal_interaction_rate: string;
  filterctr: string;
  thumbnail: string;
  featureFlags: string[];
  formatDescription?: string;
  specs?: string;
}

export type SortField = 'creative_name' | 'industry' | 'format' | 'brand' | 'account' | 'impressions';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface SearchFilters {
  industry: string;
  format: string;
  features: string;
}
