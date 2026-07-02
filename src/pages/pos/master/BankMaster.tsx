import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Bank {
  id: number;
  bankId: string; // BNK-001 (auto)
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string;
  accountType: string;
  status: "Active" | "Inactive";
}

const BankMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bank | null>(null);

  const [banks, setBanks] = useState<Bank[]>([
    {
      id: 1,
      bankId: "BNK-001",
      bankName: "SBI Bank",
      accountNo: "123456789",
      ifscCode: "SBIN0001554",
      branchName: "CG Road",
      accountType: "Current Account",
      status: "Active",
    },
  ]);

  const [form, setForm] = useState<Omit<Bank, "id" | "bankId">>({
    bankName: "",
    accountNo: "",
    ifscCode: "",
    branchName: "",
    accountType: "",
    status: "Active",
  });

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      bankName: "",
      accountNo: "",
      ifscCode: "",
      branchName: "",
      accountType: "",
      status: "Active",
    });
    setShowForm(true);
  };

  const openEdit = (row: Bank) => {
    setEditing(row);
    setForm({
      bankName: row.bankName,
      accountNo: row.accountNo,
      ifscCode: row.ifscCode,
      branchName: row.branchName,
      accountType: row.accountType,
      status: row.status,
    });
    setShowForm(true);
  };

  const handleDelete = (row: Bank) => {
    Swal.fire({
      title: "Delete?",
      text: `Delete bank "${row.bankName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((res) => {
      if (res.isConfirmed) {
        setBanks((arr) => arr.filter((x) => x.id !== row.id));
        Swal.fire("Deleted!", "Bank removed.", "success");
      }
    });
  };

  const handleSave = () => {
    if (!form.bankName || !form.accountNo) {
      Swal.fire("Required", "Bank Name & Account No are required.", "warning");
      return;
    }

    if (editing) {
      setBanks((arr) => arr.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
      Swal.fire("Updated!", "Bank updated.", "success");
    } else {
      const newId = banks.length + 1;
      const newRow: Bank = {
        id: newId,
        bankId: `BNK-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setBanks((arr) => [newRow, ...arr]);
      Swal.fire("Created!", "Bank added.", "success");
    }
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Bank Master"
        data={banks}
        columns={[
          {
            key: "actions",
            label: "Action",
            render: (row: Bank) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-yellow-500 text-white" onClick={() => openEdit(row)}>Edit</button>
                <button className="px-2 py-1 rounded bg-red-500 text-white" onClick={() => handleDelete(row)}>Delete</button>
              </div>
            ),
          },
          { key: "bankId", label: "Bank ID" },
          { key: "bankName", label: "Bank Name" },
          { key: "accountNo", label: "Account No" },
          { key: "ifscCode", label: "IFSC Code" },
          { key: "branchName", label: "Branch Name" },
          { key: "accountType", label: "Account Type" },
          { key: "status", label: "Status" },
        ]}
        onAdd={openAdd}
        addButtonLabel="Add Bank"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-7">{editing ? "Edit Bank" : "Add Bank"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="font-medium">Bank Name</label>
                <input name="bankName" className="customInput" placeholder="Bank Name" value={form.bankName} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Account No</label>
                <input name="accountNo" className="customInput" placeholder="Account No" value={form.accountNo} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">IFSC Code</label>
                <input name="ifscCode" className="customInput" placeholder="IFSC Code" value={form.ifscCode} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Branch Name</label>
                <input name="branchName" className="customInput" placeholder="Branch Name" value={form.branchName} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Account Type</label>
                <select name="accountType" className="customSelect" value={form.accountType} onChange={handleInput}>
                  <option value="">Select Account Type</option>
                  <option>Current Account</option>
                  <option>Savings Account</option>
                  <option>Cash Credit</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Status</label>
                <select name="status" className="customSelect" value={form.status} onChange={handleInput}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 mt-3">
                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
                  {editing ? "Update" : "Save"}
                </button>
              </div>
            </div>

            <button onClick={() => setShowForm(false)} className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankMaster;
