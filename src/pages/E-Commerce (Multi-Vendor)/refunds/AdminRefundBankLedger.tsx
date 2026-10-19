// pages/admin/refunds/AdminRefundBankLedger.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";
import { COD_ROUTES } from "./codRefundRoutes";

interface LedgerRow {
  id: number;
  date: string;
  voucher_no: string;
  refund_id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  payment_mode: string;
  reference_no: string;
  narration: string;
  amount_out: number;
  balance: number;
  proof: string | null;
}

interface LedgerData {
  account: { id: number; account_name: string; bank_name: string; account_number: string; ifsc_code: string; is_active: boolean };
  opening_balance: number;
  total_paid: number;
  closing_balance: number;
  count: number;
  ledger: LedgerRow[];
}

interface AccountOpt { id: number; account_name: string; bank_name: string }

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount || 0);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const AdminRefundBankLedger = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [accounts, setAccounts] = useState<AccountOpt[]>([]);
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiClient.get("ecommerce/admin/refund-bank-accounts/", { params: { all: 1 } })
      .then((r) => r.data.success && setAccounts(r.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!id) return;
    fetchLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dateFrom, dateTo, search]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (search) params.search = search;
      const r = await apiClient.get(`ecommerce/admin/refund-bank-accounts/${id}/ledger/`, { params });
      if (r.data.success) setData(r.data);
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "Failed to load ledger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(COD_ROUTES.accounts)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium">← Accounts</button>
          <h1 className="text-xl font-semibold text-gray-800">Refund Bank Ledger</h1>
        </div>
        <button onClick={fetchLedger} className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-medium">Refresh</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 grid md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Bank Account</label>
          <select value={id} onChange={(e) => navigate(COD_ROUTES.ledger(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_name} · {a.bank_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Order, customer, voucher…" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" />
        </div>
      </div>

      {data && (
        <>
          <div className="text-sm text-gray-600">
            <b>{data.account.account_name}</b> · {data.account.bank_name} · A/c {data.account.account_number} · IFSC {data.account.ifsc_code}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Opening Balance", formatCurrency(data.opening_balance), "text-gray-900"],
              ["Total Paid Out", formatCurrency(data.total_paid), "text-red-600"],
              ["Closing Balance", formatCurrency(data.closing_balance), "text-blue-600"],
              ["Entries", data.count, "text-gray-900"],
            ].map(([l, v, c]) => (
              <div key={String(l)} className="p-4 rounded-lg border border-gray-200 bg-white">
                <p className="text-xs text-gray-500 uppercase font-medium">{l}</p>
                <p className={`text-2xl font-semibold mt-1 ${c}`}>{v}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : !data || data.ledger.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No payments from this account{dateFrom || dateTo || search ? " for the selected filters" : " yet"}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "Voucher", "Order ID", "Customer", "Product", "Mode / Ref", "Narration", "Paid Out (Cr)", "Balance", "Proof"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-600" colSpan={8}>Opening Balance</td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900" colSpan={2}>{formatCurrency(data.opening_balance)}</td>
                </tr>
                {data.ledger.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.voucher_no}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.product_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.payment_mode}{r.reference_no ? ` · ${r.reference_no}` : ""}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={r.narration}>{r.narration || "-"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{formatCurrency(r.amount_out)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(r.balance)}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.proof ? <a href={r.proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : "-"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-700" colSpan={7}>Total / Closing</td>
                  <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(data.total_paid)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900" colSpan={2}>{formatCurrency(data.closing_balance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRefundBankLedger;