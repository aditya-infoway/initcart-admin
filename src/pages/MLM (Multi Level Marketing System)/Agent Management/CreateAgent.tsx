import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaBuilding,
  FaIdCard,
  FaFile,
  FaCamera,
  FaTag,
  FaSpinner,
  FaBriefcase,
  FaRegBuilding,
  FaEdit,
  FaTrash,
  FaEye
} from "react-icons/fa";
import DataTable from "../../../components/common/DataTable";
import apiClient from "../../../api/apiClient";

interface Agent {
  id: number;
  full_name: string;
  email: string;
  contact_number: string;
  agent_type: "normal" | "pos" | "society";
  society_or_business_name: string | null;
  address: string;
  city: string;
  state: string;
  status: "pending" | "approved" | "rejected";
  passport_photo: string;
  id_proof: string;
  gst_certificate: string | null;
  business_license: string | null;
  created_at: string;
  user?: {
    id: number;
    username: string;
    referral_code: string;
  };
  created_by?: {
    id: number;
    username: string;
  } | null;
}

// Form Data Interface
interface FormData {
  agent_type: "normal" | "pos" | "society";
  full_name: string;
  contact_number: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  society_or_business_name: string;
  referral_code: string;
}

// Files Interface
interface Files {
  passport_photo: File | null;
  id_proof: File | null;
  gst_certificate: File | null;
  business_license: File | null;
}

// Errors Interface
interface Errors {
  full_name?: string;
  contact_number?: string;
  email?: string;
  password?: string;
  address?: string;
  city?: string;
  state?: string;
  society_or_business_name?: string;
  passport_photo?: string;
  id_proof?: string;
  gst_certificate?: string;
  business_license?: string;
  [key: string]: string | undefined;
}

// Touched Interface
interface Touched {
  full_name?: boolean;
  contact_number?: boolean;
  email?: boolean;
  password?: boolean;
  address?: boolean;
  city?: boolean;
  state?: boolean;
  society_or_business_name?: boolean;
  passport_photo?: boolean;
  id_proof?: boolean;
  gst_certificate?: boolean;
  business_license?: boolean;
  [key: string]: boolean | undefined;
}

// Helper function to get full URL for media files
const getFullUrl = (mediaPath: string | undefined | null): string => {
  if (!mediaPath) return '';

  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }

  if (mediaPath.startsWith('/media/')) {
    return `http://localhost:8000${mediaPath}`;
  }

  if (!mediaPath.includes('/')) {
    return `http://localhost:8000/media/${mediaPath}`;
  }

  return `http://localhost:8000${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`;
};

// Helper to get agent type display with badge
const getAgentTypeBadge = (type: string) => {
  switch (type) {
    case 'pos':
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">POS Agent</span>;
    case 'society':
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Society Agent</span>;
    case 'normal':
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Normal Agent</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{type}</span>;
  }
};

// Helper to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
    case 'rejected':
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>;
    default:
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
  }
};

