import apiClient from "./apiClient";

export const vendorApi = {
  getAll: async () => {
    const res = await apiClient.get("ecommerce/vendors/");
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post("ecommerce/vendors/", data);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await apiClient.get(`ecommerce/vendors/${id}/`);
    return res.data;
  },

  update: async (id: number, data: any) => {
    const res = await apiClient.put(`ecommerce/vendors/${id}/`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await apiClient.delete(`ecommerce/vendors/${id}/`);
    return res.data;
  },

  approve: async (id: string) => {
    const res = await apiClient.patch(`ecommerce/vendors/${id}/approve/`);
    return res.data;
  },

  walletWithdrawals: async () => {
    const res = await apiClient.get("ecommerce/vendors/wallet-withdrawals/");
    return res.data;
  },
};
