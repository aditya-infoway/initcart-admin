import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

interface CommissionCriteria {
  id: number;
  levelName: string;
  minSale: number;
  maxSale: number;
  commission: number;
  bonusType: "Fixed" | "Percentage" | "None";
  remarks: string;
}

const levelOptions = [
  { value: "Starter", label: "Starter" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  // Add more levels up to 12 as needed
];

const bonusTypeOptions = [
  { value: "Fixed", label: "Fixed" },
  { value: "Percentage", label: "Percentage" },
  { value: "None", label: "None" },
];

const commissionData: CommissionCriteria[] = [
  {
    id: 1,
    levelName: "Starter",
    minSale: 5000,
    maxSale: 14999,
    commission: 2,
    bonusType: "Percentage",
    remarks: "Level 1 commission",
  },
  {
    id: 2,
    levelName: "Bronze",
    minSale: 15000,
    maxSale: 29999,
    commission: 3,
    bonusType: "None",
    remarks: "",
  },
];

const CommissionCriteriaSetup = () => {
  const [criteria, setCriteria] = useState<CommissionCriteria[]>(commissionData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<CommissionCriteria | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      levelName: editingCriteria ? editingCriteria.levelName : "",
      minSale: editingCriteria ? editingCriteria.minSale : 0,
      maxSale: editingCriteria ? editingCriteria.maxSale : 0,
      commission: editingCriteria ? editingCriteria.commission : 0,
      bonusType: editingCriteria ? editingCriteria.bonusType : "None",
      remarks: editingCriteria ? editingCriteria.remarks : "",
    },
    validationSchema: Yup.object({
      levelName: Yup.string().required("Level Name is required"),
      minSale: Yup.number()
        .min(0, "Min Sale cannot be negative")
        .required("Min Sale is required"),
      maxSale: Yup.number()
        .min(0, "Max Sale cannot be negative")
        .required("Max Sale is required")
        .test("maxSale", "Max Sale must be greater than Min Sale", function (value) {
          return value > this.parent.minSale;
        }),
      commission: Yup.number()
        .min(0, "Commission cannot be negative")
        .required("Commission is required"),
      bonusType: Yup.string().required("Bonus Type is required"),
      remarks: Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      setIsLoading(true);
      if (editingCriteria) {
        setCriteria(
          criteria.map((item) =>
            item.id === editingCriteria.id ? { ...item, ...values } : item
          )
        );
        Swal.fire({
          icon: "success",
          title: "Criteria Updated",
          text: `${values.levelName} criteria updated successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newCriteria: CommissionCriteria = {
          id: criteria.length + 1,
          ...values,
        };
        setCriteria([newCriteria, ...criteria]);
        Swal.fire({
          icon: "success",
          title: "Criteria Added",
          text: `${values.levelName} criteria added successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const handleEdit = (item: CommissionCriteria) => {
    setEditingCriteria(item);
    setModalOpen(true);
  };

  const handleDelete = (item: CommissionCriteria) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete criteria for "${item.levelName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setCriteria(criteria.filter((c) => c.id !== item.id));
        Swal.fire("Deleted!", `${item.levelName} criteria deleted.`, "success");
      }
    });
  };

  return (
    <div>
      <DataTable
        data={criteria}
        columns={[
          { key: "id", label: "SR No" },
          { key: "levelName", label: "Level Name" },
          {
            key: "minSale",
            label: "Min Sale (₹)",
            render: (item) => `₹${item.minSale.toLocaleString()}`,
          },
          {
            key: "maxSale",
            label: "Max Sale (₹)",
            render: (item) => `₹${item.maxSale.toLocaleString()}`,
          },
          {
            key: "commission",
            label: "Commission %",
            render: (item) => `${item.commission}%`,
          },
          { key: "bonusType", label: "Bonus Type" },
          { key: "remarks", label: "Remarks" },
        //   {
        //     key: "action",
        //     label: "Action",
        //     render: (item) => (
        //       <div className="flex justify-center gap-2">
        //         <button
        //           onClick={() => handleEdit(item)}
        //           className="px-2 py-1 bg-yellow-500 text-white rounded"
        //         >
        //           Edit
        //         </button>
        //         <button
        //           onClick={() => handleDelete(item)}
        //           className="px-2 py-1 bg-red-600 text-white rounded"
        //         >
        //           Delete
        //         </button>
        //       </div>
        //     ),
        //   },
        ]}
        onAdd={() => {
          setEditingCriteria(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Criteria"
        title="Commission Criteria Setup"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-7">
              {editingCriteria ? "Edit Commission Criteria" : "Add Commission Criteria"}
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
                <label className="block mb-1 font-medium">Min Sale (₹)</label>
                <input
                  type="number"
                  name="minSale"
                  value={formik.values.minSale}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Min Sale"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.minSale && formik.errors.minSale
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.minSale && formik.errors.minSale && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.minSale}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Max Sale (₹)</label>
                <input
                  type="number"
                  name="maxSale"
                  value={formik.values.maxSale}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Max Sale"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.maxSale && formik.errors.maxSale
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.maxSale && formik.errors.maxSale && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.maxSale}
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
                <label className="block mb-1 font-medium">Bonus Type</label>
                <select
                  name="bonusType"
                  value={formik.values.bonusType || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.bonusType && formik.errors.bonusType
                      ? "paymentSelectError"
                      : formik.values.bonusType
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select</option>
                  {bonusTypeOptions.map((el) => (
                    <option key={el.value} value={el.value}>
                      {el.label}
                    </option>
                  ))}
                </select>
                {formik.touched.bonusType && formik.errors.bonusType && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.bonusType}
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
                  {isLoading ? "Processing..." : editingCriteria ? "Update" : "Add"}
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

export default CommissionCriteriaSetup;