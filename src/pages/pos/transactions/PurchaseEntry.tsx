import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

type PaymentTerms = "Cash" | "Credit";
type PaymentStatus = "Pending" | "Paid";

interface PurchaseItem {
  id: string;
  item: string;
  qty: number;
  rate: number;
  discount: number;
  tax: number;
  total: number;
}

interface Purchase {
  id: number;
  purchaseId: string;
  invoiceNumber: string;
  date: string;
  supplier: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTax: number;
  freight: number;
  otherCharges: number;
  grandTotal: number;
  paymentTerms: PaymentTerms;
  paymentStatus: PaymentStatus;
  notes: string;
  attachment?: string;
}

const PurchaseEntry = () => {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);

  const [form, setForm] = useState<Omit<Purchase, "id" | "purchaseId">>({
    invoiceNumber: "",
    date: "",
    supplier: "",
    items: [],
    subtotal: 0,
    totalTax: 0,
    freight: 0,
    otherCharges: 0,
    grandTotal: 0,
    paymentTerms: "Cash",
    paymentStatus: "Pending",
    notes: "",
    attachment: "",
  });

  const [currentItem, setCurrentItem] = useState<PurchaseItem>({
    id: crypto.randomUUID(),
    item: "",
    qty: 1,
    rate: 0,
    discount: 0,
    tax: 0,
    total: 0,
  });

  const recomputeTotals = (items: PurchaseItem[], freight: number, other: number) => {
    const subtotal = items.reduce((s, it) => s + (it.qty * it.rate - it.discount), 0);
    const totalTax = items.reduce((s, it) => {
      const base = it.qty * it.rate - it.discount;
      return s + (base * it.tax) / 100;
    }, 0);
    const grandTotal = subtotal + totalTax + (Number(freight) || 0) + (Number(other) || 0);
    return { subtotal, totalTax, grandTotal };
  };

  const handleHeaderInput = (e: any) => {
    const { name, value } = e.target;
    const v = ["freight", "otherCharges"].includes(name) ? Number(value) : value;
    const { subtotal, totalTax, grandTotal } = recomputeTotals(
      form.items,
      name === "freight" ? Number(value) : form.freight,
      name === "otherCharges" ? Number(value) : form.otherCharges
    );
    setForm((f) => ({ ...f, [name]: v, subtotal, totalTax, grandTotal }));
  };

  const handleItemInput = (e: any) => {
    const { name, value } = e.target;
    const v = ["qty", "rate", "discount", "tax"].includes(name) ? Number(value) : value;
    setCurrentItem((ci) => {
      const next = { ...ci, [name]: v } as PurchaseItem;
      const base = next.qty * next.rate - (next.discount || 0);
      const taxAmount = (base * (next.tax || 0)) / 100;
      next.total = Number((base + taxAmount).toFixed(2));
      return next;
    });
  };

  const addItem = () => {
    if (!currentItem.item) {
      Swal.fire("Item Required", "Please enter an item name.", "warning");
      return;
    }
    const newItems = [...form.items, currentItem];
    const { subtotal, totalTax, grandTotal } = recomputeTotals(newItems, form.freight, form.otherCharges);
    setForm((f) => ({ ...f, items: newItems, subtotal, totalTax, grandTotal }));
    setCurrentItem({
      id: crypto.randomUUID(),
      item: "",
      qty: 1,
      rate: 0,
      discount: 0,
      tax: 0,
      total: 0,
    });
  };

  const removeItem = (id: string) => {
    const newItems = form.items.filter((i) => i.id !== id);
    const { subtotal, totalTax, grandTotal } = recomputeTotals(newItems, form.freight, form.otherCharges);
    setForm((f) => ({ ...f, items: newItems, subtotal, totalTax, grandTotal }));
  };

  const handleAttachment = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, attachment: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      invoiceNumber: "",
      date: "",
      supplier: "",
      items: [],
      subtotal: 0,
      totalTax: 0,
      freight: 0,
      otherCharges: 0,
      grandTotal: 0,
      paymentTerms: "Cash",
      paymentStatus: "Pending",
      notes: "",
      attachment: "",
    });
    setShowForm(true);
  };

  const openEdit = (row: Purchase) => {
    setEditing(row);
    setForm({ ...row });
    setShowForm(true);
  };

  const handleDelete = (row: Purchase) => {
    Swal.fire({
      title: "Delete?",
      text: `Delete purchase ${row.purchaseId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((res) => {
      if (res.isConfirmed) {
        setRows((r) => r.filter((x) => x.id !== row.id));
        Swal.fire("Deleted!", "Purchase removed.", "success");
      }
    });
  };

  const handleSave = (action?: "print" | "export") => {
    if (!form.invoiceNumber || !form.date || !form.supplier || form.items.length === 0) {
      Swal.fire("Required", "Invoice No, Date, Supplier & Item list required.", "warning");
      return;
    }

    if (editing) {
      setRows((arr) => arr.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
      Swal.fire("Updated", "Purchase updated.", "success");
    } else {
      const newId = rows.length + 1;
      const newRow: Purchase = {
        id: newId,
        purchaseId: `PUR-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setRows((arr) => [newRow, ...arr]);
      Swal.fire("Saved!", "Purchase saved.", "success");
    }

    if (action === "print") window.print();
    if (action === "export") Swal.fire("Exported!", "Export started.", "success");

    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Purchase Entry"
        data={rows}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (row: Purchase) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-yellow-500 rounded text-white" onClick={() => openEdit(row)}>
                  Edit
                </button>
                <button className="px-2 py-1 bg-red-500 rounded text-white" onClick={() => handleDelete(row)}>
                  Delete
                </button>
              </div>
            ),
          },
          { key: "purchaseId", label: "Purchase ID" },
          { key: "invoiceNumber", label: "Invoice No" },
          { key: "date", label: "Date" },
          { key: "supplier", label: "Supplier" },
          { key: "grandTotal", label: "Grand Total" },
          { key: "paymentStatus", label: "Payment Status" },
        ]}
        onAdd={openAdd}
        addButtonLabel="Add Purchase"
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#0000007d] flex justify-center items-center z-50 px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-6">{editing ? "Edit Purchase" : "Add Purchase"}</h2>

            {/* Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="font-medium">Invoice Number</label>
                <input name="invoiceNumber" className="customInput" value={form.invoiceNumber} onChange={handleHeaderInput} />
              </div>
              <div>
                <label className="font-medium">Invoice Date</label>
                <input type="date" name="date" className="customInput" value={form.date} onChange={handleHeaderInput} />
              </div>
              <div>
                <label className="font-medium">Supplier</label>
                <select name="supplier" className="customSelect" value={form.supplier} onChange={handleHeaderInput}>
                  <option value="">Select Supplier</option>
                  <option>Ramesh Traders</option>
                  <option>Patel Distributors</option>
                </select>
              </div>
            </div>

            {/* Item List */}
            <div className="border rounded p-3 mb-4">
              <label className="font-medium mb-2 block">Add Item</label>

              <div className="grid grid-cols-12 gap-2 mb-2">
                <input className="customInput col-span-3" name="item" placeholder="Item" value={currentItem.item} onChange={handleItemInput} />
                <input className="customInput col-span-2" type="number" name="qty" placeholder="Qty" value={currentItem.qty} onChange={handleItemInput} />
                <input className="customInput col-span-2" type="number" name="rate" placeholder="Rate" value={currentItem.rate} onChange={handleItemInput} />
                <input className="customInput col-span-1" type="number" name="discount" placeholder="Disc" value={currentItem.discount} onChange={handleItemInput} />
                <input className="customInput col-span-1" type="number" name="tax" placeholder="Tax %" value={currentItem.tax} onChange={handleItemInput} />
                <input className="customInput col-span-2" readOnly placeholder="Total" value={currentItem.total} />
              </div>

              <button className="customBtn" onClick={addItem}>Add Item</button>

              {form.items.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-1 border">Item</th>
                        <th className="px-2 py-1 border">Qty</th>
                        <th className="px-2 py-1 border">Rate</th>
                        <th className="px-2 py-1 border">Disc</th>
                        <th className="px-2 py-1 border">Tax %</th>
                        <th className="px-2 py-1 border">Line Total</th>
                        <th className="px-2 py-1 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-2 py-1 border">{it.item}</td>
                          <td className="px-2 py-1 border">{it.qty}</td>
                          <td className="px-2 py-1 border">{it.rate}</td>
                          <td className="px-2 py-1 border">{it.discount}</td>
                          <td className="px-2 py-1 border">{it.tax}</td>
                          <td className="px-2 py-1 border">{it.total.toFixed(2)}</td>
                          <td className="px-2 py-1 border text-center">
                            <button className="px-2 py-1 bg-red-500 rounded text-white" onClick={() => removeItem(it.id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div>
                <label className="font-medium">Subtotal</label>
                <input className="customInput" readOnly value={form.subtotal.toFixed(2)} />
              </div>
              <div>
                <label className="font-medium">Total Tax</label>
                <input className="customInput" readOnly value={form.totalTax.toFixed(2)} />
              </div>
              <div>
                <label className="font-medium">Freight</label>
                <input className="customInput" type="number" name="freight" value={form.freight} onChange={handleHeaderInput} />
              </div>
              <div>
                <label className="font-medium">Other Charges</label>
                <input className="customInput" type="number" name="otherCharges" value={form.otherCharges} onChange={handleHeaderInput} />
              </div>
              <div className="md:col-span-4">
                <label className="font-medium">Grand Total</label>
                <input className="customInput" readOnly value={form.grandTotal.toFixed(2)} />
              </div>
            </div>

            {/* Payment info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="font-medium">Payment Terms</label>
                <select name="paymentTerms" className="customSelect" value={form.paymentTerms} onChange={handleHeaderInput}>
                  <option>Cash</option>
                  <option>Credit</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Payment Status</label>
                <select name="paymentStatus" className="customSelect" value={form.paymentStatus} onChange={handleHeaderInput}>
                  <option>Pending</option>
                  <option>Paid</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Attachment (Invoice)</label>
                <input type="file" className="customInput" onChange={handleAttachment} />
              </div>
            </div>

            <div className="mt-4">
              <label className="font-medium">Notes</label>
              <textarea name="notes" className="customInput" placeholder="Notes (optional)" value={form.notes} onChange={handleHeaderInput} />
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => handleSave()}>Save</button>
              <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => handleSave("print")}>Print</button>
              <button className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={() => handleSave("export")}>Export</button>
            </div>

            <button className="absolute top-5 right-5 text-gray-500 text-2xl" onClick={() => setShowForm(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseEntry;
