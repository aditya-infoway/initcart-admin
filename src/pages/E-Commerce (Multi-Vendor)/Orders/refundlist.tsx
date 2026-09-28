// pages/admin/refunds/AdminRefundList.tsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";

interface RefundItem {
  id: number;
  refund_id: string;
  return_id: string;
  return_status: string;
  order_number: string;
  product_name: string;
  customer_name: string;
  vendor_name: string;
  refund_amount: number;
  status: "pending" | "processed" | "failed";
  razorpay_refund_id: string | null;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string;
}

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
  { key: "processed", label: "Processed" },
  { key: "all", label: "All" },
];

const AdminRefundList = () => {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, [activeTab]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("ecommerce/admin/refunds/", {
        params: { status: activeTab },
      });
      if (response.data.success) setRefunds(response.data.data);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch refunds",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount || 0);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const statusStyle = (s: string) => {
    switch (s) {
      case "processed":
        return "text-green-700 bg-green-50";
      case "failed":
        return "text-red-700 bg-red-50";
      default:
        return "text-yellow-700 bg-yellow-50";
    }
  };

  const handleProcess = async (item: RefundItem) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Process this refund?",
      html: `This will call Razorpay and refund <b>${formatCurrency(item.refund_amount)}</b> to the customer for order <b>${item.order_number}</b>.`,
      showCancelButton: true,
      confirmButtonText: "Yes, Process Refund",
      confirmButtonColor: "#2563eb",
    });
    if (!confirm.isConfirmed) return;

    setProcessingId(item.id);
    try {
      const response = await apiClient.post(`ecommerce/admin/refunds/${item.id}/process/`, {});
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Refund Processed",
          text: response.data.message,
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Refund Failed",
          text: response.data.message || "Razorpay could not process this refund. Check details and retry.",
        });
      }
      fetchRefunds();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong while processing the refund",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Customer Refunds (Online Orders)</h2>
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  activeTab === t.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : refunds.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No refunds found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {refunds.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.refund_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.vendor_name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(item.refund_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle(item.status)}`}>
                        {item.status}
                      </span>
                      {item.status === "failed" && item.failure_reason && (
                        <p className="text-[11px] text-red-500 mt-1 max-w-[180px]">{item.failure_reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3">
                      {item.status !== "processed" ? (
                        <button
                          onClick={() => handleProcess(item)}
                          disabled={processingId === item.id}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                          {processingId === item.id
                            ? "Processing..."
                            : item.status === "failed"
                            ? "Retry Refund"
                            : "Process Refund"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Done{item.processed_at ? ` · ${formatDate(item.processed_at)}` : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRefundList;