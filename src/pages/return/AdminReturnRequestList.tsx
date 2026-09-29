import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiClient from "../../api/apiClient";

interface ReturnItem {
  id: number;
  return_id: string;
  order_number: string;
  product_name: string;
  vendor_name: string;
  customer_name: string;
  reason: string;
  images: string[];
  vendor_remarks: string | null;
  status: string;
  requested_at: string;
  vendor_responded_at: string | null;
  re_requested_at: string | null;
}

interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

interface Stats {
  total: number;
  requested: number;
  vendor_approved: number;
  vendor_rejected: number;
  re_requested: number;
  admin_approved: number;
  admin_rejected: number;
}

const EMPTY_STATS: Stats = {
  total: 0, requested: 0, vendor_approved: 0, vendor_rejected: 0,
  re_requested: 0, admin_approved: 0, admin_rejected: 0,
};

const PAGE_SIZES = [10, 15, 25, 50];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getFullImageUrl = (url: string) => {
  if (!url) return url;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const statusStyle = (s: string) => {
  switch (s) {
    case "vendor_approved":
    case "admin_approved":
      return "text-green-700 bg-green-50";
    case "vendor_rejected":
      return "text-orange-700 bg-orange-50";
    case "admin_rejected":
      return "text-red-700 bg-red-50";
    case "re_requested":
      return "text-blue-700 bg-blue-50";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

const StatCard = ({
  label, value, color = "text-gray-900",
}: { label: string; value: number | string; color?: string }) => (
  <div className="p-4 rounded-lg border border-gray-200 bg-white">
    <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
    <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
  </div>
);

const Pagination = ({
  pagination, onPage, onSize,
}: { pagination: PaginationInfo; onPage: (p: number) => void; onSize: (s: number) => void }) => {
  const { count, total_pages, current_page, page_size, has_next, has_previous } = pagination;
  if (count === 0) return null;

  const start = (current_page - 1) * page_size + 1;
  const end = Math.min(current_page * page_size, count);

  const from = Math.max(1, Math.min(current_page - 2, total_pages - 4));
  const to = Math.min(total_pages, from + 4);
  const pages: number[] = [];
  for (let i = from; i <= to; i++) pages.push(i);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-gray-200 text-sm">
      <div className="flex items-center gap-3 text-gray-600">
        <span>Showing {start}–{end} of {count}</span>
        <select
          value={page_size}
          onChange={(e) => onSize(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={!has_previous} onClick={() => onPage(current_page - 1)}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">Prev</button>
        {pages.map((p) => (
          <button key={p} onClick={() => onPage(p)}
            className={`px-3 py-1 rounded border ${
              p === current_page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"
            }`}>{p}</button>
        ))}
        <button disabled={!has_next} onClick={() => onPage(current_page + 1)}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">Next</button>
      </div>
    </div>
  );
};

const AdminReturnRequestList = () => {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("re_requested");
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const TABS = [
    { key: "re_requested", label: "Needs Your Action", count: stats.re_requested },
    { key: "requested", label: "With Vendor", count: stats.requested },
    { key: "all", label: "All", count: stats.total },
  ];

  useEffect(() => {
    fetchReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, pageSize]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("ecommerce/admin/returns/", {
        params: { status: activeTab, page, page_size: pageSize },
      });
      if (response.data.success) {
        setReturns(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats || EMPTY_STATS);
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to fetch returns" });
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleAction = async (item: ReturnItem, action: "approve" | "reject") => {
    const confirm = await Swal.fire({
      icon: "question",
      title: action === "approve" ? "Approve Return?" : "Reject Return?",
      text: `Vendor "${item.vendor_name}" had rejected this. Final decision?`,
      input: "text",
      inputLabel: "Remarks (optional)",
      showCancelButton: true,
      confirmButtonText: action === "approve" ? "Approve" : "Reject",
      confirmButtonColor: action === "approve" ? "#16a34a" : "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      const response = await apiClient.post(`ecommerce/admin/returns/${item.id}/action/`, {
        action,
        remarks: confirm.value || "",
      });
      if (response.data.success) {
        Swal.fire({ icon: "success", title: "Done", text: response.data.message, timer: 1500, showConfirmButton: false });
        fetchReturns();
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Action failed" });
    }
  };

  const handleViewImages = (item: ReturnItem) => {
    if (!item.images || item.images.length === 0) {
      Swal.fire({ icon: "info", title: "No Images", text: "Customer did not upload any images." });
      return;
    }

    const imagesHtml = item.images
      .map((rawUrl) => {
        const url = getFullImageUrl(rawUrl);
        return `
          <a href="${url}" target="_blank" rel="noopener noreferrer">
            <img src="${url}" style="width:100%; height:100px; object-fit:cover; border-radius:6px; border:1px solid #e5e5e5;" />
          </a>`;
      })
      .join("");

    Swal.fire({
      title: `Images — ${item.return_id}`,
      html: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">${imagesHtml}</div>`,
      width: 500,
      confirmButtonText: "Close",
      confirmButtonColor: "#2563eb",
    });
  };

  const approved = stats.vendor_approved + stats.admin_approved;
  const rejected = stats.vendor_rejected + stats.admin_rejected;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total Returns" value={stats.total} />
        <StatCard label="With Vendor" value={stats.requested} color="text-yellow-600" />
        <StatCard label="Needs Your Action" value={stats.re_requested} color="text-blue-600" />
        <StatCard label="Approved" value={approved} color="text-green-600" />
        <StatCard label="Rejected" value={rejected} color="text-red-600" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Return Requests (Admin)</h2>
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => changeTab(t.key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  activeTab === t.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No return requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Re-requested On</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returns.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.return_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.vendor_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 italic">{item.vendor_remarks || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle(item.status)}`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.re_requested_at ? formatDate(item.re_requested_at) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {item.status === "re_requested" && (
                          <>
                            <button onClick={() => handleAction(item, "approve")} className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 font-medium">
                              Approve
                            </button>
                            <button onClick={() => handleAction(item, "reject")} className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 font-medium">
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewImages(item)}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium"
                        >
                          View Images {item.images?.length > 0 ? `(${item.images.length})` : ""}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <Pagination pagination={pagination} onPage={setPage} onSize={(s) => { setPageSize(s); setPage(1); }} />
        )}
      </div>
    </div>
  );
};

export default AdminReturnRequestList;