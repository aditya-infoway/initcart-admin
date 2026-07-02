// src/api/campaignApi.ts (नया file create करें)
import axiosInstance from './axiosInstance';

export const campaignApi = {
  // Campaign Participations
  getParticipations: (params?: any) => 
    axiosInstance.get('ecommerce/admin/campaign-participations/', { params }),
  
  getParticipationDetail: (id: number) => 
    axiosInstance.get(`ecommerce/admin/campaign-participations/${id}/`),
  
  approveParticipation: (id: number) => 
    axiosInstance.post(`ecommerce/admin/approve-participation/${id}/`),
  
  rejectParticipation: (id: number, rejectionReason: string) => 
    axiosInstance.post(`ecommerce/admin/reject-participation/${id}/`, { rejection_reason: rejectionReason }),
  
  approveProductBulk: (id: number, productIds: number[]) => 
    axiosInstance.post(`ecommerce/admin/approve-products-bulk/${id}/`, { product_ids: productIds }),
  
  rejectProductBulk: (id: number, productIds: number[], rejectionReason: string) => 
    axiosInstance.post(`ecommerce/admin/reject-products-bulk/${id}/`, { 
      product_ids: productIds,
      rejection_reason: rejectionReason 
    }),
  
  approveWithProducts: (id: number) => 
    axiosInstance.post(`ecommerce/admin/approve-with-products/${id}/`),
  
  approveProduct: (id: number) => 
    axiosInstance.post(`ecommerce/admin/approve-product/${id}/`),
  
  rejectProduct: (id: number, rejectionReason: string) => 
    axiosInstance.post(`ecommerce/admin/reject-product/${id}/`, { rejection_reason: rejectionReason }),
  
  // Campaigns
  getCampaigns: () => 
    axiosInstance.get('ecommerce/admin/campaigns/'),
};
