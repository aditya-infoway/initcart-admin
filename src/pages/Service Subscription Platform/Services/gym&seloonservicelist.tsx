import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiCheck, FiEye, FiX, FiFilter, FiGrid, FiList, FiSearch,
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiBriefcase,
  FiMapPin, FiPhone, FiMail, FiClock, FiUser, FiTag, FiImage,
  FiSliders, FiDownload, FiPrinter, FiScissors,
  FiCpu, FiUserCheck, FiAlertCircle, FiCheckCircle,
  FiXCircle, FiClock as FiClockIcon, FiActivity, FiChevronDown,
  FiTrendingUp
} from "react-icons/fi";
import { FaPlane, FaDumbbell } from "react-icons/fa";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";

// ============================================================
// Types & Interfaces
// ============================================================
interface ServiceVendor {
  id: number;
  type?: string;
  category?: string;
  subcategory: number;
  subcategory_name: string;
  business_name: string;
  contact_no: string;
  whatsapp_no?: string;
  gmail_id?: string;
  city: string;
  location?: string;
  open_time?: string;
  close_time?: string;
  description?: string;
  main_image?: string;
  second_image?: string;
  multi_images?: any[];
  items?: any[];
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  address?: string;
  country?: string;
  state?: string;
  email?: string;
}

interface VendorStats {
  total_vendor: number;
  approved: number;
  pending: number;
  rejected: number;
}

// ============================================================
// Constants
// ============================================================
const CATEGORIES = [
  { value: "gym",           label: "Gym",          icon: FaDumbbell,  color: "#4f46e5" },
  { value: "salon",         label: "Salon",        icon: FiScissors,  color: "#db2777" },
  { value: "travel_agency", label: "Travel",       icon: FaPlane,     color: "#0284c7" },
  { value: "tech_industry", label: "Tech",         icon: FiCpu,       color: "#7c3aed" },
  { value: "professional",  label: "Professional", icon: FiUserCheck, color: "#059669" },
];

const STATUS_OPTIONS = [
  { value: "all",      label: "All Status"  },
  { value: "pending",  label: "Pending"     },
  { value: "approved", label: "Approved"    },
  { value: "rejected", label: "Rejected"    },
];

const ITEMS_PER_PAGE = 10;

// ============================================================
// Helpers
// ============================================================
const getStatusConfig = (status: string) => {
  const map: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    pending:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"  },
    rejected: { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500"   },
  };
  return map[status] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" };
};

const formatDate = (d?: string) => {
  if (!d) return "N/A";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "Invalid Date"; }
};

// SweetAlert helpers
const showApproveConfirm = async (name: string) =>
  (await Swal.fire({ title: "Approve Service Provider?", html: `Approve <strong>${name}</strong>?<br/>It will become visible to users.`, icon: "question", showCancelButton: true, confirmButtonColor: "#10b981", cancelButtonColor: "#6b7280", confirmButtonText: "Yes, Approve", cancelButtonText: "Cancel", customClass: { popup: "rounded-2xl" } })).isConfirmed;