const CreateAgent = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state - exactly like BecomeAgent
  const [formData, setFormData] = useState<FormData>({
    agent_type: "normal",
    full_name: "",
    contact_number: "",
    email: "",
    password: "",
    address: "",
    city: "",
    state: "",
    society_or_business_name: "",
    referral_code: ""
  });

  const [files, setFiles] = useState<Files>({
    passport_photo: null,
    id_proof: null,
    gst_certificate: null,
    business_license: null
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/mlm/agents/");
      setAgents(response.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load agents",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDocuments = async (agentId: number) => {
    try {
      // Agent ki details fetch karo (isme documents ke URLs honge)
      const response = await apiClient.get(`/mlm/agents/${agentId}/`);
      const agentData = response.data;

      // Documents URLs ko store karo (optional - agar display karna ho)
      console.log("Agent documents:", {
        passport_photo: agentData.passport_photo,
        id_proof: agentData.id_proof,
        gst_certificate: agentData.gst_certificate,
        business_license: agentData.business_license
      });

      return agentData;
    } catch (error) {
      console.error("Error fetching agent documents:", error);
      return null;
    }
  };

  // ==========================
  // VALIDATION FUNCTIONS (exactly like BecomeAgent)
  // ==========================
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const validateForm = () => {
  const newErrors: Errors = {};

  // ... existing validations ...

  // DOCUMENTS VALIDATION - Only required for new agents
  if (!editingAgent) {
    // Passport Photo
    if (!files.passport_photo) {
      newErrors.passport_photo = "Passport photo is required";
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(files.passport_photo.type)) {
        newErrors.passport_photo = "Please upload JPG, JPEG or PNG file";
      }
    }

    // ID Proof
    if (!files.id_proof) {
      newErrors.id_proof = "ID proof is required";
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(files.id_proof.type)) {
        newErrors.id_proof = "Please upload JPG, PNG or PDF file";
      }
    }

    // POS/SOCIETY SPECIFIC VALIDATIONS
    if (formData.agent_type === "pos" || formData.agent_type === "society") {
      if (!formData.society_or_business_name?.trim()) {
        newErrors.society_or_business_name = "Society/Business name is required";
      }

      if (!files.gst_certificate) {
        newErrors.gst_certificate = "GST certificate is required";
      } else {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(files.gst_certificate.type)) {
          newErrors.gst_certificate = "Please upload JPG, PNG or PDF file";
        }
      }

      if (!files.business_license) {
        newErrors.business_license = "Business license is required";
      } else {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(files.business_license.type)) {
          newErrors.business_license = "Please upload JPG, PNG or PDF file";
        }
      }
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // ==========================
  // INPUT CHANGE
  // ==========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  // ==========================
  // BLUR HANDLER
  // ==========================
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateForm();
  };

  // ==========================
  // FILE CHANGE
  // ==========================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;

    if (fileList && fileList[0]) {
      setFiles({
        ...files,
        [name]: fileList[0]
      });

      // Clear error for this field
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: undefined
        });
      }
    }
  };

  const handleApiError = (error: any): { title: string; message: string } => {
    let title = "Registration Failed";
    let message = "Something went wrong. Please try again.";

    if (!error.response) {
      return { title, message: "Network error. Please check your connection." };
    }

    const { status, data } = error.response;

    // Handle 500 Internal Server Error (Duplicate Entry)
    if (status === 500 && typeof data === 'string' && data.includes('Duplicate entry')) {
      const match = data.match(/Duplicate entry '(.+?)' for key 'users_user\.username'/);
      const duplicateValue = match ? match[1] : "this mobile number";

      return {
        title: "Mobile Number Already Registered",
        message: `Mobile number ${duplicateValue} is already registered. Please use a different mobile number.`
      };
    }

    // Handle 400 Validation Error
    if (status === 400) {
      if (typeof data === 'string') {
        return { title, message: data };
      }

      if (typeof data === 'object') {
        // Check for specific field errors
        if (data.contact_number) {
          return {
            title: "Mobile Number Error",
            message: Array.isArray(data.contact_number) ? data.contact_number[0] : data.contact_number
          };
        }

        if (data.email) {
          return {
            title: "Email Error",
            message: Array.isArray(data.email) ? data.email[0] : data.email
          };
        }

        if (data.password) {
          return {
            title: "Password Error",
            message: Array.isArray(data.password) ? data.password[0] : data.password
          };
        }

        if (data.non_field_errors) {
          return {
            title: "Validation Error",
            message: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors
          };
        }

        if (data.error) {
          return { title, message: data.error };
        }

        if (data.message) {
          return { title, message: data.message };
        }

        // Get first error from any field
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const firstError = data[firstKey];
          return {
            title: firstKey.replace('_', ' ').toUpperCase() + " Error",
            message: Array.isArray(firstError) ? firstError[0] : String(firstError)
          };
        }
      }
    }

    // Handle other status codes
    if (status === 403) {
      return { title: "Permission Denied", message: data?.error || "You don't have permission to perform this action." };
    }

    if (status === 401) {
      return { title: "Unauthorized", message: "Please login again." };
    }

    return { title, message };
  };
  // ==========================
  // SUBMIT FORM
  // ==========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Touched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    Object.keys(files).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    setSubmitting(true);

    try {
      if (editingAgent) {
        // UPDATE EXISTING AGENT
        const updateData: any = {
          agent_type: formData.agent_type,
          full_name: formData.full_name,
          contact_number: formData.contact_number,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
        };

        // Add optional fields if they exist
        if (formData.society_or_business_name) {
          updateData.society_or_business_name = formData.society_or_business_name;
        }

        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        // Update the agent - using PATCH with JSON
        await apiClient.patch(`/mlm/agents/${editingAgent.id}/`, updateData, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Agent updated successfully',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        // CREATE NEW AGENT - FormData for files
        const formDataToSend = new FormData();

        // Append form data
        Object.keys(formData).forEach((key) => {
          if (formData[key as keyof FormData]) {
            formDataToSend.append(key, formData[key as keyof FormData] as string);
          }
        });

        // Append files
        Object.keys(files).forEach((key) => {
          if (files[key as keyof Files]) {
            formDataToSend.append(key, files[key as keyof Files] as File);
          }
        });

        await apiClient.post("/mlm/register/", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Agent Created Successfully!',
          text: 'New agent has been added to the system',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }

      // Reset form and close modal
      setModalOpen(false);
      resetForm();
      await fetchAgents();

    } catch (error: any) {
      console.error("Error:", error);

      const { title, message } = handleApiError(error);

      Swal.fire({
        icon: 'error',
        title: title,
        html: `
        <div class="text-left">
          <p class="text-red-600 mb-2">${message}</p>
          <p class="text-sm text-gray-500 mt-2">Please check your information and try again.</p>
        </div>
      `,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSubmitting(false);
    }
  };
  const resetForm = () => {
    setFormData({
      agent_type: "normal",
      full_name: "",
      contact_number: "",
      email: "",
      password: "",
      address: "",
      city: "",
      state: "",
      society_or_business_name: "",
      referral_code: ""
    });
    setFiles({
      passport_photo: null,
      id_proof: null,
      gst_certificate: null,
      business_license: null
    });
    setErrors({});
    setTouched({});
    setEditingAgent(null);
  };
  const handleEdit = async (agent: Agent) => {
    setEditingAgent(agent);

    // Basic info set karo
    setFormData({
      agent_type: agent.agent_type,
      full_name: agent.full_name,
      contact_number: agent.contact_number,
      email: agent.email,
      password: "", // Don't populate password
      address: agent.address,
      city: agent.city,
      state: agent.state,
      society_or_business_name: agent.society_or_business_name || "",
      referral_code: agent.user?.referral_code || ""
    });

    // Files ko clear karo (kyunki files input mein pre-populate nahi kar sakte)
    setFiles({
      passport_photo: null,
      id_proof: null,
      gst_certificate: null,
      business_license: null
    });

    // Errors clear karo
    setErrors({});
    setTouched({});

    // Modal open karo
    setModalOpen(true);

    // Optional: Existing documents ka preview dikhane ke liye
    try {
      const agentDetails = await fetchAgentDocuments(agent.id);
      if (agentDetails) {
        // Yahan aap existing documents ka preview dikha sakte ho
        // Jaise ki document names ya URLs show karna
        console.log("Existing documents loaded");
      }
    } catch (error) {
      console.error("Error loading agent details:", error);
    }
  };

  const handleDelete = async (agent: Agent) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${agent.full_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Note: You'll need to create a delete endpoint in your backend
          // await apiClient.delete(`/mlm/agents/${agent.id}/`);

          // For now, just filter from local state
          setAgents(agents.filter((a) => a.id !== agent.id));

          Swal.fire("Deleted!", `${agent.full_name} has been deleted.`, "success");
        } catch (error) {
          console.error("Error deleting agent:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete agent",
          });
        }
      }
    });
  };

  const handleView = (agent: Agent) => {
    Swal.fire({
      title: `<strong>${agent.full_name}</strong>`,
      html: `
        <div class="space-y-4 text-left max-h-[70vh] overflow-y-auto px-2">
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-semibold text-gray-800 mb-3 text-left border-b pb-2">Agent Details</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3">
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">ID:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.id}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Name:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.full_name}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Email:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.email}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Contact:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.contact_number}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Type:</span>
                <span class="w-2/3 text-left">${agent.agent_type}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Status:</span>
                <span class="w-2/3 text-left">${agent.status}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">City:</span>
                <span class="w-2/3 text-left">${agent.city}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">State:</span>
                <span class="w-2/3 text-left">${agent.state}</span>
              </div>
              <div class="flex col-span-2">
                <span class="w-1/6 font-semibold text-gray-700 text-left">Address:</span>
                <span class="w-5/6 text-left">${agent.address}</span>
              </div>
              ${agent.society_or_business_name ? `
              <div class="flex col-span-2">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Business/Society:</span>
                <span class="w-2/3 text-left">${agent.society_or_business_name}</span>
              </div>
              ` : ''}
              ${agent.user?.referral_code ? `
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Referral Code:</span>
                <span class="w-2/3 text-left">${agent.user.referral_code}</span>
              </div>
              ` : ''}
              ${agent.created_by ? `
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Created By:</span>
                <span class="w-2/3 text-left">${agent.created_by.username}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      width: '700px',
      showCloseButton: true,
    });
  };

  // Count required documents based on agent type
  const getRequiredDocumentsCount = () => {
    if (formData.agent_type === "pos" || formData.agent_type === "society") {
      return 4;
    }
    return 2;
  };

  const getUploadedDocumentsCount = () => {
    let count = 0;
    if (files.passport_photo) count++;
    if (files.id_proof) count++;
    if (formData.agent_type === "pos" || formData.agent_type === "society") {
      if (files.gst_certificate) count++;
      if (files.business_license) count++;
    }
    return count;
  };

  return (
    <div className="p-6">
      <DataTable<Agent>
        data={agents}
        title="Agents Management"
        loading={loading}
        onRefresh={fetchAgents}
        columns={[
          {
            key: "id",
            label: "ID",
            render: (item) => <span className="font-medium">#{item.id}</span>
          },
          {
            key: "full_name",
            label: "Name",
            render: (item) => (
              <div>
                <div className="font-medium text-gray-900">{item.full_name}</div>
                <div className="text-xs text-gray-500">{item.email}</div>
              </div>
            )
          },
          {
            key: "contact_number",
            label: "Contact",
            render: (item) => (
              <div>
                <div className="text-sm">{item.contact_number}</div>
                <div className="text-xs text-gray-500">{item.city}</div>
              </div>
            )
          },
          {
            key: "agent_type",
            label: "Type",
            render: (item) => getAgentTypeBadge(item.agent_type)
          },
          {
            key: "created_by",
            label: "Created By",
            render: (item) => (
              <span className="text-sm">
                {item.created_by?.username || 'Self'}
              </span>
            )
          },
          {
            key: "status",
            label: "Status",
            render: (item) => getStatusBadge(item.status)
          },
          {
            key: "created_at",
            label: "Joined",
            render: (item) => new Date(item.created_at).toLocaleDateString()
          }
        ]}
        onAdd={() => {
          resetForm();
          setModalOpen(true);
        }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Agent"
      />

      {/* Create/Edit Agent Modal - Exactly like BecomeAgent design */}
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3 overflow-y-auto py-8"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                {editingAgent ? "Edit Agent" : "Create New Agent"}
              </h2>
              <p className="text-gray-500 mt-2">
                {editingAgent ? "Update agent information" : "Add a new agent to the system"}
              </p>
            </div>

            {/* Document Upload Progress - Only for new agents */}
            {!editingAgent && (
              <div className="mb-6 bg-blue-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">
                    Documents Uploaded: {getUploadedDocumentsCount()}/{getRequiredDocumentsCount()}
                  </span>
                  <span className="text-xs text-blue-500">
                    {formData.agent_type === "pos" || formData.agent_type === "society" ? "4 documents required" : "2 documents required"}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(getUploadedDocumentsCount() / getRequiredDocumentsCount()) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agent Type Selection */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="agent_type"
                      value={formData.agent_type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="normal">Normal Agent (2 Documents Required)</option>
                      <option value="pos">POS Agent (4 Documents Required)</option>
                      <option value="society">Society Agent (4 Documents Required)</option>
                    </select>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Personal Information
                  </h3>
                </div>

                {/* Full Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      placeholder="Enter your full name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.full_name && errors.full_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.full_name && errors.full_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      placeholder="10-digit mobile number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={10}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.contact_number && errors.contact_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.contact_number && errors.contact_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      placeholder="your@email.com"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {!editingAgent && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      placeholder={editingAgent ? "Leave blank to keep current" : "Minimum 8 characters"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* City */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      placeholder="Your city"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.city && errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      placeholder="Your state"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.state && errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.state && errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                {/* Address */}
                <div className="col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      placeholder="Your complete address"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={3}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.address && errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                {/* POS/SOCIETY FIELDS */}
                {(formData.agent_type === "pos" || formData.agent_type === "society") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="col-span-2 space-y-4"
                  >
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaRegBuilding className="mr-2 text-blue-500" />
                        Business Information
                      </h3>
                    </div>

                    {/* Society/Business Name */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Society/Business Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="society_or_business_name"
                          value={formData.society_or_business_name}
                          placeholder="Enter society or business name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.society_or_business_name && errors.society_or_business_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                      </div>
                      {touched.society_or_business_name && errors.society_or_business_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.society_or_business_name}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Edit Mode Mein Existing Documents Preview */}
                {editingAgent && (
                  <div className="col-span-2 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FaFile className="mr-2 text-blue-500" />
                      Existing Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Passport Photo */}
                      {editingAgent.passport_photo && (
                        <div className="flex items-center p-2 bg-white rounded-lg">
                          <FaCamera className="text-gray-400 mr-3 text-lg" />
                          <span className="text-gray-600 text-sm mr-2">Passport:</span>
                          <a
                            href={getFullUrl(editingAgent.passport_photo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center"
                          >
                            <FaEye className="mr-1" /> View
                          </a>
                        </div>
                      )}

                      {/* ID Proof */}
                      {editingAgent.id_proof && (
                        <div className="flex items-center p-2 bg-white rounded-lg">
                          <FaIdCard className="text-gray-400 mr-3 text-lg" />
                          <span className="text-gray-600 text-sm mr-2">ID Proof:</span>
                          <a
                            href={getFullUrl(editingAgent.id_proof)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center"
                          >
                            <FaEye className="mr-1" /> View
                          </a>
                        </div>
                      )}

                      {/* GST Certificate - for POS/SOCIETY */}
                      {editingAgent.gst_certificate && (editingAgent.agent_type === "pos" || editingAgent.agent_type === "society") && (
                        <div className="flex items-center p-2 bg-white rounded-lg">
                          <FaFile className="text-gray-400 mr-3 text-lg" />
                          <span className="text-gray-600 text-sm mr-2">GST:</span>
                          <a
                            href={getFullUrl(editingAgent.gst_certificate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center"
                          >
                            <FaEye className="mr-1" /> View
                          </a>
                        </div>
                      )}

                      {/* Business License - for POS/SOCIETY */}
                      {editingAgent.business_license && (editingAgent.agent_type === "pos" || editingAgent.agent_type === "society") && (
                        <div className="flex items-center p-2 bg-white rounded-lg">
                          <FaFile className="text-gray-400 mr-3 text-lg" />
                          <span className="text-gray-600 text-sm mr-2">License:</span>
                          <a
                            href={getFullUrl(editingAgent.business_license)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center"
                          >
                            <FaEye className="mr-1" /> View
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Agar koi document nahi hai to message show karo */}
                    {!editingAgent.passport_photo && !editingAgent.id_proof && !editingAgent.gst_certificate && !editingAgent.business_license && (
                      <p className="text-gray-500 text-sm italic p-2">No documents uploaded yet</p>
                    )}

                    <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded-lg">
                      <FaFile className="inline mr-1" />
                      Note: Upload new files below to replace existing documents
                    </p>
                  </div>
                )}

                {/* DOCUMENTS SECTION - Show for both new and edit mode */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FaFile className="mr-2 text-blue-500" />
                    {editingAgent ? "Update Documents" : "Required Documents"}
                    {(formData.agent_type === "pos" || formData.agent_type === "society") ? (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {editingAgent ? "Upload new to replace" : "4 Documents Required"}
                      </span>
                    ) : (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {editingAgent ? "Upload new to replace" : "2 Documents Required"}
                      </span>
                    )}
                  </h3>
                </div>

                {/* Passport Photo - Always show */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Photo {!editingAgent && <span className="text-red-500">*</span>}
                    {editingAgent && <span className="text-xs text-gray-500 ml-2">(Leave empty to keep current)</span>}
                  </label>
                  <div className="relative">
                    <FaCamera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <input
                      type="file"
                      name="passport_photo"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.passport_photo && errors.passport_photo ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.passport_photo && errors.passport_photo && (
                    <p className="text-red-500 text-xs mt-1">{errors.passport_photo}</p>
                  )}
                </div>

                {/* ID Proof - Always show */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Proof {!editingAgent && <span className="text-red-500">*</span>}
                    {editingAgent && <span className="text-xs text-gray-500 ml-2">(Leave empty to keep current)</span>}
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <input
                      type="file"
                      name="id_proof"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.id_proof && errors.id_proof ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {touched.id_proof && errors.id_proof && (
                    <p className="text-red-500 text-xs mt-1">{errors.id_proof}</p>
                  )}
                </div>

                {/* GST Certificate - for POS/SOCIETY */}
                {(formData.agent_type === "pos" || formData.agent_type === "society") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Certificate {!editingAgent && <span className="text-red-500">*</span>}
                      {editingAgent && <span className="text-xs text-gray-500 ml-2">(Leave empty to keep current)</span>}
                    </label>
                    <div className="relative">
                      <FaFile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        type="file"
                        name="gst_certificate"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.gst_certificate && errors.gst_certificate ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                    </div>
                    {touched.gst_certificate && errors.gst_certificate && (
                      <p className="text-red-500 text-xs mt-1">{errors.gst_certificate}</p>
                    )}
                  </motion.div>
                )}

                {/* Business License - for POS/SOCIETY */}
                {(formData.agent_type === "pos" || formData.agent_type === "society") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business License {!editingAgent && <span className="text-red-500">*</span>}
                      {editingAgent && <span className="text-xs text-gray-500 ml-2">(Leave empty to keep current)</span>}
                    </label>
                    <div className="relative">
                      <FaFile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        type="file"
                        name="business_license"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${touched.business_license && errors.business_license ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                    </div>
                    {touched.business_license && errors.business_license && (
                      <p className="text-red-500 text-xs mt-1">{errors.business_license}</p>
                    )}
                  </motion.div>
                )}


                {/* Referral Code */}
                <div className="col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="referral_code"
                      value={formData.referral_code}
                      placeholder="Enter referral code if you have one"
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8"
              >
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    editingAgent ? "Update Agent" : "Create Agent"
                  )}
                </button>
              </motion.div>
            </form>

            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-3xl"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateAgent;