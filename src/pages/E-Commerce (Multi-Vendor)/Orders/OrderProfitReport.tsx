// src/pages/admin/OrderProfitReport.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import apiClient from "../../../api/apiClient";
import {
  FaSearch, FaSync, FaBox, FaCheckCircle, FaClock,
  FaExclamationTriangle, FaFileAlt, FaTimes, FaChartPie,
  FaRupeeSign, FaBuilding, FaUsers, FaStore, FaCalendarAlt,
  FaFilter, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import { MdCancel, MdMonetizationOn } from "react-icons/md";
import { HiClipboardCheck } from "react-icons/hi";
import { GiReturnArrow } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageStats {
  stats: {
    total_platform_profit: number;
    total_agents_paid: number;
    total_company_profit: number;
    breakdown_agents: { mlm: number; pos: number; society: number };
  };
  order_counts: {
    total: number;
    agent_orders: number;
    direct_orders: number;
    distributed: number;
    pending: number;
  };
}

interface OrderRow {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  finalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  commissionStatus: "distributed" | "pending" | "no_agent";
  agentInfo: { full_name: string; agent_type: string; username: string; is_active: boolean } | null;
}

interface OrderItem {
  product_name: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  vendor_receivable: number;
  platform_profit: number;
  vendor_name: string;
}

interface MLMEntry {
  agent_name: string;
  agent_type: string;
  username: string;
  amount: number;
  level: number;
  percentage: number;
  type: string;
  date: string;
}

interface ProfitData {
  order_info: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    order_date: string;
    order_status: string;
    payment_status: string;
    payment_method: string;
    total_amount: number;
    discount_amount: number;
    shipping_charge: number;
    final_amount: number;
  };
  profit_summary: {
    total_platform_profit: number;
    total_vendor_receivable: number;
    total_agents_paid: number;
    commission_status: string;
    referral_agent: {
      id: number; full_name: string; agent_type: string;
      username: string; is_active: boolean; status: string;
    } | null;
    mlm_commission_processed: boolean;
  };
  config: {
    pos_percentage: number; service_percentage: number;
    mlm_percentage: number; company_percentage: number;
  };
  items: OrderItem[];
  distribution: {
    mlm_chain: MLMEntry[];
    seller_extra: MLMEntry | null;
    pools: { pos_pool: number; soc_pool: number; mlm_pool: number; config_co: number };
    paid: { mlm_paid: number; pos_paid: number; society_paid: number };
    undistributed: { mlm: number; pos: number; soc: number };
    company: {
      configured_share: number; undistributed_mlm: number;
      undistributed_pos: number; undistributed_soc: number; total: number;
    };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const fmt = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const ORDER_STATUS_API: Record<string, string> = {
  Delivered: "delivered", Confirmed: "confirmed", Pending: "pending",
  Packaging: "processing", "Out for Delivery": "shipped",
  Canceled: "cancelled", Returned: "refunded",
};

const STATUS_STYLE: Record<string, string> = {
  delivered:  "bg-green-50 text-green-700 border-green-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
  refunded:   "bg-orange-50 text-orange-700 border-orange-200",
};

const AGENT_TYPE_STYLE: Record<string, string> = {
  normal:  "bg-blue-100 text-blue-700",
  pos:     "bg-purple-100 text-purple-700",
  society: "bg-teal-100 text-teal-700",
};

const LEVEL_STYLE: Record<number, string> = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-indigo-100 text-indigo-800",
  3: "bg-purple-100 text-purple-800",
  4: "bg-pink-100 text-pink-800",
};

const getStatusIcon = (s: string) => {
  switch (s) {
    case "delivered":   return <FaCheckCircle className="text-green-600" />;
    case "pending":     return <FaClock className="text-yellow-600" />;
    case "confirmed":   return <HiClipboardCheck className="text-blue-600" />;
    case "processing":  return <FaBox className="text-purple-600" />;
    case "shipped":     return <TbTruckDelivery className="text-indigo-600" />;
    case "cancelled":   return <MdCancel className="text-red-600" />;
    case "refunded":    return <GiReturnArrow className="text-orange-600" />;
    default:            return <FaFileAlt className="text-gray-600" />;
  }
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: string; sub?: string;
  icon: React.ReactNode; border: string; iconBg: string;
}> = ({ label, value, sub, icon, border, iconBg }) => (
  <div className={`bg-white rounded-2xl border-l-4 ${border} shadow-sm p-5 flex items-start justify-between`}>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
  </div>
);

// ─── Pagination Component ─────────────────────────────────────────────────────

const Pagination: React.FC<{
  page: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
  onPageChange: (p: number) => void;
}> = ({ page, totalPages, totalCount, loading, onPageChange }) => {
  // Generate page numbers to show (max 5 buttons)
  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | "...")[] = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 2) rangeWithDots.push(1, "...");
    else rangeWithDots.push(1);

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) rangeWithDots.push("...", totalPages);
    else if (totalPages > 1) rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  const startRecord = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRecord   = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
      {/* Left — record count */}
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-700">{startRecord}–{endRecord}</span>
        {" "}of{" "}
        <span className="font-semibold text-gray-700">{totalCount}</span> orders
        {totalPages > 1 && (
          <span className="ml-1 text-gray-400">
            · Page <span className="font-semibold text-gray-600">{page}</span> of{" "}
            <span className="font-semibold text-gray-600">{totalPages}</span>
          </span>
        )}
      </p>

      {/* Right — page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Prev */}
          <button
            disabled={page === 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft size={10} />
            Prev
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  disabled={loading}
                  onClick={() => onPageChange(p as number)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    page === p
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  } disabled:opacity-50`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next */}
          <button
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <FaChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Profit Modal ─────────────────────────────────────────────────────────────

const ProfitModal: React.FC<{ orderNumber: string; onClose: () => void }> = ({
  orderNumber, onClose,
}) => {
  const [data, setData]     = useState<ProfitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [tab, setTab]       = useState<"report" | "items">("report");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await apiClient.get(`ecommerce/admin/order-profit/${orderNumber}/`);
        setData(res.data);
      } catch (e: any) {
        setError(e.response?.data?.error || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderNumber]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FaChartPie className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Profit Breakdown Report</h2>
              <p className="text-xs font-mono text-gray-500">{orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading breakdown...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <FaExclamationTriangle className="text-4xl text-red-300 mx-auto mb-3" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : data ? (
          <div className="p-6 space-y-5">

            {/* ── Order Summary Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: "Order Amount",      v: fmt(data.order_info.final_amount),              c: "text-gray-900" },
                { l: "Platform Profit",   v: fmt(data.profit_summary.total_platform_profit), c: "text-indigo-700" },
                { l: "Agents Paid",       v: fmt(data.profit_summary.total_agents_paid),     c: "text-blue-700" },
                { l: "Company Profit",    v: fmt(data.distribution.company.total),           c: "text-yellow-700" },
              ].map(({ l, v, c }) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-400 mb-1">{l}</p>
                  <p className={`text-base font-bold ${c}`}>{v}</p>
                </div>
              ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-100">
              {[
                { k: "report" as const, l: "Profit Report" },
                { k: "items"  as const, l: `Items (${data.items.length})` },
              ].map(t => (
                <button key={t.k} onClick={() => setTab(t.k)}
                  className={`px-5 py-2.5 text-sm font-medium transition-all ${
                    tab === t.k
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {t.l}
                </button>
              ))}
            </div>

            {/* ═══════════════ TAB: REPORT ═══════════════ */}
            {tab === "report" && (
              <div className="space-y-5">

                {/* ── Agent Section ── */}
                {data.profit_summary.referral_agent ? (
                  <div className="border border-blue-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2.5 flex items-center gap-2">
                      <FaUsers className="text-blue-600 text-sm" />
                      <span className="text-sm font-semibold text-blue-800">Referral Agent</span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        data.profit_summary.commission_status === "distributed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {data.profit_summary.commission_status === "distributed"
                          ? "✓ Commission Distributed"
                          : " Pending Distribution"}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {data.profit_summary.referral_agent.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{data.profit_summary.referral_agent.username}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        AGENT_TYPE_STYLE[data.profit_summary.referral_agent.agent_type] || "bg-gray-100 text-gray-600"
                      }`}>
                        {data.profit_summary.referral_agent.agent_type.toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        data.profit_summary.referral_agent.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {data.profit_summary.referral_agent.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-500">
                      Direct Sale — No referral agent. Full platform profit retained by company.
                    </p>
                  </div>
                )}

                {/* ── Profit Distribution Table ── */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Profit Distribution Breakdown
                  </p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        {/* ← vertical lines on header via border-x */}
                        <tr className="divide-x divide-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Recipient</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Pool (Config%)</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actually Paid</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Undistributed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">

                        {/* MLM Chain rows */}
                        {data.distribution.mlm_chain.length > 0 ? (
                          data.distribution.mlm_chain.map((entry, i) => (
                            <tr key={i} className="hover:bg-blue-50/30 divide-x divide-gray-200">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    LEVEL_STYLE[entry.level] || "bg-gray-100 text-gray-600"
                                  }`}>
                                    L{entry.level}
                                  </span>
                                  <div>
                                    <p className="font-medium text-gray-800 text-xs">{entry.agent_name}</p>
                                    <p className="text-[10px] text-gray-400">@{entry.username}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  AGENT_TYPE_STYLE[entry.agent_type] || "bg-gray-100 text-gray-600"
                                }`}>
                                  MLM L{entry.level} · {entry.percentage}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-xs text-gray-500">—</td>
                              <td className="px-4 py-3 text-right font-bold text-blue-700">
                                {fmt(entry.amount)}
                              </td>
                              <td className="px-4 py-3 text-right text-xs text-gray-400">—</td>
                            </tr>
                          ))
                        ) : data.profit_summary.referral_agent ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-xs text-gray-400 italic text-center">
                              {data.profit_summary.commission_status === "pending"
                                ? "MLM commission pending — order not yet delivered"
                                : "No MLM transactions found"}
                            </td>
                          </tr>
                        ) : null}

                        {/* MLM Pool row (undistributed) */}
                        {data.distribution.undistributed.mlm > 0 && (
                          <tr className="bg-amber-50/50 divide-x divide-gray-200">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <span className="text-xs text-amber-700 font-medium">MLM Undistributed (short chain)</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
                                → Company
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-gray-500">
                              {fmt(data.distribution.pools.mlm_pool)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-gray-400">
                              {fmt(data.distribution.paid.mlm_paid)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-amber-700">
                              {fmt(data.distribution.undistributed.mlm)}
                            </td>
                          </tr>
                        )}

                        {/* POS Seller Extra */}
                        {data.distribution.seller_extra ? (
                          <tr className="hover:bg-purple-50/30 divide-x divide-gray-200">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <div>
                                  <p className="font-medium text-gray-800 text-xs">
                                    {data.distribution.seller_extra.agent_name}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    @{data.distribution.seller_extra.username}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700">
                                {data.distribution.seller_extra.type === "pos_profit"
                                  ? "POS Agent Profit"
                                  : "Society Agent Profit"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-gray-500">
                              {fmt(
                                data.distribution.seller_extra.type === "pos_profit"
                                  ? data.distribution.pools.pos_pool
                                  : data.distribution.pools.soc_pool
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-purple-700">
                              {fmt(data.distribution.seller_extra.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-gray-400">—</td>
                          </tr>
                        ) : (
                          <>
                            {data.distribution.pools.pos_pool > 0 && (
                              <tr className="bg-gray-50/50 divide-x divide-gray-200">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                    <span className="text-xs text-gray-500">POS Pool</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500">
                                    → Company (no POS agent)
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-500">
                                  {fmt(data.distribution.pools.pos_pool)}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400">₹0.00</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-600">
                                  {fmt(data.distribution.pools.pos_pool)}
                                </td>
                              </tr>
                            )}
                            {data.distribution.pools.soc_pool > 0 && (
                              <tr className="bg-gray-50/50 divide-x divide-gray-200">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                    <span className="text-xs text-gray-500">Society Pool</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500">
                                    → Company (no Society agent)
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-500">
                                  {fmt(data.distribution.pools.soc_pool)}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400">₹0.00</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-600">
                                  {fmt(data.distribution.pools.soc_pool)}
                                </td>
                              </tr>
                            )}
                          </>
                        )}

                        {/* Company row */}
                        <tr className="bg-yellow-50 divide-x divide-gray-200">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FaBuilding className="text-yellow-600 text-xs" />
                              <span className="font-semibold text-gray-800 text-xs">Company</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-yellow-100 text-yellow-700">
                              {data.config.company_percentage}% Fixed + Undistributed
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-600">
                            {fmt(data.distribution.pools.config_co)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-500">—</td>
                          <td className="px-4 py-3 text-right font-bold text-yellow-700 text-base">
                            {fmt(data.distribution.company.total)}
                          </td>
                        </tr>

                        {/* Total row */}
                        <tr className="bg-gray-800 divide-x divide-gray-600">
                          <td colSpan={3} className="px-4 py-3 text-sm font-bold text-white">
                            Total Platform Profit
                          </td>
                          <td colSpan={2} className="px-4 py-3 text-right font-bold text-white text-base">
                            {fmt(data.profit_summary.total_platform_profit)}
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Company Profit Breakdown note ── */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1.5 text-xs text-gray-700">
                  <p className="font-semibold text-yellow-800 mb-2">Company Profit Composition</p>
                  <div className="flex justify-between">
                    <span>Configured share ({data.config.company_percentage}%)</span>
                    <span className="font-semibold">{fmt(data.distribution.company.configured_share)}</span>
                  </div>
                  {data.distribution.company.undistributed_mlm > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>+ Undistributed MLM</span>
                      <span className="font-semibold">{fmt(data.distribution.company.undistributed_mlm)}</span>
                    </div>
                  )}
                  {data.distribution.company.undistributed_pos > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>+ Undistributed POS pool</span>
                      <span className="font-semibold">{fmt(data.distribution.company.undistributed_pos)}</span>
                    </div>
                  )}
                  {data.distribution.company.undistributed_soc > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>+ Undistributed Society pool</span>
                      <span className="font-semibold">{fmt(data.distribution.company.undistributed_soc)}</span>
                    </div>
                  )}
                  <div className="border-t border-yellow-300 pt-1.5 flex justify-between font-bold text-yellow-800">
                    <span>Total Company Profit</span>
                    <span>{fmt(data.distribution.company.total)}</span>
                  </div>
                </div>

                {/* ── Order meta ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { l: "Customer",       v: data.order_info.customer_name },
                    { l: "Phone",          v: data.order_info.customer_phone || "—" },
                    { l: "Payment",        v: data.order_info.payment_method.toUpperCase() },
                    { l: "Order Date",     v: fmtDate(data.order_info.order_date) },
                    { l: "Discount",       v: fmt(data.order_info.discount_amount) },
                    { l: "Shipping",       v: fmt(data.order_info.shipping_charge) },
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <p className="text-gray-400 mb-0.5">{l}</p>
                      <p className="font-medium text-gray-700 truncate">{v}</p>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ═══════════════ TAB: ITEMS ═══════════════ */}
            {tab === "items" && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="divide-x divide-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Vendor Gets</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Platform Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 divide-x divide-gray-200">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs">{item.product_name}</p>
                          <p className="text-[10px] text-gray-400">{item.vendor_name}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmt(item.total_price)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-purple-700">{fmt(item.vendor_receivable)}</td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-700">{fmt(item.platform_profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold text-sm">
                    <tr className="divide-x divide-gray-200">
                      <td colSpan={3} className="px-4 py-3 text-gray-700">Total</td>
                      <td className="px-4 py-3 text-right text-purple-700">
                        {fmt(data.profit_summary.total_vendor_receivable)}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-700">
                        {fmt(data.profit_summary.total_platform_profit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const OrderProfitReport: React.FC = () => {
  const [pageStats, setPageStats]       = useState<PageStats | null>(null);
  const [orders, setOrders]             = useState<OrderRow[]>([]);
  const [loading, setLoading]           = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage]                 = useState(1);
  const [totalOrders, setTotalOrders]   = useState(0);
  const [searchTerm, setSearchTerm]     = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // totalPages derived from totalOrders + PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));

  // Fetch header stats
  useEffect(() => {
    (async () => {
      try {
        setStatsLoading(true);
        const res = await apiClient.get("ecommerce/admin/order-profit-stats/");
        setPageStats(res.data);
      } catch (e) {
        console.error("Stats fetch failed:", e);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const fetchOrders = useCallback(async (
    search = searchTerm, pg = page, filter = activeFilter
  ) => {
    setLoading(true);
    try {
      const params: any = { page: pg, page_size: PAGE_SIZE };
      if (filter !== "All") {
        params.order_status = ORDER_STATUS_API[filter] || filter.toLowerCase();
      }
      if (search) params.search = search;

      const res = await apiClient.get("/ecommerce/superadmin/orders/", { params });
      const raw = res.data.results || res.data;
      if (res.data.count !== undefined) setTotalOrders(res.data.count);

      const rows: OrderRow[] = (raw || []).map((o: any) => ({
        orderId:          o.order_number || `ORD${o.id}`,
        orderDate:        o.created_at,
        customerName:     o.billing_name || o.customer_details?.username || "Customer",
        customerPhone:    o.billing_phone || o.customer_details?.phone || "",
        finalAmount:      parseFloat(o.final_amount || "0"),
        orderStatus:      o.order_status || "pending",
        paymentStatus:    o.payment_status || "pending",
        agentInfo:        o.referral_agent_info || null,
        commissionStatus: o.mlm_commission_processed
          ? "distributed"
          : o.referral_agent_info
          ? "pending"
          : "no_agent",
      }));
      setOrders(rows);
    } catch (e) {
      console.error("Orders fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, activeFilter]);

  // search / filter change → reset to page 1
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchOrders(searchTerm, 1, activeFilter); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, activeFilter]);

  // page change
  useEffect(() => {
    fetchOrders(searchTerm, page, activeFilter);
  }, [page]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages && !loading) setPage(p);
  };

  const FILTERS = ["All", "Delivered", "Confirmed", "Pending", "Packaging", "Out for Delivery", "Canceled", "Returned"];

  const cs = pageStats?.stats;
  const oc = pageStats?.order_counts;

  return (
    <div className="p-4 md:p-6 bg-[#F2F2F7] min-h-screen space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
            <MdMonetizationOn className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Profit Report</h1>
            <p className="text-xs text-gray-500">Click any row to view profit distribution</p>
          </div>
        </div>
        <button
          onClick={() => { fetchOrders(); setStatsLoading(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <FaSync size={11} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Platform Profit"
          value={statsLoading ? "..." : fmt(cs?.total_platform_profit || 0)}
          sub="From delivered orders"
          icon={<FaRupeeSign className="text-green-600" />}
          border="border-green-400" iconBg="bg-green-50"
        />
        <StatCard
          label="Total Agents Paid"
          value={statsLoading ? "..." : fmt(cs?.total_agents_paid || 0)}
          sub={statsLoading ? "" : `MLM ${fmt(cs?.breakdown_agents.mlm || 0)}`}
          icon={<FaUsers className="text-blue-600" />}
          border="border-blue-400" iconBg="bg-blue-50"
        />
        <StatCard
          label="Total Company Profit"
          value={statsLoading ? "..." : fmt(cs?.total_company_profit || 0)}
          sub="Configured + All undistributed"
          icon={<FaBuilding className="text-yellow-600" />}
          border="border-yellow-400" iconBg="bg-yellow-50"
        />
        <StatCard
          label="Commission Status"
          value={statsLoading ? "..." : `${oc?.distributed || 0} Distributed`}
          sub={statsLoading ? "" : `${oc?.pending || 0} pending · ${oc?.direct_orders || 0} direct`}
          icon={<FaChartPie className="text-indigo-600" />}
          border="border-indigo-400" iconBg="bg-indigo-50"
        />
      </div>

      {/* ── Order Count Badges ── */}
      {oc && (
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { l: `All Orders: ${oc.total}`,          c: "bg-gray-100 text-gray-700" },
            { l: `Agent Orders: ${oc.agent_orders}`,  c: "bg-blue-100 text-blue-700" },
            { l: `Direct Sales: ${oc.direct_orders}`, c: "bg-gray-100 text-gray-500" },
            { l: `Distributed: ${oc.distributed}`,    c: "bg-green-100 text-green-700" },
            { l: `Pending: ${oc.pending}`,             c: "bg-yellow-100 text-yellow-700" },
          ].map(({ l, c }) => (
            <span key={l} className={`px-3 py-1.5 rounded-full font-medium ${c}`}>{l}</span>
          ))}
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Controls */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search order ID, customer..."
              className="w-full pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <FaTimes className="text-gray-400 text-xs" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeFilter === f
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f !== "All" && getStatusIcon(ORDER_STATUS_API[f] || f.toLowerCase())}
                {f === "All" ? <><FaFilter size={10} /> All</> : f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {/* ← vertical lines in main table header */}
                <tr className="divide-x divide-gray-200">
                  <th className="px-5 py-3.5 text-left">Order ID</th>
                  <th className="px-5 py-3.5 text-left">Date</th>
                  <th className="px-5 py-3.5 text-left">Customer</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-left">Agent</th>
                  <th className="px-5 py-3.5 text-left">Commission</th>
                  <th className="px-5 py-3.5 text-center">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr
                    key={order.orderId}
                    onClick={() => setSelectedOrder(order.orderId)}
                    className="hover:bg-indigo-50/30 cursor-pointer transition-colors divide-x divide-gray-200"
                  >
                    {/* Order ID */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
                        {order.orderId}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500">
                      {fmtDate(order.orderDate)}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 text-xs">{order.customerName}</p>
                      {order.customerPhone && (
                        <p className="text-[10px] text-gray-400">{order.customerPhone}</p>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 text-right">
                      <p className="font-bold text-gray-800">{fmt(order.finalAmount)}</p>
                      <p className={`text-[10px] font-medium ${
                        order.paymentStatus === "completed" ? "text-green-600" : "text-red-500"
                      }`}>
                        {order.paymentStatus === "completed" ? "Paid" : "Unpaid"}
                      </p>
                    </td>

                    {/* Order Status */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${
                        STATUS_STYLE[order.orderStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus}</span>
                      </span>
                    </td>

                    {/* Agent */}
                    <td className="px-5 py-3.5">
                      {order.agentInfo ? (
                        <div>
                          <p className="text-xs font-medium text-gray-800">{order.agentInfo.full_name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              AGENT_TYPE_STYLE[order.agentInfo.agent_type] || "bg-gray-100 text-gray-600"
                            }`}>
                              {order.agentInfo.agent_type}
                            </span>
                            <span className={`text-[10px] ${order.agentInfo.is_active ? "text-green-600" : "text-red-500"}`}>
                              {order.agentInfo.is_active ? "● Active" : "● Inactive"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Direct Sale</span>
                      )}
                    </td>

                    {/* Commission Status */}
                    <td className="px-5 py-3.5">
                      {order.commissionStatus === "distributed" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          ✓ Distributed
                        </span>
                      )}
                      {order.commissionStatus === "pending" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                           Pending
                        </span>
                      )}
                      {order.commissionStatus === "no_agent" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                          — No Agent
                        </span>
                      )}
                    </td>

                    {/* Report button */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedOrder(order.orderId); }}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        title="View Profit Report"
                      >
                        <FaChartPie size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && orders.length === 0 && (
              <div className="py-16 text-center">
                <FaBox className="text-5xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No orders found</p>
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalOrders}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Profit Modal */}
      {selectedOrder && (
        <ProfitModal
          orderNumber={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderProfitReport;