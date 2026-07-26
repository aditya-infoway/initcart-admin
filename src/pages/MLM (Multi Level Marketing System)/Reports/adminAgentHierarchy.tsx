// src/pages/SuperAdminAgentHierarchy.tsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../api/apiClient';
import {
  Users, Award, TrendingUp, DollarSign, Activity, ArrowUp,
  MinusCircle, PlusCircle, Search, Filter, ChevronDown, ShieldCheck, X,
  Network, UserCheck, UserX, Crown,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

interface AgentInfo {
  agent_id: number;
  agent_type: string;
  status: string;
  total_sales: number;
  is_active: boolean;
  referral_code?: string;
}

interface UserBrief {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
}

interface SearchResult extends UserBrief {
  agent: AgentInfo | null;
}

// ── Dashboard stats shapes ──
interface AgentTypeStat {
  type: string;
  label: string;
  count: number;
}

interface DashboardStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  total_sales: number;
  total_users: number;
  top_level_agents: number;
  by_type: AgentTypeStat[];
}

// ── Downline tree shapes (mirrors DownlineHierarchy.tsx) ──
interface DownlineTreeNodeData {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  user_type: string;
  depth: number;
  agent: AgentInfo | null;
  downline_count: number;
  children: DownlineTreeNodeData[];
}

interface DownlineResponse {
  target_user: UserBrief;
  max_depth: number;
  total_downline: number;
  root: DownlineTreeNodeData;
}

// ── Upline tree shapes (mirrors UplineHierarchy.tsx) ──
interface RawSibling {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  agent: AgentInfo | null;
  is_active: boolean;
  is_direct_parent: boolean;
}

interface RawUplineNode {
  level: number;
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  is_active: boolean;
  agent: AgentInfo | null;
  siblings: RawSibling[];
}

interface RawRoot {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  depth: number;
  agent: AgentInfo | null;
  siblings: RawSibling[];
}

interface UplineTreeResponse {
  target_user: UserBrief;
  max_levels: number;
  upline_count: number;
  root: RawRoot;
  upline_tree: RawUplineNode[];
}

interface DisplayNode {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  depth: number;
  agent: AgentInfo | null;
  children: DisplayNode[];
  isDirectPath?: boolean;
  isSelf?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getGradient = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'pos': return 'from-purple-500 to-purple-700';
    case 'society': return 'from-teal-500 to-teal-700';
    case 'master': return 'from-purple-500 to-purple-700';
    case 'senior': return 'from-indigo-500 to-indigo-700';
    case 'junior': return 'from-teal-500 to-teal-700';
    default: return 'from-blue-500 to-blue-700';
  }
};

// Formal blue-toned palette for charts, cycled per slice
const DONUT_PALETTE = [
  '#2563eb', // blue-600
  '#4f46e5', // indigo-600
  '#0891b2', // cyan-600
  '#7c3aed', // violet-600
  '#0d9488', // teal-600
  '#1d4ed8', // blue-700
  '#334155', // slate-700
];

const buildParentMap = (node: { id: number; children: any[] }, parentId: number | null = null): Map<number, number | null> => {
  const map = new Map<number, number | null>();
  map.set(node.id, parentId);
  node.children.forEach((child: any) => {
    const childMap = buildParentMap(child, node.id);
    childMap.forEach((value, key) => map.set(key, value));
  });
  return map;
};

function buildDisplayTree(data: UplineTreeResponse): DisplayNode {
  const { root, upline_tree } = data;

  if (upline_tree.length === 0) {
    return {
      id: root.id,
      full_name: root.full_name,
      username: root.username,
      email: root.email,
      phone: root.phone || '',
      depth: 0,
      agent: root.agent,
      children: [],
      isDirectPath: true,
      isSelf: true,
    };
  }

  const sibToLeaf = (sib: RawSibling, displayDepth: number): DisplayNode => ({
    id: sib.id,
    full_name: sib.full_name,
    username: sib.username,
    email: sib.email,
    phone: sib.phone || '',
    depth: displayDepth,
    agent: sib.id === root.id ? root.agent : sib.agent,
    children: [],
    isDirectPath: sib.is_direct_parent,
    isSelf: sib.id === root.id,
  });

  const buildNode = (levelIndex: number, displayDepth: number): DisplayNode => {
    const lvl = upline_tree[levelIndex];
    let children: DisplayNode[];

    if (levelIndex === 0) {
      children = lvl.siblings.map(sib => sibToLeaf(sib, displayDepth + 1));
    } else {
      children = lvl.siblings.map(sib => {
        if (sib.is_direct_parent) {
          return buildNode(levelIndex - 1, displayDepth + 1);
        }
        return sibToLeaf(sib, displayDepth + 1);
      });
    }

    return {
      id: lvl.id,
      full_name: lvl.full_name,
      username: lvl.username,
      email: lvl.email,
      phone: lvl.phone || '',
      depth: lvl.level,
      agent: lvl.agent,
      children,
      isDirectPath: true,
    };
  };

  return buildNode(upline_tree.length - 1, 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard overview (shown only when no agent selected / no search results)
// ─────────────────────────────────────────────────────────────────────────────

// Small count-up hook for animated numbers
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  bg: string;
  color: string;
  delay?: number;
}> = ({ icon: Icon, label, value, prefix = '', bg, color, delay = 0 }) => {
  const animated = useCountUp(value);
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
      style={{ animation: `fadeSlideIn 0.5s ease-out ${delay}ms both` }}
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 ${bg} rounded-xl`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}
            {animated.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Animated SVG donut chart, no external chart library needed
const DonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: number;
}> = ({ data, size = 200, strokeWidth = 26, centerLabel, centerValue }) => {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {total > 0 && data.map((d, i) => {
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const offset = circumference - (animated ? dash : 0);
            const rotation = (cumulative / total) * 360;
            cumulative += d.value;
            return (
              <circle
                key={d.label + i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: `${center}px ${center}px`,
                  transition: `stroke-dashoffset 1s ease-out ${i * 120}ms`,
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{centerValue ?? total}</span>
          {centerLabel && <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{centerLabel}</span>}
        </div>
      </div>
    </div>
  );
};

const DashboardOverview: React.FC<{
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}> = ({ stats, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-700 font-semibold">Loading network overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
        <Activity className="w-10 h-10 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={onRetry} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Try Again</button>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = [
    { label: 'Active', value: stats.active_agents, color: '#2563eb' },
    { label: 'Inactive', value: stats.inactive_agents, color: '#cbd5e1' },
  ];

  const typeData = stats.by_type.map((t, i) => ({
    label: t.label,
    value: t.count,
    color: DONUT_PALETTE[i % DONUT_PALETTE.length],
  }));

  return (
    <div>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Intro banner */}
      <div
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl shadow-xl p-6 mb-6 text-white"
        style={{ animation: 'fadeSlideIn 0.5s ease-out both' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Network Overview</h2>
            <p className="text-blue-100 text-sm">Search an agent above to inspect their individual upline / downline tree</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Agents" value={stats.total_agents} bg="bg-blue-100" color="text-blue-600" delay={0} />
        <StatCard icon={UserCheck} label="Active Agents" value={stats.active_agents} bg="bg-indigo-100" color="text-indigo-600" delay={80} />
        <StatCard icon={UserX} label="Inactive Agents" value={stats.inactive_agents} bg="bg-slate-100" color="text-slate-600" delay={160} />
        <StatCard icon={DollarSign} label="Network Sales" value={Math.round(stats.total_sales)} prefix="₹" bg="bg-green-100" color="text-green-600" delay={240} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Crown} label="Top-Level Agents" value={stats.top_level_agents} bg="bg-purple-100" color="text-purple-600" delay={320} />
        <StatCard icon={Award} label="Agent Types" value={stats.by_type.length} bg="bg-cyan-100" color="text-cyan-600" delay={400} />
        <StatCard icon={TrendingUp} label="Total Users" value={stats.total_users} bg="bg-blue-100" color="text-blue-600" delay={480} />
        <div className="hidden lg:block" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          style={{ animation: 'fadeSlideIn 0.6s ease-out 200ms both' }}
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" /> Agent Status Breakdown
          </h3>
          <div className="flex items-center justify-around flex-wrap gap-6">
            <DonutChart data={statusData} centerLabel="Total" centerValue={stats.total_agents} />
            <div className="space-y-3">
              {statusData.map(d => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-gray-700 font-medium">{d.label}</span>
                  <span className="text-sm font-bold text-gray-900 ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          style={{ animation: 'fadeSlideIn 0.6s ease-out 320ms both' }}
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" /> Agent Type Distribution
          </h3>
          {typeData.length > 0 ? (
            <div className="flex items-center justify-around flex-wrap gap-6">
              <DonutChart data={typeData} centerLabel="Types" centerValue={typeData.length} />
              <div className="space-y-3">
                {typeData.map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-gray-700 font-medium">{d.label}</span>
                    <span className="text-sm font-bold text-gray-900 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No agent type data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Downline: Tree node card (identical design to DownlineHierarchy.tsx)
// ─────────────────────────────────────────────────────────────────────────────

const DownlineTreeNodeComponent: React.FC<{ node: DownlineTreeNodeData; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const displayName = node.full_name || node.username;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`
          relative w-72 rounded-2xl shadow-xl border-2 transition-all duration-300
          hover:shadow-2xl hover:scale-105 cursor-pointer
          ${isRoot
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400'
            : node.agent?.is_active
            ? 'bg-white border-green-300 hover:border-green-500'
            : 'bg-gray-50/80 border-gray-300 hover:border-gray-400'
          }
        `}>
          <div className="flex items-center justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md bg-gradient-to-br ${getGradient(node.agent?.agent_type || '')}`}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-sm leading-tight">{displayName}</h3>
                <p className="text-xs text-gray-500 truncate">{node.email || node.phone || node.username}</p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r ${isRoot ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-pink-600'}`}>
              L{node.depth}
            </div>
          </div>

          <div className={`h-1 ${node.agent?.is_active ? 'bg-gradient-to-r from-green-400 to-green-500' : isRoot ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gray-300'}`} />

          <div className="p-3 pt-2 space-y-1.5">
            {node.agent ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Agent Type</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getGradient(node.agent.agent_type)}`}>
                    {node.agent.agent_type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Sales</span>
                  <span className="text-xs font-bold text-green-700">₹{node.agent.total_sales.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${node.agent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {node.agent.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                {node.agent.referral_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Referral Code</span>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{node.agent.referral_code}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-2"><span className="text-xs text-gray-400 italic">Not an agent yet</span></div>
            )}
          </div>

          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-600"><span className="font-bold">{node.downline_count}</span> downline</span>
              </div>
              {hasChildren ? (
                <button onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  {isExpanded
                    ? <><MinusCircle className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-medium text-blue-600">Hide</span></>
                    : <><PlusCircle className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-medium text-blue-600">Show</span></>}
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">No children</span>
              )}
            </div>
          </div>
        </div>

        {!isRoot && (
          <div className={`absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${node.agent?.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-blue-300" />
          <div className="relative">
            {node.children.length > 1 && (
              <div className="absolute top-0 h-0.5 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300"
                style={{ left: `${100 / (node.children.length * 2)}%`, right: `${100 / (node.children.length * 2)}%` }} />
            )}
            <div className="flex gap-6 pt-8 justify-center">
              {node.children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-300 to-blue-400 -mt-8" />
                  <DownlineTreeNodeComponent node={child} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Downline: List view (identical design to DownlineHierarchy.tsx) ──

const DownlineListViewComponent: React.FC<{ data: DownlineResponse }> = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([data.root.id]));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const parentMap = buildParentMap(data.root as any);

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      const collapse = (nodeId: number) => {
        next.delete(nodeId);
        parentMap.forEach((pId, cId) => { if (pId === nodeId) collapse(cId); });
      };
      collapse(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const shouldShow = (node: DownlineTreeNodeData): boolean => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const name = (node.full_name || node.username).toLowerCase();
      const contact = (node.email || node.phone || node.username).toLowerCase();
      if (!name.includes(q) && !contact.includes(q) && !(node.agent?.referral_code?.toLowerCase().includes(q))) return false;
    }
    if (filterStatus === 'active' && !node.agent?.is_active) return false;
    if (filterStatus === 'inactive' && node.agent?.is_active) return false;
    return true;
  };

  const renderNode = (node: DownlineTreeNodeData, depth = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const visible = shouldShow(node);

    if (!visible && !hasChildren) return rows;

    const displayName = node.full_name || node.username;
    const contactInfo = node.email || node.phone || node.username;

    if (visible) {
      rows.push(
        <tr key={node.id} className={`transition-all duration-200 hover:bg-gray-50 ${depth === 0 ? 'bg-blue-50/50' : ''}`}>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button onClick={() => toggleRow(node.id)} className="p-1 hover:bg-gray-200 rounded-lg">
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                </button>
              ) : <div className="w-6" />}
              <span style={{ marginLeft: `${depth * 20}px` }}>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-sm bg-gradient-to-br ${depth === 0 ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-pink-600'}`}>
                  {depth}
                </span>
              </span>
            </div>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${getGradient(node.agent?.agent_type || '')}`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {depth > 0 && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${node.agent?.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  {depth === 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium border border-blue-200">Selected agent</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">{contactInfo}</p>
              </div>
            </div>
          </td>
          <td className="py-3 px-4">
            {node.agent ? (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getGradient(node.agent.agent_type)}`}>
                {node.agent.agent_type}
              </span>
            ) : <span className="text-xs text-gray-400 italic">Not an agent</span>}
          </td>
          <td className="py-3 px-4 text-right">
            <span className="text-sm font-bold text-green-700">₹{node.agent?.total_sales?.toLocaleString('en-IN') || '0'}</span>
          </td>
          <td className="py-3 px-4 text-center">
            {depth === 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Root
              </span>
            ) : node.agent?.is_active ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Inactive
              </span>
            )}
          </td>
          <td className="py-3 px-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              {node.downline_count}
            </span>
          </td>
        </tr>
      );
    }

    if (isExpanded && hasChildren) {
      node.children.forEach(child => rows.push(...renderNode(child, depth + 1)));
    }
    return rows;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, contact or referral code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 px-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.total_downline}</span> Total Members
        </span>
        <span className="w-1 h-1 bg-gray-300 rounded-full" />
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.max_depth}</span> Levels Deep
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              {['Level', 'Member', 'Type', 'Sales', 'Status', 'Downline'].map(h => (
                <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">{renderNode(data.root)}</tbody>
        </table>
      </div>

      {data.total_downline === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Downline Members</h3>
          <p className="text-gray-500 text-sm">This agent has not built a downline yet</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Upline: Tree node card (identical design to UplineHierarchy.tsx)
// ─────────────────────────────────────────────────────────────────────────────

const UplineTreeNodeComponent: React.FC<{ node: DisplayNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelf = !!node.isSelf;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`
          relative w-72 rounded-2xl shadow-xl border-2 transition-all duration-300
          hover:shadow-2xl hover:scale-105 cursor-pointer
          ${isSelf
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400 shadow-blue-300/50'
            : isRoot
            ? 'bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-400 shadow-purple-300/50'
            : node.isDirectPath
            ? 'bg-white border-indigo-300 hover:border-indigo-500'
            : node.agent?.is_active
              ? 'bg-white border-green-300 hover:border-green-500'
              : 'bg-gray-50/80 border-gray-300 hover:border-gray-400'
          }
        `}>
          <div className="flex items-center justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md
                bg-gradient-to-br ${isSelf ? 'from-blue-500 to-blue-700' : getGradient(node.agent?.agent_type || '')}
              `}>
                {node.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-sm leading-tight flex items-center gap-1">
                  {node.full_name}
                  {isSelf && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">Selected agent</span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 truncate">{node.email || node.phone || node.username}</p>
              </div>
            </div>
          </div>

          <div className={`h-1 ${isSelf ? 'bg-gradient-to-r from-blue-400 to-blue-500' : node.agent?.is_active ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-300'}`} />

          <div className="p-3 pt-2 space-y-1.5">
            {node.agent ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Agent Type</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getGradient(node.agent.agent_type)}`}>
                    {node.agent.agent_type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Sales</span>
                  <span className="text-xs font-bold text-green-700">₹{node.agent.total_sales.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${node.agent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {node.agent.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                {node.agent.referral_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Referral Code</span>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{node.agent.referral_code}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-2"><span className="text-xs text-gray-400 italic">Not an agent yet</span></div>
            )}
          </div>

          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-600">
                  <span className="font-bold">{node.children.length}</span> {isSelf ? 'co-referrals' : 'members'}
                </span>
              </div>
              {hasChildren ? (
                <button onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  {isExpanded
                    ? <><MinusCircle className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-medium text-blue-600">Hide</span></>
                    : <><PlusCircle className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-medium text-blue-600">Show</span></>}
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">{isSelf ? 'Top of chain' : 'No members'}</span>
              )}
            </div>
          </div>
        </div>

        {!isRoot && (
          <div className={`
            absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg
            ${isSelf ? 'bg-blue-500 animate-pulse' : node.agent?.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}
          `} />
        )}
        {!isRoot && !isSelf && node.isDirectPath && (
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg bg-indigo-500" />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-blue-300" />
          <div className="relative">
            {node.children.length > 1 && (
              <div className="absolute top-0 h-0.5 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300"
                style={{ left: `${100 / (node.children.length * 2)}%`, right: `${100 / (node.children.length * 2)}%` }} />
            )}
            <div className="flex gap-6 pt-8 justify-center">
              {node.children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-300 to-blue-400 -mt-8" />
                  <UplineTreeNodeComponent node={child} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Upline: List view (identical design to UplineHierarchy.tsx) ──

const UplineListViewComponent: React.FC<{ data: UplineTreeResponse; displayRoot: DisplayNode }> = ({ data, displayRoot }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([displayRoot.id]));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const parentMap = buildParentMap(displayRoot);

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      const collapse = (nodeId: number) => {
        next.delete(nodeId);
        parentMap.forEach((pId, cId) => { if (pId === nodeId) collapse(cId); });
      };
      collapse(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const getLevelBadgeColor = (node: DisplayNode) => {
    if (node.isSelf) return 'from-blue-500 to-blue-700';
    if (node.isDirectPath) return 'from-indigo-500 to-indigo-700';
    return 'from-purple-500 to-pink-600';
  };

  const shouldShowNode = (node: DisplayNode): boolean => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matches =
        node.full_name?.toLowerCase().includes(q) ||
        node.username?.toLowerCase().includes(q) ||
        node.email?.toLowerCase().includes(q) ||
        node.agent?.referral_code?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filterStatus === 'active' && !node.agent?.is_active) return false;
    if (filterStatus === 'inactive' && node.agent?.is_active) return false;
    return true;
  };

  const renderNode = (node: DisplayNode, depth = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const isVisible = shouldShowNode(node);

    if (!isVisible && !hasChildren) return rows;

    if (isVisible) {
      rows.push(
        <tr key={node.id} className={`
          transition-all duration-200 hover:bg-gray-50
          ${node.isSelf ? 'bg-blue-50/50 hover:bg-blue-50/80' : ''}
          ${node.isDirectPath && !node.isSelf ? 'bg-indigo-50/30' : ''}
        `}>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button onClick={() => toggleRow(node.id)} className="p-1 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-110">
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                </button>
              ) : <div className="w-6" />}
              <span style={{ marginLeft: `${depth * 20}px` }}>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-sm bg-gradient-to-br ${getLevelBadgeColor(node)}`}>
                  {node.isSelf ? 'S' : ''}
                </span>
              </span>
            </div>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${node.isSelf ? 'from-blue-500 to-blue-700' : getGradient(node.agent?.agent_type || '')}`}>
                  {node.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                {!node.isSelf && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${node.agent?.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{node.full_name}</p>
                  {node.isSelf && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium border border-blue-200">Selected agent</span>
                  )}
                  {node.isDirectPath && !node.isSelf && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium border border-indigo-200">Direct Upline</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{node.phone || node.username}</span>
                  {node.email && <><span>•</span><span className="truncate">{node.email}</span></>}
                </div>
              </div>
            </div>
          </td>
          <td className="py-3 px-4">
            {node.agent ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">{node.agent.agent_type}</span>
            ) : <span className="text-xs text-gray-400 italic">Not an agent</span>}
          </td>
          <td className="py-3 px-4 text-right">
            <span className="text-sm font-bold text-green-700">₹{node.agent?.total_sales?.toLocaleString('en-IN') || '0'}</span>
          </td>
          <td className="py-3 px-4 text-center">
            {node.isSelf ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" /> Selected
              </span>
            ) : node.agent?.is_active ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Inactive
              </span>
            )}
          </td>
          <td className="py-3 px-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              {node.children.length}
            </span>
          </td>
          <td className="py-3 px-4">
            {node.agent?.referral_code ? (
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">{node.agent.referral_code}</span>
            ) : <span className="text-xs text-gray-400">-</span>}
          </td>
        </tr>
      );
    }

    if (isExpanded && hasChildren) {
      node.children.forEach(child => rows.push(...renderNode(child, depth + 1)));
    }
    return rows;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, username, email or referral code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 px-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.upline_count}</span> Total Upline
        </span>
        <span className="w-1 h-1 bg-gray-300 rounded-full" />
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.max_levels}</span> Levels
        </span>
        <span className="w-1 h-1 bg-gray-300 rounded-full" />
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold text-gray-900">₹{data.root.agent?.total_sales?.toLocaleString('en-IN') || '0'}</span> Selected Agent's Sales
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">Level</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Member Details</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent Type</th>
              <th className="text-right py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Sales</th>
              <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Members</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">{renderNode(displayRoot)}</tbody>
        </table>
      </div>

      {data.upline_count === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowUp className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Upline Found</h3>
          <p className="text-gray-500 text-sm">This agent is at the top of the chain — no referrer linked.</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main superadmin page
// ─────────────────────────────────────────────────────────────────────────────

type HierarchyMode = 'downline' | 'upline';
type ViewMode = 'tree' | 'list';

const SuperAdminAgentHierarchy: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);

  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [hierarchyMode, setHierarchyMode] = useState<HierarchyMode>('downline');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [downlineData, setDownlineData] = useState<DownlineResponse | null>(null);
  const [uplineData, setUplineData] = useState<UplineTreeResponse | null>(null);
  const [displayRoot, setDisplayRoot] = useState<DisplayNode | null>(null);

  // Dashboard overview stats (shown only in empty state)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const res = await apiClient.get('mlm/admin/dashboard-stats/');
      setDashboardStats(res.data);
    } catch (err: any) {
      setStatsError(err.response?.data?.detail || 'Failed to load network overview.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    try {
      setSearching(true);
      setSearchError(null);
      setSearchResults(null);
      const res = await apiClient.get('mlm/admin/agent-search/', { params: { q } });
      const results: SearchResult[] = res.data.results || [];
      if (results.length === 1) {
        selectAgent(results[0]);
      } else {
        setSearchResults(results);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.detail || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const selectAgent = async (user: SearchResult) => {
    setSelectedUser(user);
    setSearchResults(null);
    setHierarchyMode('downline');
    setViewMode('tree');
    await Promise.all([fetchDownline(user.id), fetchUpline(user.id)]);
  };

  const fetchDownline = async (userId: number) => {
    try {
      setLoadingData(true);
      setDataError(null);
      const res = await apiClient.get('mlm/admin/hierarchy/downline/', { params: { user_id: userId } });
      setDownlineData(res.data);
    } catch (err: any) {
      setDataError(err.response?.data?.detail || 'Failed to fetch downline hierarchy');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUpline = async (userId: number) => {
    try {
      const res = await apiClient.get('mlm/admin/hierarchy/upline-tree/', { params: { user_id: userId } });
      setUplineData(res.data);
      setDisplayRoot(buildDisplayTree(res.data));
    } catch (err: any) {
      // Downline error already surfaces via dataError; keep upline failure quiet unless user switches to it
      console.error('Failed to fetch upline hierarchy', err);
    }
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setDownlineData(null);
    setUplineData(null);
    setDisplayRoot(null);
    setDataError(null);
    fetchDashboardStats(); // refresh overview stats when returning to empty state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">Agent Network Lookup</h1>
                  <p className="text-blue-100 text-sm mt-0.5">Search any agent to view their full upline and downline</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
                  placeholder="Search agent by mobile number or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={runSearch}
                disabled={searching || !query.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
              {selectedUser && (
                <button
                  onClick={clearSelection}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold text-sm flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {searchError && <p className="text-sm text-red-600 mt-2">{searchError}</p>}

            {/* Multiple match picker */}
            {searchResults && (
              <div className="mt-4">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500">No agent found for "{query}".</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{searchResults.length} match{searchResults.length > 1 ? 'es' : ''} found — pick one</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {searchResults.map(user => (
                        <button
                          key={user.id}
                          onClick={() => selectAgent(user)}
                          className="text-left bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-3"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${getGradient(user.agent?.agent_type || '')}`}>
                            {(user.full_name || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name || user.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user.phone || user.email || user.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard overview shown before any search / when no results selected */}
        {!selectedUser && !searchResults && (
          <DashboardOverview
            stats={dashboardStats}
            loading={loadingStats}
            error={statsError}
            onRetry={fetchDashboardStats}
          />
        )}

        {/* Selected agent summary + hierarchy */}
        {selectedUser && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-md bg-gradient-to-br ${getGradient(selectedUser.agent?.agent_type || '')}`}>
                {(selectedUser.full_name || selectedUser.username).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{selectedUser.full_name || selectedUser.username}</p>
                <p className="text-xs text-gray-500">{selectedUser.phone || selectedUser.email || selectedUser.username}</p>
              </div>
              {selectedUser.agent?.referral_code && (
                <span className="ml-auto text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                  {selectedUser.agent.referral_code}
                </span>
              )}
            </div>

            {loadingData ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                  <p className="mt-4 text-gray-700 font-semibold">Loading network...</p>
                </div>
              </div>
            ) : dataError ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                <Activity className="w-10 h-10 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">{dataError}</p>
                <button onClick={() => fetchDownline(selectedUser.id)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Try Again</button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Users, bg: 'bg-blue-100', color: 'text-blue-600', label: 'Total Downline', val: downlineData?.total_downline ?? 0 },
                    { icon: ArrowUp, bg: 'bg-orange-100', color: 'text-orange-600', label: 'Total Upline', val: uplineData?.upline_count ?? 0 },
                    { icon: Award, bg: 'bg-purple-100', color: 'text-purple-600', label: 'Max Levels', val: `${downlineData?.max_depth ?? uplineData?.max_levels ?? 0} Levels` },
                    { icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600', label: 'Agent Sales', val: `₹${downlineData?.root.agent?.total_sales.toLocaleString('en-IN') || '0'}` },
                  ].map(({ icon: Icon, bg, color, label, val }) => (
                    <div key={label} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 ${bg} rounded-xl`}><Icon className={`w-6 h-6 ${color}`} /></div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                          <p className="text-2xl font-bold text-gray-900">{val}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hierarchy container */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHierarchyMode('downline')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${hierarchyMode === 'downline' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        <Users className="w-3.5 h-3.5" /> Downline
                      </button>
                      <button
                        onClick={() => setHierarchyMode('upline')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${hierarchyMode === 'upline' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" /> Upline
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {(['tree', 'list'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {mode === 'tree' ? 'Tree View' : 'List View'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    {hierarchyMode === 'downline' && downlineData && (
                      downlineData.total_downline > 0 ? (
                        viewMode === 'tree' ? (
                          <div className="overflow-x-auto pb-6">
                            <div className="flex justify-center min-w-fit">
                              <DownlineTreeNodeComponent node={downlineData.root} isRoot={true} />
                            </div>
                          </div>
                        ) : (
                          <DownlineListViewComponent data={downlineData} />
                        )
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No Downline Members</h3>
                          <p className="text-gray-600">This agent hasn't built a network yet.</p>
                        </div>
                      )
                    )}

                    {hierarchyMode === 'upline' && uplineData && displayRoot && (
                      uplineData.upline_count > 0 ? (
                        viewMode === 'tree' ? (
                          <div className="overflow-x-auto overflow-y-hidden pb-6">
                            <div className="flex justify-center min-w-fit">
                              <UplineTreeNodeComponent node={displayRoot} isRoot={true} />
                            </div>
                          </div>
                        ) : (
                          <UplineListViewComponent data={uplineData} displayRoot={displayRoot} />
                        )
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ArrowUp className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No Upline Found</h3>
                          <p className="text-gray-600">This agent is at the top of the chain — no referrer is linked to their account.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminAgentHierarchy;