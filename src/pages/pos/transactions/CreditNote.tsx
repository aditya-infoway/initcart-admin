import { useState } from "react";
import DataTable from "../../../components/common/DataTable";
import Swal from "sweetalert2";

type NoteStatus = "Open" | "Closed";
type NoteType = "Purchase" | "Sale" | "Adjustment";

interface NoteRow {
  id: number;
  noteId: string; // CN-001 auto
  refInvoice: string;
  date: string;
  type: NoteType;
  amount: number;
  reason: string;
  status: NoteStatus;
}

export const CreditNote = () => {
  const [rows, setRows] = useState<NoteRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NoteRow | null>(null);

  const [form, setForm] = useState<Omit<NoteRow, "id" | "noteId">>({
    refInvoice: "",
    date: "",
    type: "Purchase",
    amount: 0,
    reason: "",
    status: "Open",
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
      refInvoice: "",
      date: "",
      type: "Purchase",
      amount: 0,
      reason: "",
      status: "Open",
    });
    setShowForm(true);
  };

  const openEdit = (r: NoteRow) => {
    setEditing(r);
    setForm({
      refInvoice: r.refInvoice,
      date: r.date,
      type: r.type,
      amount: r.amount,
      reason: r.reason,
      status: r.status,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.refInvoice || !form.date || !form.amount)
      return Swal.fire(
        "Required",
        "Ref Invoice, Date and Amount are required.",
        "warning"
      );

    if (editing) {
      setRows((list) =>
        list.map((x) => (x.id === editing.id ? { ...x, ...form } : x))
      );
      Swal.fire("Updated!", "Credit Note updated.", "success");
    } else {
      const next = rows.length + 1;
      setRows((list) => [
        { id: next, noteId: `CN-${String(next).padStart(3, "0")}`, ...form },
        ...list,
      ]);
      Swal.fire("Added!", "Credit Note created.", "success");
    }

    setShowForm(false);
  };

  return (
    <div className="p-4">

      <DataTable
        title="Credit Note"
        data={rows}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (r: NoteRow) => (
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => openEdit(r)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => setRows((list) => list.filter((x) => x.id !== r.id))}
                >
                  Delete
                </button>
              </div>
            ),
          },
          { key: "noteId", label: "Note ID" },
          { key: "refInvoice", label: "Ref Invoice" },
          { key: "date", label: "Date" },
          { key: "type", label: "Type" },
          { key: "amount", label: "Amount" },
          { key: "status", label: "Status" },
        ]}
        onAdd={openAdd}
        addButtonLabel="Add Credit Note"
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#0000007d] z-50 flex items-center justify-center px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit Credit Note" : "Add Credit Note"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="flex flex-col">
                <label className="font-medium mb-1">Reference Invoice</label>
                <input
                  name="refInvoice"
                  className="customInput"
                  placeholder="Ref Invoice (e.g., PUR-001 / SLS-001)"
                  value={form.refInvoice}
                  onChange={onChange}
                />
              </div>

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
                <label className="font-medium mb-1">Note Type</label>
                <select
                  name="type"
                  className="customSelect"
                  value={form.type}
                  onChange={onChange}
                >
                  <option>Purchase</option>
                  <option>Sale</option>
                  <option>Adjustment</option>
                </select>
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
                <label className="font-medium mb-1">Status</label>
                <select
                  name="status"
                  className="customSelect"
                  value={form.status}
                  onChange={onChange}
                >
                  <option>Open</option>
                  <option>Closed</option>
                </select>
              </div>

              <div className="flex flex-col md:col-span-3">
                <label className="font-medium mb-1">Reason</label>
                <textarea
                  name="reason"
                  className="customInput"
                  placeholder="Reason"
                  value={form.reason}
                  onChange={onChange}
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
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
