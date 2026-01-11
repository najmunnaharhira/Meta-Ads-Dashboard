export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  daily_budget?: number;
  lifetime_budget?: number;
  delivery_status?: string;
  insights?: CampaignInsights;
  creative_id?: string;
}

export interface CampaignInsights {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  spend?: number;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  date_start?: string;
  date_stop?: string;
}

export interface AdAccount {
  id: string;
  name: string;
  account_id: string;
}

export type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'this_month' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

