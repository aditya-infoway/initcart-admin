import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Account {
  id: number;
  customerId: string; // ACC-001 (auto)
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNo: string;
  openingBalance: number;
  creditLimit: number;
  status: "Active" | "Inactive";
}

const AccountMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 1,
      customerId: "ACC-001",
      name: "Aayush Traders",
      contactPerson: "Aayush",
      phone: "9876543210",
      email: "aayush@gmail.com",
      address: "Surat, Gujarat",
      gstNo: "24ABCDE1234F1Z9",
      openingBalance: 1000,
      creditLimit: 5000,
      status: "Active",
    },
  ]);

  const [form, setForm] = useState<Omit<Account, "id" | "customerId">>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstNo: "",
    openingBalance: 0,
    creditLimit: 0,
    status: "Active",
  });

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "openingBalance" || name === "creditLimit" ? Number(value) : value,
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      gstNo: "",
      openingBalance: 0,
      creditLimit: 0,
      status: "Active",
    });
    setShowForm(true);
  };

  const openEdit = (row: Account) => {
    setEditing(row);
    setForm({
      name: row.name,
      contactPerson: row.contactPerson,
      phone: row.phone,
      email: row.email,
      address: row.address,
      gstNo: row.gstNo,
      openingBalance: row.openingBalance,
      creditLimit: row.creditLimit,
      status: row.status,
    });
    setShowForm(true);
  };

  const handleDelete = (row: Account) => {
    Swal.fire({
      title: "Delete?",
      text: `Delete customer "${row.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((res) => {
      if (res.isConfirmed) {
        setAccounts((arr) => arr.filter((x) => x.id !== row.id));
        Swal.fire("Deleted!", "Customer removed.", "success");
      }
    });
  };

  const handleSave = () => {
    if (!form.name || !form.phone) {
      Swal.fire("Required", "Name & Phone are required.", "warning");
      return;
    }

    if (editing) {
      setAccounts((arr) =>
        arr.map((x) => (x.id === editing.id ? { ...x, ...form } : x))
      );
      Swal.fire("Updated!", "Customer updated.", "success");
    } else {
      const newId = accounts.length + 1;
      const newRow: Account = {
        id: newId,
        customerId: `ACC-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setAccounts((arr) => [newRow, ...arr]);
      Swal.fire("Created!", "Customer added.", "success");
    }
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Account Master"
        data={accounts}
        columns={[
          {
            key: "actions",
            label: "Action",
            render: (row: Account) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-yellow-500 text-white" onClick={() => openEdit(row)}>Edit</button>
                <button className="px-2 py-1 rounded bg-red-500 text-white" onClick={() => handleDelete(row)}>Delete</button>
              </div>
            ),
          },
          { key: "customerId", label: "Customer ID" },
          { key: "name", label: "Name" },
          { key: "contactPerson", label: "Contact Person" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "address", label: "Address" },
          { key: "gstNo", label: "GST No" },
          { key: "openingBalance", label: "Opening Balance" },
          { key: "creditLimit", label: "Credit Limit" },
          { key: "status", label: "Status" },
        ]}
        onAdd={openAdd}
        addButtonLabel="Add Customer"
      />

      {/* ---------- FORM MODAL ---------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-7">{editing ? "Edit Account" : "Add Account"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="font-medium">Name</label>
                <input name="name" className="customInput" value={form.name} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Contact Person</label>
                <input name="contactPerson" className="customInput" value={form.contactPerson} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Phone</label>
                <input name="phone" className="customInput" value={form.phone} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Email</label>
                <input name="email" className="customInput" value={form.email} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">GST No</label>
                <input name="gstNo" className="customInput" value={form.gstNo} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Opening Balance</label>
                <input type="number" name="openingBalance" className="customInput" value={form.openingBalance} onChange={handleInput} />
              </div>

              <div>
                <label className="font-medium">Credit Limit</label>
                <input type="number" name="creditLimit" className="customInput" value={form.creditLimit} onChange={handleInput} />
              </div>

              <div className="md:col-span-3">
                <label className="font-medium">Address</label>
                <textarea name="address" className="customInput" value={form.address} onChange={handleInput} />
              </div>

              <div className="md:col-span-3">
                <label className="font-medium">Status</label>
                <select name="status" className="customSelect" value={form.status} onChange={handleInput}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
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

export default AccountMaster;
