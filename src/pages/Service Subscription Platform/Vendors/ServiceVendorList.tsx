import { useState } from "react";
import { RiUserSettingsLine } from "react-icons/ri";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Vendor {
  id: string;
  vendorName: string;
  serviceCategory: string;
  businessName: string;
  city: string;
  subscriptionType: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Pending" | "Blocked";
}

const VendorSchema = Yup.object().shape({
  vendorName: Yup.string().required("Vendor Name is required"),
  serviceCategory: Yup.string().required("Service Category is required"),
  businessName: Yup.string().required("Business Name is required"),
  city: Yup.string().required("City is required"),
  subscriptionType: Yup.string().required("Subscription Type is required"),
  startDate: Yup.string().required("Start Date is required"),
  endDate: Yup.string().required("End Date is required"),
  status: Yup.string().required("Status is required"),
});

const ServiceVendorList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "SVC-001",
      vendorName: "Rajesh Patel",
      serviceCategory: "Gym",
      businessName: "FitPro Gym",
      city: "Mumbai",
      subscriptionType: "Premium",
      startDate: "2025-10-15",
      endDate: "2026-10-15",
      status: "Active",
    },
    {
      id: "SVC-002",
      vendorName: "Anita Sharma",
      serviceCategory: "Spa",
      businessName: "Serenity Spa",
      city: "Delhi",
      subscriptionType: "Basic",
      startDate: "2025-09-01",
      endDate: "2026-09-01",
      status: "Pending",
    },
  ]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const handleView = (item: Vendor) => {
    Swal.fire({
      title: `Vendor: ${item.businessName}`,
      html: `
        <p><strong>Vendor ID:</strong> ${item.id}</p>
        <p><strong>Vendor Name:</strong> ${item.vendorName}</p>
        <p><strong>Service Category:</strong> ${item.serviceCategory}</p>
        <p><strong>City:</strong> ${item.city}</p>
        <p><strong>Subscription Type:</strong> ${item.subscriptionType}</p>
        <p><strong>Start Date:</strong> ${item.startDate}</p>
        <p><strong>End Date:</strong> ${item.endDate}</p>
        <p><strong>Status:</strong> ${item.status}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const handleEdit = (item: Vendor) => {
    setEditingVendor(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Vendor) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete vendor ${item.businessName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setVendors(vendors.filter((v) => v.id !== item.id));
        Swal.fire("Deleted!", `Vendor ${item.businessName} has been deleted.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      vendorName: editingVendor ? editingVendor.vendorName : "",
      serviceCategory: editingVendor ? editingVendor.serviceCategory : "",
      businessName: editingVendor ? editingVendor.businessName : "",
      city: editingVendor ? editingVendor.city : "",
      subscriptionType: editingVendor ? editingVendor.subscriptionType : "",
      startDate: editingVendor ? editingVendor.startDate : "",
      endDate: editingVendor ? editingVendor.endDate : "",
      status: editingVendor ? editingVendor.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: VendorSchema,
    onSubmit: (values) => {
      if (editingVendor) {
        setVendors(
          vendors.map((v) =>
            v.id === editingVendor.id
              ? {
                  ...v,
                  ...values,
                  status: values.status as "Active" | "Pending" | "Blocked",
                }
              : v
          )
        );
        Swal.fire({
          icon: "success",
          title: "Vendor Updated",
          text: `"${values.businessName}" has been updated!`,
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
        title="Service Vendor List"
        data={vendors}
        columns={[
          { key: "id", label: "Vendor ID" },
          { key: "vendorName", label: "Vendor Name" },
          { key: "serviceCategory", label: "Service Category" },
          { key: "businessName", label: "Business Name" },
          { key: "city", label: "City" },
          { key: "subscriptionType", label: "Subscription Type" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          {
            key: "status",
            label: "Status",
            render: (item: Vendor) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Active"
                    ? "text-green-700"
                    : item.status === "Pending"
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
          // {
          //   key: "vendorAction",
          //   label: "Action",
          //   render: (item: Vendor) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleView(item)}
          //         className="px-2 py-1 bg-blue-500 text-white rounded"
          //       >
          //         View
          //       </button>
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
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">Edit Vendor</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Vendor Details */}
              <h3 className="block mb-1 font-medium mt-4">Vendor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="Vendor Name"
                    name="vendorName"
                    value={formik.values.vendorName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.vendorName && formik.errors.vendorName
                        ? "customInputError"
                        : formik.values.vendorName
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.vendorName && formik.errors.vendorName && (
                    <div className="text-red-500 text-sm">{formik.errors.vendorName}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Service Category</label>
                  <select
                    name="serviceCategory"
                    value={formik.values.serviceCategory}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value) e.currentTarget.classList.add("filled");
                      else e.currentTarget.classList.remove("filled");
                    }}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.serviceCategory && formik.errors.serviceCategory
                        ? "customSelectError"
                        : formik.values.serviceCategory
                        ? "filled"
                        : ""
                    }`}
                  >
                    <option value="">Select Service Category</option>
                    <option value="Gym">Gym</option>
                    <option value="Spa">Spa</option>
                    <option value="Salon">Salon</option>
                  </select>
                  {formik.touched.serviceCategory && formik.errors.serviceCategory && (
                    <div className="text-red-500 text-sm">{formik.errors.serviceCategory}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Business Name</label>
                  <input
                    type="text"
                    placeholder="Business Name"
                    name="businessName"
                    value={formik.values.businessName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.businessName && formik.errors.businessName
                        ? "customInputError"
                        : formik.values.businessName
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.businessName && formik.errors.businessName && (
                    <div className="text-red-500 text-sm">{formik.errors.businessName}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.city && formik.errors.city
                        ? "customInputError"
                        : formik.values.city
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.city && formik.errors.city && (
                    <div className="text-red-500 text-sm">{formik.errors.city}</div>
                  )}
                </div>
              </div>

              {/* Subscription Details */}
              <h3 className="block mb-1 font-medium mt-4">Subscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Subscription Type</label>
                  <select
                    name="subscriptionType"
                    value={formik.values.subscriptionType}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value) e.currentTarget.classList.add("filled");
                      else e.currentTarget.classList.remove("filled");
                    }}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.subscriptionType && formik.errors.subscriptionType
                        ? "customSelectError"
                        : formik.values.subscriptionType
                        ? "filled"
                        : ""
                    }`}
                  >
                    <option value="">Select Subscription Type</option>
                    <option value="Premium">Premium</option>
                    <option value="Basic">Basic</option>
                    <option value="Free Trial">Free Trial</option>
                  </select>
                  {formik.touched.subscriptionType && formik.errors.subscriptionType && (
                    <div className="text-red-500 text-sm">{formik.errors.subscriptionType}</div>
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
              </div>

              {/* Status */}
              <h3 className="block mb-1 font-medium mt-4">Status</h3>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-700">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) e.currentTarget.classList.add("filled");
                    else e.currentTarget.classList.remove("filled");
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
                  <option value="Pending">Pending</option>
                  <option value="Blocked">Blocked</option>
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

export default ServiceVendorList;