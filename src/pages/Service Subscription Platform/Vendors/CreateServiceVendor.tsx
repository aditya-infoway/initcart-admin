import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";

interface ServiceVendor {
  id: string;
  businessName: string;
  contactPerson: string;
  serviceCategory: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  subscriptionPlan: "Premium" | "Basic" | "Free Trial";
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  status: "Active" | "Pending" | "Blocked";
}

const ServiceVendorSchema = Yup.object().shape({
  businessName: Yup.string().required("Business Name is required"),
  contactPerson: Yup.string().required("Contact Person is required"),
  serviceCategory: Yup.string().required("Service Category is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone Number is required"),
  password: Yup.string().required("Password is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  country: Yup.string().required("Country is required"),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  gstNumber: Yup.string()
    // .matches(
    //   /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    //   "Invalid GST Number"
    // )
    .required("GST Number is required"),
  panNumber: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN Number")
    .required("PAN Number is required"),
  bankName: Yup.string().required("Bank Name is required"),
  accountNo: Yup.string().required("Account Number is required"),
  ifscCode: Yup.string()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code")
    .required("IFSC Code is required"),
  subscriptionPlan: Yup.string().required("Subscription Plan is required"),
  subscriptionStartDate: Yup.string().required("Subscription Start Date is required"),
  subscriptionEndDate: Yup.string().required("Subscription End Date is required"),
  status: Yup.string().required("Status is required"),
});

const CreateServiceVendor = () => {
  const [vendors, setVendors] = useState<ServiceVendor[]>([
    {
      id: "SVC-001",
      businessName: "FitPro Gym",
      contactPerson: "Rajesh Patel",
      serviceCategory: "Gym",
      email: "fitpro@gmail.com",
      phone: "9876543210",
      password: "secure123",
      address: "Bandra West, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "400050",
      gstNumber: "27ABCDE1234F1Z1",
      panNumber: "ABCDE1234F",
      bankName: "HDFC Bank",
      accountNo: "1234567890",
      ifscCode: "HDFC000123",
      subscriptionPlan: "Premium",
      subscriptionStartDate: "2025-10-15",
      subscriptionEndDate: "2026-10-15",
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingVendor, setEditingVendor] = useState<ServiceVendor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateVendorId = () => {
    const nextId = vendors.length + 1;
    return `SVC-${nextId.toString().padStart(3, "0")}`;
  };

  const handleAdd = () => {
    setEditingVendor(null);
    setModalOpen(true);
  };

  const handleEdit = (item: ServiceVendor) => {
    setEditingVendor(item);
    setModalOpen(true);
  };

  const handleDelete = (item: ServiceVendor) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.businessName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setVendors(vendors.filter((v) => v.id !== item.id));
        Swal.fire("Deleted!", `"${item.businessName}" has been deleted.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      id: editingVendor ? editingVendor.id : generateVendorId(),
      businessName: editingVendor ? editingVendor.businessName : "",
      contactPerson: editingVendor ? editingVendor.contactPerson : "",
      serviceCategory: editingVendor ? editingVendor.serviceCategory : "",
      email: editingVendor ? editingVendor.email : "",
      phone: editingVendor ? editingVendor.phone : "",
      password: editingVendor ? editingVendor.password : "",
      address: editingVendor ? editingVendor.address : "",
      city: editingVendor ? editingVendor.city : "",
      state: editingVendor ? editingVendor.state : "",
      country: editingVendor ? editingVendor.country : "",
      pincode: editingVendor ? editingVendor.pincode : "",
      gstNumber: editingVendor ? editingVendor.gstNumber : "",
      panNumber: editingVendor ? editingVendor.panNumber : "",
      bankName: editingVendor ? editingVendor.bankName : "",
      accountNo: editingVendor ? editingVendor.accountNo : "",
      ifscCode: editingVendor ? editingVendor.ifscCode : "",
      subscriptionPlan: editingVendor ? editingVendor.subscriptionPlan : "",
      subscriptionStartDate: editingVendor ? editingVendor.subscriptionStartDate : "",
      subscriptionEndDate: editingVendor ? editingVendor.subscriptionEndDate : "",
      status: editingVendor ? editingVendor.status : "Pending",
      license: null as File | null,
      idProof: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: ServiceVendorSchema,
    onSubmit: (values) => {
      setIsLoading(true);
      if (editingVendor) {
        setVendors(
          vendors.map((v) =>
            v.id === editingVendor.id
              ? {
                  ...v,
                  ...values,
                  subscriptionPlan: values.subscriptionPlan as "Premium" | "Basic" | "Free Trial",
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
      } else {
        const newVendor: ServiceVendor = {
        //   id: generateVendorId(),
          ...values,
          subscriptionPlan: values.subscriptionPlan as "Premium" | "Basic" | "Free Trial",
          status: values.status as "Active" | "Pending" | "Blocked",
        };
        setVendors([newVendor, ...vendors]);
        Swal.fire({
          icon: "success",
          title: "Vendor Added",
          text: `"${values.businessName}" has been added!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  return (
    <div className="">
      <DataTable
        title="Service Vendors"
        data={vendors}
        columns={[
          { key: "id", label: "Vendor ID" },
          { key: "businessName", label: "Business Name" },
          { key: "contactPerson", label: "Contact Person" },
          { key: "serviceCategory", label: "Service Category" },
          {
            key: "status",
            label: "Status",
            render: (item: ServiceVendor) => (
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
          //   render: (item: ServiceVendor) => (
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
        onAdd={handleAdd}
        addButtonLabel="Add Service Vendor"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingVendor ? "Edit Service Vendor" : "Add Service Vendor"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Business Details */}
              <h3 className="block mb-1 font-medium mt-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Vendor ID</label>
                  <input
                    type="text"
                    name="id"
                    value={formik.values.id}
                    readOnly
                    className="customInput w-full bg-gray-100"
                  />
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
                  <label className="font-semibold text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Contact Person"
                    name="contactPerson"
                    value={formik.values.contactPerson}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.contactPerson && formik.errors.contactPerson
                        ? "customInputError"
                        : formik.values.contactPerson
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.contactPerson && formik.errors.contactPerson && (
                    <div className="text-red-500 text-sm">{formik.errors.contactPerson}</div>
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
                    <option value="Consulting">Consulting</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Catering">Catering</option>
                    <option value="Event Planning">Event Planning</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Fitness Training">Fitness Training</option>
                    <option value="Photography">Photography</option>
                  </select>
                  {formik.touched.serviceCategory && formik.errors.serviceCategory && (
                    <div className="text-red-500 text-sm">{formik.errors.serviceCategory}</div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <h3 className="block mb-1 font-medium mt-4">Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.email && formik.errors.email
                        ? "customInputError"
                        : formik.values.email
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm">{formik.errors.email}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Phone</label>
                  <input
                    type="text"
                    placeholder="Phone"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.phone && formik.errors.phone
                        ? "customInputError"
                        : formik.values.phone
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-red-500 text-sm">{formik.errors.phone}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.password && formik.errors.password
                        ? "customInputError"
                        : formik.values.password
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-sm">{formik.errors.password}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700">Address</label>
                  <textarea
                    placeholder="Address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.address && formik.errors.address
                        ? "customInputError"
                        : formik.values.address
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.address && formik.errors.address && (
                    <div className="text-red-500 text-sm">{formik.errors.address}</div>
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
                <div>
                  <label className="font-semibold text-gray-700">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    name="state"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.state && formik.errors.state
                        ? "customInputError"
                        : formik.values.state
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.state && formik.errors.state && (
                    <div className="text-red-500 text-sm">{formik.errors.state}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    name="country"
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.country && formik.errors.country
                        ? "customInputError"
                        : formik.values.country
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.country && formik.errors.country && (
                    <div className="text-red-500 text-sm">{formik.errors.country}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Pincode</label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    name="pincode"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.pincode && formik.errors.pincode
                        ? "customInputError"
                        : formik.values.pincode
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.pincode && formik.errors.pincode && (
                    <div className="text-red-500 text-sm">{formik.errors.pincode}</div>
                  )}
                </div>
              </div>

              {/* Tax Details */}
              <h3 className="block mb-1 font-medium mt-4">Tax Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">GST Number</label>
                  <input
                    type="text"
                    placeholder="GST Number"
                    name="gstNumber"
                    value={formik.values.gstNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.gstNumber && formik.errors.gstNumber
                        ? "customInputError"
                        : formik.values.gstNumber
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.gstNumber && formik.errors.gstNumber && (
                    <div className="text-red-500 text-sm">{formik.errors.gstNumber}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">PAN Number</label>
                  <input
                    type="text"
                    placeholder="PAN Number"
                    name="panNumber"
                    value={formik.values.panNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.panNumber && formik.errors.panNumber
                        ? "customInputError"
                        : formik.values.panNumber
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.panNumber && formik.errors.panNumber && (
                    <div className="text-red-500 text-sm">{formik.errors.panNumber}</div>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <h3 className="block mb-1 font-medium mt-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    name="bankName"
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.bankName && formik.errors.bankName
                        ? "customInputError"
                        : formik.values.bankName
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.bankName && formik.errors.bankName && (
                    <div className="text-red-500 text-sm">{formik.errors.bankName}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Account Number</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    name="accountNo"
                    value={formik.values.accountNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.accountNo && formik.errors.accountNo
                        ? "customInputError"
                        : formik.values.accountNo

                    ? "filled"
                    : ""
                    }`}
                    required
                  />
                  {formik.touched.accountNo && formik.errors.accountNo && (
                    <div className="text-red-500 text-sm">{formik.errors.accountNo}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    name="ifscCode"
                    value={formik.values.ifscCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.ifscCode && formik.errors.ifscCode
                        ? "customInputError"
                        : formik.values.ifscCode
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.ifscCode && formik.errors.ifscCode && (
                    <div className="text-red-500 text-sm">{formik.errors.ifscCode}</div>
                  )}
                </div>
              </div>

              {/* Subscription Details */}
              <h3 className="block mb-1 font-medium mt-4">Subscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Subscription Plan</label>
                  <select
                    name="subscriptionPlan"
                    value={formik.values.subscriptionPlan}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value) e.currentTarget.classList.add("filled");
                      else e.currentTarget.classList.remove("filled");
                    }}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.subscriptionPlan && formik.errors.subscriptionPlan
                        ? "customSelectError"
                        : formik.values.subscriptionPlan
                        ? "filled"
                        : ""
                    }`}
                  >
                    <option value="">Select Subscription Plan</option>
                    <option value="Premium">Premium</option>
                    <option value="Basic">Basic</option>
                    <option value="Free Trial">Free Trial</option>
                  </select>
                  {formik.touched.subscriptionPlan && formik.errors.subscriptionPlan && (
                    <div className="text-red-500 text-sm">{formik.errors.subscriptionPlan}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Subscription Start Date</label>
                  <input
                    type="date"
                    name="subscriptionStartDate"
                    value={formik.values.subscriptionStartDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.subscriptionStartDate && formik.errors.subscriptionStartDate
                        ? "customInputError"
                        : formik.values.subscriptionStartDate
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.subscriptionStartDate && formik.errors.subscriptionStartDate && (
                    <div className="text-red-500 text-sm">{formik.errors.subscriptionStartDate}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Subscription End Date</label>
                  <input
                    type="date"
                    name="subscriptionEndDate"
                    value={formik.values.subscriptionEndDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.subscriptionEndDate && formik.errors.subscriptionEndDate
                        ? "customInputError"
                        : formik.values.subscriptionEndDate
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.subscriptionEndDate && formik.errors.subscriptionEndDate && (
                    <div className="text-red-500 text-sm">{formik.errors.subscriptionEndDate}</div>
                  )}
                </div>
              </div>

              {/* Documents Upload */}
              <h3 className="block mb-1 font-medium mt-4">Documents Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "License", name: "license" },
                  { label: "ID Proof", name: "idProof" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="font-semibold text-gray-700">{field.label}</label>
                    <input
                      type="file"
                      name={field.name}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] || null;
                        formik.setFieldValue(field.name, file);
                        if (file) e.currentTarget.classList.add("filled");
                        else e.currentTarget.classList.remove("filled");
                      }}
                      className={`customInput w-full ${
                        formik.values[field.name as keyof typeof formik.values] ? "filled" : ""
                      }`}
                    />
                  </div>
                ))}
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="customBtn"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => formik.resetForm()}
                  className="customBtn"
                  disabled={isLoading}
                >
                  Reset
                </button>
                <button type="submit" className="customBtn" disabled={isLoading}>
                  {editingVendor ? "Update" : "Save"}
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

export default CreateServiceVendor;