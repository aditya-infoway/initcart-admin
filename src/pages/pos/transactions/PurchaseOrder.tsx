import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface OrderItem {
  id: string;
  item: string;
  qty: number;
  rate: number;
}

interface PurchaseOrder {
  id: number;
  orderId: string; // PO-001 auto
  supplier: string;
  requiredByDate: string;
  items: OrderItem[];
  shippingAddress: string;
  status: "Pending" | "Sent";
}

const PurchaseOrder = () => {
  const [rows, setRows] = useState<PurchaseOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);

  const [form, setForm] = useState<Omit<PurchaseOrder, "id" | "orderId">>({
    supplier: "",
    requiredByDate: "",
    items: [],
    shippingAddress: "",
    status: "Pending",
  });

  const [currentItem, setCurrentItem] = useState<OrderItem>({
    id: crypto.randomUUID(),
    item: "",
    qty: 1,
    rate: 0,
  });

  const handleHeaderInput = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleItemInput = (e: any) => {
    const { name, value } = e.target;
    setCurrentItem((ci) => ({
      ...ci,
      [name]: name === "qty" || name === "rate" ? Number(value) : value,
    }));
  };

  const addItem = () => {
    if (!currentItem.item) {
      Swal.fire("Required", "Please enter/select item.", "warning");
      return;
    }
    setForm((f) => ({ ...f, items: [...f.items, currentItem] }));
    setCurrentItem({ id: crypto.randomUUID(), item: "", qty: 1, rate: 0 });
  };

  const removeItem = (id: string) => {
    setForm((f) => ({ ...f, items: f.items.filter((it) => it.id !== id) }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      supplier: "",
      requiredByDate: "",
      items: [],
      shippingAddress: "",
      status: "Pending",
    });
    setShowForm(true);
  };

  const openEdit = (row: PurchaseOrder) => {
    setEditing(row);
    setForm({
      supplier: row.supplier,
      requiredByDate: row.requiredByDate,
      items: row.items,
      shippingAddress: row.shippingAddress,
      status: row.status,
    });
    setShowForm(true);
  };

  const handleSave = (action?: "send") => {
    if (!form.supplier || !form.requiredByDate || form.items.length === 0) {
      Swal.fire("Required", "Supplier, Date, and Items are required", "warning");
      return;
    }

    if (editing) {
      setRows((arr) => arr.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
      Swal.fire("Updated", "Order updated", "success");
    } else {
      const newId = rows.length + 1;
      const newRow: PurchaseOrder = {
        id: newId,
        orderId: `PO-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setRows((arr) => [newRow, ...arr]);
      Swal.fire("Created", "Order created", "success");
    }

    if (action === "send") Swal.fire("Sent", "Order sent to supplier", "success");

    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Purchase Order"
        data={rows}
        addButtonLabel="Create Purchase Order"
        onAdd={openAdd}
        columns={[
          // ✅ ACTION COLUMN FIRST
          {
            key: "action",
            label: "Action",
            render: (row: PurchaseOrder) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(row)}
                  className="px-2 py-1 rounded bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSave("send")}
                  className="px-2 py-1 rounded bg-blue-600 text-white"
                >
                  Send
                </button>
              </div>
            ),
          },

          { key: "orderId", label: "Order ID" },
          { key: "supplier", label: "Supplier" },
          { key: "requiredByDate", label: "Required By" },
          { key: "status", label: "Status" },
        ]}
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#0000007d] flex justify-center items-center px-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">

            <h2 className="text-xl font-bold mb-6">
              {editing ? "Edit Purchase Order" : "Create Purchase Order"}
            </h2>

            {/* FORM SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-medium">Supplier</label>
                <select
                  name="supplier"
                  className="customSelect"
                  value={form.supplier}
                  onChange={handleHeaderInput}
                >
                  <option value="">Select Supplier</option>
                  <option>Ramesh Traders</option>
                  <option>Patel Distributors</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Required By Date</label>
                <input
                  type="date"
                  name="requiredByDate"
                  className="customInput"
                  value={form.requiredByDate}
                  onChange={handleHeaderInput}
                />
              </div>

              <div>
                <label className="font-medium">Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  className="customInput"
                  value={form.shippingAddress}
                  onChange={handleHeaderInput}
                />
              </div>
            </div>

            {/* ADD ITEMS */}
            <div className="border rounded p-3 my-4">
              <h3 className="font-semibold mb-3">Add Items</h3>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <label className="font-medium">Item</label>
                  <input
                    className="customInput"
                    name="item"
                    value={currentItem.item}
                    onChange={handleItemInput}
                  />
                </div>

                <div className="col-span-3">
                  <label className="font-medium">Qty</label>
                  <input
                    className="customInput"
                    type="number"
                    name="qty"
                    value={currentItem.qty}
                    onChange={handleItemInput}
                  />
                </div>

                <div className="col-span-3">
                  <label className="font-medium">Rate</label>
                  <input
                    className="customInput"
                    type="number"
                    name="rate"
                    value={currentItem.rate}
                    onChange={handleItemInput}
                  />
                </div>
              </div>

              <button className="customBtn mt-3" onClick={addItem}>
                + Add Item
              </button>

              {form.items.length > 0 && (
                <table className="w-full text-sm border mt-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Item</th>
                      <th className="border px-2 py-1">Qty</th>
                      <th className="border px-2 py-1">Rate</th>
                      <th className="border px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((it) => (
                      <tr key={it.id}>
                        <td className="border px-2 py-1">{it.item}</td>
                        <td className="border px-2 py-1 text-right">{it.qty}</td>
                        <td className="border px-2 py-1 text-right">{it.rate}</td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => removeItem(it.id)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => handleSave()}>
                Save
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => handleSave("send")}>
                Send Order
              </button>
            </div>

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-5 text-2xl text-gray-500"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
