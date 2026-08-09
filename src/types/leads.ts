export const LEAD_STATUSES = ["new", "in_progress", "contacted", "closed", "junk"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В\u00a0работе",
  contacted: "Связались",
  closed: "Закрыта",
  junk: "Спам",
};

export type LeadAttribution = {
  firstTouch?: {
    source?: string;
  };
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  comment: string;
  contact_method: string;
  status: LeadStatus;
  attribution: LeadAttribution;
  created_at: string;
  updated_at: string;
};

export type LeadListResult = {
  leads: Lead[];
  filteredTotal: number;
  total: number;
  newCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
