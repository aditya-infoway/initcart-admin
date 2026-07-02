import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

interface Level {
  id: number;
  levelName: string;
  salesTarget: number;
  commission: number;
  cumulativeSales: number;
  remarks: string;
  autoUpgrade: boolean;
}

const levelData: Level[] = [
  {
    id: 1,
    levelName: "Starter",
    salesTarget: 5000,
    commission: 2,
    cumulativeSales: 5000,
    remarks: "Auto upgrade",
    autoUpgrade: true,
  },
  {
    id: 2,
    levelName: "Bronze",
    salesTarget: 15000,
    commission: 3,
    cumulativeSales: 20000,
    remarks: "",
    autoUpgrade: true,
  },
];

const levelOptions = [
  { value: "Starter", label: "Starter" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  // Add more levels as needed (up to 12)
];

const AgentLevelsConfiguration = () => {
  const [levels, setLevels] = useState<Level[]>(levelData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      levelName: editingLevel ? editingLevel.levelName : "",
      salesTarget: editingLevel ? editingLevel.salesTarget : 0,
      commission: editingLevel ? editingLevel.commission : 0,
      cumulativeSales: editingLevel ? editingLevel.cumulativeSales : 0,
      remarks: editingLevel ? editingLevel.remarks : "",
      autoUpgrade: editingLevel ? editingLevel.autoUpgrade : true,
    },
    validationSchema: Yup.object({
      levelName: Yup.string().required("Level Name is required"),
      salesTarget: Yup.number()
        .min(0, "Sales Target cannot be negative")
        .required("Sales Target is required"),
      commission: Yup.number()
        .min(0, "Commission cannot be negative")
        .required("Commission is required"),
      cumulativeSales: Yup.number()
        .min(0, "Cumulative Sales cannot be negative")
        .required("Cumulative Sales is required"),
      remarks: Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      setIsLoading(true);
      if (editingLevel) {
        setLevels(
          levels.map((level) =>
            level.id === editingLevel.id ? { ...level, ...values } : level
          )
        );
        Swal.fire({
          icon: "success",
          title: "Level Updated",
          text: `${values.levelName} has been updated successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newLevel: Level = {
          id: levels.length + 1,
          ...values,
        };
        setLevels([newLevel, ...levels]);
        Swal.fire({
          icon: "success",
          title: "Level Added",
          text: `${values.levelName} has been added successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    setModalOpen(true);
  };

  const handleDelete = (level: Level) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${level.levelName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setLevels(levels.filter((l) => l.id !== level.id));
        Swal.fire("Deleted!", `${level.levelName} has been deleted.`, "success");
      }
    });
  };

  return (
    <div>
      <DataTable
        data={levels}
        columns={[
          { key: "id", label: "Level No" },
          { key: "levelName", label: "Level Name" },
          {
            key: "salesTarget",
            label: "Sales Target (₹)",
            render: (item) => `₹${item.salesTarget.toLocaleString()}`,
          },
          {
            key: "commission",
            label: "Commission %",
            render: (item) => `${item.commission}%`,
          },
          {
            key: "cumulativeSales",
            label: "Cumulative Sales Required",
            render: (item) => `₹${item.cumulativeSales.toLocaleString()}`,
          },
          { key: "remarks", label: "Remarks" },
          
        ]}
        onAdd={() => {
          setEditingLevel(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Level"
        title="Agent Levels Configuration"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-7">
              {editingLevel ? "Edit Level" : "Add Level"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div className="mb-2">
                <label className="block mb-1 font-medium">Level Name</label>
                <select
                  name="levelName"
                  value={formik.values.levelName || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.levelName && formik.errors.levelName
                      ? "paymentSelectError"
                      : formik.values.levelName
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select</option>
                  {levelOptions.map((el) => (
                    <option key={el.value} value={el.value}>
                      {el.label}
                    </option>
                  ))}
                </select>
                {formik.touched.levelName && formik.errors.levelName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.levelName}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Sales Target (₹)</label>
                <input
                  type="number"
                  name="salesTarget"
                  value={formik.values.salesTarget}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Sales Target"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.salesTarget && formik.errors.salesTarget
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.salesTarget && formik.errors.salesTarget && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.salesTarget}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Commission %</label>
                <input
                  type="number"
                  name="commission"
                  value={formik.values.commission}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Commission %"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.commission && formik.errors.commission
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.commission && formik.errors.commission && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.commission}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Cumulative Sales Required</label>
                <input
                  type="number"
                  name="cumulativeSales"
                  value={formik.values.cumulativeSales}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Cumulative Sales"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.cumulativeSales && formik.errors.cumulativeSales
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.cumulativeSales && formik.errors.cumulativeSales && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.cumulativeSales}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Remarks"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.remarks && formik.errors.remarks
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.remarks && formik.errors.remarks && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.remarks}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">Auto Upgrade</label>
                <ToggleSwitch
                  checked={formik.values.autoUpgrade}
                  onChange={(val) => formik.setFieldValue("autoUpgrade", val)}
                />
                <span>{formik.values.autoUpgrade ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : editingLevel ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
              disabled={isLoading}
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLevelsConfiguration;