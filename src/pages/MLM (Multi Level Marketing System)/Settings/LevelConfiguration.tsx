/*  LevelConfiguration.tsx  */
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

interface Level {
  id: number;                     // required by DataTable<T extends { id: … }>
  levelName: string;
  target: number;
  commission: number;
  autoUpgrade: boolean;
  status: "Active" | "Inactive";
}

const mockLevels: Level[] = [
  {
    id: 1,
    levelName: "Starter",
    target: 5000,
    commission: 2,
    autoUpgrade: true,
    status: "Active",
  },
  {
    id: 2,
    levelName: "Bronze",
    target: 15000,
    commission: 3,
    autoUpgrade: true,
    status: "Active",
  },
];

const LevelConfiguration = () => {
  const [levels, setLevels] = useState<Level[]>(mockLevels);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  /* ------------------- Formik ------------------- */
  const formik = useFormik({
    initialValues: {
      levelName: editingLevel?.levelName ?? "",
      target: editingLevel?.target ?? 0,
      commission: editingLevel?.commission ?? 0,
      autoUpgrade: editingLevel?.autoUpgrade ?? false,
      status: editingLevel?.status ?? "Active",
    },
    validationSchema: Yup.object({
      levelName: Yup.string().required("Required"),
      target: Yup.number().min(0).required("Required"),
      commission: Yup.number().min(0).max(100).required("Required"),
      autoUpgrade: Yup.boolean(),
      status: Yup.string().oneOf(["Active", "Inactive"]).required(),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      const newLevel: Level = {
        id: editingLevel?.id ?? levels.length + 1,
        ...values,
      };

      if (editingLevel) {
        setLevels((prev) => prev.map((l) => (l.id === editingLevel.id ? newLevel : l)));
        Swal.fire("Updated!", `${newLevel.levelName} updated.`, "success");
      } else {
        setLevels((prev) => [...prev, newLevel]);
        Swal.fire("Added!", `${newLevel.levelName} added.`, "success");
      }

      setModalOpen(false);
      formik.resetForm();
    },
  });

  /* ------------------- Handlers ------------------- */
  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    setModalOpen(true);
  };

  const handleDelete = (level: Level) => {
    Swal.fire({
      title: "Delete Level?",
      text: `${level.levelName} will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (res.isConfirmed) {
        setLevels((prev) => prev.filter((l) => l.id !== level.id));
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  /* ------------------- Render ------------------- */
  return (
    <div>
      {/* ---------- DataTable ---------- */}
      <DataTable<Level>
        title="Level Configuration"
        data={levels}
        columns={[
          { key: "id", label: "Level ID" },
          { key: "levelName", label: "Level Name" },
          {
            key: "target",
            label: "Target (₹)",
            render: (l) => `₹${l.target.toLocaleString()}`,
          },
          {
            key: "commission",
            label: "Commission %",
            render: (l) => `${l.commission}%`,
          },
          {
            key: "autoUpgrade",
            label: "Auto Upgrade",
            render: (l) => (
              <span className={l.autoUpgrade ? "text-green-600" : "text-gray-500"}>
                {l.autoUpgrade ? "Yes" : "No"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (l) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  l.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {l.status}
              </span>
            ),
          },
        ]}
        onAdd={() => {
          setEditingLevel(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Level"
      />

      {/* ---------- Modal (same design as AgentSalesEntry) ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-7">
              {editingLevel ? "Edit Level" : "Add New Level"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div>
                <label className="block mb-1 font-medium">Level Name</label>
                <input
                  name="levelName"
                  value={formik.values.levelName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Starter"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.levelName && formik.errors.levelName
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.levelName && formik.errors.levelName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.levelName}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Target (₹)</label>
                <input
                  type="number"
                  name="target"
                  value={formik.values.target}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="0"
                  placeholder="5000"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.target && formik.errors.target
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.target && formik.errors.target && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.target}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Commission %</label>
                <input
                  type="number"
                  name="commission"
                  value={formik.values.commission}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="0"
                  max="100"
                  placeholder="2"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.commission && formik.errors.commission
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.commission && formik.errors.commission && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.commission}</div>
                )}
              </div>

              {/* Row 2 */}
              <div className="md:col-span-2 flex items-center gap-4">
                <label className="font-medium">Auto Upgrade</label>
                <ToggleSwitch
                  checked={formik.values.autoUpgrade}
                  onChange={(v) => formik.setFieldValue("autoUpgrade", v)}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.status && formik.errors.status
                      ? "customInputError"
                      : "customInput"
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.status}</div>
                )}
              </div>

              {/* Buttons */}
              <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editingLevel ? "Update Level" : "Add Level"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelConfiguration;