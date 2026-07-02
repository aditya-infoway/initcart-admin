import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";

interface Courier {
  id: number;
  courierName: string;
  apiKey: string;
  baseRate: number;
  perKmCharge: number;
  maxWeight: number;
  estimatedDays: number;
  status: "Active" | "Inactive";
}

const CourierSchema = Yup.object().shape({
  courierName: Yup.string().required("Courier Name is required"),
  apiKey: Yup.string().required("API Key is required"),
  baseRate: Yup.number()
    .min(0, "Base Rate cannot be negative")
    .required("Base Rate is required"),
  perKmCharge: Yup.number()
    .min(0, "Per KM Charge cannot be negative")
    .required("Per KM Charge is required"),
  maxWeight: Yup.number()
    .min(0, "Max Weight cannot be negative")
    .required("Max Weight is required"),
  estimatedDays: Yup.number()
    .min(1, "Estimated Days must be at least 1")
    .required("Estimated Days is required"),
  status: Yup.string().required("Status is required"),
});

const ShippingConfiguration = () => {
  const [couriers, setCouriers] = useState<Courier[]>([
    {
      id: 1,
      courierName: "BlueDart",
      apiKey: "BD123456",
      baseRate: 100,
      perKmCharge: 5,
      maxWeight: 30,
      estimatedDays: 3,
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);

  const handleAdd = () => {
    setEditingCourier(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Courier) => {
    setEditingCourier(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Courier) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.courierName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setCouriers(couriers.filter((c) => c.id !== item.id));
        Swal.fire(
          "Deleted!",
          `"${item.courierName}" has been deleted.`,
          "success"
        );
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      courierName: editingCourier ? editingCourier.courierName : "",
      apiKey: editingCourier ? editingCourier.apiKey : "",
      baseRate: editingCourier ? editingCourier.baseRate : 0,
      perKmCharge: editingCourier ? editingCourier.perKmCharge : 0,
      maxWeight: editingCourier ? editingCourier.maxWeight : 0,
      estimatedDays: editingCourier ? editingCourier.estimatedDays : 1,
      status: editingCourier ? editingCourier.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: CourierSchema,
    onSubmit: (values) => {
      if (editingCourier) {
        setCouriers(
          couriers.map((c) =>
            c.id === editingCourier.id
              ? {
                  ...c,
                  ...values,
                  status: values.status as "Active" | "Inactive",
                }
              : c
          )
        );
        Swal.fire({
          icon: "success",
          title: "Courier Updated",
          text: `"${values.courierName}" has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newCourier: Courier = {
          id: couriers.length + 1,
          ...values,
          status: values.status as "Active" | "Inactive",
        };
        setCouriers([newCourier, ...couriers]);
        Swal.fire({
          icon: "success",
          title: "Courier Added",
          text: `"${values.courierName}" has been added!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div className="">
      <DataTable
        title="Shipping Configuration"
        data={couriers}
        columns={[
          { key: "courierName", label: "Courier Name" },
          { key: "apiKey", label: "API Key" },
          {
            key: "baseRate",
            label: "Base Rate",
            render: (item: Courier) => <span>₹{item.baseRate}</span>,
          },
          {
            key: "perKmCharge",
            label: "Per KM Charge",
            render: (item: Courier) => <span>₹{item.perKmCharge}</span>,
          },
          {
            key: "maxWeight",
            label: "Max Weight",
            render: (item: Courier) => <span>{item.maxWeight} kg</span>,
          },
          { key: "estimatedDays", label: "Estimated Days" },
          {
            key: "status",
            label: "Status",
            render: (item: Courier) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Active" ? "text-green-700" : "text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
          // {
          //   key: "action",
          //   label: "Action",
          //   render: (item: Courier) => (
          //     <div className="flex gap-2">
          //       {/* <button
          //         onClick={() => handleEdit(item)}
          //         className="px-2 py-1 bg-yellow-500 text-white rounded customBtn"
          //       >
          //         Edit
          //       </button>
          //       <button
          //         onClick={() => handleDelete(item)}
          //         className="px-2 py-1 bg-red-500 text-white rounded customBtn"
          //       >
          //         Delete
          //       </button> */}
          //       <button
          //         onClick={() => handleEdit(item)}
          //         className="px-2 py-1 bg-blue-500 text-white rounded"
          //       >
          //         Edit
          //       </button>
          //       <button
          //         onClick={() => handleDelete(item)}
          //         className="px-2 py-1 bg-red-500 text-white rounded"
          //       >
          //         Delete
          //       </button>
          //     </div>
          //   ),
          // },
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Courier"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingCourier ? "Edit Courier" : "Add Courier"}
            </h2>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="font-semibold text-gray-700">
                  Courier Name
                </label>
                <input
                  type="text"
                  placeholder="Courier Name"
                  name="courierName"
                  value={formik.values.courierName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.courierName && formik.errors.courierName
                      ? "customInputError"
                      : formik.values.courierName
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.courierName && formik.errors.courierName && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.courierName}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">API Key</label>
                <input
                  type="text"
                  placeholder="API Key"
                  name="apiKey"
                  value={formik.values.apiKey}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.apiKey && formik.errors.apiKey
                      ? "customInputError"
                      : formik.values.apiKey
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.apiKey && formik.errors.apiKey && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.apiKey}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Base Rate</label>
                <input
                  type="number"
                  placeholder="Base Rate"
                  name="baseRate"
                  value={formik.values.baseRate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.baseRate && formik.errors.baseRate
                      ? "customInputError"
                      : formik.values.baseRate > 0
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.baseRate && formik.errors.baseRate && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.baseRate}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Per KM Charge
                </label>
                <input
                  type="number"
                  placeholder="Per KM Charge"
                  name="perKmCharge"
                  value={formik.values.perKmCharge}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.perKmCharge && formik.errors.perKmCharge
                      ? "customInputError"
                      : formik.values.perKmCharge > 0
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.perKmCharge && formik.errors.perKmCharge && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.perKmCharge}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Max Weight
                </label>
                <input
                  type="number"
                  placeholder="Max Weight"
                  name="maxWeight"
                  value={formik.values.maxWeight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.maxWeight && formik.errors.maxWeight
                      ? "customInputError"
                      : formik.values.maxWeight > 0
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.maxWeight && formik.errors.maxWeight && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.maxWeight}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Estimated Days
                </label>
                <input
                  type="number"
                  placeholder="Estimated Days"
                  name="estimatedDays"
                  value={formik.values.estimatedDays}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.estimatedDays && formik.errors.estimatedDays
                      ? "customInputError"
                      : formik.values.estimatedDays > 0
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.estimatedDays &&
                  formik.errors.estimatedDays && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.estimatedDays}
                    </div>
                  )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) {
                      e.currentTarget.classList.add("filled");
                    } else {
                      e.currentTarget.classList.remove("filled");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full ${
                    formik.touched.status && formik.errors.status
                      ? "customSelectError"
                      : formik.values.status
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.status}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="customBtn"
                >
                  Cancel
                </button>
                <button type="submit" className="customBtn">
                  {editingCourier ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
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

export default ShippingConfiguration;
