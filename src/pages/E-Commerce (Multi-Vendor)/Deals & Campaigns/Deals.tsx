import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";

interface Deal {
  id: number;
  dealType: "Flash" | "Deal of the Day" | "Featured";
  product: string;
  vendor: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
}

const DealSchema = Yup.object().shape({
  dealType: Yup.string().required("Deal Type is required"),
  product: Yup.string().required("Product is required"),
  vendor: Yup.string().required("Vendor is required"),
  discount: Yup.number().min(0, "Discount cannot be negative").required("Discount is required"),
  startDate: Yup.string().required("Start Date is required"),
  endDate: Yup.string()
    .required("End Date is required")
    .test("is-after-start", "End Date must be after Start Date", function (value) {
      return !this.parent.startDate || new Date(value) >= new Date(this.parent.startDate);
    }),
  status: Yup.string().required("Status is required"),
});

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: 1,
      dealType: "Deal of the Day",
      product: "Smartphone X",
      vendor: "Elite Electronics",
      discount: 15,
      startDate: "2025-10-16",
      endDate: "2025-10-17",
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const handleEdit = (item: Deal) => {
    setEditingDeal(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Deal) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.product}" from ${item.dealType}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeals(deals.filter((d) => d.id !== item.id));
        Swal.fire("Deleted!", `"${item.product}" has been deleted.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      dealType: editingDeal ? editingDeal.dealType : "Flash",
      product: editingDeal ? editingDeal.product : "",
      vendor: editingDeal ? editingDeal.vendor : "",
      discount: editingDeal ? editingDeal.discount : 0,
      startDate: editingDeal ? editingDeal.startDate : "",
      endDate: editingDeal ? editingDeal.endDate : "",
      status: editingDeal ? editingDeal.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: DealSchema,
    onSubmit: (values) => {
      setDeals(
        deals.map((d) =>
          d.id === editingDeal!.id
            ? { ...d, ...values, dealType: values.dealType as "Flash" | "Deal of the Day" | "Featured", status: values.status as "Active" | "Inactive" }
            : d
        )
      );
      Swal.fire({
        icon: "success",
        title: "Deal Updated",
        text: `"${values.product}" has been updated!`,
        timer: 2000,
        showConfirmButton: false,
      });
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div className="">
      <DataTable
        title="Deals"
        data={deals}
        columns={[
          { key: "id", label: "SR No" },
          { key: "dealType", label: "Deal Type" },
          { key: "product", label: "Product" },
          { key: "vendor", label: "Vendor" },
          { key: "discount", label: "Discount %", render: (item: Deal) => <span>{item.discount}%</span> },
          {
            key: "duration",
            label: "Duration",
            render: (item: Deal) => (
              <span>
                {item.startDate} to {item.endDate}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item: Deal) => (
              <span className={`text-sm font-semibold ${item.status === "Active" ? "text-green-700" : "text-red-700"}`}>
                {item.status}
              </span>
            ),
          },
          // {
          //   key: "action",
          //   label: "Action",
          //   render: (item: Deal) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleEdit(item)}
          //         className="px-2 py-1 bg-yellow-500 text-white rounded"
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
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">Edit Deal</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-semibold text-gray-700">Deal Type</label>
                <select
                  name="dealType"
                  value={formik.values.dealType}
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
                    formik.touched.dealType && formik.errors.dealType
                      ? "customSelectError"
                      : formik.values.dealType
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select Deal Type</option>
                  <option value="Flash">Flash</option>
                  <option value="Deal of the Day">Deal of the Day</option>
                  <option value="Featured">Featured</option>
                </select>
                {formik.touched.dealType && formik.errors.dealType && (
                  <div className="text-red-500 text-sm">{formik.errors.dealType}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Product</label>
                <input
                  type="text"
                  placeholder="Product"
                  name="product"
                  value={formik.values.product}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.product && formik.errors.product
                      ? "customInputError"
                      : formik.values.product
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.product && formik.errors.product && (
                  <div className="text-red-500 text-sm">{formik.errors.product}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Vendor</label>
                <input
                  type="text"
                  placeholder="Vendor"
                  name="vendor"
                  value={formik.values.vendor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.vendor && formik.errors.vendor
                      ? "customInputError"
                      : formik.values.vendor
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.vendor && formik.errors.vendor && (
                  <div className="text-red-500 text-sm">{formik.errors.vendor}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Discount %</label>
                <input
                  type="number"
                  placeholder="Discount"
                  name="discount"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.discount && formik.errors.discount
                      ? "customInputError"
                      : formik.values.discount > 0
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.discount && formik.errors.discount && (
                  <div className="text-red-500 text-sm">{formik.errors.discount}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.startDate && formik.errors.startDate
                      ? "customInputError"
                      : formik.values.startDate
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.startDate && formik.errors.startDate && (
                  <div className="text-red-500 text-sm">{formik.errors.startDate}</div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.endDate && formik.errors.endDate
                      ? "customInputError"
                      : formik.values.endDate
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.endDate && formik.errors.endDate && (
                  <div className="text-red-500 text-sm">{formik.errors.endDate}</div>
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
                  Update
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

export default Deals;