const showRejectConfirm = async (name: string) =>
  (await Swal.fire({ title: "Reject Service Provider?", html: `Reject <strong>${name}</strong>?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280", confirmButtonText: "Yes, Reject", cancelButtonText: "Cancel", customClass: { popup: "rounded-2xl" } })).isConfirmed;

const showSuccessToast = (msg: string, type: "approve" | "reject") =>
  Swal.fire({ title: type === "approve" ? "Approved!" : "Rejected!", text: msg, icon: type === "approve" ? "success" : "error", toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true, customClass: { popup: "rounded-xl shadow-xl" } });

const showErrorAlert = (msg: string) =>
  Swal.fire({ title: "Error!", text: msg, icon: "error", confirmButtonColor: "#4f46e5", confirmButtonText: "OK", customClass: { popup: "rounded-2xl" } });

// ============================================================
// Main Component
// ============================================================
const GymServiceApprovalList = () => {
  // ── State ────────────────────────────────────────────────
  const [vendors,         setVendors]         = useState<ServiceVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<ServiceVendor[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceVendor | null>(null);
  const [openModal,       setOpenModal]       = useState(false);

  // All vendors fetched once (no status param) to compute per-category stats
  const [allVendors, setAllVendors] = useState<ServiceVendor[]>([]);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [searchTerm,     setSearchTerm]     = useState("");

  const [loading,      setLoading]      = useState(false);
  const [viewMode,     setViewMode]     = useState<"table" | "card">("table");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetch all vendors once (for stats) ──────────────────
  const fetchAllVendors = useCallback(async () => {
    try {
      const response = await apiClient.get("gym-approval-filter/");
      const data = response.data?.data || response.data || [];
      setAllVendors(Array.isArray(data) ? data : []);
    } catch { /* silently fail – stats just show 0 */ }
  }, []);

  // ── Fetch filtered vendors (for table/cards) ─────────────
  const fetchFilteredData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (statusFilter   !== "all") params.status   = statusFilter;
      const response  = await apiClient.get("gym-approval-filter/", { params });
      const data      = response.data?.data || response.data || [];
      const vendorList = Array.isArray(data) ? data : [];
      setVendors(vendorList);
      setFilteredVendors(vendorList);
      setCurrentPage(1);
    } catch {
      showErrorAlert("Failed to fetch service providers. Please try again.");
      setVendors([]); setFilteredVendors([]);
    } finally { setLoading(false); }
  }, [categoryFilter, statusFilter]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchFilteredData(), fetchAllVendors()]);
    setIsRefreshing(false);
  }, [fetchFilteredData, fetchAllVendors]);

  useEffect(() => { fetchAllVendors(); }, [fetchAllVendors]);
  useEffect(() => { fetchFilteredData(); }, [fetchFilteredData]);

  // Search filter (client-side)
  useEffect(() => {
    if (!searchTerm.trim()) { setFilteredVendors(vendors); return; }
    const s = searchTerm.toLowerCase();
    setFilteredVendors(vendors.filter(v =>
      v.business_name?.toLowerCase().includes(s) ||
      v.subcategory_name?.toLowerCase().includes(s) ||
      v.city?.toLowerCase().includes(s) ||
      v.contact_no?.includes(searchTerm)
    ));
    setCurrentPage(1);
  }, [searchTerm, vendors]);
  const sortNewest = (list: ServiceVendor[]) =>
  [...list].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const db = b.created_at ? new Date(b.created_at).getTime() : 0;
    return db - da;
  });
  // ── Actions ──────────────────────────────────────────────
  const handleApprove = useCallback(async (vendor: ServiceVendor) => {
    if (!await showApproveConfirm(vendor.business_name)) return;
    try {
      await apiClient.patch(`gym-service-approve/${vendor.id}/`, { status: "approved", subcategory: vendor.subcategory });
      const update = (list: ServiceVendor[]) => list.map(v => v.id === vendor.id ? { ...v, status: "approved" as const } : v);
      setVendors(update); setAllVendors(update);
      showSuccessToast(`${vendor.business_name} approved.`, "approve");
    } catch { showErrorAlert("Failed to approve service."); }
  }, []);

  const handleReject = useCallback(async (vendor: ServiceVendor) => {
    if (!await showRejectConfirm(vendor.business_name)) return;
    try {
      await apiClient.patch(`gym-service-approve/${vendor.id}/`, { status: "rejected", subcategory: vendor.subcategory });
      const update = (list: ServiceVendor[]) => list.map(v => v.id === vendor.id ? { ...v, status: "rejected" as const } : v);
      setVendors(update); setAllVendors(update);
      showSuccessToast(`${vendor.business_name} rejected.`, "reject");
    } catch { showErrorAlert("Failed to reject service."); }
  }, []);

  const handleViewDetails = useCallback(async (id: number, subcategoryId: number) => {
    try {
      const response = await apiClient.get("/service-detail/", { params: { service_id: id, subcategory_id: subcategoryId } });
      setSelectedService(response.data); setOpenModal(true);
    } catch { showErrorAlert("Failed to load service details."); }
  }, []);

  // ── Stats: based on selected category from ALL vendors ───
  // If "all" → use all vendors; else → filter by category
  const displayStats = useMemo((): VendorStats => {
    const base = categoryFilter === "all"
      ? allVendors
      : allVendors.filter(v => v.category === categoryFilter);
    return {
      total_vendor: base.length,
      approved:     base.filter(v => v.status === "approved").length,
      pending:      base.filter(v => v.status === "pending").length,
      rejected:     base.filter(v => v.status === "rejected").length,
    };
  }, [allVendors, categoryFilter]);

  const activeCat = CATEGORIES.find(c => c.value === categoryFilter);

  const totalPages      = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        .dash { font-family:'DM Sans',sans-serif; }
        .mono { font-family:'DM Mono',monospace; }

        /* stat cards */
        .stat-card { position:relative; overflow:hidden; transition:box-shadow .2s,transform .2s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px -6px rgba(0,0,0,.10); }
        .stat-card-bar { position:absolute; left:0; top:0; bottom:0; width:4px; border-radius:4px 0 0 4px; }

        /* table */
        .trow { transition:background .1s; }
        .trow:hover { background:#f8fafc; }
        .abtn { transition:all .14s; border-radius:8px; }
        .abtn:hover { transform:scale(1.1); }

        /* pill badge */
        .pill { display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 7px;border-radius:20px;border-width:1px;border-style:solid;font-size:11px;font-weight:700;letter-spacing:.04em; }
        .dot  { width:6px;height:6px;border-radius:50%;flex-shrink:0; }

        /* modal */
        .moverlay { animation:fIn .18s ease; }
        .mpanel   { animation:sUp .22s cubic-bezier(.4,0,.2,1); }
        @keyframes fIn { from{opacity:0} to{opacity:1} }
        @keyframes sUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* spinner */
        .spin { animation:rot .8s linear infinite; }
        @keyframes rot { to{transform:rotate(360deg)} }

        /* pagination */
        .pbtn { min-width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:13px;font-weight:500;border:1px solid #e2e8f0;color:#64748b;cursor:pointer;transition:all .14s; }
        .pbtn:hover:not(:disabled) { background:#ede9fe;color:#4f46e5;border-color:#c4b5fd; }
        .pbtn.act { background:#4f46e5;color:#fff;border-color:#4f46e5; }
        .pbtn:disabled { opacity:.35;cursor:not-allowed; }

        /* select arrow */
        select { appearance:none!important; }
        input:focus,select:focus { outline:none;box-shadow:0 0 0 3px rgba(79,70,229,.13); }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
      `}</style>

      <div className="dash max-w-screen-xl mx-auto px-4 md:px-8 py-8">

        {/* ════════════════════════════════════════
            HEADER
        ════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FiActivity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mono">Admin Panel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Service Approval Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and manage service provider registrations across all categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FiDownload className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FiPrinter className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleRefresh} disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════
            STATS CARDS  (driven by category dropdown)
        ════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="stat-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="stat-card-bar bg-slate-300" />
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                <FiBriefcase className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mono">{displayStats.total_vendor}</p>
            <p className="text-xs text-slate-400 mt-1.5">
              {categoryFilter === "all" ? "All categories" : `In ${activeCat?.label}`}
            </p>
          </div>

          {/* Approved */}
          <div className="stat-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="stat-card-bar bg-emerald-500" />
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approved</p>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600 mono">{displayStats.approved}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <FiTrendingUp className="w-3 h-3 text-emerald-500" />
              <p className="text-xs text-slate-400">
                {displayStats.total_vendor
                  ? Math.round((displayStats.approved / displayStats.total_vendor) * 100)
                  : 0}% of total
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="stat-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="stat-card-bar bg-amber-400" />
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</p>
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <FiClockIcon className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600 mono">{displayStats.pending}</p>
            <p className="text-xs text-slate-400 mt-1.5">Awaiting review</p>
          </div>

          {/* Rejected */}
          <div className="stat-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="stat-card-bar bg-rose-500" />
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rejected</p>
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                <FiXCircle className="w-4 h-4 text-rose-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-600 mono">{displayStats.rejected}</p>
            <p className="text-xs text-slate-400 mt-1.5">Not approved</p>
          </div>
        </div>

        {/* ════════════════════════════════════════
            FILTER BAR  (category dropdown here → updates stats above)
        ════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-700">Filter Services</h2>
            {(categoryFilter !== "all" || statusFilter !== "all" || searchTerm) && (
              <button
                onClick={() => { setCategoryFilter("all"); setStatusFilter("all"); setSearchTerm(""); }}
                className="ml-auto flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors"
              >
                <FiX className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

            {/* Category dropdown — controls stats cards too */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                {/* coloured accent dot for selected category */}
                {activeCat && (
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-10"
                    style={{ background: activeCat.color }}
                  />
                )}
                {!activeCat && (
                  <FiGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                )}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full pl-7 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 font-medium cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {activeCat && (
                <p className="text-xs text-slate-400 mt-1 ml-1">
                  Stats above show <span className="font-semibold" style={{ color: activeCat.color }}>{activeCat.label}</span> only
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <div className="relative">
                {statusFilter !== "all" && (
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-10 ${
                    statusFilter === "approved" ? "bg-emerald-500" : statusFilter === "pending" ? "bg-amber-400" : "bg-rose-500"
                  }`} />
                )}
                {statusFilter === "all" && (
                  <FiAlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                )}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full pl-7 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 font-medium cursor-pointer"
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Business name, city, contact..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* View toggle */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">View</label>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white shadow text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                    title="Table"
                  ><FiList className="w-4 h-4" /></button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-white shadow text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                    title="Cards"
                  ><FiGrid className="w-4 h-4" /></button>
                </div>
                <span className="mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                  {filteredVendors.length}
                </span>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(categoryFilter !== "all" || statusFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400">Active:</span>
              {categoryFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeCat?.color }} />
                  {activeCat?.label}
                  <button onClick={() => setCategoryFilter("all")} className="ml-0.5 hover:text-indigo-900"><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusConfig(statusFilter).bg} ${getStatusConfig(statusFilter).text} ${getStatusConfig(statusFilter).border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(statusFilter).dot}`} />
                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button onClick={() => setStatusFilter("all")} className="ml-0.5"><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <FiSearch className="w-3 h-3" /> "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="ml-0.5"><FiX className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results row */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-700 mono">{paginatedVendors.length}</span> of{" "}
            <span className="font-bold text-slate-700 mono">{filteredVendors.length}</span> results
          </p>
          {totalPages > 1 && <p className="text-xs mono text-slate-400">Page {currentPage}/{totalPages}</p>}
        </div>

        {/* ════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════ */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-20 text-center">
            <div className="w-12 h-12 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-sm">Loading service providers...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-20 text-center">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiSliders className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">No Services Found</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or clearing the search."
                : "No service providers have registered yet."}
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* ── Table ── */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["#", "Category", "Business", "Contact", "Location", "Status", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedVendors.map((v, idx) => {
                    const sc = getStatusConfig(v.status);
                    return (
                      <tr key={v.id} className="trow border-b border-slate-50 last:border-0">
                        <td className="px-5 py-4"><span className="mono text-xs text-slate-400">{(currentPage-1)*ITEMS_PER_PAGE+idx+1}</span></td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {v.subcategory_name}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{v.business_name}</p>
                          <p className="mono text-xs text-slate-400 mt-0.5">#{v.id}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-slate-700 font-medium">{v.contact_no}</p>
                          {v.whatsapp_no && <p className="text-xs text-emerald-600 mt-0.5">WA: {v.whatsapp_no}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <FiMapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            {v.city || "N/A"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`pill ${sc.bg} ${sc.text} ${sc.border}`}>
                            <span className={`dot ${sc.dot}`} />
                            {v.status.charAt(0).toUpperCase()+v.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleViewDetails(v.id, v.subcategory)} className="abtn p-2 text-blue-600 bg-blue-50 hover:bg-blue-100" title="View">
                              <FiEye className="w-3.5 h-3.5" />
                            </button>
                            {v.status !== "approved" && (
                              <button onClick={() => handleApprove(v)} className="abtn p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" title="Approve">
                                <FiCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {v.status !== "rejected" && (
                              <button onClick={() => handleReject(v)} className="abtn p-2 text-rose-600 bg-rose-50 hover:bg-rose-100" title="Reject">
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── Cards ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedVendors.map(v => {
              const sc = getStatusConfig(v.status);
              return (
                <div key={v.id} className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-200 overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200">
                    {v.main_image
                      ? <img src={v.main_image} alt={v.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><FiBriefcase className="w-10 h-10 text-slate-300" /><span className="text-xs text-slate-400">No Image</span></div>
                    }
                    <div className="absolute top-3 right-3">
                      <span className={`pill ${sc.bg} ${sc.text} ${sc.border} backdrop-blur-sm`}>
                        <span className={`dot ${sc.dot}`} />
                        {v.status.charAt(0).toUpperCase()+v.status.slice(1)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-slate-700 backdrop-blur-sm">
                        {v.subcategory_name}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-[15px] mb-0.5 line-clamp-1">{v.business_name}</h3>
                    <p className="mono text-xs text-slate-400 mb-3">ID #{v.id}</p>
                    <div className="space-y-1.5 mb-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2"><FiPhone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />{v.contact_no}</div>
                      <div className="flex items-center gap-2"><FiMapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />{v.city||"N/A"}</div>
                      {v.gmail_id && <div className="flex items-center gap-2 truncate"><FiMail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />{v.gmail_id}</div>}
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => handleViewDetails(v.id, v.subcategory)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 text-sm font-semibold transition-colors">
                        <FiEye className="w-3.5 h-3.5" /> Details
                      </button>
                      {v.status !== "approved" && (
                        <button onClick={() => handleApprove(v)} className="abtn px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="Approve">
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      {v.status !== "rejected" && (
                        <button onClick={() => handleReject(v)} className="abtn px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100" title="Reject">
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-8">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className="pbtn">
              <FiChevronLeft className="w-3 h-3" /><FiChevronLeft className="w-3 h-3 -ml-1.5" />
            </button>
            <button onClick={() => setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="pbtn">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
              let pn=i+1;
              if(totalPages>5){
                if(currentPage<=3) pn=i+1;
                else if(currentPage>=totalPages-2) pn=totalPages-4+i;
                else pn=currentPage-2+i;
              }
              return <button key={pn} onClick={()=>setCurrentPage(pn)} className={`pbtn mono ${currentPage===pn?"act":""}`}>{pn}</button>;
            })}
            <button onClick={() => setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="pbtn">
              <FiChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="pbtn">
              <FiChevronRight className="w-3 h-3" /><FiChevronRight className="w-3 h-3 -ml-1.5" />
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          DETAIL MODAL
      ════════════════════════════════════════ */}
      {openModal && selectedService && (
        <div className="moverlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setOpenModal(false)}>
          <div className="mpanel bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden" onClick={e=>e.stopPropagation()}>

            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{selectedService.business_name}</h2>
                <p className="mono text-xs text-slate-400 mt-0.5">
                  {selectedService.subcategory_name} &nbsp;·&nbsp; #{selectedService.id} &nbsp;·&nbsp;
                  <span className={`${getStatusConfig(selectedService.status).text} font-bold`}>
                    {selectedService.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <button onClick={()=>setOpenModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <FiX className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-148px)]">
              {/* Images */}
              {(selectedService.main_image||selectedService.second_image) && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <FiImage className="w-3.5 h-3.5" /> Visual Assets
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedService.main_image && (
                      <div><p className="text-xs text-slate-400 mb-1.5">Primary</p>
                        <img src={selectedService.main_image} className="h-48 w-full object-cover rounded-xl border border-slate-100" alt="Main" />
                      </div>
                    )}
                    {selectedService.second_image && (
                      <div><p className="text-xs text-slate-400 mb-1.5">Secondary</p>
                        <img src={selectedService.second_image} className="h-48 w-full object-cover rounded-xl border border-slate-100" alt="Secondary" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detail grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {[
                  { icon:<FiTag className="w-3.5 h-3.5"/>,     label:"Category",       value:selectedService.subcategory_name },
                  { icon:<FiMapPin className="w-3.5 h-3.5"/>,  label:"Location",        value:[selectedService.city,selectedService.state,selectedService.country].filter(Boolean).join(", ")||"N/A" },
                  { icon:<FiPhone className="w-3.5 h-3.5"/>,   label:"Contact",         value:selectedService.contact_no, sub:selectedService.whatsapp_no?`WhatsApp: ${selectedService.whatsapp_no}`:undefined },
                  { icon:<FiMail className="w-3.5 h-3.5"/>,    label:"Email",           value:selectedService.gmail_id||selectedService.email||"N/A" },
                  ...(selectedService.open_time?[{ icon:<FiClock className="w-3.5 h-3.5"/>, label:"Hours", value:`${selectedService.open_time} — ${selectedService.close_time}` }]:[]),
                  { icon:<FiUser className="w-3.5 h-3.5"/>,    label:"Address",         value:selectedService.address||"N/A" },
                  { icon:<FiClockIcon className="w-3.5 h-3.5"/>,label:"Registered",     value:formatDate(selectedService.created_at) },
                ].map((d,i)=>(
                  <div key={i} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">{d.icon} {d.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{d.value}</p>
                    {d.sub&&<p className="text-xs text-emerald-600 mt-0.5">{d.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Description */}
              {selectedService.description && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-100"
                    dangerouslySetInnerHTML={{__html:selectedService.description}} />
                </div>
              )}

              {/* Items */}
              {selectedService.items&&selectedService.items.length>0&&(
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Service Offerings</p>
                  <div className="space-y-2">
                    {selectedService.items.map((item:any,idx:number)=>(
                      <div key={idx} className="flex items-start justify-between border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          {item.description&&<p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                        </div>
                        <p className="font-bold text-indigo-600 mono text-sm ml-4 flex-shrink-0">₹{item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {selectedService.multi_images&&selectedService.multi_images.length>0&&(
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gallery</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedService.multi_images.map((img:any,idx:number)=>(
                      <img key={idx} src={img.image} className="h-24 w-full object-cover rounded-xl border border-slate-100 hover:opacity-80 transition-opacity cursor-pointer" alt={`Gallery ${idx+1}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                {(()=>{ const sc=getStatusConfig(selectedService.status); return (
                  <span className={`pill ${sc.bg} ${sc.text} ${sc.border}`}>
                    <span className={`dot ${sc.dot}`} />
                    {selectedService.status.toUpperCase()}
                  </span>
                ); })()}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setOpenModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Close
                </button>
                {selectedService.status!=="approved"&&(
                  <button onClick={()=>{handleApprove(selectedService);setOpenModal(false);}} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors">
                    <FiCheck className="w-4 h-4"/> Approve
                  </button>
                )}
                {selectedService.status!=="rejected"&&(
                  <button onClick={()=>{handleReject(selectedService);setOpenModal(false);}} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-colors">
                    <FiX className="w-4 h-4"/> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymServiceApprovalList;