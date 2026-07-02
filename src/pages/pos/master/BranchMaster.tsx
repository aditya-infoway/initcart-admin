import { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import apiClient from "../../../api/apiClient";

interface Branch {
  id: number;
  branch_type: "fashion" | "mart" | "electronics";
  branch_name: string;
  owner_name: string;
  email: string;
  phone: string;
  password?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  licence_file?: string;
  gst_certificate?: string;
  branch_logo?: string;
  id_proof?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

const BranchSchema = Yup.object().shape({
  branch_type: Yup.string().required("Branch Type is required"),
  branch_name: Yup.string().required("Branch Name is required"),
  owner_name: Yup.string().required("Owner Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone Number is required"),
  password: Yup.string().when("isEdit", {
    is: true,
    // For edit mode - password is optional but if provided must meet requirements
    then: (schema) => schema
      .notRequired()
      .test('min-length-if-provided', 'Password must be at least 6 characters', (value) => {
        if (!value || value.length === 0) return true;
        return value.length >= 6;
      })
      .test('has-letter-if-provided', 'Password must contain at least one letter', (value) => {
        if (!value || value.length === 0) return true;
        return /[a-zA-Z]/.test(value);
      })
      .test('has-number-if-provided', 'Password must contain at least one number', (value) => {
        if (!value || value.length === 0) return true;
        return /[0-9]/.test(value);
      }),
    // For add mode - password is required
    otherwise: (schema) => schema
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .matches(/[0-9]/, "Password must contain at least one number"),
  }),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string().required("Pincode is required"),
  bank_name: Yup.string().required("Bank Name is required"),
  account_number: Yup.string().required("Account Number is required"),
  ifsc_code: Yup.string().required("IFSC code is required"),
});

const BranchMaster = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // File states
  const [fileUploads, setFileUploads] = useState({
    licence_file: null as File | null,
    gst_certificate: null as File | null,
    branch_logo: null as File | null,
    id_proof: null as File | null,
  });

  const [fileErrors, setFileErrors] = useState({
    branch_logo: "",
    id_proof: "",
  });

  // LOAD BRANCHES
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setDataLoading(true);
    try {
      const res = await apiClient.get("pos/branches/");

      if (res.data.success) {
        const mapped = res.data.data.map((b: any) => mapServerToClient(b));
        setBranches(mapped);
      }
    } catch (err: any) {
      console.error("Branch load error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to load branches",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBranch(null);
    setFileUploads({
      licence_file: null,
      gst_certificate: null,
      branch_logo: null,
      id_proof: null,
    });
    setFileErrors({
      branch_logo: "",
      id_proof: "",
    });
    formik.resetForm();
    setModalOpen(true);
  };

  const handleEdit = async (item: Branch) => {
    try {
      const res = await apiClient.get(`pos/branches/${item.id}/`);
      if (res.data.success) {
        const fullBranch = mapServerToClient(res.data.data);
        setEditingBranch(fullBranch);
        setFileUploads({
          licence_file: null,
          gst_certificate: null,
          branch_logo: null,
          id_proof: null,
        });
        setFileErrors({
          branch_logo: "",
          id_proof: "",
        });
        setModalOpen(true);
      }
    } catch (error: any) {
      console.error("Error loading branch:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to load branch details.",
      });
    }
  };

  const handleDelete = async (item: Branch) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      html: `<strong>${item.branch_name}</strong> will be permanently deleted!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!confirm.isConfirmed) return;

    try {
      // Optimistically update UI
      const previousBranches = [...branches];
      setBranches(prev => prev.filter(branch => branch.id !== item.id));

      // Try API call
      const res = await apiClient.delete(`pos/branches/${item.id}/`);

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${item.branch_name} has been deleted.`,
          timer: 2000,
          showConfirmButton: false
        });

      } else {
        // Revert UI if API failed
        setBranches(previousBranches);
        throw new Error(res.data.message || "Failed to delete branch");
      }

    } catch (err: any) {
      console.error("Delete error:", err);

      // If branch not found (already deleted)
      if (err.response?.status === 404) {
        // Keep the UI updated (branch already removed)
        Swal.fire({
          icon: "info",
          title: "Already Removed",
          text: "This branch was already deleted.",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      // Network or other errors
      if (err.code === 'ERR_NETWORK') {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Cannot connect to server. Please check your connection.",
          confirmButtonText: "OK"
        });
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err.response?.data?.message || "Failed to delete branch. Please try again.",
        confirmButtonText: "OK"
      });
    }
  };

  const handleView = async (item: Branch) => {
    try {
      const res = await apiClient.get(`pos/branches/${item.id}/`);
      if (res.data.success) {
        const fullBranch = mapServerToClient(res.data.data);

        Swal.fire({
          title: `<strong>${fullBranch.branch_name}</strong>`,
          html: `
            <div class="space-y-4">
              <!-- Basic Details -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Basic Information</h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Type:</span>
                    <span class="w-2/3">${getBranchTypeDisplay(fullBranch.branch_type)}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Status:</span>
                    <span class="w-2/3 ${fullBranch.status === 'active' ? 'text-green-600' : 'text-red-600'}">${fullBranch.status}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Owner:</span>
                    <span class="w-2/3">${fullBranch.owner_name || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Email:</span>
                    <span class="w-2/3">${fullBranch.email || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Phone:</span>
                    <span class="w-2/3">${fullBranch.phone || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Created:</span>
                    <span class="w-2/3">${fullBranch.created_at ? new Date(fullBranch.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Address -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Address</h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Address:</span>
                    <span class="w-2/3">${fullBranch.address || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">City:</span>
                    <span class="w-2/3">${fullBranch.city || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">State:</span>
                    <span class="w-2/3">${fullBranch.state || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Pincode:</span>
                    <span class="w-2/3">${fullBranch.pincode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Bank Details -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Bank Details</h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Bank Name:</span>
                    <span class="w-2/3">${fullBranch.bank_name || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Account No:</span>
                    <span class="w-2/3">${fullBranch.account_number || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">IFSC Code:</span>
                    <span class="w-2/3">${fullBranch.ifsc_code || 'N/A'}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">UPI ID:</span>
                    <span class="w-2/3">${fullBranch.upi_id || 'N/A'}</span>
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
                      ${fullBranch.licence_file ?
              `<a href="${getFullUrl(fullBranch.licence_file)}" target="_blank" class="text-blue-600">View</a>` :
              'N/A'
            }
                    </span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold  text-gray-700">GST:</span>
                    <span class="w-2/3">
                      ${fullBranch.gst_certificate ?
              `<a href="${getFullUrl(fullBranch.gst_certificate)}" target="_blank" class="text-blue-600">View</a>` :
              'N/A'
            }
                    </span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">ID Proof:</span>
                    <span class="w-2/3">
                      ${fullBranch.id_proof ?
              `<a href="${getFullUrl(fullBranch.id_proof)}" target="_blank" class="text-blue-600">View</a>` :
              'N/A'
            }
                    </span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Logo:</span>
                    <span class="w-2/3">
                      ${fullBranch.branch_logo ?
              `<a href="${getFullUrl(fullBranch.branch_logo)}" target="_blank" class="text-blue-600">View</a>` :
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
      console.error("Error loading branch details for view:", error);
      // Fallback view
      Swal.fire({
        title: `<strong>${item.branch_name}</strong>`,
        html: `
          <div class="space-y-3">
            <div class="border rounded p-3">
              <div class="grid grid-cols-2 gap-3">
                <div><strong>Type:</strong> ${getBranchTypeDisplay(item.branch_type)}</div>
                <div><strong>Status:</strong> <span class="${item.status === 'active' ? 'text-green-600' : 'text-red-600'}">${item.status}</span></div>
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

  // File handle function
  const handleFileChange = (fieldName: string, file: File | null) => {
    setFileUploads(prev => ({
      ...prev,
      [fieldName]: file
    }));

    // Clear file error when file is selected
    if (file) {
      if (fieldName === 'branch_logo') {
        setFileErrors(prev => ({ ...prev, branch_logo: "" }));
      } else if (fieldName === 'id_proof') {
        setFileErrors(prev => ({ ...prev, id_proof: "" }));
      }
    }
  };

  // File validation function
  const validateFiles = () => {
    const errors = {
      branch_logo: "",
      id_proof: "",
    };

    if (!fileUploads.branch_logo && !editingBranch?.branch_logo && !editingBranch) {
      errors.branch_logo = "Branch logo is required";
    }

    if (!fileUploads.id_proof && !editingBranch?.id_proof && !editingBranch) {
      errors.id_proof = "ID proof is required";
    }

    setFileErrors(errors);
    return !errors.branch_logo && !errors.id_proof;
  };

  // Add handleStatusChange function
  const handleStatusChange = async (item: Branch) => {
    try {
      const newStatus = item.status === 'active' ? 'inactive' : 'active';

      const result = await Swal.fire({
        title: 'Change Status?',
        text: `Are you sure you want to change status to ${newStatus}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change it!'
      });

      if (result.isConfirmed) {
        const response = await apiClient.patch(`pos/branches/${item.id}/`, {
          status: newStatus
        });

        if (response.data.success) {
          // Update local state
          setBranches(prev => prev.map(branch =>
            branch.id === item.id ? { ...branch, status: newStatus } : branch
          ));

          Swal.fire(
            'Changed!',
            `Status has been changed to ${newStatus}.`,
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Error changing status:', error);
      Swal.fire(
        'Error!',
        'Failed to change status.',
        'error'
      );
    }
  };

  const formik = useFormik({
    initialValues: {
      branch_type: editingBranch?.branch_type || "fashion",
      branch_name: editingBranch?.branch_name || "",
      owner_name: editingBranch?.owner_name || "",
      email: editingBranch?.email || "",
      phone: editingBranch?.phone || "",
      password: "",
      address: editingBranch?.address || "",
      city: editingBranch?.city || "",
      state: editingBranch?.state || "",
      pincode: editingBranch?.pincode || "",
      bank_name: editingBranch?.bank_name || "",
      account_number: editingBranch?.account_number || "",
      ifsc_code: editingBranch?.ifsc_code || "",
      upi_id: editingBranch?.upi_id || "",
      status: editingBranch?.status || "active",
      isEdit: !!editingBranch,
    },
    enableReinitialize: true,
    validationSchema: BranchSchema,
    onSubmit: async (values, { resetForm }) => {
      // File validation before submit
      if (!validateFiles()) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please upload all required documents (ID proof & Branch logo).",
        });
        return;
      }

      setIsLoading(true);
      try {
        const formData = new FormData();

        // Add all form values to FormData
        Object.keys(values).forEach(key => {
          if (key !== 'isEdit' && values[key as keyof typeof values] !== undefined) {
            const value = values[key as keyof typeof values];
            if (value !== null && value !== undefined && value !== '') {
              formData.append(key, value as string);
            }
          }
        });

        // Append files if they exist
        if (fileUploads.licence_file instanceof File) {
          formData.append("licence_file", fileUploads.licence_file);
        }
        if (fileUploads.gst_certificate instanceof File) {
          formData.append("gst_certificate", fileUploads.gst_certificate);
        }
        if (fileUploads.branch_logo instanceof File) {
          formData.append("branch_logo", fileUploads.branch_logo);
        }
        if (fileUploads.id_proof instanceof File) {
          formData.append("id_proof", fileUploads.id_proof);
        }

        let res;
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

        if (editingBranch) {
          console.log(`Updating branch ID: ${editingBranch.id}`);
          // Use PATCH instead of PUT for partial updates
          res = await apiClient.patch(
            `pos/branches/${editingBranch.id}/`,
            formData,
            config
          );
        } else {
          console.log("Creating new branch");
          res = await apiClient.post(
            "pos/branches/",
            formData,
            config
          );
        }

        console.log("API Response:", res.data);

        if (res.data.success) {
          // IMPORTANT FIX: Check for both response structures
          let branchData;
          if (editingBranch) {
            // Update response has 'data' field
            branchData = mapServerToClient(res.data.data);
          } else {
            // Create response has 'branch' field (as per your serializer)
            branchData = mapServerToClient(res.data.branch || res.data.data);
          }

          Swal.fire({
            icon: "success",
            title: editingBranch ? "Updated" : "Created",
            text: editingBranch ? "Branch updated successfully!" : "Branch created successfully!",
          });

          // Close modal and reset everything
          setModalOpen(false);
          resetForm();
          setEditingBranch(null);
          setFileUploads({
            licence_file: null,
            gst_certificate: null,
            branch_logo: null,
            id_proof: null,
          });
          setFileErrors({
            branch_logo: "",
            id_proof: "",
          });

          // Reload branches to get fresh data with proper ordering
          loadBranches();
        } else {
          throw new Error(res.data.message || "Operation failed");
        }

      } catch (err: any) {
        console.error("Branch save error:", err);
        console.error("Full error response:", err.response?.data);

        // Check for network error first
        if (err.code === 'ERR_NETWORK' || !err.response) {
          Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Cannot connect to server. Please check if Django server is running on http://localhost:8000",
          });
          return;
        }

        if (err.response?.data) {
          const errors = err.response.data;

          // Email duplication error handling
          if (errors.email) {
            Swal.fire({
              icon: "error",
              title: "Email Error",
              text: Array.isArray(errors.email) ? errors.email[0] : errors.email,
            });
            return;
          }

          // Password error
          if (errors.password) {
            Swal.fire({
              icon: "error",
              title: "Password Error",
              text: Array.isArray(errors.password) ? errors.password[0] : "Password validation failed",
            });
            return;
          }

          // Generic validation errors
          if (typeof errors === 'object') {
            const errorMessages = Object.entries(errors)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                } else if (typeof value === 'string') {
                  return `${key}: ${value}`;
                }
                return '';
              })
              .filter(msg => msg !== '')
              .join('<br>');

            if (errorMessages) {
              Swal.fire({
                icon: "error",
                title: "Validation Error",
                html: errorMessages,
              });
              return;
            }
          }
        }

        // Default error
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: err.response?.data?.message || "Something went wrong on the server.",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Update formik when editingBranch changes
  useEffect(() => {
    if (editingBranch) {
      formik.setValues({
        branch_type: editingBranch.branch_type,
        branch_name: editingBranch.branch_name,
        owner_name: editingBranch.owner_name,
        email: editingBranch.email,
        phone: editingBranch.phone,
        password: "",
        address: editingBranch.address || "",
        city: editingBranch.city || "",
        state: editingBranch.state || "",
        pincode: editingBranch.pincode || "",
        bank_name: editingBranch.bank_name || "",
        account_number: editingBranch.account_number || "",
        ifsc_code: editingBranch.ifsc_code || "",
        upi_id: editingBranch.upi_id || "",
        status: editingBranch.status || "active",
        isEdit: true,
      });
    }
  }, [editingBranch]);

  function mapServerToClient(b: any): Branch {
    if (!b) {
      console.error("mapServerToClient received undefined or null data");
      return {} as Branch;
    }

    return {
      id: b.id || 0,
      branch_type: b.branch_type || "fashion",
      branch_name: b.branch_name || "",
      owner_name: b.owner_name || "",
      email: b.email || "",
      phone: b.phone || "",
      address: b.address || "",
      city: b.city || "",
      state: b.state || "",
      pincode: b.pincode || "",
      bank_name: b.bank_name || "",
      account_number: b.account_number || "",
      ifsc_code: b.ifsc_code || "",
      upi_id: b.upi_id || "",
      licence_file: b.licence_file,
      gst_certificate: b.gst_certificate,
      branch_logo: b.branch_logo,
      id_proof: b.id_proof,
      status: b.status || "active",
      created_at: b.created_at,
      updated_at: b.updated_at,
    };
  }

  const getBranchTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      fashion: "Fashion",
      mart: "Mart",
      electronics: "Electronics",
    };
    return types[type] || type;
  };

  const getFullUrl = (url: string | undefined) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  return (
    <div className="">
      <DataTable
        title="Branch Master"
        data={branches}
        columns={[
          {
            key: "branch_logo",
            label: "Logo",
            render: (item: Branch) => (
              item.branch_logo ? (
                <img
                  src={getFullUrl(item.branch_logo)}
                  alt="Branch Logo"
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
          { key: "branch_name", label: "Branch Name" },
          { key: "owner_name", label: "Owner Name" },
          { key: "email", label: "Email ID" },
          { key: "phone", label: "Phone No." },
          {
            key: "branch_type",
            label: "Type",
            render: (item: Branch) => (
              <span className="capitalize">
                {getBranchTypeDisplay(item.branch_type)}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item: Branch) => (
              <button
                onClick={() => handleStatusChange(item)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${item.status === 'active'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
              >
                {item.status}
              </button>
            ),
          },
          {
            key: "created_at",
            label: "Created Date",
            render: (item: Branch) => (
              item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "-"
            ),
          },
        ]}
        onEdit={handleEdit}
        onView={handleView}
        onAdd={handleAdd}
        onDelete={handleDelete}
        addButtonLabel="Add Branch"
        loading={dataLoading}
        onRefresh={loadBranches}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">{editingBranch ? "Edit Branch" : "Add Branch"}</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

              {/* BRANCH TYPE */}
              <h3 className="block mb-1 font-medium mt-2">Branch Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Select Branch Type *</label>
                  <select
                    name="branch_type"
                    value={formik.values.branch_type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${formik.touched.branch_type && formik.errors.branch_type ? "customSelectError" : formik.values.branch_type ? "filled" : ""}`}
                  >
                    <option value="fashion">Fashion</option>
                    <option value="mart">Mart</option>
                    <option value="electronics">Electronics</option>
                  </select>
                  {formik.touched.branch_type && formik.errors.branch_type && (
                    <div className="text-red-500 text-sm">{formik.errors.branch_type}</div>
                  )}
                </div>
              </div>

              {/* BRANCH DETAILS */}
              <h3 className="block mb-1 font-medium mt-2">Branch Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Branch Name *</label>
                  <input
                    type="text"
                    placeholder="Branch Name"
                    name="branch_name"
                    value={formik.values.branch_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.branch_name && formik.errors.branch_name
                      ? "customInputError"
                      : formik.values.branch_name
                        ? "filled"
                        : ""
                      }`}
                    required
                  />
                  {formik.touched.branch_name && formik.errors.branch_name && (
                    <div className="text-red-500 text-sm">{formik.errors.branch_name}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Owner Name *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.owner_name}</div>
                  )}
                </div>
              </div>

              {/* CONTACT INFO */}
              <h3 className="block mb-1 font-medium mt-4">Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Email *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.email}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Phone *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.phone}</div>
                  )}
                </div>

                {/* PASSWORD FIELD - NOW SHOWN IN BOTH ADD AND EDIT MODE */}
                <div>
                  <label className="font-semibold text-gray-700">
                    Password {!editingBranch && "*"}
                    {editingBranch && <span className="text-gray-500 text-xs ml-1">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    placeholder={editingBranch ? "New password (optional)" : "Password (min 6 chars, letters & numbers)"}
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
                    required={!editingBranch}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-sm">{formik.errors.password}</div>
                  )}
                  {!formik.errors.password && formik.values.password && formik.values.password.length < 6 && (
                    <div className="text-orange-500 text-sm">
                      Password should be at least 6 characters
                    </div>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                    {editingBranch
                      ? "Enter new password only if you want to change it"
                      : "Password must be at least 6 characters with letters and numbers"
                    }
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <h3 className="block mb-1 font-medium mt-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="font-semibold text-gray-700">Address *</label>
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
                    rows={3}
                  />
                  {formik.touched.address && formik.errors.address && (
                    <div className="text-red-500 text-sm">{formik.errors.address}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">City *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.city}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">State *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.state}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Pincode *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.pincode}</div>
                  )}
                </div>
              </div>

              {/* BANK DETAILS */}
              <h3 className="block mb-1 font-medium mt-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Bank Name *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.bank_name}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Account Number *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.account_number}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">IFSC Code *</label>
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
                    <div className="text-red-500 text-sm">{formik.errors.ifsc_code}</div>
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
                  { label: "License File", name: "licence_file", required: false, accept: ".pdf,.jpg,.jpeg,.png" },
                  { label: "GST Certificate", name: "gst_certificate", required: false, accept: ".pdf,.jpg,.jpeg,.png" },
                  { label: "ID Proof *", name: "id_proof", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
                  { label: "Branch Logo *", name: "branch_logo", required: true, accept: ".jpg,.jpeg,.png,.webp" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="font-semibold text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type="file"
                      name={field.name}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] || null;
                        handleFileChange(field.name, file);
                      }}
                      accept={field.accept}
                      className={`customInput w-full ${fileUploads[field.name as keyof typeof fileUploads] ? "filled" : ""
                        } ${field.required && fileErrors[field.name as keyof typeof fileErrors] ? "customInputError" : ""
                        }`}
                    />
                    {fileUploads[field.name as keyof typeof fileUploads] && (
                      <div className="text-green-600 text-sm mt-1">
                        File selected: {fileUploads[field.name as keyof typeof fileUploads]?.name}
                      </div>
                    )}
                    {field.required && fileErrors[field.name as keyof typeof fileErrors] && (
                      <div className="text-red-500 text-sm mt-1">
                        {fileErrors[field.name as keyof typeof fileErrors]}
                      </div>
                    )}
                    {editingBranch && editingBranch[field.name as keyof Branch] && (
                      <div className="text-blue-600 text-sm mt-1">
                        <a href={getFullUrl(editingBranch[field.name as keyof Branch] as string)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline">
                          View current file
                        </a> - Upload new to replace
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* STATUS */}
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
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <div className="text-red-500 text-sm">{formik.errors.status}</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingBranch(null);
                    formik.resetForm();
                  }}
                  className="customBtn bg-gray-300 hover:bg-gray-400 text-gray-800"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="customBtn bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingBranch ? "Updating..." : "Creating..."}
                    </span>
                  ) : editingBranch ? "Update Branch" : "Create Branch"}
                </button>
              </div>
            </form>
            <button
              onClick={() => {
                setModalOpen(false);
                setEditingBranch(null);
                formik.resetForm();
              }}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchMaster;