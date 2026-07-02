// src/pages/admin/AdminMLMCommission.tsx
import React, { useState, useEffect } from "react";
import apiClient from "../../../api/apiClient"; // ✅ Use your apiClient instead of adminAxios
import {
  FaRupeeSign, FaUsers, FaChartBar, FaBuilding, FaStore,
  FaSync, FaSearch, FaEye, FaTimesCircle, FaTimes
} from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Config {
  pos_percentage: number;
  service_percentage: number;
  mlm_percentage: number;
  company_percentage: number;
}

interface Summary {
  total_platform_profit: number;
  total_paid_to_agents: number;
  total_upline_commission: number;
  total_pos_profit: number;
  total_society_profit: number;
  configured_company_profit: number;
  undistributed_mlm: number;
  total_company_profit: number;
  total_agents_paid: number;
  total_transactions: number;
}

interface LevelBreakdown {
  level: number;
  total: number;
  count: number;
}

interface AgentSummary {
  agent_id: number | null;
  agent_name: string;
  agent_type: string;
  username: string;
  upline: number;
  pos_profit: number;
  society_profit: number;
  total: number;
  tx_count: number;
}

interface Transaction {
  id: number;
  agent_name?: string;
  agent_type?: string;
  username?: string;
  order: string | null;
  amount: number;
  level: number;
  percentage: number;
  type: string;
  date: string;
}

interface OverviewResponse {
  config: Config;
  summary: Summary;
  level_breakdown: LevelBreakdown[];
  agents_summary: AgentSummary[];
  upline_transactions: Transaction[];
  pos_transactions: Transaction[];
  society_transactions: Transaction[];
}

interface AgentDetailResponse {
  agent: {
    id: number;
    full_name: string;
    agent_type: string;
    status: string;
    is_active: boolean;
    total_sales: number;
    minimum_required: number;
  };
  summary: {
    total_earnings: number;
    total_mlm: number;
    total_pos_profit: number;
    total_society_profit: number;
    mlm_count: number;
  };
  level_breakdown: LevelBreakdown[];
  mlm_transactions: Transaction[];
  pos_transactions: Transaction[];
  society_transactions: Transaction[];
}

type TabType = "overview" | "agents" | "pos" | "society"; // ✅ MLM Commission tab removed

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-indigo-100 text-indigo-800",
  3: "bg-purple-100 text-purple-800",
  4: "bg-pink-100 text-pink-800",
};
const levelBadge = (l: number) => LEVEL_COLORS[l] ?? "bg-gray-100 text-gray-700";

const TYPE_BADGE: Record<string, string> = {
  upline:          "bg-blue-50 text-blue-700",
  pos_profit:      "bg-purple-50 text-purple-700",
  service_profit:  "bg-teal-50 text-teal-700",
};
const typeLabel: Record<string, string> = {
  upline:         "MLM Commission",
  pos_profit:     "POS Profit",
  service_profit: "Society Profit",
};

