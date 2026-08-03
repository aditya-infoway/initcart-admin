//payments/VendorPaymentApprovals.tsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import axiosInstance from "../../../api/apiClient";

interface OrderRow {
  order_id: number;
  order_number: string;
  created_at: string;
  billing_name: string;
  vendor_total: number;
  platform_charge: number;
}

interface PaymentRequestRow {
  id: number;
  payment_request_id: string;
  vendor_name: string;
  date_from: string;
  date_to: string;
  total_order_amount: number;
  online_platform_charge: number;
  cod_platform_charge: number;
  total_platform_charge: number;
  release_payment_amount: number;
  approved_order_amount: number;
  approved_online_charge: number;
  approved_amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  admin_remarks: string | null;
  created_at: string;
  orders_data?: OrderRow[];
  approved_order_ids?: number[];
}

const VendorPaymentApprovals = () => {
  const [requests, setRequests] = useState<PaymentRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState<PaymentRequestRow | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("ecommerce/admin/payment-requests/", {
        params: { status: statusFilter },
      });
      if (response.data.success) setRequests(response.data.data);
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load payment requests" });
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (item: PaymentRequestRow) => {
    setModalOpen(true);
    setModalLoading(true);
    setRemarks("");
    try {
      const response = await axiosInstance.get(`ecommerce/admin/payment-requests/${item.id}/`);
      if (response.data.success) {
        const data = response.data.data;
        setActiveRequest(data);
        setSelectedOrderIds(
          data.approved_order_ids?.length
            ? data.approved_order_ids
            : data.orders_data.map((o: OrderRow) => o.order_id)
        );
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load request details" });
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const toggleOrder = (orderId: number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount || 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const statusStyle = (statusVal: string) => {
    switch (statusVal) {
      case "paid": return "text-green-700 bg-green-50";
      case "approved": return "text-blue-700 bg-blue-50";
      case "rejected": return "text-red-700 bg-red-50";
      default: return "text-yellow-700 bg-yellow-50";
    }
  };

  const selectedPreview = () => {
    if (!activeRequest?.orders_data) return { vendorTotal: 0, onlineCharge: 0, releaseAmount: 0 };
    const selected = activeRequest.orders_data.filter((o) => selectedOrderIds.includes(o.order_id));
    const vendorTotal = selected.reduce((s, o) => s + o.vendor_total, 0);
    const onlineCharge = selected.reduce((s, o) => s + o.platform_charge, 0);
    const releaseAmount = vendorTotal - onlineCharge - (activeRequest.cod_platform_charge || 0);
    return { vendorTotal, onlineCharge, releaseAmount };
  };

  const handleApprove = async (full: boolean) => {
    if (!activeRequest) return;
    if (!full && selectedOrderIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Select at least one order" });
      return;
    }
    const preview = selectedPreview();
    const confirm = await Swal.fire({
      icon: "question",
      title: full ? "Approve Full Request?" : "Approve Selected Orders?",
      text: `Approved amount will be ${formatCurrency(preview.releaseAmount)}.`,
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Approve",
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      const payload: any = { remarks };
      if (!full) payload.approved_order_ids = selectedOrderIds;

      const response = await axiosInstance.post(
        `ecommerce/admin/payment-requests/${activeRequest.id}/approve/`,
        payload
      );
      if (response.data.success) {
        Swal.fire({ icon: "success", title: "Approved", timer: 1500, showConfirmButton: false });
        setModalOpen(false);
        fetchRequests();
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Approval failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeRequest) return;
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Reject Payment Request?",
      text: "The orders in this request will become available for the vendor to re-request.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Reject",
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.post(
        `ecommerce/admin/payment-requests/${activeRequest.id}/reject/`,
        { remarks }
      );
      if (response.data.success) {
        Swal.fire({ icon: "success", title: "Rejected", timer: 1500, showConfirmButton: false });
        setModalOpen(false);
        fetchRequests();
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Rejection failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!activeRequest) return;
    const confirm = await Swal.fire({
      icon: "question",
      title: "Mark as Paid?",
      text: `Confirm that ${formatCurrency(activeRequest.approved_amount)} has been paid to the vendor.`,
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Yes, Paid",
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`ecommerce/admin/payment-requests/${activeRequest.id}/mark-paid/`);
      if (response.data.success) {
        Swal.fire({ icon: "success", title: "Marked as Paid", timer: 1500, showConfirmButton: false });
        setModalOpen(false);
        fetchRequests();
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to mark as paid" });
    } finally {
      setActionLoading(false);
    }
  };

  const preview = selectedPreview();

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "pending", "approved", "paid", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        title="Vendor Payment Requests"
        data={requests}
        loading={loading}
        columns={[
          { key: "payment_request_id", label: "Request ID" },
          { key: "vendor_name", label: "Vendor" },
          {
            key: "date_range",
            label: "Order Date Range",
            render: (item: PaymentRequestRow) => `${formatDate(item.date_from)} - ${formatDate(item.date_to)}`,
          },
          {
            key: "total_order_amount",
            label: "Order Amount",
            render: (item: PaymentRequestRow) => formatCurrency(item.total_order_amount),
          },
          {
            key: "total_platform_charge",
            label: "Platform Charge",
            render: (item: PaymentRequestRow) => (
              <span className="text-red-600">-{formatCurrency(item.total_platform_charge)}</span>
            ),
          },
          {
            key: "release_payment_amount",
            label: "Requested Amount",
            render: (item: PaymentRequestRow) => (
              <span className="font-semibold">{formatCurrency(item.release_payment_amount)}</span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item: PaymentRequestRow) => (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle(item.status)}`}>
                {item.status}
              </span>
            ),
          },
          {
            key: "action",
            label: "Action",
            render: (item: PaymentRequestRow) => (
              <button
                onClick={() => openDetail(item)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Review
              </button>
            ),
          },
        ]}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>

            {modalLoading || !activeRequest ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1">{activeRequest.payment_request_id}</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {activeRequest.vendor_name} &middot; {formatDate(activeRequest.date_from)} - {formatDate(activeRequest.date_to)}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Order Amount</p>
                    <p className="font-bold text-gray-800">{formatCurrency(preview.vendorTotal)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Online Platform Charge</p>
                    <p className="font-bold text-red-600">-{formatCurrency(preview.onlineCharge)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">COD Platform Charge</p>
                    <p className="font-bold text-red-600">-{formatCurrency(activeRequest.cod_platform_charge)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 mb-1">Release Amount</p>
                    <p className="font-bold text-blue-700">{formatCurrency(preview.releaseAmount)}</p>
                  </div>
                </div>

                {activeRequest.status !== "pending" && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                    Approved amount: <strong>{formatCurrency(activeRequest.approved_amount)}</strong>
                    {activeRequest.admin_remarks && <> &middot; Remarks: {activeRequest.admin_remarks}</>}
                  </div>
                )}

                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Orders {activeRequest.status === "pending" ? "(select to approve partially)" : ""}
                </h3>
                <div className="overflow-x-auto border rounded-lg mb-6">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {activeRequest.status === "pending" && <th className="px-3 py-2"></th>}
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeRequest.orders_data?.map((order) => (
                        <tr key={order.order_id} className={selectedOrderIds.includes(order.order_id) ? "bg-blue-50" : ""}>
                          {activeRequest.status === "pending" && (
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={selectedOrderIds.includes(order.order_id)}
                                onChange={() => toggleOrder(order.order_id)}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                            </td>
                          )}
                          <td className="px-3 py-2 font-medium">{order.order_number}</td>
                          <td className="px-3 py-2 text-gray-600">{formatDate(order.created_at)}</td>
                          <td className="px-3 py-2 text-gray-600">{order.billing_name}</td>
                          <td className="px-3 py-2">{formatCurrency(order.vendor_total)}</td>
                          <td className="px-3 py-2 text-red-600">-{formatCurrency(order.platform_charge)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {activeRequest.status === "pending" && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Remarks (optional)</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="customInput w-full"
                      rows={2}
                      placeholder="Add a note for the vendor..."
                    />
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-2 mt-4">
                  {activeRequest.status === "pending" && (
                    <>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(false)}
                        disabled={actionLoading || selectedOrderIds.length === (activeRequest.orders_data?.length || 0)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve Selected
                      </button>
                      <button
                        onClick={() => handleApprove(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                      >
                        Approve Full Request
                      </button>
                    </>
                  )}
                  {activeRequest.status === "approved" && (
                    <button
                      onClick={handleMarkPaid}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                    >
                      {actionLoading ? "Processing..." : "Mark as Paid"}
                    </button>
                  )}
                  {(activeRequest.status === "paid" || activeRequest.status === "rejected") && (
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium ${statusStyle(activeRequest.status)}`}>
                      {activeRequest.status === "paid" ? "Payment completed" : "This request was rejected"}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPaymentApprovals;