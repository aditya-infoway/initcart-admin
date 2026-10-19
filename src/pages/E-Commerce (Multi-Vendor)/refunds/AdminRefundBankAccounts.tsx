// pages/admin/refunds/AdminRefundBankAccounts.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";
import { COD_ROUTES } from "./codRefundRoutes";

interface Account {
  id: number;
  account_name: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  opening_balance: number;
  is_active: boolean;
  total_paid: number;
  closing_balance: number;
  payments_count: number;
}

interface PaginationInfo {
  count: number; total_pages: number; current_page: number; page_size: number; has_next: boolean; has_previous: boolean;
}

const EMPTY_FORM = { account_name: "", bank_name: "", account_holder_name: "", account_number: "", ifsc_code: "", opening_balance: "0" };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount || 0);

const inputCls = "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

const AdminRefundBankAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, total_paid: 0 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 15 };
      if (search) params.search = search;
      const r = await apiClient.get("ecommerce/admin/refund-bank-accounts/", { params });
      if (r.data.success) {
        setAccounts(r.data.data);
        setPagination(r.data.pagination);
        setStats(r.data.stats || stats);
      }
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "Failed to load bank accounts" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setErrors({}); setShowForm(true); };
  const openEdit = (a: Account) => {
    setEditing(a);
    setForm({
      account_name: a.account_name, bank_name: a.bank_name, account_holder_name: a.account_holder_name,
      account_number: a.account_number, ifsc_code: a.ifsc_code, opening_balance: String(a.opening_balance),
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.account_name.trim().length < 2) e.account_name = "Enter account name";
    if (form.bank_name.trim().length < 2) e.bank_name = "Enter bank name";
    if (!/^\d{9,18}$/.test(form.account_number.replace(/\s/g, ""))) e.account_number = "Account number must be 9–18 digits";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.trim().toUpperCase())) e.ifsc_code = "Invalid IFSC (e.g. SBIN0001234)";
    if (form.opening_balance === "" || Number(form.opening_balance) < 0) e.opening_balance = "Opening balance cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      account_number: form.account_number.replace(/\s/g, ""),
      ifsc_code: form.ifsc_code.trim().toUpperCase(),
      opening_balance: Number(form.opening_balance).toFixed(2),
    };
    try {
      const r = editing
        ? await apiClient.patch(`ecommerce/admin/refund-bank-accounts/${editing.id}/`, payload)
        : await apiClient.post("ecommerce/admin/refund-bank-accounts/", payload);
      if (r.data.success) {
        Swal.fire({ icon: "success", title: r.data.message, timer: 1400, showConfirmButton: false });
        setShowForm(false);
        fetchAccounts();
      }
    } catch (error: any) {
      const d = error.response?.data;
      if (d?.errors) {
        const fe: Record<string, string> = {};
        Object.entries(d.errors).forEach(([k, v]: any) => (fe[k] = Array.isArray(v) ? v[0] : String(v)));
        setErrors(fe);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: d?.message || "Failed to save" });
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (a: Account) => {
    try {
      await apiClient.patch(`ecommerce/admin/refund-bank-accounts/${a.id}/`, { is_active: !a.is_active });
      fetchAccounts();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "Failed to update" });
    }
  };

  const handleDelete = async (a: Account) => {
    const c = await Swal.fire({
      icon: "warning", title: "Delete this bank account?", text: a.account_name,
      showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#dc2626",
    });
    if (!c.isConfirmed) return;
    try {
      const r = await apiClient.delete(`ecommerce/admin/refund-bank-accounts/${a.id}/`);
      if (r.data.success) fetchAccounts();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Cannot delete", text: e.response?.data?.message || "Failed" });
    }
  };

  const F = (k: keyof typeof EMPTY_FORM, label: string, extra: any = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        value={form[k]}
        onChange={(e) => setForm((p) => ({ ...p, [k]: extra.upper ? e.target.value.toUpperCase() : e.target.value }))}
        className={inputCls}
        {...extra.input}
      />
      {errors[k] && <p className="text-xs text-red-600 mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium">← Back</button>
          <h1 className="text-xl font-semibold text-gray-800">Refund Bank Accounts</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(COD_ROUTES.list)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium">COD Refunds</button>
          <button onClick={openCreate} className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">+ Add Bank Account</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Accounts", stats.total, "text-gray-900"],
          ["Active", stats.active, "text-green-600"],
          ["Inactive", stats.inactive, "text-gray-500"],
          ["Total Refunded", formatCurrency(stats.total_paid), "text-blue-600"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="p-4 rounded-lg border border-gray-200 bg-white">
            <p className="text-xs text-gray-500 uppercase font-medium">{l}</p>
            <p className={`text-2xl font-semibold mt-1 ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by account name, bank, account number…"
            className="w-full md:max-w-md px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No bank accounts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Account Name", "Bank", "Account No.", "IFSC", "Opening", "Paid Out", "Balance", "Payments", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.account_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.bank_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.account_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.ifsc_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(a.opening_balance)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(a.total_paid)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(a.closing_balance)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.payments_count}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${a.is_active ? "text-green-700 bg-green-50" : "text-gray-600 bg-gray-100"}`}>
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => navigate(COD_ROUTES.ledger(a.id))} className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium">Ledger</button>
                        <button onClick={() => openEdit(a)} className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium">Edit</button>
                        <button onClick={() => toggleActive(a)} className="px-2.5 py-1 text-xs bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 font-medium">
                          {a.is_active ? "Deactivate" : "Activate"}
                        </button>
                        {a.payments_count === 0 && (
                          <button onClick={() => handleDelete(a)} className="px-2.5 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 font-medium">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.count > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>Page {pagination.current_page} of {pagination.total_pages} · {pagination.count} accounts</span>
            <div className="flex gap-2">
              <button disabled={!pagination.has_previous} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button disabled={!pagination.has_next} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-800">{editing ? "Edit Bank Account" : "Add Bank Account"}</h2>
            {F("account_name", "Account Name (display label) *")}
            {F("bank_name", "Bank Name *")}
            {F("account_holder_name", "Account Holder Name")}
            {F("account_number", "Account Number *", { input: { inputMode: "numeric" } })}
            {F("ifsc_code", "IFSC Code *", { upper: true, input: { maxLength: 11 } })}
            {F("opening_balance", "Opening Balance (₹)", { input: { type: "number", step: "0.01", min: "0" } })}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} disabled={saving} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50">
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminRefundBankAccounts;