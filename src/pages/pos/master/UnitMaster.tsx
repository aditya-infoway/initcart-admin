import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface UnitMaster {
  id: number;
  unitId: string; // Auto generate UNIT-001
  unitName: string;
  shortCode: string;
  conversionFactor: number;
  status: "Active" | "Inactive";
}

const UnitMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitMaster | null>(null);

  const [units, setUnits] = useState<UnitMaster[]>([
    {
      id: 1,
      unitId: "UNIT-001",
      unitName: "Kilogram",
      shortCode: "KG",
      conversionFactor: 1,
      status: "Active",
    },
  ]);

  const [form, setForm] = useState<Omit<UnitMaster, "id" | "unitId">>({
    unitName: "",
    shortCode: "",
    conversionFactor: 1,
    status: "Active",
  });

  const handleInput = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setEditingUnit(null);
    setForm({
      unitName: "",
      shortCode: "",
      conversionFactor: 1,
      status: "Active",
    });
    setShowForm(true);
  };

  const handleEdit = (item: UnitMaster) => {
    setEditingUnit(item);
    setForm({
      unitName: item.unitName,
      shortCode: item.shortCode,
      conversionFactor: item.conversionFactor,
      status: item.status,
    });
    setShowForm(true);
  };

  const handleDelete = (item: UnitMaster) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete unit "${item.unitName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setUnits(units.filter((u) => u.id !== item.id));
        Swal.fire("Deleted!", "Unit deleted successfully.", "success");
      }
    });
  };

  const handleSubmit = () => {
    if (!form.unitName || !form.shortCode) {
      Swal.fire("Required!", "Unit Name & Short Code are mandatory.", "warning");
      return;
    }

    if (editingUnit) {
      setUnits(
        units.map((u) => (u.id === editingUnit.id ? { ...u, ...form } : u))
      );
      Swal.fire("Updated!", "Unit updated successfully.", "success");
    } else {
      const newId = units.length + 1;
      const newUnit: UnitMaster = {
        id: newId,
        unitId: `UNIT-${String(newId).padStart(3, "0")}`,
        ...form,
      };
      setUnits([newUnit, ...units]);
      Swal.fire("Created!", "Unit added successfully.", "success");
    }

    setShowForm(false);
  };

  return (
    <div className="p-4">
      <DataTable
        title="Unit Master"
        data={units}
        onAdd={handleAdd}
        addButtonLabel="Add Unit"
        columns={[
          {
            key: "action",
            label: "Actions",
            render: (item: UnitMaster) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-2 py-1 bg-yellow-500 rounded text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="px-2 py-1 bg-red-500 rounded text-white"
                >
                  Delete
                </button>
              </div>
            ),
          },
          { key: "unitId", label: "Unit ID" },
          { key: "unitName", label: "Unit Name" },
          { key: "shortCode", label: "Short Code" },
          { key: "conversionFactor", label: "Conversion Factor" },
          { key: "status", label: "Status" },
        ]}
      />

      {/* --------- FORM MODAL --------- */}
      {showForm && (
        <div className="fixed inset-0 bg-[#00000070] flex justify-center items-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-5 text-gray-600 hover:text-black text-3xl"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingUnit ? "Edit Unit" : "Add Unit"}
            </h2>

            <div className="flex flex-col gap-3">

              <div>
                <label className="font-medium">Unit Name</label>
                <input
                  name="unitName"
                  className="customInput"
                  placeholder="Unit Name (e.g., Kilogram)"
                  value={form.unitName}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Short Code</label>
                <input
                  name="shortCode"
                  className="customInput"
                  placeholder="Short Code (e.g., KG)"
                  value={form.shortCode}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Conversion Factor</label>
                <input
                  type="number"
                  name="conversionFactor"
                  className="customInput"
                  placeholder="Conversion Factor"
                  value={form.conversionFactor}
                  onChange={handleInput}
                />
              </div>

              <div>
                <label className="font-medium">Status</label>
                <select
                  name="status"
                  className="customSelect"
                  value={form.status}
                  onChange={handleInput}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button onClick={handleSubmit} className="customBtn mt-4">
                {editingUnit ? "Update" : "Save"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UnitMaster;
