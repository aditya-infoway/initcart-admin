import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface VerifyItem {
  id: string;
  item: string;
  quantity: number;
  rate: number;
  tax: number;
  discount: number;
  netAmount: number; // computed
  verified?: boolean;
}

interface VerifyVoucher {
  id: number;
  srNo: number;
  voucherNo: string;     // e.g. VCH-001
  date: string;
  terms: string;         // Cash/Credit
  supplierName: string;
  grandTotal: number;
  items: VerifyItem[];
}

const PurchaseVerify = () => {
  const [rows, setRows] = useState<VerifyVoucher[]>([
    {
      id: 1,
      srNo: 1,
      voucherNo: "VCH-001",
      date: "2025-10-15",
      terms: "Credit",
      supplierName: "Ramesh Traders",
      grandTotal: 12050,
      items: [
        { id: crypto.randomUUID(), item: "Parle-G 500gm", quantity: 10, rate: 20, discount: 0, tax: 18, netAmount: 20 * 10 * 1.18 },
        { id: crypto.randomUUID(), item: "Tea 1kg", quantity: 5, rate: 200, discount: 50, tax: 5, netAmount: (200*5-50)*1.05 },
      ],
    },
  ]);

  const [showVerify, setShowVerify] = useState<VerifyVoucher | null>(null);

  const computeNet = (it: VerifyItem) => {
    const base = it.quantity * it.rate - (it.discount || 0);
    return Number((base + base * (it.tax || 0) / 100).toFixed(2));
  };

  const markVerified = (voucherId: number, itemId: string) => {
    setRows(list => list.map(v =>
      v.id !== voucherId ? v : {
        ...v,
        items: v.items.map(it => it.id !== itemId ? it : ({ ...it, verified: true }))
      }
    ));
    Swal.fire("Verified", "Item verified & stock updated.", "success");
  };

  return (
    <div className="p-4">
      <DataTable
        title="Purchase Verify"
        data={rows}
        columns={[
            {
            key: "action",
            label: "Action",
            render: (row: VerifyVoucher) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-sky-600 text-white rounded" onClick={() => setShowVerify(row)}>Verify</button>
                <button className="px-2 py-1 bg-gray-600 text-white rounded" onClick={() => setShowVerify(row)}>View</button>
              </div>
            ),
          },
          { key: "srNo", label: "SR No." },
          { key: "voucherNo", label: "Voucher No." },
          { key: "date", label: "Date" },
          { key: "terms", label: "Terms" },
          { key: "supplierName", label: "Supplier Name" },
          { key: "grandTotal", label: "Grand Total" },
          
        ]}
      />

      {/* Verify Modal */}
      {showVerify && (
        <div className="fixed inset-0 bg-[#0000007d] z-50 flex items-center justify-center px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-4">Verify Voucher: {showVerify.voucherNo}</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-2 py-1">Item</th>
                    <th className="border px-2 py-1">Quantity</th>
                    <th className="border px-2 py-1">Rate</th>
                    <th className="border px-2 py-1">Tax %</th>
                    <th className="border px-2 py-1">Discount</th>
                    <th className="border px-2 py-1">Net Amount</th>
                    <th className="border px-2 py-1">Verify</th>
                  </tr>
                </thead>
                <tbody>
                  {showVerify.items.map(it => (
                    <tr key={it.id}>
                      <td className="border px-2 py-1">{it.item}</td>
                      <td className="border px-2 py-1 text-right">{it.quantity}</td>
                      <td className="border px-2 py-1 text-right">{it.rate}</td>
                      <td className="border px-2 py-1 text-right">{it.tax}</td>
                      <td className="border px-2 py-1 text-right">{it.discount}</td>
                      <td className="border px-2 py-1 text-right">{computeNet(it).toFixed(2)}</td>
                      <td className="border px-2 py-1 text-center">
                        {it.verified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Verified</span>
                        ) : (
                          <button className="px-2 py-1 bg-emerald-600 text-white rounded" onClick={() => markVerified(showVerify.id, it.id)}>Verify</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowVerify(null)}>Close</button>
            </div>

            <button onClick={() => setShowVerify(null)} className="absolute top-5 right-5 text-2xl text-gray-500">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseVerify;
