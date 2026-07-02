import apiClient from "../api/apiClient";

export const fetchPendingApprovals = async () => {
  try {
    const response = await apiClient.get("ecommerce/vendor-approvals/pending/");
    return response.data.data || [];
  } catch (error: any) {
    console.error("❌ Error fetching approvals:", error.response?.data || error);
    throw error;
  }
};

export const approveVendor = async (requestId: string, data: any) => {
  try {
    const response = await apiClient.post(
      `ecommerce/vendor-approvals/${requestId}/approve/`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ Error approving vendor:", error.response?.data || error);
    throw error;
  }
};

export const rejectVendor = async (requestId: string, notes: string) => {
  try {
    const response = await apiClient.post(
      `ecommerce/vendor-approvals/${requestId}/reject/`,
      { admin_notes: notes }
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ Error rejecting vendor:", error.response?.data || error);
    throw error;
  }
};
