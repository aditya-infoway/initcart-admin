import { useEffect, useState } from "react";
import DataTable from "../../../components/common/DataTable";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/ecommerce/vendors/";

interface Vendor {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;  
  phone: string;
  password?: string;
  address?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  status: "active" | "inactive" | "pending" | "rejected";
  verification_label: "pending" | "verified" | "rejected";
  created_at?: string;
  vendor_type?: "product" | "service";
  vendor_subtype?: string;
  city?: string;
  state?: string;
  pincode?: string;
  store_logo?: string;
  licence_file?: string;
  gst_certificate?: string;
  id_proof?: string;
}

const VendorSchema = Yup.object().shape({
  vendor_type: Yup.string().required("Business Type is required"),
  vendor_subtype: Yup.string().required("Sub Type is required"),
  business_name: Yup.string().required("Business Name is required"),
  owner_name: Yup.string().required("Owner Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone Number is required"),
  password: Yup.string().when("isEdit", {
    is: (val: boolean) => !val,
    then: (schema: Yup.StringSchema) => schema.required("Password is required"),
    otherwise: (schema: Yup.StringSchema) => schema.notRequired(),
  }),
  address: Yup.string().required("Business Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string().required("Pincode is required"),
  bank_name: Yup.string().required("Bank Name is required"),
  account_number: Yup.string().required("Account Number is required"),
  ifsc_code: Yup.string().required("IFSC code is required"),
});

// Helper function to get error message from Formik
const getFormikError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) return error.join(', ');
  return '';
};

