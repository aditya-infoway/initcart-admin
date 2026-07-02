import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";

interface Gateway {
  id: number;
  gatewayName: string;
  merchantId: string;
  apiKey: string;
  mode: "Test" | "Live";
  charges: number;
  status: "Active" | "Inactive";
}

const GatewaySchema = Yup.object().shape({
  gatewayName: Yup.string().required("Gateway Name is required"),
  merchantId: Yup.string().required("Merchant ID is required"),
  apiKey: Yup.string().required("API Key is required"),
  mode: Yup.string().required("Mode is required"),
  charges: Yup.number().min(0, "Charges cannot be negative").required("Charges is required"),
  status: Yup.string().required("Status is required"),
});

const PaymentGatewaySetup = () => {
  const [gateways, setGateways] = useState<Gateway[]>([
    {
      id: 1,
      gatewayName: "Razorpay",
      merchantId: "MERCH123",
      apiKey: "API123456",
      mode: "Live",
      charges: 2,
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);

  const handleAdd = () => {
    setEditingGateway(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Gateway) => {
    setEditingGateway(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Gateway) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.gatewayName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setGateways(gateways.filter((g) => g.id !== item.id));
        Swal.fire("Deleted!", `"${item.gatewayName}" has been deleted.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      gatewayName: editingGateway ? editingGateway.gatewayName : "",
      merchantId: editingGateway ? editingGateway.merchantId : "",
      apiKey: editingGateway ? editingGateway.apiKey : "",
      mode: editingGateway ? editingGateway.mode : "Test",
      charges: editingGateway ? editingGateway.charges : 0,
      status: editingGateway ? editingGateway.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: GatewaySchema,
    onSubmit: (values) => {
      if (editingGateway) {
        setGateways(
          gateways.map((g) =>
            g.id === editingGateway.id
              ? { ...g, ...values, mode: values.mode as "Test" | "Live", status: values.status as "Active" | "Inactive" }
              : g
          )
        );
        Swal.fire({
          icon: "success",
          title: "Gateway Updated",
          text: `"${values.gatewayName}" has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newGateway: Gateway = {
          id: gateways.length + 1,
          ...values,
          mode: values.mode as "Test" | "Live",
          status: values.status as "Active" | "Inactive",
        };
        setGateways([newGateway, ...gateways]);
        Swal.fire({
          icon: "success",
          title: "Gateway Added",
          text: `"${values.gatewayName}" has been added!`,
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
        title="Payment Gateway Setup"
        data={gateways}
        columns={[
          { key: "gatewayName", label: "Gateway Name" },
          { key: "merchantId", label: "Merchant ID" },
          { key: "apiKey", label: "API Key" },
          { key: "mode", label: "Mode" },
          { key: "charges", label: "Charges", render: (item: Gateway) => <span>{item.charges}%</span> },
          {
            key: "status",
            label: "Status",
            render: (item: Gateway) => (
              <span className={`text-sm font-semibold ${item.status === "Active" ? "text-green-700" : "text-red-700"}`}>
                {item.status}
              </span>
            ),
          },
          // {
          //   key: "action",
          //   label: "Action",
          //   render: (item: Gateway) => (
          //     <div className="flex gap-2">
          //        <button
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
        addButtonLabel="Add Gateway"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">{editingGateway ? "Edit Gateway" : "Add Gateway"}</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-semibold text-gray-700">Gateway Name</label>
                <input
                  type="text"
                  placeholder="Gateway Name"
                  name="gatewayName"
                  value={formik.values.gatewayName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.gatewayName && formik.errors.gatewayName
                      ? "customInputError"
                      : formik.values.gatewayName
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.gatewayName && formik.errors.gatewayName && (
                  <div className="text-red-500 text-sm">{formik.errors.gatewayName}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Merchant ID</label>
                <input
                  type="text"
                  placeholder="Merchant ID"
                  name="merchantId"
                  value={formik.values.merchantId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.merchantId && formik.errors.merchantId
                      ? "customInputError"
                      : formik.values.merchantId
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.merchantId && formik.errors.merchantId && (
                  <div className="text-red-500 text-sm">{formik.errors.merchantId}</div>
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
                  <div className="text-red-500 text-sm">{formik.errors.apiKey}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Mode</label>
                <select
                  name="mode"
                  value={formik.values.mode}
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
                    formik.touched.mode && formik.errors.mode
                      ? "customSelectError"
                      : formik.values.mode
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select Mode</option>
                  <option value="Test">Test</option>
                  <option value="Live">Live</option>
                </select>
                {formik.touched.mode && formik.errors.mode && (
                  <div className="text-red-500 text-sm">{formik.errors.mode}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Charges (%)</label>
                <input
                  type="number"
                  placeholder="Charges"
                  name="charges"
                  value={formik.values.charges}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.charges && formik.errors.charges
                      ? "customInputError"
                      : formik.values.charges > 0
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.charges && formik.errors.charges && (
                  <div className="text-red-500 text-sm">{formik.errors.charges}</div>
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
                  <div className="text-red-500 text-sm">{formik.errors.status}</div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="customBtn">
                  Cancel
                </button>
                <button type="submit" className="customBtn">
                  {editingGateway ? "Update" : "Add"}
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

export default PaymentGatewaySetup;