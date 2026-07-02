import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Tax {
  id: number;
  taxId: string; // TAX-001 (auto)
  taxName: string;
  taxPercent: number;
  description: string;
  effectiveDate: string;
  status: "Active" | "Inactive";
}

const TaxMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);

  const [taxes, setTaxes] = useState<Tax[]>([
    {
      id: 1,
      taxId: "TAX-001",
      taxName: "GST 18%",
      taxPercent: 18,
      description: "Standard GST rate",
      effectiveDate: "2025-11-06",
      status: "Active",
    },
  ]);

  const [form, setForm] = useState<Omit<Tax, "id" | "taxId">>({
    taxName: "",
    taxPercent: 0,
    description: "",
    effectiveDate: "",
    status: "Active",
  });

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "taxPercent" ? Number(value) : value }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      taxName: "",
      taxPercent: 0,
      description: "",
      effectiveDate: "",
      status: "Active",
    });
    setShowForm(true);
  };

  const openEdit = (row: Tax) => {
    setEditing(row);
    setForm({
      taxName: row.taxName,
      taxPercent: row.taxPercent,
      description: row.description,
      effectiveDate: row.effectiveDate,
      status: row.status,
    });
    setShowForm(true);
  };

  const handleDelete = (row: Tax) => {
    Swal.fire({
      title: "Delete?",
      text: `Delete tax "${row.taxName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((res) => {
      if (res.isConfirmed) {
        setTaxes((arr) => arr.filter((x) => x.id !== row.id));
        Swal.fire("Deleted!", "Tax removed.", "success");
      }
    });
  };

  const handleSave = () => {
    if (!form.taxName) {
      Swal.fire("Required", "Tax Name is required.", "warning");
      return;
    }

    if (editing) {
      setTaxes((arr) => arr.map((x) => (x.id === editing.id ? { ...x, ...form } : x)));
      Swal.fire("Updated!", "Tax updated.", "success");
    } else {
      const newId = taxes.length + 1;
      const newRow: Tax = {
        id: newId,
        taxId: `TAX-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setTaxes((arr) => [newRow, ...arr]);
      Swal.fire("Created!", "Tax added.", "success");
    }
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Tax Master"
        data={taxes}
        columns={[
          {
            key: "actions",
            label: "Action",
            render: (row: Tax) => (
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-yellow-500 text-white" onClick={() => openEdit(row)}>
                  Edit
                </button>
                <button className="px-2 py-1 rounded bg-red-500 text-white" onClick={() => handleDelete(row)}>
                  Delete
                </button>
              </div>
            ),
          },
          { key: "taxId", label: "Tax ID" },
          { key: "taxName", label: "Tax Name" },
          { key: "taxPercent", label: "Tax %" },
          { key: "description", label: "Description" },
          { key: "effectiveDate", label: "Effective Date" },
          { key: "status", label: "Status" },
        ]}
        onAdd={openAdd}
        addButtonLabel="Add Tax"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-7">{editing ? "Edit Tax" : "Add Tax"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="font-medium">Tax Name</label>
                <input
                  name="taxName"
                  className="customInput"
                  placeholder="Tax Name (e.g., GST 18%)"
                  value={form.taxName}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Tax %</label>
                <input
                  type="number"
                  name="taxPercent"
                  className="customInput"
                  placeholder="Tax %"
                  value={form.taxPercent}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Effective Date</label>
                <input
                  type="date"
                  name="effectiveDate"
                  className="customInput"
                  value={form.effectiveDate}
                  onChange={handleInput}
                />
              </div>

              <div className="md:col-span-3">
                <label className="font-medium">Description</label>
                <textarea
                  name="description"
                  className="customInput"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleInput}
                />
              </div>

              <div>
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

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxMaster;