const VendorList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "pending" | "rejected"
  >("all");

  // File states
  const [fileUploads, setFileUploads] = useState({
    businessRegistrationImage: null as File | null,
    gstCertificate: null as File | null,
    storeLogo: null as File | null,
    identityProof: null as File | null,
  });

  // File validation errors
  const [fileErrors, setFileErrors] = useState({
    storeLogo: "",
    identityProof: "",
  });

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
  };

  // Service options
  const serviceOptions = [
    "salon", "gym", "real_estate", "travel_agency", "finance",
    "tech", "hotel", "healthcare", "education", "professional", "restaurant"
  ];

  // 🔄 Fetch Vendors
  const loadVendors = async () => {
    try {
      const response = await axios.get(API_BASE_URL, authHeader);
      let data = response.data;
      
      if (filterStatus !== "all") {
        data = data.filter(
          (v: Vendor) =>
            v.status === filterStatus ||
            v.verification_label === filterStatus
        );
      }
      setVendors(data);
    } catch (error) {
      Swal.fire("Error", "Failed to load vendors", "error");
    }
  };

  useEffect(() => {
    loadVendors();
  }, [filterStatus]);

  const handleEdit = async (item: Vendor) => {
    try {
      const res = await axios.get(`${API_BASE_URL}${item.id}/`, authHeader);
      const fullVendor = mapServerToClient(res.data);
      setEditingVendor(fullVendor);
      
      // Reset file uploads when opening modal
      setFileUploads({
        businessRegistrationImage: null,
        gstCertificate: null,
        storeLogo: null,
        identityProof: null,
      });
      setFileErrors({
        storeLogo: "",
        identityProof: "",
      });
      setModalOpen(true);
    } catch (error) {
      Swal.fire("Error", "Failed to load vendor details", "error");
    }
  };

  const handleDelete = (item: Vendor) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.business_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}${item.id}/`, authHeader);
          Swal.fire("Deleted!", `"${item.business_name}" deleted.`, "success");
          loadVendors();
        } catch {
          Swal.fire("Error", "Failed to delete vendor", "error");
        }
      }
    });
  };

const handleView = async (item: Vendor) => {
  try {
    const res = await axios.get(`${API_BASE_URL}${item.id}/`, authHeader);
    if (res.data) {
      const fullVendor = mapServerToClient(res.data);

      // Helper function to get full URL for media files (same as CreateVendor.tsx)
      const getFullUrl = (mediaPath: string | undefined) => {
        if (!mediaPath) return '#';
        
        if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
          return mediaPath;
        }
        
        const API_BASE_URL = "http://localhost:8000";
        if (mediaPath.startsWith('/media/')) {
          return `${API_BASE_URL}${mediaPath}`;
        }
        
        if (!mediaPath.includes('/')) {
          return `${API_BASE_URL}/media/${mediaPath}`;
        }
        
        return `${API_BASE_URL}${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`;
      };

      // Get vendor type display name (same as CreateVendor.tsx)
      const getVendorTypeDisplay = (type: string | undefined) => {
        if (!type) return 'N/A';
        switch (type.toLowerCase()) {
          case 'product': return 'Product Vendor';
          case 'service': return 'Service Vendor';
          default: return type.charAt(0).toUpperCase() + type.slice(1);
        }
      };

      // FIXED: Convert status string to lowercase for comparison
      const statusClass = fullVendor.status.toLowerCase() === 'active' ? 'text-green-600' : 'text-red-600';
      const displayStatus = fullVendor.status ? fullVendor.status.charAt(0).toUpperCase() + fullVendor.status.slice(1) : 'N/A';

      // Same exact HTML structure as CreateVendor.tsx
      Swal.fire({
        title: `<strong>${fullVendor.business_name}</strong>`,
        html: `
          <div class="space-y-4">
            <!-- Basic Details -->
            <div class="border rounded-lg p-3">
              <h4 class="font-semibold text-gray-800 mb-2">Business Information</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Type:</span>
                  <span class="w-2/3">${getVendorTypeDisplay(fullVendor.vendor_type || '')}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Status:</span>
                  <span class="w-2/3 ${statusClass}">${displayStatus}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Owner:</span>
                  <span class="w-2/3">${fullVendor.owner_name || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Email:</span>
                  <span class="w-2/3">${fullVendor.email || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Phone:</span>
                  <span class="w-2/3">${fullVendor.phone || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Created:</span>
                  <span class="w-2/3">${fullVendor.created_at ? new Date(fullVendor.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div class="border rounded-lg p-3">
              <h4 class="font-semibold text-gray-800 mb-2">Address</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Address:</span>
                  <span class="w-2/3">${fullVendor.address || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">City:</span>
                  <span class="w-2/3">${fullVendor.city || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">State:</span>
                  <span class="w-2/3">${fullVendor.state || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Pincode:</span>
                  <span class="w-2/3">${fullVendor.pincode || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Bank Details -->
            <div class="border rounded-lg p-3">
              <h4 class="font-semibold text-gray-800 mb-2">Bank Details</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Bank Name:</span>
                  <span class="w-2/3">${fullVendor.bank_name || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Account No:</span>
                  <span class="w-2/3">${fullVendor.account_number || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">IFSC Code:</span>
                  <span class="w-2/3">${fullVendor.ifsc_code || 'N/A'}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">UPI ID:</span>
                  <span class="w-2/3">${fullVendor.upi_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div class="border rounded-lg p-3">
              <h4 class="font-semibold text-gray-800 mb-2">Documents</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">License:</span>
                  <span class="w-2/3">
                    ${fullVendor.licence_file ? 
                      `<a href="${getFullUrl(fullVendor.licence_file)}" target="_blank" class="text-blue-600">View</a>` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">GST:</span>
                  <span class="w-2/3">
                    ${fullVendor.gst_certificate ? 
                      `<a href="${getFullUrl(fullVendor.gst_certificate)}" target="_blank" class="text-blue-600">View</a>` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">ID Proof:</span>
                  <span class="w-2/3">
                    ${fullVendor.id_proof ? 
                      `<a href="${getFullUrl(fullVendor.id_proof)}" target="_blank" class="text-blue-600">View</a>` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Store Logo:</span>
                  <span class="w-2/3">
                    ${fullVendor.store_logo ? 
                      `<a href="${getFullUrl(fullVendor.store_logo)}" target="_blank" class="text-blue-600">View</a>` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Close",
        width: '650px',
        showCloseButton: true
      });
    }
  } catch (error: any) {
    console.error("Error loading vendor details for view:", error);
    // FIXED: Convert status string to lowercase for comparison
    const statusClass = item.status.toLowerCase() === 'active' ? 'text-green-600' : 'text-red-600';
    const displayStatus = item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A';
    
    // Same fallback view as CreateVendor.tsx
    Swal.fire({
      title: `<strong>${item.business_name}</strong>`,
      html: `
        <div class="space-y-3">
          <div class="border rounded p-3">
            <div class="grid grid-cols-2 gap-3">
              <div><strong>Type:</strong> ${item.vendor_type ? item.vendor_type.charAt(0).toUpperCase() + item.vendor_type.slice(1) : 'N/A'}</div>
              <div><strong>Status:</strong> <span class="${statusClass}">${displayStatus}</span></div>
              <div><strong>Owner:</strong> ${item.owner_name}</div>
              <div><strong>Email:</strong> ${item.email}</div>
              <div><strong>Phone:</strong> ${item.phone}</div>
              <div><strong>Created:</strong> ${item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
          
          <div class="border rounded p-3">
            <div class="grid grid-cols-2 gap-3">
              <div><strong>Address:</strong> ${item.address || 'N/A'}</div>
              <div><strong>City:</strong> ${item.city || 'N/A'}</div>
              <div><strong>State:</strong> ${item.state || 'N/A'}</div>
              <div><strong>Pincode:</strong> ${item.pincode || 'N/A'}</div>
            </div>
          </div>
          
          <div class="border rounded p-3">
            <div class="grid grid-cols-2 gap-3">
              <div><strong>Bank Name:</strong> ${item.bank_name || 'N/A'}</div>
              <div><strong>Account No:</strong> ${item.account_number || 'N/A'}</div>
              <div><strong>IFSC Code:</strong> ${item.ifsc_code || 'N/A'}</div>
              <div><strong>UPI ID:</strong> ${item.upi_id || 'N/A'}</div>
            </div>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      width: '600px'
    });
  }
};

  // File validation function
  const validateFiles = () => {
    const errors = {
      storeLogo: "",
      identityProof: "",
    };

    if (!fileUploads.storeLogo && !editingVendor?.store_logo) {
      errors.storeLogo = "Store logo is required";
    }

    if (!fileUploads.identityProof) {
      errors.identityProof = "ID proof is required";
    }

    setFileErrors(errors);
    return !errors.storeLogo && !errors.identityProof;
  };

  // Add missing handleFileChange function
  const handleFileChange = (fieldName: string, file: File | null) => {
    setFileUploads(prev => ({
      ...prev,
      [fieldName]: file
    }));

    if (file && fieldName === 'storeLogo') {
      setFileErrors(prev => ({
        ...prev,
        storeLogo: ""
      }));
    }

    if (file && fieldName === 'identityProof') {
      setFileErrors(prev => ({
        ...prev,
        identityProof: ""
      }));
    }
  };

  const formik = useFormik({
    initialValues: {
      vendor_type: editingVendor?.vendor_type || "",
      vendor_subtype: editingVendor?.vendor_subtype || "",
      business_name: editingVendor?.business_name || "",
      owner_name: editingVendor?.owner_name || "",
      email: editingVendor?.email || "",
      phone: editingVendor?.phone || "",
      password: "",
      address: editingVendor?.address || "",
      city: editingVendor?.city || "",
      state: editingVendor?.state || "",
      pincode: editingVendor?.pincode || "",
      bank_name: editingVendor?.bank_name || "",
      account_number: editingVendor?.account_number || "",
      ifsc_code: editingVendor?.ifsc_code || "",
      upi_id: editingVendor?.upi_id || "",
      status: editingVendor?.status || "active",
      verification_label: editingVendor?.verification_label || "pending",
      isEdit: !!editingVendor,
    },
    enableReinitialize: true,
    validationSchema: VendorSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("vendor_type", values.vendor_type);
        formData.append("vendor_subtype", values.vendor_subtype);
        formData.append("business_name", values.business_name);
        formData.append("owner_name", values.owner_name);
        formData.append("email", values.email);
        formData.append("phone", values.phone);

        if (values.password) formData.append("password", values.password);

        formData.append("address", values.address);
        formData.append("city", values.city);
        formData.append("state", values.state);
        formData.append("pincode", values.pincode);

        formData.append("bank_name", values.bank_name);
        formData.append("account_number", values.account_number);
        formData.append("ifsc_code", values.ifsc_code);
        if (values.upi_id) formData.append("upi_id", values.upi_id);

        formData.append("status", values.status);
        formData.append("verification_label", values.verification_label);

        // File uploads - Only append if file exists
        if (fileUploads.businessRegistrationImage) {
          formData.append("licence_file", fileUploads.businessRegistrationImage);
        }
        if (fileUploads.gstCertificate) {
          formData.append("gst_certificate", fileUploads.gstCertificate);
        }
        if (fileUploads.storeLogo) {
          formData.append("store_logo", fileUploads.storeLogo);
        }
        if (fileUploads.identityProof) {
          formData.append("id_proof", fileUploads.identityProof);
        }

        await axios.put(`${API_BASE_URL}${editingVendor?.id}/`, formData, {
          ...authHeader,
          headers: {
            ...authHeader.headers,
            "Content-Type": "multipart/form-data",
          }
        });

        Swal.fire({
          icon: "success",
          title: "Vendor Updated",
          text: `"${values.business_name}" updated successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
        
        setModalOpen(false);
        resetForm();
        setFileUploads({
          businessRegistrationImage: null,
          gstCertificate: null,
          storeLogo: null,
          identityProof: null,
        });
        loadVendors();
      } catch (error: any) {
        console.error("Vendor update error:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update vendor.";
        
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  function mapServerToClient(v: any): Vendor {
    return {
      id: v.id,
      business_name: v.business_name ?? "",
      owner_name: v.owner_name ?? "",
      email: v.email ?? "",
      phone: v.phone ?? "",
      password: "",
      address: v.address ?? "",
      city: v.city ?? "",
      state: v.state ?? "",
      pincode: v.pincode ?? "",
      bank_name: v.bank_name ?? "",
      account_number: v.account_number ?? "",
      ifsc_code: v.ifsc_code ?? "",
      upi_id: v.upi_id ?? "",
      status: v.status?.toLowerCase() === "active" ? "active" : 
              v.status?.toLowerCase() === "inactive" ? "inactive" : 
              v.status?.toLowerCase() === "pending" ? "pending" : "rejected",
      verification_label: v.verification_label?.toLowerCase() === "verified" ? "verified" : 
                         v.verification_label?.toLowerCase() === "pending" ? "pending" : "rejected",
      created_at: v.created_at,
      vendor_type: v.vendor_type,
      vendor_subtype: v.vendor_subtype,
      store_logo: v.store_logo,
      licence_file: v.licence_file,
      gst_certificate: v.gst_certificate,
      id_proof: v.id_proof,

    };
  }

  return (
    <div className="">
      {/* 🔽 Filter Tabs */}
      <div className="flex gap-3 mb-3">
        {["all", "active", "pending", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s as any)}
            className={`px-3 py-1 rounded-md text-sm font-semibold ${
              filterStatus === s
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {s === "all"
              ? "All Vendors"
              : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        title="Vendor List"
        data={vendors}
        columns={[
          {
            key: "store_logo",
            label: "Logo",
            render: (item: Vendor) => (
              item.store_logo ? (
                <img
                  src={item.store_logo}
                  alt="Store Logo"
                  className="h-10 w-10 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=No+Logo';
                  }}
                />
              ) : (
                <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Logo</span>
                </div>
              )
            ),
          },
          { key: "business_name", label: "Business Name" },
          { key: "owner_name", label: "Owner Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          {
            key: "vendor_type",
            label: "Type",
            render: (item: Vendor) => (
              <span className="capitalize">
                {item.vendor_type || "-"} {item.vendor_subtype ? `- ${item.vendor_subtype}` : ""}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item: Vendor) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "active"
                    ? "text-green-700"
                    : item.status === "pending"
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            ),
          },
          {
            key: "verification_label",
            label: "Verification",
            render: (item: Vendor) => (
              <span
                className={`text-sm font-semibold ${
                  item.verification_label === "verified"
                    ? "text-green-700"
                    : item.verification_label === "pending"
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {item.verification_label.charAt(0).toUpperCase() +
                  item.verification_label.slice(1)}
              </span>
            ),
          },
        ]}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ✏️ Edit Modal - CreateVendor jaisa enhanced modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">Edit Vendor</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

              {/* BUSINESS TYPE & SUBTYPE */}
              <h3 className="block mb-1 font-medium mt-2">Business Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Select Business Type</label>
                  <select
                    name="vendor_type"
                    value={formik.values.vendor_type}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue("vendor_subtype", "");
                    }}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${formik.touched.vendor_type && formik.errors.vendor_type ? "customSelectError" : formik.values.vendor_type ? "filled" : ""}`}
                  >
                    <option value="">Select Type</option>
                    <option value="product">Product Vendor</option>
                    <option value="service">Service Vendor</option>
                  </select>
                  {formik.touched.vendor_type && formik.errors.vendor_type && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.vendor_type)}</div>
                  )}
                </div>

                {formik.values.vendor_type && (
                  <div>
                    <label className="font-semibold text-gray-700">
                      {formik.values.vendor_type === "product" ? "Product Vendor Type" : "Service Category"}
                    </label>
                    <select
                      name="vendor_subtype"
                      value={formik.values.vendor_subtype}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`customSelect w-full ${formik.touched.vendor_subtype && formik.errors.vendor_subtype ? "customSelectError" : formik.values.vendor_subtype ? "filled" : ""}`}
                    >
                      <option value="">Select Sub Type</option>
                      {formik.values.vendor_type === "product" ? (
                        <>
                          <option value="retailer">Retailer</option>
                          <option value="wholesaler">Wholesaler</option>
                        </>
                      ) : (
                        serviceOptions.map((service) => (
                          <option key={service} value={service}>
                            {service.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))
                      )}
                    </select>
                    {formik.touched.vendor_subtype && formik.errors.vendor_subtype && (
                      <div className="text-red-500 text-sm">{getFormikError(formik.errors.vendor_subtype)}</div>
                    )}
                  </div>
                )}
              </div>

              {/* BUSINESS DETAILS */}
              <h3 className="block mb-1 font-medium mt-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Business Name</label>
                  <input
                    type="text"
                    placeholder="Business Name"
                    name="business_name"
                    value={formik.values.business_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.business_name && formik.errors.business_name
                        ? "customInputError"
                        : formik.values.business_name
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.business_name && formik.errors.business_name && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.business_name)}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Owner Name</label>
                  <input
                    type="text"
                    placeholder="Owner Name"
                    name="owner_name"
                    value={formik.values.owner_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.owner_name && formik.errors.owner_name
                        ? "customInputError"
                        : formik.values.owner_name
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.owner_name && formik.errors.owner_name && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.owner_name)}</div>
                  )}
                </div>
              </div>

              {/* CONTACT INFO */}
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
                    className={`customInput w-full ${formik.touched.email && formik.errors.email
                        ? "customInputError"
                        : formik.values.email
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.email)}</div>
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
                    className={`customInput w-full ${formik.touched.phone && formik.errors.phone
                        ? "customInputError"
                        : formik.values.phone
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.phone)}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Password (leave empty to keep current)"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.password && formik.errors.password
                        ? "customInputError"
                        : formik.values.password
                          ? "filled"
                          : ""
                      }`}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.password)}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Address</label>
                  <textarea
                    placeholder="Address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.address && formik.errors.address
                        ? "customInputError"
                        : formik.values.address
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.address && formik.errors.address && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.address)}</div>
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
                    className={`customInput w-full ${formik.touched.city && formik.errors.city
                        ? "customInputError"
                        : formik.values.city
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.city && formik.errors.city && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.city)}</div>
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
                    className={`customInput w-full ${formik.touched.state && formik.errors.state
                        ? "customInputError"
                        : formik.values.state
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.state && formik.errors.state && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.state)}</div>
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
                    className={`customInput w-full ${formik.touched.pincode && formik.errors.pincode
                        ? "customInputError"
                        : formik.values.pincode
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.pincode && formik.errors.pincode && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.pincode)}</div>
                  )}
                </div>
              </div>

              {/* BANK DETAILS */}
              <h3 className="block mb-1 font-medium mt-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    name="bank_name"
                    value={formik.values.bank_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.bank_name && formik.errors.bank_name
                        ? "customInputError"
                        : formik.values.bank_name
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.bank_name && formik.errors.bank_name && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.bank_name)}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Account Number</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    name="account_number"
                    value={formik.values.account_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.account_number && formik.errors.account_number
                        ? "customInputError"
                        : formik.values.account_number
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.account_number && formik.errors.account_number && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.account_number)}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    name="ifsc_code"
                    value={formik.values.ifsc_code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.ifsc_code && formik.errors.ifsc_code
                        ? "customInputError"
                        : formik.values.ifsc_code
                          ? "filled"
                          : ""
                      }`}
                    required
                  />
                  {formik.touched.ifsc_code && formik.errors.ifsc_code && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.ifsc_code)}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">UPI ID</label>
                  <input
                    type="text"
                    placeholder="UPI ID"
                    name="upi_id"
                    value={formik.values.upi_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.values.upi_id ? "filled" : ""}`}
                  />
                </div>
              </div>

              {/* DOCUMENTS UPLOAD */}
              <h3 className="block mb-1 font-medium mt-4">Documents Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "License", name: "businessRegistrationImage", required: false },
                  { label: "GST Certificate", name: "gstCertificate", required: false },
                  { label: "ID Proof", name: "identityProof", required: true },
                  { label: "Store Logo", name: "storeLogo", required: true },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="font-semibold text-gray-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="file"
                      name={field.name}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] || null;
                        handleFileChange(field.name, file);
                      }}
                      className={`customInput w-full ${fileUploads[field.name as keyof typeof fileUploads] ? "filled" : ""
                        } ${field.required && fileErrors[field.name as keyof typeof fileErrors] ? "customInputError" : ""
                        }`}
                    />
                    {fileUploads[field.name as keyof typeof fileUploads] && (
                      <div className="text-green-600 text-sm mt-1">
                        File selected: {fileUploads[field.name as keyof typeof fileUploads]?.name}
                      </div>
                    )}
                    {editingVendor?.store_logo && field.name === 'storeLogo' && !fileUploads.storeLogo && (
                      <div className="text-blue-600 text-sm mt-1">
                        Current logo: <img src={editingVendor.store_logo} alt="Current Logo" className="h-8 w-8 object-cover inline ml-2" />
                      </div>
                    )}
                    {field.required && fileErrors[field.name as keyof typeof fileErrors] && (
                      <div className="text-red-500 text-sm mt-1">
                        {fileErrors[field.name as keyof typeof fileErrors]}
                      </div>
                    )}
                    {editingVendor && field.required && (
                      <div className="text-blue-600 text-sm mt-1">
                        Current file will be kept if no new file is selected
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* STATUS & VERIFICATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="font-semibold text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${formik.touched.status && formik.errors.status
                        ? "customSelectError"
                        : formik.values.status
                          ? "filled"
                          : ""
                      }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <div className="text-red-500 text-sm">{getFormikError(formik.errors.status)}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Verification</label>
                  <select
                    name="verification_label"
                    value={formik.values.verification_label}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${formik.touched.verification_label && formik.errors.verification_label
                        ? "customSelectError"
                        : formik.values.verification_label
                          ? "filled"
                          : ""
                      }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="customBtn">
                  Cancel
                </button>
                <button type="submit" className="customBtn" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Vendor"}
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

export default VendorList;