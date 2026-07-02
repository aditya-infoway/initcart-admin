import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Sale {
  id: number;
  agentId: string;
  agentName: string;
  saleDate: string;
  invoiceNo: string;
  productName: string;
  quantity: number;
  saleValue: number;
  costPrice: number;
  profitAmount: number;
  commissionPercent: number;
  commissionValue: number;
  status: "Pending" | "Verified" | "Rejected";
}

const mockSales: Sale[] = [
  {
    id: 1,
    agentId: "AGT-001",
    agentName: "Rohit Sharma",
    saleDate: "2025-10-15",
    invoiceNo: "INV-2025-001",
    productName: "Premium Pack",
    quantity: 2,
    saleValue: 10000,
    costPrice: 7000,
    profitAmount: 3000,
    commissionPercent: 2,
    commissionValue: 60,
    status: "Pending",
  },
];

const AgentSalesEntry = () => {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      agentId: editingSale?.agentId || "",
      agentName: editingSale?.agentName || "",
      saleDate: editingSale?.saleDate || "",
      invoiceNo: editingSale?.invoiceNo || "",
      productName: editingSale?.productName || "",
      quantity: editingSale?.quantity || 1,
      saleValue: editingSale?.saleValue || 0,
      costPrice: editingSale?.costPrice || 0,
    },
    validationSchema: Yup.object({
      agentId: Yup.string().required("Agent ID is required"),
      agentName: Yup.string().required("Agent Name is required"),
      saleDate: Yup.string().required("Sale Date is required"),
      invoiceNo: Yup.string().required("Invoice No is required"),
      productName: Yup.string().required("Product Name is required"),
      quantity: Yup.number().min(1, "Min 1").required("Quantity is required"),
      saleValue: Yup.number().min(0).required("Sale Value is required"),
      costPrice: Yup.number().min(0).required("Cost Price is required"),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      setIsLoading(true);

      const profit = values.saleValue - values.costPrice;
      const commissionPercent = 2; // Can be dynamic later
      const commissionValue = profit * (commissionPercent / 100);

      const newSale: Sale = {
        id: editingSale?.id || sales.length + 1,
        ...values,
        profitAmount: profit,
        commissionPercent,
        commissionValue,
        status: editingSale?.status || "Pending",
      };

      if (editingSale) {
        setSales(sales.map((s) => (s.id === editingSale.id ? newSale : s)));
        Swal.fire({
          icon: "success",
          title: "Sale Updated",
          text: `${values.invoiceNo} updated successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setSales([newSale, ...sales]);
        Swal.fire({
          icon: "success",
          title: "Sale Recorded",
          text: `${values.invoiceNo} added successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setModalOpen(false);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setModalOpen(true);
  };

  const handleDelete = (sale: Sale) => {
    Swal.fire({
      title: "Delete Sale?",
      text: `Delete invoice ${sale.invoiceNo}? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setSales(sales.filter((s) => s.id !== sale.id));
        Swal.fire("Deleted!", `${sale.invoiceNo} has been removed.`, "success");
      }
    });
  };

  return (
    <div>
      <DataTable
        data={sales}
        columns={[
          { key: "id", label: "SR No" },
          { key: "agentId", label: "Agent ID" },
          { key: "agentName", label: "Agent Name" },
          { key: "saleDate", label: "Sale Date" },
          { key: "invoiceNo", label: "Invoice No" },
          { key: "productName", label: "Product" },
          { key: "quantity", label: "Qty" },
          {
            key: "saleValue",
            label: "Sale Value",
            render: (s) => `₹${s.saleValue.toLocaleString()}`,
          },
          {
            key: "profitAmount",
            label: "Profit",
            render: (s) => `₹${s.profitAmount.toLocaleString()}`,
          },
          { key: "commissionPercent", label: "Comm %" },
          {
            key: "commissionValue",
            label: "Comm Value",
            render: (s) => `₹${s.commissionValue.toLocaleString()}`,
          },
          {
            key: "status",
            label: "Status",
            render: (s) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  s.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : s.status === "Verified"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {s.status}
              </span>
            ),
          },
        ]}
        onAdd={() => {
          setEditingSale(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Record Sale"
        title="Agent Sales Entry"
      />

      {/* Modal - Same as AgentLevelsConfiguration */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-7">
              {editingSale ? "Edit Sale" : "Record New Sale"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div>
                <label className="block mb-1 font-medium">Agent ID</label>
                <input
                  name="agentId"
                  value={formik.values.agentId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="AGT-001"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.agentId && formik.errors.agentId
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.agentId && formik.errors.agentId && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.agentId}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Agent Name</label>
                <input
                  name="agentName"
                  value={formik.values.agentName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Rohit Sharma"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.agentName && formik.errors.agentName
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.agentName && formik.errors.agentName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.agentName}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Sale Date</label>
                <input
                  type="date"
                  name="saleDate"
                  value={formik.values.saleDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.saleDate && formik.errors.saleDate
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.saleDate && formik.errors.saleDate && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.saleDate}</div>
                )}
              </div>

              {/* Row 2 */}
              <div>
                <label className="block mb-1 font-medium">Invoice No</label>
                <input
                  name="invoiceNo"
                  value={formik.values.invoiceNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="INV-2025-001"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.invoiceNo && formik.errors.invoiceNo
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.invoiceNo && formik.errors.invoiceNo && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.invoiceNo}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Product Name</label>
                <input
                  name="productName"
                  value={formik.values.productName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Premium Pack"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.productName && formik.errors.productName
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.productName && formik.errors.productName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.productName}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="1"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.quantity && formik.errors.quantity
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.quantity && formik.errors.quantity && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.quantity}</div>
                )}
              </div>

              {/* Row 3 */}
              <div>
                <label className="block mb-1 font-medium">Sale Value (₹)</label>
                <input
                  type="number"
                  name="saleValue"
                  value={formik.values.saleValue}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="0"
                  placeholder="10000"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.saleValue && formik.errors.saleValue
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.saleValue && formik.errors.saleValue && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.saleValue}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Cost Price (₹)</label>
                <input
                  type="number"
                  name="costPrice"
                  value={formik.values.costPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="0"
                  placeholder="7000"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.costPrice && formik.errors.costPrice
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.costPrice && formik.errors.costPrice && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.costPrice}</div>
                )}
              </div>

              {/* Profit & Commission (Read-only) */}
              <div>
                <label className="block mb-1 font-medium">Profit (₹)</label>
                <input
                  type="number"
                  value={formik.values.saleValue - formik.values.costPrice}
                  disabled
                  className="w-full p-2 border rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer hover:bg-gray-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                >
                  {isLoading
                    ? "Saving..."
                    : editingSale
                    ? "Update Sale"
                    : "Record Sale"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setModalOpen(false)}
              disabled={isLoading}
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

export default AgentSalesEntry;