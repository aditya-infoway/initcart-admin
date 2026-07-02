// src/types/campaign.ts
export interface Campaign {
  id: number;
  campaign_name: string;
  campaign_type: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
  max_products_per_vendor: number;
  status: 'Draft' | 'Active' | 'Inactive' | 'Expired';
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  duration: string;
  categories_details?: { id: number; name: string }[];
  created_by_name?: string;
  vendor_count?: number;
  approved_products_count?: number;
}

export interface Vendor {
  id: number;
  business_name: string;
  email: string;
  phone: string;
  status: string;
  is_approved: boolean;
}

export interface CampaignParticipation {
  id: number;
  campaign: number;
  vendor: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_at: string;
  approved_at: string | null;
  approved_by: number | null;
  rejection_reason: string | null;
  product_count?: number;
  approved_products_count?: number;
  pending_products_count?: number;
}

export interface CampaignProduct {
  id: number;
  participation: number;
  product: number;
  special_price: number | null;
  discount_percentage: number | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  added_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  final_price: number;
  original_price: number;
  product_details?: {
    id: number;
    product_name: string;
    main_image?: string;
    category?: { name: string };
  };
  vendor_name?: string;
}