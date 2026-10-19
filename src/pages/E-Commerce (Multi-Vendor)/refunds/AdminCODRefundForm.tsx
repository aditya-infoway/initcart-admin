// pages/admin/refunds/AdminCODRefundForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";
import { COD_ROUTES } from "./codRefundRoutes";

interface BankAccount {
  id: number;
  account_name: string;
  bank_name: string;
  account_number: string;
  closing_balance: number;
}

interface PayableRefund {
  id: number;
  refund_id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  refund_amount: number;
  has_bank_details: boolean;
}

interface RefundDetail {
  id: number;
  refund_id: string;
  status: string;
  refund_amount: number;
  customer_info: { username: string; email: string; phone: string; billing_name: string };
  order_info: { order_number: string; order_date: string; final_amount: number };
  return_info: { return_id: string; reason: string; description: string | null; quantity: number };
  product_info: {
    product_name: string; sku: string; color: string | null; size: string | null;
    ordered_quantity: number; returned_quantity_requested: number; unit_price: number;
    total_price: number; image: string | null;
  };
  vendor_name: string;
  bank_details: {
    account_holder_name: string; bank_name: string; account_number: string;
    ifsc_code: string; account_type: string; upi_id: string;
  } | null;
}

const MODES = [
  { value: "neft", label: "NEFT" },
  { value: "imps", label: "IMPS" },
  { value: "rtgs", label: "RTGS" },
  { value: "upi", label: "UPI" },
  { value: "net_banking", label: "Net Banking" },
  { value: "cheque", label: "Cheque" },
];

const MAX_PROOF = 1 * 1024 * 1024;
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".pdf"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount || 0);

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const inputCls = "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

