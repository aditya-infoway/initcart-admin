import React, { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../../api/apiClient"; // adjust path
import {
  FaSearch,
  FaTimes,
  FaCheck,
  FaBan,
  FaTrash,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaInfoCircle,
  FaImage,
  FaCloudUploadAlt,
} from "react-icons/fa";

interface TopSellerRow {
  id: number;
  request_id: string;
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  vendor_city: string;
  vendor_state: string;
  vendor_logo: string | null;
  vendor_joined: string | null;
  message: string;
  banner_url: string | null;
  banner_uploaded_by: "vendor" | "admin" | "";
  status: "pending" | "approved" | "rejected";
  is_active: boolean;
  display_order: number;
  admin_remarks: string | null;
  total_requests: number;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  live: number;
  hidden: number;
  rejected: number;
}

interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

const BASE = "ecommerce/admin/top-seller-requests/";
const MAX_MB = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const statusStyle = (s: string) => {
  switch (s) {
    case "approved": return "text-green-700 bg-green-50";
    case "rejected": return "text-red-700 bg-red-50";
    default: return "text-yellow-700 bg-yellow-50";
  }
};

const Avatar = ({ name, src, size = "h-10 w-10" }: { name: string; src: string | null; size?: string }) =>
  src ? (
    <img src={src} alt={name} className={`${size} rounded-full object-cover border border-gray-200 bg-white`} />
  ) : (
    <div className={`${size} rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );

const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    aria-pressed={checked}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? "bg-green-500" : "bg-gray-300"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
      ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
  </button>
);

// Server-side pagination bar (same look as the DataTable pagination)
interface ServerPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const ServerPagination = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ServerPaginationProps) => {
  if (totalCount === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const pages: (number | string)[] = [];
  const maxVisible = 3;
  const startPage = Math.max(1, page - 1);
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (startPage > 1) pages.push(1, "...");
  for (let i = startPage; i <= endPage; i++) pages.push(i);
  if (endPage < totalPages) pages.push("...", totalPages);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 border-t border-gray-100">
      <div className="flex items-center gap-5 text-sm text-gray-700">
        <div className="flex gap-2 items-center">
          <label htmlFor="ts-page-size" className="font-medium text-gray-600">Rows per page:</label>
          <select
            id="ts-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            className="border border-gray-300 rounded-lg px-2 py-1 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {[10, 25, 50].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-800">{from} - {to}</span> of {totalCount}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            page <= 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Prev
        </button>

        {pages.map((p, i) =>
          typeof p === "number" ? (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                p === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="px-2 text-gray-500">{p}</span>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            page >= totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const TopSellerManagement = () => {
  const [rows, setRows] = useState<TopSellerRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, live: 0, hidden: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0, total_pages: 1, current_page: 1, page_size: 10, has_next: false, has_previous: false,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [active, setActive] = useState<TopSellerRow | null>(null);
  const [remarks, setRemarks] = useState("");
  const [showOnApprove, setShowOnApprove] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // silent = true refreshes the data without showing the loading state (used after toggle / order changes)
  const fetchRows = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await axiosInstance.get(BASE, {
          params: { status: statusFilter, search, page, page_size: pageSize },
        });
        if (res.data.success) {
          setRows(res.data.data);
          setStats(res.data.stats);
          setPagination(res.data.pagination);
        }
      } catch (error: any) {
        // The requested page no longer exists (for example the last item of the last page was removed)
        if (error.response?.status === 404 && page > 1) {
          setPage(1);
          return;
        }
        Swal.fire({ icon: "error", title: "Error", text: "Failed to load top seller requests" });
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, page, pageSize]
  );

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Search debounce: always go back to page 1 when the search text changes
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const changeFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const openDetail = async (item: TopSellerRow) => {
    setModalOpen(true);
    setModalLoading(true);
    setRemarks("");
    setShowOnApprove(true);
    try {
      const res = await axiosInstance.get(`${BASE}${item.id}/`);
      if (res.data.success) setActive(res.data.data);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load request details" });
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setActive(null);
  };

  // Keep the table row and the modal in sync after a banner change
  const applyBannerUpdate = (updated: TopSellerRow) => {
    setActive(updated);
    setRows((prev) =>
      prev.map((r) =>
        r.id === updated.id
          ? { ...r, banner_url: updated.banner_url, banner_uploaded_by: updated.banner_uploaded_by }
          : r
      )
    );
  };

  const handleBannerPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !active) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      Swal.fire({ icon: "warning", title: "Invalid file", text: "Only JPG, PNG or WEBP images are allowed." });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      Swal.fire({ icon: "warning", title: "File too large", text: `Banner must be smaller than ${MAX_MB} MB.` });
      return;
    }

    setBannerLoading(true);
    try {
      const formData = new FormData();
      formData.append("banner", file);
      const res = await axiosInstance.post(`${BASE}${active.id}/banner/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        applyBannerUpdate(res.data.data);
        Swal.fire({ icon: "success", title: "Banner updated", timer: 1200, showConfirmButton: false });
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to upload banner" });
    } finally {
      setBannerLoading(false);
    }
  };

  const handleBannerRemove = async () => {
    if (!active) return;
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Remove banner?",
      text: "The store logo will be shown in the slider instead.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Remove",
    });
    if (!confirm.isConfirmed) return;

    setBannerLoading(true);
    try {
      const res = await axiosInstance.delete(`${BASE}${active.id}/banner/`);
      if (res.data.success) {
        applyBannerUpdate(res.data.data);
        Swal.fire({ icon: "success", title: "Banner removed", timer: 1200, showConfirmButton: false });
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to remove banner" });
    } finally {
      setBannerLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!active) return;
    const confirm = await Swal.fire({
      icon: "question",
      title: "Approve as Top Seller?",
      text: showOnApprove
        ? `${active.vendor_name} will appear on the website immediately${active.banner_url ? " with the current banner" : ""}.`
        : `${active.vendor_name} will be approved but stay hidden until you turn it on.`,
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Approve",
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await axiosInstance.post(`${BASE}${active.id}/approve/`, { remarks, is_active: showOnApprove });
      if (res.data.success) {
        Swal.fire({ icon: "success", title: "Approved", timer: 1400, showConfirmButton: false });
        closeModal();
        fetchRows(true);
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Approval failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!active) return;
    if (!remarks.trim()) {
      Swal.fire({ icon: "warning", title: "Remarks required", text: "Please add a reason so the vendor knows why." });
      return;
    }
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Reject Request?",
      text: "The vendor will see your remarks and can send a new request later.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Reject",
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await axiosInstance.post(`${BASE}${active.id}/reject/`, { remarks });
      if (res.data.success) {
        Swal.fire({ icon: "success", title: "Rejected", timer: 1400, showConfirmButton: false });
        closeModal();
        fetchRows(true);
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Rejection failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (item: TopSellerRow) => {
    // optimistic update
    setRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, is_active: !r.is_active } : r)));
    try {
      await axiosInstance.post(`${BASE}${item.id}/toggle/`);
      fetchRows(true); // refresh stats and the current page (a hidden item may leave the "live" filter)
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to update" });
      fetchRows(true);
    }
  };

  const handleOrderSave = async (item: TopSellerRow, input: HTMLInputElement) => {
    const num = parseInt(input.value, 10);

    // Invalid or empty value: put the old number back
    if (isNaN(num) || num < 0) {
      input.value = String(item.display_order);
      return;
    }
    // Nothing changed
    if (num === item.display_order) return;

    try {
      await axiosInstance.post(`${BASE}${item.id}/order/`, { display_order: num });
      setRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, display_order: num } : r)));
      Swal.fire({ icon: "success", title: "Order updated", timer: 1000, showConfirmButton: false });
    } catch (error: any) {
      // Duplicate number (or any other error): restore the old number and show the message
      input.value = String(item.display_order);
      Swal.fire({
        icon: "warning",
        title: "Cannot set this order",
        text: error.response?.data?.message || "Failed to update order",
      });
    }
  };

  const handleRemove = async (item: TopSellerRow) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Remove from Top Sellers?",
      text: `${item.vendor_name} will be removed completely. The vendor can send a new request later.`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Remove",
    });
    if (!confirm.isConfirmed) return;
    try {
      await axiosInstance.delete(`${BASE}${item.id}/`);
      Swal.fire({ icon: "success", title: "Removed", timer: 1200, showConfirmButton: false });
      fetchRows(true);
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to remove" });
    }
  };

  const statCards = [
    { key: "all", label: "Total Requests", value: stats.total, color: "text-gray-800", ring: "ring-gray-400" },
    { key: "pending", label: "Pending", value: stats.pending, color: "text-yellow-600", ring: "ring-yellow-400" },
    { key: "live", label: "Live on Website", value: stats.live, color: "text-green-600", ring: "ring-green-400" },
    { key: "hidden", label: "Approved (Hidden)", value: stats.hidden, color: "text-blue-600", ring: "ring-blue-400" },
    { key: "rejected", label: "Rejected", value: stats.rejected, color: "text-red-600", ring: "ring-red-400" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Top Sellers Management</h1>
        <p className="text-sm text-gray-500">Review vendor requests and control who appears in the homepage Top Sellers slider.</p>
      </div>

      {/* Stat cards (clickable filters) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map((c) => (
          <button
            key={c.key}
            onClick={() => changeFilter(c.key)}
            className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center transition hover:shadow-md
              ${statusFilter === c.key ? `ring-2 ${c.ring}` : ""}`}
          >
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "live", "hidden", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => changeFilter(s)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search vendor or request ID..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && rows.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No requests found. </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "Vendor", "Request ID", "Banner", "Location", "Requested On", "Status", "Show on Website", "Order", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {(pagination.current_page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.vendor_name} src={item.vendor_logo} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.vendor_name}</p>
                          <p className="text-xs text-gray-500">{item.vendor_email || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.request_id}</td>
                    <td className="px-4 py-3">
                      {item.banner_url ? (
                        <img
                          src={item.banner_url}
                          alt="Banner"
                          style={{ aspectRatio: "2 / 1" }}
                          className="w-24 rounded border border-gray-200 object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No banner</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {[item.vendor_city, item.vendor_state].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "approved" ? (
                        <div className="flex items-center gap-2">
                          <Toggle checked={item.is_active} onChange={() => handleToggle(item)} />
                          <span className={`text-xs font-medium ${item.is_active ? "text-green-600" : "text-gray-400"}`}>
                            {item.is_active ? "Live" : "Hidden"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "approved" ? (
                        <input
                          type="number"
                          min={0}
                          defaultValue={item.display_order}
                          key={`${item.id}-${item.display_order}`}
                          onBlur={(e) => handleOrderSave(item, e.target)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                          title="Lower number = appears first in slider"
                        />
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetail(item)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-1"
                        >
                          <FaEye className="text-xs" />
                          {item.status === "pending" ? "Review" : "View"}
                        </button>
                        {item.status !== "pending" && (
                          <button
                            onClick={() => handleRemove(item)}
                            className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 font-medium flex items-center gap-1"
                          >
                            <FaTrash className="text-xs" />
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ServerPagination
          page={pagination.current_page}
          pageSize={pageSize}
          totalCount={pagination.count}
          totalPages={pagination.total_pages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Detail Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button onClick={closeModal} className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-2xl flex items-center justify-center">
              <FaTimes />
            </button>

            {modalLoading || !active ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-5 pr-8">
                  <Avatar name={active.vendor_name} src={active.vendor_logo} size="h-16 w-16 text-xl" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{active.vendor_name}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      {active.request_id} &middot;{" "}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle(active.status)}`}>
                        {active.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Email", value: active.vendor_email || "-", icon: <FaEnvelope className="text-gray-400" /> },
                    { label: "Phone", value: active.vendor_phone || "-", icon: <FaPhone className="text-gray-400" /> },
                    { label: "Location", value: [active.vendor_city, active.vendor_state].filter(Boolean).join(", ") || "-", icon: <FaMapMarkerAlt className="text-gray-400" /> },
                    { label: "Vendor Since", value: formatDate(active.vendor_joined), icon: <FaCalendarAlt className="text-gray-400" /> },
                    { label: "Requested On", value: formatDate(active.created_at), icon: <FaCalendarAlt className="text-gray-400" /> },
                    { label: "Total Requests Sent", value: String(active.total_requests), icon: <FaClipboardList className="text-gray-400" /> },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1.5">
                        {item.icon}
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-gray-800 break-words">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Banner section */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <FaImage className="text-gray-400" />
                      Slider Banner
                    </p>
                    {active.banner_url && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Uploaded by {active.banner_uploaded_by === "admin" ? "admin" : "vendor"}
                      </span>
                    )}
                  </div>

                  <div
                    style={{ aspectRatio: "2 / 1" }}
                    className="relative w-full max-w-md rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    {active.banner_url ? (
                      <img src={active.banner_url} alt="Banner" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1 px-4 text-center">
                        <FaImage className="text-2xl" />
                        No banner uploaded. The store logo will be used in the slider.
                      </div>
                    )}
                    {bannerLoading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleBannerPick}
                  />

                  {active.status !== "rejected" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={bannerLoading}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <FaCloudUploadAlt />
                        {active.banner_url ? "Replace Banner" : "Upload Banner"}
                      </button>
                      {active.banner_url && (
                        <button
                          onClick={handleBannerRemove}
                          disabled={bannerLoading}
                          className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <FaTrash className="text-xs" />
                          Remove Banner
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended 600 x 300 px (2:1). Any uploaded image is automatically cropped and resized to this size.
                  </p>
                </div>

                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaInfoCircle className="text-gray-400" />
                    Vendor's Message
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700 whitespace-pre-wrap min-h-[56px]">
                    {active.message || <span className="text-gray-400 italic">No message provided</span>}
                  </div>
                </div>

                {active.status !== "pending" && (
                  <div className={`mb-5 p-3 rounded-lg text-sm ${active.status === "approved" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                    {active.status === "approved"
                      ? `Approved on ${formatDate(active.approved_at)}`
                      : `Rejected on ${formatDate(active.rejected_at)}`}
                    {active.admin_remarks && <> &middot; Remarks: {active.admin_remarks}</>}
                  </div>
                )}

                {active.status === "pending" && (
                  <>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Remarks <span className="text-gray-400 font-normal">(required for reject)</span>
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Add a note for the vendor..."
                      />
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Show on website after approval</p>
                        <p className="text-xs text-gray-500">If turned off, it will be approved but won't appear in the slider.</p>
                      </div>
                      <Toggle checked={showOnApprove} onChange={() => setShowOnApprove((v) => !v)} />
                    </div>
                  </>
                )}

                <div className="flex flex-wrap justify-end gap-2">
                  {active.status === "pending" && (
                    <>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading || bannerLoading}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <FaBan className="text-sm" />
                        Reject
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading || bannerLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <FaCheck className="text-sm" />
                        {actionLoading ? "Processing..." : "Approve"}
                      </button>
                    </>
                  )}
                  {active.status === "approved" && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Show on website</span>
                      <Toggle
                        checked={active.is_active}
                        onChange={async () => {
                          await handleToggle(active);
                          setActive({ ...active, is_active: !active.is_active });
                        }}
                      />
                    </div>
                  )}
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopSellerManagement;