import { useState } from "react";
import DataTable from "../../../components/common/DataTable";
import Swal from "sweetalert2";

type TxnType = "Deposit" | "Withdraw" | "Transfer";

interface CashBankTxn {
  id: number;
  transactionId: string;
  date: string;
  bankAccount: string;
  type: TxnType;
  amount: number;
  reference: string;
  notes: string;
}

const CashBankTransactions = () => {
  const [rows, setRows] = useState<CashBankTxn[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CashBankTxn | null>(null);

  const [form, setForm] = useState<Omit<CashBankTxn, "id" | "transactionId">>({
    date: "",
    bankAccount: "",
    type: "Deposit",
    amount: 0,
    reference: "",
    notes: "",
  });

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "amount" ? Number(value) : value }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      date: "",
      bankAccount: "",
      type: "Deposit",
      amount: 0,
      reference: "",
      notes: "",
    });
    setShowForm(true);
  };

  const openEdit = (row: CashBankTxn) => {
    setEditing(row);
    setForm({
      date: row.date,
      bankAccount: row.bankAccount,
      type: row.type,
      amount: row.amount,
      reference: row.reference,
      notes: row.notes,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.date || !form.bankAccount || !form.amount) {
      return Swal.fire("Required", "Date, Bank Account and Amount are required.", "warning");
    }

    if (editing) {
      setRows((list) => list.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
      Swal.fire("Updated!", "Transaction updated successfully", "success");
    } else {
      const next = rows.length + 1;
      setRows((list) => [
        {
          id: next,
          transactionId: `CBT-${String(next).padStart(3, "0")}`,
          ...form,
        },
        ...list,
      ]);
      Swal.fire("Saved!", "Transaction added successfully", "success");
    }
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Cash & Bank Transactions"
        data={rows}
        onAdd={openAdd}
        addButtonLabel="Add Transaction"
        columns={[
          {
            key: "action",
            label: "Action",
            render: (row: CashBankTxn) => (
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => openEdit(row)}
                >
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
          { key: "transactionId", label: "Transaction ID" },
          { key: "date", label: "Date" },
          { key: "bankAccount", label: "Bank Account" },
          { key: "type", label: "Type" },
          { key: "amount", label: "Amount" },
          { key: "reference", label: "Reference" },
          { key: "notes", label: "Notes" },
        ]}
      />

      {showForm && (
        <div className="fixed inset-0 bg-[#00000070] flex justify-center items-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">

            <h2 className="text-xl font-bold mb-6">
              {editing ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="flex flex-col">
                <label className="font-medium mb-1">Date</label>
                <input type="date" name="date" className="customInput" value={form.date} onChange={handleInput} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Bank Account</label>
                <input name="bankAccount" placeholder="357535753578" className="customInput" value={form.bankAccount} onChange={handleInput} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Transaction Type</label>
                <select name="type" className="customSelect" value={form.type} onChange={handleInput}>
                  <option>Deposit</option>
                  <option>Withdraw</option>
                  <option>Transfer</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Amount</label>
                <input type="number" name="amount" className="customInput" value={form.amount} onChange={handleInput} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Reference</label>
                <input name="reference" className="customInput" value={form.reference} onChange={handleInput} />
              </div>

              <div className="flex flex-col md:col-span-3">
                <label className="font-medium mb-1">Notes</label>
                <textarea name="notes" className="customInput" value={form.notes} onChange={handleInput} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-300" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
                {editing ? "Update" : "Save"}
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

export default CashBankTransactions;
