import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface ReturnItem {
  id: string;
  item: string;
  qty: number;
  reason: string;
  amount: number; // computed
}

interface PurchaseReturn {
  id: number;
  returnId: string;   // PR-001 auto
  purchaseRef: string;
  supplier: string;
  date: string;
  items: ReturnItem[];
  refundAmount: number;
  status: "Pending" | "Completed";
}

const PurchaseReturn = () => {
  const [rows, setRows] = useState<PurchaseReturn[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PurchaseReturn | null>(null);

  const [form, setForm] = useState<Omit<PurchaseReturn, "id" | "returnId">>({
    purchaseRef: "",
    supplier: "",
    date: "",
    items: [],
    refundAmount: 0,
    status: "Pending",
  });

  const [currentItem, setCurrentItem] = useState<ReturnItem>({
    id: crypto.randomUUID(),
    item: "",
    qty: 1,
    reason: "",
    amount: 0,
  });

  const handleHeaderInput = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleItemInput = (e: any) => {
    const { name, value } = e.target;
    setCurrentItem((ci) => ({
      ...ci,
      [name]: name === "qty" ? Number(value) : value,
    }));
  };

  const addItem = () => {
    if (!currentItem.item) {
      Swal.fire("Required", "Please enter item name", "warning");
      return;
    }

    const newItems = [...form.items, currentItem];
    const refundAmount = newItems.reduce((sum, it) => sum + it.qty * 1, 0); // amount = qty * 1 (dummy, modify if needed)
    setForm((f) => ({ ...f, items: newItems, refundAmount }));

    setCurrentItem({
      id: crypto.randomUUID(),
      item: "",
      qty: 1,
      reason: "",
      amount: 0,
    });
  };

  const removeItem = (id: string) => {
    const newItems = form.items.filter((it) => it.id !== id);
    const refundAmount = newItems.reduce((sum, it) => sum + it.qty * 1, 0);
    setForm((f) => ({ ...f, items: newItems, refundAmount }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      purchaseRef: "",
      supplier: "",
      date: "",
      items: [],
      refundAmount: 0,
      status: "Pending",
    });
    setShowForm(true);
  };

  const openEdit = (row: PurchaseReturn) => {
    setEditing(row);
    setForm({
      purchaseRef: row.purchaseRef,
      supplier: row.supplier,
      date: row.date,
      items: row.items,
      refundAmount: row.refundAmount,
      status: row.status,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.purchaseRef || !form.supplier || form.items.length === 0) {
      Swal.fire("Required", "Purchase Ref, Supplier & Items required", "warning");
      return;
    }

    if (editing) {
      setRows((arr) =>
        arr.map((x) =>
          x.id === editing.id ? { ...x, ...form } : x
        )
      );
      Swal.fire("Updated", "Purchase Return updated.", "success");
    } else {
      const newId = rows.length + 1;
      const newRow: PurchaseReturn = {
        id: newId,
        returnId: `PR-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setRows((arr) => [newRow, ...arr]);
      Swal.fire("Created", "Purchase Return created.", "success");
    }

    setShowForm(false);
  };

  const handleDelete = (row: PurchaseReturn) => {
    Swal.fire({
      title: "Delete?",
      text: `Delete return request "${row.returnId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((res) => {
      if (res.isConfirmed) {
        setRows((arr) => arr.filter((x) => x.id !== row.id));
        Swal.fire("Deleted!", "Purchase return removed.", "success");
      }
    });
  };

  return (
    <div className="p-4">
      <DataTable
        title="Purchase Return"
        data={rows}
        addButtonLabel="Create Purchase Return"
        onAdd={openAdd}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (row: PurchaseReturn) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-yellow-500 text-white" onClick={() => openEdit(row)}>Edit</button>
                <button className="px-2 py-1 rounded bg-red-500 text-white" onClick={() => handleDelete(row)}>Delete</button>
              </div>
            ),
          },
          { key: "returnId", label: "Return ID" },
          { key: "purchaseRef", label: "Purchase Ref" },
          { key: "supplier", label: "Supplier" },
          { key: "date", label: "Date" },
          { key: "refundAmount", label: "Refund Amount" },
          { key: "status", label: "Status" },
        ]}
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#00000070] flex justify-center items-center px-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-6">{editing ? "Edit Purchase Return" : "Create Purchase Return"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-medium">Purchase Ref</label>
                <input name="purchaseRef" className="customInput" value={form.purchaseRef} onChange={handleHeaderInput} />
              </div>

              <div>
                <label className="font-medium">Supplier</label>
                <input name="supplier" className="customInput" value={form.supplier} onChange={handleHeaderInput} />
              </div>

              <div>
                <label className="font-medium">Date</label>
                <input type="date" name="date" className="customInput" value={form.date} onChange={handleHeaderInput} />
              </div>
            </div>

            <div className="border rounded p-3 my-4">
              <h3 className="font-semibold mb-2">Add Returned Items</h3>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <label className="font-medium">Item</label>
                  <input className="customInput" name="item" value={currentItem.item} onChange={handleItemInput} />
                </div>

                <div className="col-span-2">
                  <label className="font-medium">Qty</label>
                  <input type="number" className="customInput" name="qty" value={currentItem.qty} onChange={handleItemInput} />
                </div>

                <div className="col-span-4">
                  <label className="font-medium">Reason</label>
                  <input className="customInput" name="reason" value={currentItem.reason} onChange={handleItemInput} />
                </div>
              </div>

              <button className="customBtn mt-3" onClick={addItem}>+ Add Item</button>

              {form.items.length > 0 && (
                <table className="w-full text-sm border mt-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Item</th>
                      <th className="border px-2 py-1">Qty</th>
                      <th className="border px-2 py-1">Reason</th>
                      <th className="border px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((it) => (
                      <tr key={it.id}>
                        <td className="border px-2 py-1">{it.item}</td>
                        <td className="border px-2 py-1">{it.qty}</td>
                        <td className="border px-2 py-1">{it.reason}</td>
                        <td className="border px-2 py-1 text-center">
                          <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => removeItem(it.id)}>X</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-3">
              <label className="font-medium">Refund Amount</label>
              <input className="customInput" readOnly value={form.refundAmount} />
            </div>

            <select name="status" className="customSelect mt-4" value={form.status} onChange={handleHeaderInput}>
              <option>Pending</option>
              <option>Completed</option>
            </select>

            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
                {editing ? "Update" : "Save"}
              </button>
            </div>

            <button onClick={() => setShowForm(false)} className="absolute top-5 right-5 text-gray-600 text-2xl">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturn;
