import { useState } from "react";
import DataTable from "../../../components/common/DataTable";
import Swal from "sweetalert2";

type RefundMode = "Cash" | "Bank" | "UPI";

interface SRItem {
  id: string;
  item: string;
  returnedQty: number;
  reason: string;
}

interface SaleReturnRow {
  id: number;
  returnId: string;         // SRN-001 auto
  originalSaleId: string;   // SLS-001
  branch: string;
  items: SRItem[];
  amount: number;
  refundMode: RefundMode;
}

const SaleReturn = () => {
  const [rows, setRows] = useState<SaleReturnRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SaleReturnRow | null>(null);

  const [form, setForm] = useState<Omit<SaleReturnRow, "id" | "returnId">>({
    originalSaleId: "",
    branch: "",
    items: [],
    amount: 0,
    refundMode: "Cash",
  });

  const [item, setItem] = useState<SRItem>({
    id: crypto.randomUUID(),
    item: "",
    returnedQty: 1,
    reason: "",
  });

  const onHeader = (e: any) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onItem = (e: any) =>
    setItem((i) => ({
      ...i,
      [e.target.name]:
        e.target.name === "returnedQty" ? Number(e.target.value) : e.target.value,
    }));

  const addItem = () => {
    if (!item.item || !item.reason)
      return Swal.fire("Item & Reason required", "", "warning");

    const items = [...form.items, item];

    setForm((f) => ({
      ...f,
      items,
      amount: items.reduce((s, it) => s + it.returnedQty * 1, 0),
    }));

    setItem({ id: crypto.randomUUID(), item: "", returnedQty: 1, reason: "" });
  };

  const removeItem = (id: string) => {
    const items = form.items.filter((i) => i.id !== id);
    setForm((f) => ({
      ...f,
      items,
      amount: items.reduce((s, it) => s + it.returnedQty * 1, 0),
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      originalSaleId: "",
      branch: "",
      items: [],
      amount: 0,
      refundMode: "Cash",
    });
    setShowForm(true);
  };

  const openEdit = (row: SaleReturnRow) => {
    setEditing(row);
    setForm({
      originalSaleId: row.originalSaleId,
      branch: row.branch,
      items: row.items,
      amount: row.amount,
      refundMode: row.refundMode,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.originalSaleId || !form.branch || form.items.length === 0)
      return Swal.fire(
        "Required",
        "Original Sale ID, Branch & at least 1 item.",
        "warning"
      );

    if (editing) {
      setRows((list) =>
        list.map((r) => (r.id === editing.id ? { ...r, ...form } : r))
      );
      Swal.fire("Updated", "Sale return updated.", "success");
    } else {
      const next = rows.length + 1;
      setRows((list) => [
        { id: next, returnId: `SRN-${String(next).padStart(3, "0")}`, ...form },
        ...list,
      ]);
      Swal.fire("Saved", "Sale return added.", "success");
    }
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Sale Return"
        data={rows}
        onAdd={openAdd}
        addButtonLabel="Add Sale Return"
        columns={[
          {
            key: "action",
            label: "Action",
            render: (row: SaleReturnRow) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => openEdit(row)}>
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => setRows((list) => list.filter((x) => x.id !== row.id))}
                >
                  Delete
                </button>
              </div>
            ),
          },
          { key: "returnId", label: "Return ID" },
          { key: "originalSaleId", label: "Original Sale ID" },
          { key: "branch", label: "Branch" },
          { key: "amount", label: "Amount" },
          { key: "refundMode", label: "Refund Mode" },
        ]}
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#0000007d] z-50 flex items-center justify-center px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit Sale Return" : "Add Sale Return"}
            </h2>

            {/* HEADER INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="font-medium">Original Sale ID</label>
                <input name="originalSaleId" className="customInput"
                  placeholder="SLS-001"
                  value={form.originalSaleId}
                  onChange={onHeader}
                />
              </div>

              <div>
                <label className="font-medium">Branch</label>
                <select name="branch" className="customSelect" value={form.branch} onChange={onHeader}>
                  <option value="">Select Branch</option>
                  <option>Branch A</option>
                  <option>Branch B</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Refund Mode</label>
                <select name="refundMode" className="customSelect" value={form.refundMode} onChange={onHeader}>
                  <option>Cash</option>
                  <option>Bank</option>
                  <option>UPI</option>
                </select>
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="border rounded p-3">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <label className="font-medium">Item</label>
                  <input className="customInput" name="item" value={item.item} onChange={onItem} />
                </div>

                <div className="col-span-2">
                  <label className="font-medium">Returned Qty</label>
                  <input className="customInput" type="number" name="returnedQty" value={item.returnedQty} onChange={onItem} />
                </div>

                <div className="col-span-4">
                  <label className="font-medium">Reason</label>
                  <input className="customInput" name="reason" value={item.reason} onChange={onItem} />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button className="customBtn" onClick={addItem}>Add</button>
              </div>

              {/* ITEM TABLE */}
              {form.items.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-2 py-1">Item</th>
                        <th className="border px-2 py-1">Returned Qty</th>
                        <th className="border px-2 py-1">Reason</th>
                        <th className="border px-2 py-1">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it) => (
                        <tr key={it.id}>
                          <td className="border px-2 py-1">{it.item}</td>
                          <td className="border px-2 py-1 text-right">{it.returnedQty}</td>
                          <td className="border px-2 py-1">{it.reason}</td>
                          <td className="border px-2 py-1 text-center">
                            <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => removeItem(it.id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* AMOUNT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="md:col-span-3">
                <label className="font-medium">Amount</label>
                <input className="customInput" readOnly value={form.amount.toFixed(2)} />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
                {editing ? "Update" : "Save"}
              </button>
            </div>

            <button onClick={() => setShowForm(false)} className="absolute top-5 right-5 text-2xl text-gray-500">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleReturn;
