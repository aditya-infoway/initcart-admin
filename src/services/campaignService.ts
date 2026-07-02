// services/campaignService.ts
import api from "../api/apiClient";

// Interfaces
export interface CampaignParticipation {
  id: number;
  campaign: number;
  campaign_details: {
    id: number;
    campaign_name: string;
    campaign_type: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
  };
  vendor: number;
  vendor_details: {
    id: number;
    business_name: string;
    email: string;
  };
  status: "Pending" | "Approved" | "Rejected";
  applied_at: string;
  product_count: number;
}

export interface CampaignProduct {
  id: number;
  product: number;
  product_details: {
    id: number;
    product_name: string;
    category?: {
      id: number;
      name: string;
    };
  };
  original_price: number;
  special_price: number | null;
  discount_percentage: number | null;
  final_price: number;
  status: "Pending" | "Approved" | "Rejected";
}

class CampaignService {
  getCampaignParticipations = async () => {
    const response = await api.get("/api/ecommerce/admin/campaign-participations/");
    return response.data;
  };

  approveParticipation = async (participationId: number) => {
    const response = await api.post(
      `/api/ecommerce/admin/approve-participation/${participationId}/`
    );
    return response.data;
  };

  approveProduct = async (productId: number) => {
    const response = await api.post(
      `/api/ecommerce/admin/approve-product/${productId}/`
    );
    return response.data;
  };

  rejectProduct = async (productId: number) => {
    const response = await api.post(
      `/api/ecommerce/admin/reject-product/${productId}/`
    );
    return response.data;
  };

  getParticipationProducts = async (participationId: number) => {
    // First get participation details
    const response = await api.get(
      `/api/ecommerce/vendor/campaign-participations/${participationId}/`
    );
    return response.data;
  };
}

export default new CampaignService();