const AGENT_TYPE_COLOR: Record<string, string> = {
  normal:  "bg-blue-100 text-blue-700",
  pos:     "bg-purple-100 text-purple-700",
  society: "bg-teal-100 text-teal-700",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: string; icon: React.ReactNode;
  color: string; sub?: string; highlight?: boolean;
}> = ({ label, value, icon, color, sub, highlight }) => (
  <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${highlight ? 'border-blue-400 ring-1 ring-blue-200' : color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${highlight ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
        {icon}
      </div>
    </div>
  </div>
);

// ─── Transaction Table ────────────────────────────────────────────────────────

const TxTable: React.FC<{
  transactions: Transaction[];
  showAgent?: boolean;
  showLevel?: boolean;
  emptyMsg?: string;
}> = ({ transactions, showAgent = true, showLevel = true, emptyMsg = "No records" }) => {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const PER_PAGE = 15;

  const filtered = search
    ? transactions.filter(t =>
        t.order?.toLowerCase().includes(search.toLowerCase()) ||
        t.agent_name?.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center">
        <FaChartBar className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs z-50" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order or agent..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <FaTimes className="text-gray-400 text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              {showAgent && <th className="px-5 py-3 text-left">Agent</th>}
              <th className="px-5 py-3 text-left">Order</th>
              {showLevel && <th className="px-5 py-3 text-left">Level</th>}
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((tx, i) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-400 text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                {showAgent && (
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-xs">{tx.agent_name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${AGENT_TYPE_COLOR[tx.agent_type || 'normal'] || 'bg-gray-100 text-gray-600'}`}>
                        {tx.agent_type}
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-5 py-3 font-medium text-indigo-600">{tx.order ?? "—"}</td>
                {showLevel && (
                  <td className="px-5 py-3">
                    {tx.level > 0
                      ? <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelBadge(tx.level)}`}>L{tx.level}</span>
                      : <span className="text-xs text-gray-400">—</span>
                    }
                  </td>
                )}
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_BADGE[tx.type] || 'bg-gray-50 text-gray-600'}`}>
                    {typeLabel[tx.type] || tx.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-bold text-green-600">{fmt(tx.amount)}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(tx.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {paginated.map(tx => (
          <div key={tx.id} className="px-4 py-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-indigo-600 text-sm">{tx.order ?? "—"}</span>
              <span className="font-bold text-green-600">{fmt(tx.amount)}</span>
            </div>
            {showAgent && <p className="text-xs text-gray-600">{tx.agent_name} · <span className="capitalize">{tx.agent_type}</span></p>}
            <div className="flex items-center gap-2 flex-wrap">
              {showLevel && tx.level > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge(tx.level)}`}>L{tx.level}</span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_BADGE[tx.type]}`}>{typeLabel[tx.type]}</span>
            </div>
            <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm font-semibold text-gray-700">
          Showing {filtered.length} records · Total:{" "}
          <span className="text-green-600">{fmt(filtered.reduce((s, t) => s + t.amount, 0))}</span>
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200">‹</button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200">›</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Agent Detail Modal ───────────────────────────────────────────────────────

const AgentDetailModal: React.FC<{
  agentId: number;
  onClose: () => void;
}> = ({ agentId, onClose }) => {
  const [data, setData]       = useState<AgentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mlm" | "pos" | "society">("mlm");

  useEffect(() => {
    const fetchAgentDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`mlm/admin/agent-commission/${agentId}/`);
        setData(res.data);
        console.log("Agent detail loaded:", res.data);
      } catch (err: any) {
        console.error("Failed to load agent detail:", err);
        setError(err.response?.data?.error || err.message || "Failed to load agent details");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetail();
  }, [agentId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">
            {loading ? "Loading..." : data ? `${data.agent.full_name} — Commission Detail` : "Agent Details"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading agent details...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <FaTimesCircle className="text-4xl text-red-400 mx-auto mb-3" />
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Agent info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Earnings",    val: fmt(data.summary.total_earnings) },
                { label: "MLM Commission",     val: fmt(data.summary.total_mlm) },
                { label: "POS / Society",      val: fmt(data.summary.total_pos_profit + data.summary.total_society_profit) },
                { label: "Total Sales",        val: fmt(data.agent.total_sales) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-lg font-bold text-gray-800">{val}</p>
                </div>
              ))}
            </div>

            {/* Level breakdown */}
            {data.level_breakdown.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">MLM Level Breakdown</h4>
                <div className="space-y-2">
                  {data.level_breakdown.map(lb => (
                    <div key={lb.level} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge(lb.level)}`}>Level {lb.level}</span>
                      <span className="text-sm font-semibold text-gray-700">{fmt(lb.total)} <span className="text-gray-400 font-normal">({lb.count} txns)</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs - MLM tab hamesha dikhega, POS/Society agent type ke hisab se */}
            <div className="flex border-b border-gray-200">
              {[
                { key: "mlm" as const, label: "MLM Commission" },
                ...(data.agent.agent_type === "pos" ? [{ key: "pos" as const, label: "POS Profit" }] : []),
                ...(data.agent.agent_type === "society" ? [{ key: "society" as const, label: "Society Profit" }] : []),
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-medium transition-all ${activeTab === tab.key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "mlm" && (
              <TxTable transactions={data.mlm_transactions} showAgent={false} showLevel={true} emptyMsg="No MLM commission records" />
            )}
            {activeTab === "pos" && (
              <TxTable transactions={data.pos_transactions} showAgent={false} showLevel={false} emptyMsg="No POS profit records" />
            )}
            {activeTab === "society" && (
              <TxTable transactions={data.society_transactions} showAgent={false} showLevel={false} emptyMsg="No society profit records" />
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">Failed to load data</div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminMLMCommission: React.FC = () => {
  const [data, setData]           = useState<OverviewResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [agentSearch, setAgentSearch]     = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("mlm/admin/mlm-overview/");
      setData(res.data);
      console.log("MLM overview loaded:", res.data);
    } catch (e: any) {
      console.error("Failed to load MLM data:", e);
      const errorMessage = e.response?.data?.detail || 
                          e.response?.data?.message || 
                          e.message || 
                          "Failed to load MLM data";
      setError(errorMessage);
      
      // Handle 401 - redirect to login
      if (e.response?.status === 401) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Loading MLM data…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <FaTimesCircle className="text-4xl text-red-400 mx-auto mb-3" />
      <p className="text-red-600 mb-4">{error}</p>
      <button 
        onClick={fetchData} 
        className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <FaSync className="inline mr-2" size={12} />
        Retry
      </button>
    </div>
  );

  if (!data) return null;

  const { summary, config, level_breakdown, agents_summary,
          pos_transactions, society_transactions } = data;

  const filteredAgents = agentSearch
    ? agents_summary.filter(a =>
        a.agent_name.toLowerCase().includes(agentSearch.toLowerCase()) ||
        a.agent_type.toLowerCase().includes(agentSearch.toLowerCase())
      )
    : agents_summary;

  const LEVEL_BAR_COLORS = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-rose-500"];
  const maxLevel = Math.max(...level_breakdown.map(l => l.total), 1);

  // ✅ MLM Commission tab removed from TABS
  const TABS: { key: TabType; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "agents",   label: "Agents",   count: agents_summary.length },
    { key: "pos",      label: "POS Profit",     count: pos_transactions.length },
    { key: "society",  label: "Society Profit", count: society_transactions.length },
  ];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MLM Commission Overview</h1>
          <p className="text-gray-500 text-sm mt-1">All agents' earnings, company profit & distribution</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition-colors"
        >
          <FaSync size={12} className={loading ? "animate-spin" : ""} /> 
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Platform Profit"  value={fmt(summary.total_platform_profit)}   icon={<FaRupeeSign />}  color="border-green-400" />
        <StatCard label="Paid to Agents"         value={fmt(summary.total_paid_to_agents)}    icon={<FaUsers />}      color="border-blue-400" />
        <StatCard label="MLM Commission Paid"    value={fmt(summary.total_upline_commission)} icon={<FaChartBar />}   color="border-indigo-400" />
        <StatCard label="POS + Society Paid"     value={fmt(summary.total_pos_profit + summary.total_society_profit)} icon={<FaStore />} color="border-purple-400" />
      </div>

      {/* Company Profit Breakdown */}
      <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaBuilding className="text-blue-600" /> Company Profit Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Configured Company Share ({config.company_percentage}%)</p>
            <p className="text-xl font-bold text-gray-800">{fmt(summary.configured_company_profit)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Undistributed MLM (Chain Gaps)</p>
            <p className="text-xl font-bold text-amber-700">{fmt(summary.undistributed_mlm)}</p>
            <p className="text-xs text-gray-400 mt-1">MLM pool unused when chain is short</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-4 border border-blue-300">
            <p className="text-xs text-gray-600 mb-1 font-medium">Total Company Profit</p>
            <p className="text-2xl font-bold text-blue-800">{fmt(summary.total_company_profit)}</p>
            <p className="text-xs text-gray-500 mt-1">= Configured + Undistributed</p>
          </div>
        </div>

        {/* Distribution config bar */}
        {config && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Profit Split Configuration</p>
            <div className="flex rounded-xl overflow-hidden h-6 text-xs font-bold text-white">
              {[
                { label: `POS ${config.pos_percentage}%`,     width: config.pos_percentage,     color: "bg-purple-500" },
                { label: `Society ${config.service_percentage}%`, width: config.service_percentage, color: "bg-teal-500" },
                { label: `MLM ${config.mlm_percentage}%`,    width: config.mlm_percentage,     color: "bg-blue-500" },
                { label: `Company ${config.company_percentage}%`, width: config.company_percentage, color: "bg-yellow-500" },
              ].map(({ label, width, color }) => width > 0 && (
                <div key={label} className={`${color} flex items-center justify-center`} style={{ width: `${width}%` }}>
                  {width > 8 ? label : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all
                ${activeTab === tab.key
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="p-6 space-y-6">

            {/* Level Breakdown */}
            {level_breakdown.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">MLM Commission by Level</h3>
                <div className="space-y-3">
                  {level_breakdown.map((lb, i) => (
                    <div key={lb.level}>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${levelBadge(lb.level)}`}>Level {lb.level}</span>
                        <span className="font-semibold text-gray-700">
                          {fmt(lb.total)} <span className="text-gray-400 font-normal">({lb.count} txns)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${LEVEL_BAR_COLORS[i % LEVEL_BAR_COLORS.length]} rounded-full`}
                          style={{ width: `${(lb.total / maxLevel) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Agents Paid",  val: summary.total_agents_paid,                  unit: "agents" },
                { label: "Total Transactions", val: summary.total_transactions,                 unit: "txns" },
                { label: "POS Profit Paid",    val: fmt(summary.total_pos_profit),              unit: "" },
                { label: "Society Profit Paid",val: fmt(summary.total_society_profit),          unit: "" },
              ].map(({ label, val, unit }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-lg font-bold text-gray-800">{val} {unit && <span className="text-xs font-normal text-gray-400">{unit}</span>}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Agents Tab ── */}
        {activeTab === "agents" && (
          <div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  value={agentSearch}
                  onChange={e => setAgentSearch(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 text-left">Agent</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-right">MLM Commission</th>
                    <th className="px-5 py-3 text-right">POS/Society</th>
                    <th className="px-5 py-3 text-right">Total Earnings</th>
                    <th className="px-5 py-3 text-center">Txns</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAgents.map(ag => (
                    <tr key={ag.username} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{ag.agent_name}</p>
                          <p className="text-xs text-gray-500">@{ag.username}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${AGENT_TYPE_COLOR[ag.agent_type] || 'bg-gray-100 text-gray-600'}`}>
                          {ag.agent_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-blue-700">{fmt(ag.upline)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-purple-700">
                        {fmt(ag.pos_profit + ag.society_profit)}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-green-700">{fmt(ag.total)}</td>
                      <td className="px-5 py-3 text-center text-gray-600">{ag.tx_count}</td>
                      <td className="px-5 py-3 text-center">
                        {ag.agent_id && (
                          <button
                            onClick={() => setSelectedAgent(ag.agent_id!)}
                            className="flex items-center gap-1 mx-auto px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-xs font-medium transition-colors"
                          >
                            <FaEye size={10} /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAgents.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <FaSearch className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p>No agents found</p>
                </div>
              )}
            </div>
            {/* Footer total */}
            <div className="px-5 py-4 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700">
                Total paid to all agents:{" "}
                <span className="text-green-600">{fmt(summary.total_paid_to_agents)}</span>
              </span>
            </div>
          </div>
        )}

        {/* ── Transaction Tabs (MLM Commission removed) ── */}
        {activeTab === "pos" && (
          <TxTable transactions={pos_transactions} showAgent={true} showLevel={false}
            emptyMsg="No POS profit transactions yet" />
        )}
        {activeTab === "society" && (
          <TxTable transactions={society_transactions} showAgent={true} showLevel={false}
            emptyMsg="No society profit transactions yet" />
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal agentId={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
};

export default AdminMLMCommission;