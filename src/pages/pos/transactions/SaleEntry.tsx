import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

type PayMode = "Cash" | "Bank" | "UPI";

interface SaleItem {
  id: string;
  item: string;
  qty: number;
  rate: number;
  tax: number;
  discount: number;
}

interface SaleRow {
  id: number;
  invoiceNo: string; // SLS-001 auto
  date: string;
  branch: string;
  items: SaleItem[];
  netTotal: number;
  paymentMode: PayMode;
}

const SaleEntry = () => {
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SaleRow | null>(null);

  const [form, setForm] = useState<Omit<SaleRow, "id" | "invoiceNo">>({
    date: "",
    branch: "",
    items: [],
    netTotal: 0,
    paymentMode: "Cash",
  });

  const [item, setItem] = useState<SaleItem>({
    id: crypto.randomUUID(),
    item: "",
    qty: 1,
    rate: 0,
    tax: 0,
    discount: 0,
  });

  const calcTotal = (items: SaleItem[]) => {
    return items.reduce((s, it) => {
      const base = it.qty * it.rate - (it.discount || 0);
      const t = base * (it.tax || 0) / 100;
      return s + base + t;
    }, 0);
  };

  const onHeader = (e: any) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onItem = (e: any) =>
    setItem(i => ({
      ...i,
      [e.target.name]:
        ["qty", "rate", "tax", "discount"].includes(e.target.name)
          ? Number(e.target.value)
          : e.target.value,
    }));

  const addItem = () => {
    if (!item.item) return Swal.fire("Item required", "", "warning");

    const items = [...form.items, item];
    setForm(f => ({ ...f, items, netTotal: calcTotal(items) }));

    setItem({
      id: crypto.randomUUID(),
      item: "",
      qty: 1,
      rate: 0,
      tax: 0,
      discount: 0,
    });
  };

  const removeItem = (id: string) => {
    const items = form.items.filter(i => i.id !== id);
    setForm(f => ({ ...f, items, netTotal: calcTotal(items) }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      date: "",
      branch: "",
      items: [],
      netTotal: 0,
      paymentMode: "Cash",
    });
    setShowForm(true);
  };

  const openEdit = (row: SaleRow) => {
    setEditing(row);
    setForm({
      date: row.date,
      branch: row.branch,
      items: row.items,
      netTotal: row.netTotal,
      paymentMode: row.paymentMode,
    });
    setShowForm(true);
  };

  const handleSave = (print?: boolean) => {
    if (!form.date || !form.branch || form.items.length === 0)
      return Swal.fire("Required", "Date, Branch & at least 1 item.", "warning");

    if (editing) {
      setRows(list =>
        list.map(r => (r.id === editing.id ? { ...r, ...form } : r))
      );
      Swal.fire("Updated", "Sale updated.", "success");
    } else {
      const next = rows.length + 1;
      setRows(list => [
        { id: next, invoiceNo: `SLS-${String(next).padStart(3, "0")}`, ...form },
        ...list,
      ]);
      Swal.fire("Saved", "Sale saved.", "success");
    }

    if (print) window.print();
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Sale Entry (Company ➜ Branch)"
        data={rows}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (row: SaleRow) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => openEdit(row)}>
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-indigo-600 text-white rounded"
                  onClick={() => {
                    setEditing(row);
                    setShowForm(true);
                  }}
                >
                  Print
                </button>
              </div>
            ),
          },
          { key: "invoiceNo", label: "Invoice No" },
          { key: "date", label: "Date" },
          { key: "branch", label: "Branch" },
          { key: "netTotal", label: "Net Total" },
          { key: "paymentMode", label: "Payment Mode" },
        ]}
        onAdd={openAdd}
        addButtonLabel="Add Sale"
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#0000007d] z-50 flex items-center justify-center px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit Sale" : "Add Sale"}</h2>

            HEADER INPUTS
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="font-medium">Date</label>
                <input type="date" name="date" className="customInput" value={form.date} onChange={onHeader} />
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
                <label className="font-medium">Payment Mode</label>
                <select name="paymentMode" className="customSelect" value={form.paymentMode} onChange={onHeader}>
                  <option>Cash</option>
                  <option>Bank</option>
                  <option>UPI</option>
                </select>
              </div>
            </div>

            {/* ITEM ENTRY */}
            <div className="border rounded p-3">
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <label className="font-medium">Item</label>
                  <input className="customInput" name="item" value={item.item} onChange={onItem} />
                </div>

                <div className="col-span-2">
                  <label className="font-medium">Qty</label>
                  <input className="customInput" type="number" name="qty" value={item.qty} onChange={onItem} />
                </div>

                <div className="col-span-2">
                  <label className="font-medium">Rate</label>
                  <input className="customInput" type="number" name="rate" value={item.rate} onChange={onItem} />
                </div>

                <div className="col-span-1">
                  <label className="font-medium">Tax %</label>
                  <input className="customInput" type="number" name="tax" value={item.tax} onChange={onItem} />
                </div>

                <div className="col-span-1">
                  <label className="font-medium">Disc</label>
                  <input className="customInput" type="number" name="discount" value={item.discount} onChange={onItem} />
                </div>

                <div className="col-span-1 flex justify-end">
                  <button className="customBtn" onClick={addItem}>Add</button>
                </div>
              </div>

              {/* ITEM TABLE */}
              {form.items.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-2 py-1">Item</th>
                        <th className="border px-2 py-1">Qty</th>
                        <th className="border px-2 py-1">Rate</th>
                        <th className="border px-2 py-1">Tax%</th>
                        <th className="border px-2 py-1">Disc</th>
                        <th className="border px-2 py-1">Amount</th>
                        <th className="border px-2 py-1">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {form.items.map(it => {
                        const base = it.qty * it.rate - (it.discount || 0);
                        const amt = base + base * (it.tax || 0) / 100;

                        return (
                          <tr key={it.id}>
                            <td className="border px-2 py-1">{it.item}</td>
                            <td className="border px-2 py-1 text-right">{it.qty}</td>
                            <td className="border px-2 py-1 text-right">{it.rate}</td>
                            <td className="border px-2 py-1 text-right">{it.tax}</td>
                            <td className="border px-2 py-1 text-right">{it.discount}</td>
                            <td className="border px-2 py-1 text-right">{amt.toFixed(2)}</td>
                            <td className="border px-2 py-1 text-center">
                              <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => removeItem(it.id)}>Remove</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* NET TOTAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="md:col-span-3">
                <label className="font-medium">Net Total</label>
                <input className="customInput" readOnly value={form.netTotal.toFixed(2)} />
              </div>
            </div>

            {/* FORM ACTION BUTTONS */}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => handleSave(false)}>
                {editing ? "Update" : "Save"}
              </button>
              <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => handleSave(true)}>
                Print
              </button>
            </div>

            <button onClick={() => setShowForm(false)} className="absolute top-5 right-5 text-2xl text-gray-500">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleEntry;