const AdminCODRefundForm = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const preselect = sp.get("refund");

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [payable, setPayable] = useState<PayableRefund[]>([]);
  const [orderSearch, setOrderSearch] = useState("");

  const [bankAccountId, setBankAccountId] = useState("");
  const [refundId, setRefundId] = useState(preselect || "");
  const [detail, setDetail] = useState<RefundDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("neft");
  const [referenceNo, setReferenceNo] = useState("");
  const [narration, setNarration] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // bank accounts (active only)
  useEffect(() => {
    apiClient
      .get("ecommerce/admin/refund-bank-accounts/", { params: { all: 1, active: 1 } })
      .then((r) => r.data.success && setAccounts(r.data.data))
      .catch(() => Swal.fire({ icon: "error", title: "Error", text: "Failed to load bank accounts" }));
  }, []);

  // payable COD refunds (debounced search)
  useEffect(() => {
    const t = setTimeout(() => {
      apiClient
        .get("ecommerce/admin/cod-refunds/payable/", { params: orderSearch ? { search: orderSearch } : {} })
        .then((r) => r.data.success && setPayable(r.data.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [orderSearch]);

  // detail when order selected
  useEffect(() => {
    if (!refundId) { setDetail(null); return; }
    setDetailLoading(true);
    apiClient
      .get(`ecommerce/admin/cod-refunds/${refundId}/`)
      .then((r) => {
        if (r.data.success) {
          setDetail(r.data.data);
          setAmount(String(r.data.data.refund_amount));
        }
      })
      .catch((e) => {
        setDetail(null);
        Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "Failed to load refund details" });
      })
      .finally(() => setDetailLoading(false));
  }, [refundId]);

  useEffect(() => () => { if (proofPreview) URL.revokeObjectURL(proofPreview); }, [proofPreview]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setErrors((p) => ({ ...p, proof: "" }));
    if (proofPreview) { URL.revokeObjectURL(proofPreview); setProofPreview(null); }
    if (!f) { setProof(null); return; }
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (!ALLOWED_EXT.includes(ext)) {
      setErrors((p) => ({ ...p, proof: "Only JPG, PNG or PDF allowed" }));
      setProof(null); if (fileRef.current) fileRef.current.value = ""; return;
    }
    if (f.size > MAX_PROOF) {
      setErrors((p) => ({ ...p, proof: "File must be 1 MB or smaller" }));
      setProof(null); if (fileRef.current) fileRef.current.value = ""; return;
    }
    setProof(f);
    if (f.type.startsWith("image/")) setProofPreview(URL.createObjectURL(f));
  };

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!bankAccountId) e.bank_account_id = "Select the bank account to pay from";
    if (!refundId || !detail) e.refund = "Select an order";
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = "Enter a valid amount";
    else if (detail && amt > detail.refund_amount) e.amount = `Cannot exceed ${formatCurrency(detail.refund_amount)}`;
    else if (detail && amt < detail.refund_amount && !narration.trim()) e.narration = "Narration required when paying less than refund amount";
    if (!mode) e.payment_mode = "Select payment mode";
    if (!proof) e.proof = "Upload payment proof (JPG/PNG/PDF, max 1 MB)";
    if (detail && !detail.bank_details) e.refund = "Customer has not provided bank details";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !detail || !proof) return;

    const acc = accounts.find((a) => String(a.id) === bankAccountId);
    const confirm = await Swal.fire({
      icon: "question",
      title: "Confirm refund payment",
      html: `Pay <b>${formatCurrency(Number(amount))}</b> for order <b>${detail.order_info.order_number}</b><br/>from <b>${acc?.account_name}</b>?<br/><small>This cannot be undone.</small>`,
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      confirmButtonColor: "#2563eb",
    });
    if (!confirm.isConfirmed) return;

    const fd = new FormData();
    fd.append("bank_account_id", bankAccountId);
    fd.append("amount", Number(amount).toFixed(2));
    fd.append("payment_mode", mode);
    fd.append("reference_no", referenceNo.trim());
    fd.append("narration", narration.trim());
    fd.append("proof", proof);

    setSubmitting(true);
    try {
      const res = await apiClient.post(`ecommerce/admin/cod-refunds/${detail.id}/pay/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        await Swal.fire({ icon: "success", title: "Refund Recorded", text: res.data.message, timer: 2000, showConfirmButton: false });
        navigate(COD_ROUTES.list);
      }
    } catch (error: any) {
      const d = error.response?.data;
      if (d?.errors) {
        const fe: Record<string, string> = {};
        Object.entries(d.errors).forEach(([k, v]: any) => (fe[k] = Array.isArray(v) ? v[0] : String(v)));
        setErrors(fe);
      }
      Swal.fire({
        icon: "error",
        title: "Could not submit",
        text: d?.message || (d?.errors ? Object.values(d.errors).flat().join(" ") : "Something went wrong"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const bd = detail?.bank_details;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium">← Back</button>
        <h1 className="text-xl font-semibold text-gray-800">Pay COD Refund</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-5">
        {/* 1. Bank account */}
        <Field label="Pay from Bank Account *" error={errors.bank_account_id}>
          <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className={inputCls}>
            <option value="">— Select bank account —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.account_name} · {a.bank_name} · ****{a.account_number.slice(-4)}</option>
            ))}
          </select>
          {accounts.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No active bank account. <button type="button" className="text-blue-600 underline" onClick={() => navigate(COD_ROUTES.accounts)}>Create one</button>
            </p>
          )}
        </Field>

        {/* 2. Order */}
        <div className="space-y-2">
          <Field label="Order (COD refunds pending payment) *" error={errors.refund}>
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search order no. / customer / product…"
              className={`${inputCls} mb-2`}
            />
            <select value={refundId} onChange={(e) => setRefundId(e.target.value)} className={inputCls}>
              <option value="">— Select order —</option>
              {payable.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.order_number} · {p.customer_name} · {p.product_name} · {formatCurrency(p.refund_amount)}{!p.has_bank_details ? " (no bank details)" : ""}
                </option>
              ))}
              {/* keep preselected one visible even if filtered out by search */}
              {detail && !payable.find((p) => String(p.id) === refundId) && (
                <option value={refundId}>{detail.order_info.order_number} · {detail.customer_info.username}</option>
              )}
            </select>
          </Field>
        </div>

        {/* 3. Details */}
        {detailLoading && <p className="text-sm text-gray-500">Loading details…</p>}
        {detail && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Customer & Product</h3>
              <div className="flex gap-3">
                {detail.product_info.image && (
                  <img src={detail.product_info.image} alt="" className="w-16 h-16 rounded object-cover border" />
                )}
                <div className="text-sm text-gray-700 space-y-0.5">
                  <div className="font-medium">{detail.product_info.product_name}</div>
                  <div className="text-xs text-gray-500">
                    SKU: {detail.product_info.sku}
                    {detail.product_info.color ? ` · ${detail.product_info.color}` : ""}
                    {detail.product_info.size ? ` · ${detail.product_info.size}` : ""}
                  </div>
                  <div className="text-xs text-gray-500">Vendor: {detail.vendor_name}</div>
                  <div className="text-xs text-gray-500">Return qty: {detail.return_info.quantity} of {detail.product_info.ordered_quantity}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-700 space-y-0.5">
                <div><b>Customer:</b> {detail.customer_info.billing_name || detail.customer_info.username}</div>
                <div><b>Phone:</b> {detail.customer_info.phone || "-"}</div>
                <div><b>Email:</b> {detail.customer_info.email || "-"}</div>
                <div><b>Order:</b> {detail.order_info.order_number}</div>
                <div><b>Return:</b> {detail.return_info.return_id} · {detail.return_info.reason}</div>
                <div><b>Refund amount:</b> <span className="font-semibold">{formatCurrency(detail.refund_amount)}</span></div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Customer's Bank Details</h3>
              {!bd ? (
                <p className="text-sm text-red-600">Customer has not provided bank details yet — payment cannot be made.</p>
              ) : (
                <div className="text-sm text-gray-700 space-y-1">
                  {[
                    ["Account Holder", bd.account_holder_name],
                    ["Bank", bd.bank_name],
                    ["Account No.", bd.account_number],
                    ["IFSC", bd.ifsc_code],
                    ["Type", bd.account_type],
                    ["UPI ID", bd.upi_id || "-"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <span><b>{k}:</b> {v}</span>
                      {v && v !== "-" && (
                        <button type="button" onClick={() => copy(String(v))} className="text-xs text-blue-600 hover:underline">Copy</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Amount */}
        <Field label="Refund Amount (₹) *" error={errors.amount}>
          <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} placeholder="0.00" />
          {detail && <p className="text-xs text-gray-500 mt-1">Refund amount for this return: {formatCurrency(detail.refund_amount)}</p>}
        </Field>

        {/* 5. Mode */}
        <Field label="Payment Mode *" error={errors.payment_mode}>
          <div className="flex flex-wrap gap-3">
            {MODES.map((m) => (
              <label key={m.value} className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm ${mode === m.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-700"}`}>
                <input type="radio" name="payment_mode" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} />
                {m.label}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Reference No. / UTR / Cheque No. (optional)">
          <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} maxLength={100} className={inputCls} />
        </Field>

        {/* 6. Proof */}
        <Field label="Payment Proof * (JPG / PNG / PDF, max 1 MB)" error={errors.proof}>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFile}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {proof && (
            <div className="mt-2 flex items-center gap-3">
              {proofPreview ? <img src={proofPreview} alt="proof" className="h-20 rounded border" /> : <span className="text-sm text-gray-600">📄 {proof.name}</span>}
              <span className="text-xs text-gray-500">{(proof.size / 1024).toFixed(0)} KB</span>
            </div>
          )}
        </Field>

        {/* 7. Narration */}
        <Field label="Narration" error={errors.narration}>
          <textarea value={narration} onChange={(e) => setNarration(e.target.value)} rows={3} maxLength={500} className={inputCls} placeholder="Remarks for this refund payment…" />
        </Field>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => navigate(COD_ROUTES.list)} disabled={submitting}
            className="px-5 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={submitting || !detail || !bd}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50">
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCODRefundForm;