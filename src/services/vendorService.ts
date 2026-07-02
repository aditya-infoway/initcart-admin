import apiClient from "../api/apiClient";

const BASE = "ecommerce";

export const vendorService = {
  getAll: async () => {
    const res = await apiClient.get(`${BASE}/vendors/all_vendors/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    return res.data.vendors || [];
  },

  // Add vendor methods
  createVendor: async (payload: FormData) => {
    const res = await apiClient.post(`${BASE}/vendors/`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  updateVendor: async (id: number, payload: FormData) => {
    const res = await apiClient.put(`${BASE}/vendors/${id}/`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  deleteVendor: async (id: number) => {
    const res = await apiClient.delete(`${BASE}/vendors/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    return res.data;
  },

  getPendingRequests: async () => {
    const res = await apiClient.get(`${BASE}/vendor-approvals/pending/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    return res.data.approval_requests || [];
  },

  approveVendor: async (id: string, payload: any) => {
    const res = await apiClient.post(
      `${BASE}/vendor-approvals/${id}/approve/`,
      payload,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      }
    );
    return res.data;
  },

  rejectVendor: async (id: string, notes: string) => {
    const res = await apiClient.post(
      `${BASE}/vendor-approvals/${id}/reject/`,
      { admin_notes: notes },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      }
    );
    return res.data;
  },

  getWallets: async () => {
    const res = await apiClient.get(`${BASE}/vendor-wallets/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    return res.data;
  },

  getWithdrawals: async () => {
    const res = await apiClient.get(`${BASE}/vendor-withdrawals/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    return res.data;
  },

  getBrands: async () => {
    const res = await apiClient.get(`${BASE}/brands/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    return res.data;
  },

  createBrand: async (payload: FormData) => {
    const res = await apiClient.post(`${BASE}/brands/`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  deleteBrand: async (id: number) => {
    const res = await apiClient.delete(`${BASE}/brands/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    return res.data;
  },
};