import { useState } from "react";
import DataTable from "../../../components/common/DataTable";
import Swal from "sweetalert2";

type Mode = "Cash" | "Bank" | "UPI";
interface QuickTxn {
  id: number;
  refId: string; // QP-001 / QR-001
  date: string;
  accountFrom: string;
  accountTo: string;
  amount: number;
  mode: Mode;
  reference: string;
  notes: string;
}

export const QuickReceipt = () => {
  const [rows, setRows] = useState<QuickTxn[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<QuickTxn | null>(null);
  const [form, setForm] = useState<Omit<QuickTxn, "id" | "refId">>({
    date: "",
    accountFrom: "",
    accountTo: "",
    amount: 0,
    mode: "Cash",
    reference: "",
    notes: "",
  });

  const onChange = (e: any) =>
    setForm((f) => ({
      ...f,
      [e.target.name]:
        e.target.name === "amount" ? Number(e.target.value) : e.target.value,
    }));
  const openAdd = () => {
    setEditing(null);
    setForm({
      date: "",
      accountFrom: "",
      accountTo: "",
      amount: 0,
      mode: "Cash",
      reference: "",
      notes: "",
    });
    setShowForm(true);
  };
  const openEdit = (r: QuickTxn) => {
    setEditing(r);
    setForm({
      date: r.date,
      accountFrom: r.accountFrom,
      accountTo: r.accountTo,
      amount: r.amount,
      mode: r.mode,
      reference: r.reference,
      notes: r.notes,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.date || !form.accountFrom || !form.accountTo || !form.amount)
      return Swal.fire(
        "Required",
        "All fields except notes are mandatory.",
        "warning"
      );
    if (editing)
      setRows((list) =>
        list.map((x) => (x.id === editing.id ? { ...x, ...form } : x))
      );
    else {
      const next = rows.length + 1;
      setRows((list) => [
        { id: next, refId: `QR-${String(next).padStart(3, "0")}`, ...form },
        ...list,
      ]);
    }
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Quick Receipt"
        data={rows}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (r: QuickTxn) => (
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => openEdit(r)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() =>
                    setRows((list) => list.filter((x) => x.id !== r.id))
                  }
                >
                  Delete
                </button>
              </div>
            ),
          },
          { key: "refId", label: "ID" },
          { key: "date", label: "Date" },
          { key: "accountFrom", label: "Account From" },
          { key: "accountTo", label: "Account To" },
          { key: "amount", label: "Amount" },
          { key: "mode", label: "Mode" },
          { key: "reference", label: "Reference" },
          
        ]}
        onAdd={openAdd}
        addButtonLabel="Add Receipt"
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#0000007d] z-50 flex items-center justify-center px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit Receipt" : "Add Receipt"}
            </h2>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

  <div className="flex flex-col">
    <label className="font-medium mb-1">Date</label>
    <input
      type="date"
      name="date"
      className="customInput"
      value={form.date}
      onChange={onChange}
    />
  </div>

  <div className="flex flex-col">
    <label className="font-medium mb-1">Account From</label>
    <input
      name="accountFrom"
      className="customInput"
      placeholder="Account From"
      value={form.accountFrom}
      onChange={onChange}
    />
  </div>

  <div className="flex flex-col">
    <label className="font-medium mb-1">Account To</label>
    <input
      name="accountTo"
      className="customInput"
      placeholder="Account To"
      value={form.accountTo}
      onChange={onChange}
    />
  </div>

  <div className="flex flex-col">
    <label className="font-medium mb-1">Amount</label>
    <input
      type="number"
      name="amount"
      className="customInput"
      placeholder="Amount"
      value={form.amount}
      onChange={onChange}
    />
  </div>

  <div className="flex flex-col">
    <label className="font-medium mb-1">Mode</label>
    <select
      name="mode"
      className="customSelect"
      value={form.mode}
      onChange={onChange}
    >
      <option>Cash</option>
      <option>Bank</option>
      <option>UPI</option>
    </select>
  </div>

  <div className="flex flex-col">
    <label className="font-medium mb-1">Reference</label>
    <input
      name="reference"
      className="customInput"
      placeholder="Reference"
      value={form.reference}
      onChange={onChange}
    />
  </div>

  <div className="flex flex-col md:col-span-3">
    <label className="font-medium mb-1">Notes</label>
    <textarea
      name="notes"
      className="customInput"
      placeholder="Notes"
      value={form.notes}
      onChange={onChange}
    />
  </div>

</div>


            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={handleSave}
              >
                {editing ? "Update" : "Save"}
              </button>
            </div>

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 text-2xl text-gray-500"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
