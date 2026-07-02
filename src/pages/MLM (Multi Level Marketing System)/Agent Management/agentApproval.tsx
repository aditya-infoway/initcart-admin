import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";
import DataTable from "../../../components/common/DataTable";

interface Agent {
  id: number;
  full_name: string;
  contact_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  agent_type: "normal" | "pos" | "society";  // These are the correct types
  society_or_business_name: string | null;
  status: "pending" | "approved" | "rejected";
  passport_photo: string;
  id_proof: string;
  gst_certificate: string | null;
  business_license: string | null;
  created_at: string;
  user?: {
    id: number;
    username: string;
  };
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

// Helper to get agent type display with badge - FIXED: Now correctly handles all three types
const getAgentTypeBadge = (type: string) => {
  // Normalize the type string to handle any API inconsistencies
  const normalizedType = type.toLowerCase().trim();
  
  switch (normalizedType) {
    case 'pos':
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">POS Agent</span>;
    case 'society':
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Society Agent</span>;
    case 'normal':
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Normal Agent</span>;
    default:
      // Fallback for any unexpected values - show the actual value for debugging
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

const AgentApproval: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/mlm/agents/");
      console.log("API Response:", res.data); // Log to see what's coming from API
      setAgents(res.data);
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

  useEffect(() => {
    fetchAgents();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/mlm/approve-agent/${id}/`, { status });
      
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Agent ${status === 'approved' ? 'approved' : 'rejected'} successfully!`,
      });
      
      fetchAgents();
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update agent status",
      });
    }
  };

  const handleApprove = (item: Agent) => {
    Swal.fire({
      title: "Approve Agent?",
      text: `Are you sure you want to approve ${item.full_name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Approve",
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(item.id, "approved");
      }
    });
  };

  const handleReject = (item: Agent) => {
    Swal.fire({
      title: "Reject Agent?",
      text: `Are you sure you want to reject ${item.full_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Reject",
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(item.id, "rejected");
      }
    });
  };

  const handleView = (agent: Agent) => {
    // FIXED: Ensure we display the correct agent type in the view
    const displayAgentType = (() => {
      switch(agent.agent_type) {
        case 'pos': return 'POS Agent';
        case 'society': return 'Society Agent';
        case 'normal': return 'Normal Agent';
        default: return agent.agent_type;
      }
    })();

    Swal.fire({
      title: `<strong>${agent.full_name}</strong>`,
      html: `
        <div class="space-y-4 text-left max-h-[70vh] overflow-y-auto px-2">
          <!-- Basic Information -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-semibold text-gray-800 mb-3 text-left border-b pb-2">Personal Information</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3">
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Name:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.full_name}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Contact:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.contact_number}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Email:</span>
                <span class="w-2/3 text-left text-gray-900 break-all">${agent.email}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Type:</span>
                <span class="w-2/3 text-left">
                  ${displayAgentType}
                </span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Status:</span>
                <span class="w-2/3 text-left">
                  ${agent.status === 'approved' ? '<span class="text-green-600">Approved</span>' : 
                    agent.status === 'rejected' ? '<span class="text-red-600">Rejected</span>' : 
                    '<span class="text-yellow-600">Pending</span>'}
                </span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Applied:</span>
                <span class="w-2/3 text-left text-gray-900">${new Date(agent.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-semibold text-gray-800 mb-3 text-left border-b pb-2">Address</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3">
              <div class="flex col-span-2">
                <span class="w-1/6 font-semibold text-gray-700 text-left">Address:</span>
                <span class="w-5/6 text-left text-gray-900">${agent.address}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">City:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.city}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">State:</span>
                <span class="w-2/3 text-left text-gray-900">${agent.state}</span>
              </div>
            </div>
          </div>

          ${(agent.agent_type === "pos" || agent.agent_type === "society") ? `
            <!-- Business/Society Information -->
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-semibold text-gray-800 mb-3 text-left border-b pb-2">${agent.agent_type === "pos" ? "POS" : "Society"} Information</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                <div class="flex">
                  <span class="w-1/3 font-semibold text-gray-700 text-left">Name:</span>
                  <span class="w-2/3 text-left text-gray-900">${agent.society_or_business_name || 'N/A'}</span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Documents -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-semibold text-gray-800 mb-3 text-left border-b pb-2">Documents</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3">
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">Passport Photo:</span>
                <span class="w-2/3 text-left">
                  <a href="${getFullUrl(agent.passport_photo)}" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View Photo
                  </a>
                </span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-semibold text-gray-700 text-left">ID Proof:</span>
                <span class="w-2/3 text-left">
                  <a href="${getFullUrl(agent.id_proof)}" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    View Document
                  </a>
                </span>
              </div>
              ${(agent.agent_type === "pos" || agent.agent_type === "society") ? `
                <div class="flex">
                  <span class="w-1/3 font-semibold text-gray-700 text-left">GST Certificate:</span>
                  <span class="w-2/3 text-left">
                    ${agent.gst_certificate ? 
                      `<a href="${getFullUrl(agent.gst_certificate)}" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        View Certificate
                      </a>` : 
                      '<span class="text-gray-400">Not provided</span>'
                    }
                  </span>
                </div>
                <div class="flex">
                  <span class="w-1/3 font-semibold text-gray-700 text-left">Business License:</span>
                  <span class="w-2/3 text-left">
                    ${agent.business_license ? 
                      `<a href="${getFullUrl(agent.business_license)}" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        View License
                      </a>` : 
                      '<span class="text-gray-400">Not provided</span>'
                    }
                  </span>
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

  return (
    <div className="p-6">
      <DataTable<Agent>
        data={agents}
        title="Agent Approval Management"
        loading={loading}
        onRefresh={fetchAgents}
        columns={[
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
                <div className="text-xs text-gray-500">{item.city}, {item.state}</div>
              </div>
            )
          },
          {
            key: "agent_type",
            label: "Type",
            render: (item) => getAgentTypeBadge(item.agent_type)
          },
          {
            key: "business_info",
            label: "Business/Society",
            render: (item) => (
              <div className="text-sm">
                {item.agent_type === "pos" && (
                  <span className="font-medium text-purple-700">
                    {item.society_or_business_name || 'POS Agent'}
                  </span>
                )}
                {item.agent_type === "society" && (
                  <span className="font-medium text-green-700">
                    {item.society_or_business_name || 'Society Agent'}
                  </span>
                )}
                {item.agent_type === "normal" && (
                  <span className="text-gray-400">-</span>
                )}
              </div>
            )
          },
          {
            key: "status",
            label: "Status",
            render: (item) => getStatusBadge(item.status)
          },
          {
            key: "created_at",
            label: "Applied On",
            render: (item) => new Date(item.created_at).toLocaleDateString()
          }
        ]}
        onView={handleView}
        onApprove={(item) => handleApprove(item)}
        onReject={(item) => handleReject(item)}
      />
    </div>
  );
};

export default AgentApproval;