import { useState, useEffect } from "react";
import { vendorService } from "../../services/vendorService";
import DataTable from "../../components/common/DataTable";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Vendor {
  id: number;
  businessName: string;
  ownerName: string;
  businessType: "Manufacturer" | "Wholesaler" | "Retailer";
  businessCategory: "Fashion" | "Grocery" | "Electronic";
  gstNo: string;
  email: string;
  mobile: string;
  alternateNumber?: string;
  businessAddress: string;
  locationLink?: string;
  bankAccountHolderName: string;
  bankAccountNo: string;
  ifsc: string;
  bankName: string;
  upiId?: string;
  paymentSettlementPreference: "Weekly" | "Bi-Weekly" | "Monthly";
  status: "Active" | "Inactive" | "Pending Verification";
}

const VendorSchema = Yup.object().shape({
  businessName: Yup.string().required("Business Name is required"),
  ownerName: Yup.string().required("Owner Name is required"),
  businessType: Yup.string().required("Business Type is required"),
  businessCategory: Yup.string().required("Business Category is required"),
  gstNo: Yup.string().required("GST No. is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile: Yup.string().required("Mobile Number is required"),
  businessAddress: Yup.string().required("Business Address is required"),
  bankAccountHolderName: Yup.string().required("Account Holder Name is required"),
  bankAccountNo: Yup.string().required("Account Number is required"),
  ifsc: Yup.string().required("IFSC is required"),
  bankName: Yup.string().required("Bank Name is required"),
  paymentSettlementPreference: Yup.string().required(
    "Payment Settlement Preference is required"
  ),
});

const ProductVendor = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedVendorForApproval, setSelectedVendorForApproval] = useState<Vendor | null>(null);

  // Fetch vendors helper — used after create/update/delete and on component mount
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await vendorService.getAll();
      setVendors(data);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
      Swal.fire("Error", "Failed to load vendors from server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // 🧩 Handle Add/Edit/Delete Modal
  const handleAdd = () => {
    setEditingVendor(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Vendor) => {
    setEditingVendor(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: Vendor) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.businessName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Use deleteVendor method instead of delete
          await vendorService.deleteVendor(item.id);
          await fetchVendors(); // refresh list
          Swal.fire("Deleted!", `"${item.businessName}" has been deleted.`, "success");
        } catch (err: any) {
          console.error("Delete error:", err);
          Swal.fire("Error", "Failed to delete vendor from server", "error");
        }
      }
    });
  };

  // Approval handler function
  const handleApprove = (vendor: Vendor) => {
    setSelectedVendorForApproval(vendor);
    setApprovalModalOpen(true);
  };

  // Final approval submission
  const handleFinalApprove = async () => {
    if (!selectedVendorForApproval) return;

    try {
      const formData = new FormData();
      formData.append("status", "active");

      // Use updateVendor method
      await vendorService.updateVendor(selectedVendorForApproval.id, formData);
      
      Swal.fire("Success", "Vendor approved successfully!", "success");
      setApprovalModalOpen(false);
      fetchVendors(); // Refresh list
    } catch (error) {
      console.error("Approval error:", error);
      Swal.fire("Error", "Failed to approve vendor", "error");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const uiToBackend = { 
      "Active": "active", 
      "Inactive": "inactive", 
      "Pending Verification": "pending" 
    };
    const newUiStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const newBackendStatus = uiToBackend[newUiStatus as keyof typeof uiToBackend] || newUiStatus.toLowerCase();

    // Type assertion to fix TypeScript error
    const updatedVendors = vendors.map(v => 
      v.id === id ? { ...v, status: newUiStatus as "Active" | "Inactive" | "Pending Verification" } : v
    );
    
    // Optimistic UI
    setVendors(updatedVendors);

    try {
      const formData = new FormData();
      formData.append("status", newBackendStatus);
      // call update endpoint using updateVendor
      await vendorService.updateVendor(id, formData);
      // optionally re-fetch list
      await fetchVendors();
    } catch (err) {
      console.error("Toggle status error:", err);
      Swal.fire("Error", "Failed to update vendor status", "error");
      // rollback UI
      setVendors(vendors.map(v => 
        v.id === id ? { ...v, status: currentStatus as "Active" | "Inactive" | "Pending Verification" } : v
      ));
    }
  };

  const formik = useFormik({
    initialValues: {
      businessName: editingVendor?.businessName || "",
      ownerName: editingVendor?.ownerName || "",
      businessType: editingVendor?.businessType || "Manufacturer",
      businessCategory: editingVendor?.businessCategory || "Fashion",
      gstNo: editingVendor?.gstNo || "",
      email: editingVendor?.email || "",
      mobile: editingVendor?.mobile || "",
      alternateNumber: editingVendor?.alternateNumber || "",
      businessAddress: editingVendor?.businessAddress || "",
      locationLink: editingVendor?.locationLink || "",
      bankAccountHolderName: editingVendor?.bankAccountHolderName || "",
      bankAccountNo: editingVendor?.bankAccountNo || "",
      ifsc: editingVendor?.ifsc || "",
      bankName: editingVendor?.bankName || "",
      upiId: editingVendor?.upiId || "",
      paymentSettlementPreference: editingVendor?.paymentSettlementPreference || "Weekly",
      businessRegistrationImage: null as File | null,
      gstCertificate: null as File | null,
      panCard: null as File | null,
      identityProof: null as File | null,
      cancelledCheque: null as File | null,
      logo: null as File | null,
      banner: null as File | null,
      status: editingVendor?.status || "Pending Verification",
    },
    enableReinitialize: true,
    validationSchema: VendorSchema,

    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = new FormData();  
        
        // ✅ Field mapping (frontend -> backend)
        formData.append("business_name", values.businessName);
        formData.append("owner_name", values.ownerName);
        formData.append("business_type", values.businessType);
        formData.append("business_category", values.businessCategory);
        formData.append("gst_no", values.gstNo);
        formData.append("email", values.email);
        formData.append("phone", values.mobile);
        formData.append("address", values.businessAddress);
        formData.append("bank_account_holder_name", values.bankAccountHolderName);
        formData.append("bank_account_no", values.bankAccountNo);
        formData.append("ifsc", values.ifsc);
        formData.append("bank_name", values.bankName);
        formData.append("upi_id", values.upiId || "");
        formData.append("payment_settlement_preference", values.paymentSettlementPreference);
        formData.append("status", values.status);

        // ✅ Attach files (if any)
        if (values.businessRegistrationImage)
          formData.append("licence_file", values.businessRegistrationImage);
        if (values.gstCertificate)
          formData.append("gst_certificate", values.gstCertificate);
        if (values.panCard)
          formData.append("id_proof", values.panCard);
        if (values.identityProof)
          formData.append("id_proof", values.identityProof);
        if (values.cancelledCheque)
          formData.append("cancelled_cheque", values.cancelledCheque);
        if (values.logo)
          formData.append("logo", values.logo);
        if (values.banner)
          formData.append("banner", values.banner);

        // ✅ Backend call (update or create)
        if (editingVendor) {
          // Use updateVendor method
          await vendorService.updateVendor(editingVendor.id, formData);
          Swal.fire("Updated", `"${values.businessName}" updated successfully!`, "success");
        } else {
          // Use createVendor method
          await vendorService.createVendor(formData);
          Swal.fire("Added", `"${values.businessName}" added successfully!`, "success");
        }

        // ✅ Refresh vendor list
        await fetchVendors();
        setModalOpen(false);
        formik.resetForm();
      } catch (error: any) {
        console.error("Submit error:", error);
        Swal.fire("Error", "Failed to save vendor", "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const columns = [
    { key: "businessName", label: "Business Name" },
    { key: "ownerName", label: "Owner Name" },
    { key: "businessType", label: "Business Type" },
    {
      key: "status",
      label: "Status",
      render: (item: Vendor) => (
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-semibold ${
              item.status === "Active" ? "text-green-700" : 
              item.status === "Pending Verification" ? "text-yellow-700" : "text-red-700"
            }`}
          >
            {item.status}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: Vendor) => (
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <button
            onClick={() => handleEdit(item)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Edit
          </button>
          
          {/* Delete Button */}
          <button
            onClick={() => handleDelete(item)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Delete
          </button>
          
          {/* Approval Button - Only show for pending vendors */}
          {item.status === "Pending Verification" && (
            <button
              onClick={() => handleApprove(item)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <DataTable
        title="Product Vendors"
        data={vendors}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Product Vendor"
      />

      {/* Existing Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingVendor ? "Edit Product Vendor" : "Add Product Vendor"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* BUSINESS DETAILS */}
              <h3 className="block mb-1 font-medium mt-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">
                    Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="Business Name"
                    name="businessName"
                    value={formik.values.businessName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.businessName && formik.errors.businessName
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="Owner Name"
                    name="ownerName"
                    value={formik.values.ownerName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.ownerName && formik.errors.ownerName
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formik.values.businessType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.businessType && formik.errors.businessType
                        ? "customInputError"
                        : "customInput"
                    }`}
                  >
                    <option>Manufacturer</option>
                    <option>Wholesaler</option>
                    <option>Retailer</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Business Category
                  </label>
                  <select
                    name="businessCategory"
                    value={formik.values.businessCategory}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.businessCategory &&
                      formik.errors.businessCategory
                        ? "customInputError"
                        : "customInput"
                    }`}
                  >
                    <option>Fashion</option>
                    <option>Grocery</option>
                    <option>Electronic</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">GST No.</label>
                  <input
                    type="text"
                    placeholder="GST No."
                    name="gstNo"
                    value={formik.values.gstNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.gstNo && formik.errors.gstNo
                        ? "customInputError"
                        : "customInput"
                    }`}
                  />
                </div>
              </div>

              {/* CONTACT INFO */}
              <h3 className="block mb-1 font-medium mt-4">Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">
                    Email (Login Email)
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.email && formik.errors.email
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.mobile && formik.errors.mobile
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Alternate Number
                  </label>
                  <input
                    type="text"
                    placeholder="Alternate Number"
                    name="alternateNumber"
                    value={formik.values.alternateNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.alternateNumber &&
                      formik.errors.alternateNumber
                        ? "customInputError"
                        : "customInput"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Business Address
                  </label>
                  <input
                    type="text"
                    placeholder="Business Address"
                    name="businessAddress"
                    value={formik.values.businessAddress}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.businessAddress &&
                      formik.errors.businessAddress
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Business Location Link
                  </label>
                  <input
                    type="text"
                    placeholder="Business Location Link"
                    name="locationLink"
                    value={formik.values.locationLink}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.locationLink && formik.errors.locationLink
                        ? "customInputError"
                        : "customInput"
                    }`}
                  />
                </div>
              </div>

              {/* BANK & PAYMENT DETAILS */}
              <h3 className="block mb-1 font-medium mt-4">
                Bank & Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    name="bankAccountHolderName"
                    value={formik.values.bankAccountHolderName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.bankAccountHolderName &&
                      formik.errors.bankAccountHolderName
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    name="bankAccountNo"
                    value={formik.values.bankAccountNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.bankAccountNo &&
                      formik.errors.bankAccountNo
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">IFSC</label>
                  <input
                    type="text"
                    placeholder="IFSC"
                    name="ifsc"
                    value={formik.values.ifsc}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.ifsc && formik.errors.ifsc
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Bank Name & Branch
                  </label>
                  <input
                    type="text"
                    placeholder="Bank Name & Branch"
                    name="bankName"
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.bankName && formik.errors.bankName
                        ? "customInputError"
                        : "customInput"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">UPI ID</label>
                  <input
                    type="text"
                    placeholder="UPI ID"
                    name="upiId"
                    value={formik.values.upiId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.upiId && formik.errors.upiId
                        ? "customInputError"
                        : "customInput"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Payment Settlement Preference
                  </label>
                  <select
                    name="paymentSettlementPreference"
                    value={formik.values.paymentSettlementPreference}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border p-2 rounded-md ${
                      formik.touched.paymentSettlementPreference &&
                      formik.errors.paymentSettlementPreference
                        ? "customInputError"
                        : "customInput"
                    }`}
                  >
                    <option>Weekly</option>
                    <option>Bi-Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>

              {/* DOCUMENTS UPLOAD */}
              <h3 className="block mb-1 font-medium mt-4">Documents Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    label: "Business Registration Image",
                    name: "businessRegistrationImage",
                  },
                  { label: "GST Certificate", name: "gstCertificate" },
                  { label: "PAN Card", name: "panCard" },
                  { label: "Identity Proof", name: "identityProof" },
                  { label: "Cancelled Cheque", name: "cancelledCheque" },
                  { label: "Logo", name: "logo" },
                  { label: "Banner", name: "banner" },
                ].map((field) => (
                  <div
                    key={field.name}
                    className={field.name === "banner" ? "md:col-span-2" : ""}
                  >
                    <label className="font-semibold text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type="file"
                      name={field.name}
                      onChange={(e) =>
                        formik.setFieldValue(
                          field.name,
                          e.currentTarget.files?.[0] || null
                        )
                      }
                      className={`border p-2 rounded-md customInput w-full ${
                        formik.values[field.name as keyof typeof formik.values]
                          ? "filled"
                          : ""
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* STATUS */}
              <div className="flex items-center gap-2 mt-2">
                <label className="font-semibold text-gray-700">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`border p-2 rounded-md ${
                    formik.touched.status && formik.errors.status
                      ? "customInputError"
                      : "customInput"
                  }`}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending Verification</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer"
                >
                  {editingVendor ? "Update" : "Add"}
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

      {/* ✅ NEW APPROVAL MODAL - Simple Confirmation (Aapke design ke according) */}
      {approvalModalOpen && selectedVendorForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-center">Approve Vendor?</h2>
            
            <p className="text-gray-600 text-center mb-6">
              Do you want to approve <strong>"{selectedVendorForApproval.businessName}"</strong>?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setApprovalModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalApprove}
                className="px-6 py-2 rounded-lg bg-green-600 text-white cursor-pointer hover:bg-green-700"
              >
                Yes, approve!
              </button>
            </div>

            <button
              onClick={() => setApprovalModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVendor;