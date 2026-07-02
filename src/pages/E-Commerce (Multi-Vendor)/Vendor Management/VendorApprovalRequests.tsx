import { useEffect, useState } from "react";
import DataTable from "../../../components/common/DataTable";
import Swal from "sweetalert2";
import { vendorService } from "../../../services/vendorService";

interface ApprovalRequest {
  request_id: string;
  vendor_details: {
    id: number;
    business_name: string;
    email: string;
    owner_name: string;
    vendor_type: string;
    created_at?: string;
    licence_file?: string;
    gst_certificate?: string;
    store_logo?: string;
    id_proof?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    vendor_subtype?: string;
    pincode?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
  };
  date: string;
  status: "pending" | "approved" | "rejected";
}

// Create a new type that extends Identifiable
interface ApprovalRequestWithId extends ApprovalRequest {
  id: string;
}

const VendorApprovalRequests = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  // Get full URL for media files
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

  // Get vendor type display name
  const getVendorTypeDisplay = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'product': return 'Product Vendor';
      case 'service': return 'Service Vendor';
      default: return type?.charAt(0).toUpperCase() + type?.slice(1) || 'N/A';
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getPendingRequests();
      setRequests(data);
    } catch (err) {
      Swal.fire("Error", "Failed to load approval requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (item: ApprovalRequestWithId) => {
    // Convert back to ApprovalRequest for setSelectedRequest
    const approvalRequest: ApprovalRequest = {
      request_id: item.request_id,
      vendor_details: item.vendor_details,
      date: item.date,
      status: item.status
    };
    setSelectedRequest(approvalRequest);
    setApprovalModalOpen(true);
  };

  const handleFinalApprove = async () => {
    if (!selectedRequest) return;

    if (
      !bankDetails.bankName ||
      !bankDetails.accountNumber ||
      !bankDetails.ifscCode
    ) {
      Swal.fire("Error", "Please fill all required bank details", "error");
      return;
    }

    try {
      const payload = {
        bank_name: bankDetails.bankName,
        account_number: bankDetails.accountNumber,
        ifsc_code: bankDetails.ifscCode,
        upi_id: bankDetails.upiId,
        admin_notes: "Approved via SuperAdmin panel",
      };

      const res = await vendorService.approveVendor(
        selectedRequest.request_id,
        payload
      );

      Swal.fire("Approved", res.message || "Vendor approved successfully!", "success");

      setApprovalModalOpen(false);
      setBankDetails({ bankName: "", accountNumber: "", ifscCode: "", upiId: "" });
      await loadRequests();
    } catch (err) {
      Swal.fire("Error", "Failed to approve vendor", "error");
    }
  };

  const handleView = async (item: ApprovalRequestWithId) => {
    // Convert to ApprovalRequest for the view
    const approvalRequest: ApprovalRequest = {
      request_id: item.request_id,
      vendor_details: item.vendor_details,
      date: item.date,
      status: item.status
    };
    
    const v = approvalRequest.vendor_details;

    Swal.fire({
      title: `<strong>${v.business_name}</strong>`,
      html: `
        <div class="space-y-4">
          <!-- Basic Details -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-2">Business Information</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Owner:</span>
                <span class="w-2/3">${v.owner_name || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Email:</span>
                <span class="w-2/3">${v.email || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Phone:</span>
                <span class="w-2/3">${v.phone || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Vendor Type:</span>
                <span class="w-2/3">${getVendorTypeDisplay(v.vendor_type || '')}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Sub Type:</span>
                <span class="w-2/3">${v.vendor_subtype || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Request Date:</span>
                <span class="w-2/3">${approvalRequest.date ? new Date(approvalRequest.date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Status:</span>
                <span class="w-2/3 ${approvalRequest.status === 'approved' ? 'text-green-600' : approvalRequest.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}">
                  ${approvalRequest.status.charAt(0).toUpperCase() + approvalRequest.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <!-- Address -->
          ${v.address || v.city || v.state || v.pincode ? `
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-2">Address Details</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              ${v.address ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Address:</span>
                <span class="w-2/3">${v.address}</span>
              </div>` : ''}
              ${v.city ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">City:</span>
                <span class="w-2/3">${v.city}</span>
              </div>` : ''}
              ${v.state ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">State:</span>
                <span class="w-2/3">${v.state}</span>
              </div>` : ''}
              ${v.pincode ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Pincode:</span>
                <span class="w-2/3">${v.pincode}</span>
              </div>` : ''}
            </div>
          </div>` : ''}

          <!-- Bank Details (if available) -->
          ${v.bank_name || v.account_number || v.ifsc_code ? `
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-2">Bank Details</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              ${v.bank_name ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Bank Name:</span>
                <span class="w-2/3">${v.bank_name}</span>
              </div>` : ''}
              ${v.account_number ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Account No:</span>
                <span class="w-2/3">${v.account_number ? `****${v.account_number.slice(-4)}` : 'N/A'}</span>
              </div>` : ''}
              ${v.ifsc_code ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">IFSC Code:</span>
                <span class="w-2/3">${v.ifsc_code}</span>
              </div>` : ''}
              ${v.upi_id ? `
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">UPI ID:</span>
                <span class="w-2/3">${v.upi_id}</span>
              </div>` : ''}
            </div>
          </div>` : ''}

          <!-- Documents -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-2">Documents</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">License:</span>
                <span class="w-2/3">
                  ${v.licence_file ? 
                    `<a href="${getFullUrl(v.licence_file)}" target="_blank" class="text-blue-600 hover:underline">View</a>` : 
                    'N/A'
                  }
                </span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">GST:</span>
                <span class="w-2/3">
                  ${v.gst_certificate ? 
                    `<a href="${getFullUrl(v.gst_certificate)}" target="_blank" class="text-blue-600 hover:underline">View</a>` : 
                    'N/A'
                  }
                </span>
                              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Store Logo:</span>
                <span class="w-2/3">
                  ${v.store_logo ? 
                    `<a href="${getFullUrl(v.store_logo)}" target="_blank" class="text-blue-600 hover:underline">View</a>` : 
                    'N/A'
                  }
                </span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">ID Proof:</span>
                <span class="w-2/3">
                  ${v.id_proof ? 
                    `<a href="${getFullUrl(v.id_proof)}" target="_blank" class="text-blue-600 hover:underline">View</a>` : 
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
      showCloseButton: true,
      customClass: {
        popup: 'rounded-lg',
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
      }
    });
  };

  const handleReject = async (item: ApprovalRequestWithId) => {
    const result = await Swal.fire({
      title: "Reject Vendor?",
      text: `Do you want to reject "${item.vendor_details.business_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await vendorService.rejectVendor(
          item.request_id,
          "Rejected by admin"
        );
        Swal.fire("Rejected", res.message || "Vendor rejected", "error");
        await loadRequests();
      } catch {
        Swal.fire("Error", "Failed to reject vendor", "error");
      }
    }
  };

  // Prepare data for DataTable by adding id property
  const tableData: ApprovalRequestWithId[] = requests.map((item) => ({
    ...item,
    id: item.request_id, // required for DataTable
  }));

  return (
    <div className="p-4">
      <DataTable
        title="Vendor Approval Requests"
        data={tableData}
        columns={[
          { key: "request_id", label: "Request ID" },
          {
            key: "vendor_details.owner_name",
            label: "Vendor Name",
            render: (item: ApprovalRequestWithId) => item.vendor_details.owner_name,
          },
          {
            key: "vendor_details.business_name",
            label: "Business Name",
            render: (item: ApprovalRequestWithId) => item.vendor_details.business_name,
          },
          {
            key: "vendor_details.email",
            label: "Email",
            render: (item: ApprovalRequestWithId) => item.vendor_details.email,
          },
          {
            key: "date",
            label: "Date",
            render: (item: ApprovalRequestWithId) =>
              new Date(item.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
          },
          {
            key: "status",
            label: "Status",
            render: (item: ApprovalRequestWithId) => (
              <span
                className={`font-semibold ${
                  item.status === "approved"
                    ? "text-green-600"
                    : item.status === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            ),
          },
        ]}
        onView={handleView}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Approval Modal */}
      {approvalModalOpen && selectedRequest && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-3">Approve Vendor</h2>
            <p className="text-gray-600 mb-4">
              Vendor: <strong>{selectedRequest.vendor_details.business_name}</strong>
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Bank Name *"
                value={bankDetails.bankName}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, bankName: e.target.value })
                }
                className="w-full border p-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Account Number *"
                value={bankDetails.accountNumber}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                }
                className="w-full border p-2 rounded-md"
              />
              <input
                type="text"
                placeholder="IFSC Code *"
                value={bankDetails.ifscCode}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, ifscCode: e.target.value })
                }
                className="w-full border p-2 rounded-md"
              />
              <input
                type="text"
                placeholder="UPI ID"
                value={bankDetails.upiId}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, upiId: e.target.value })
                }
                className="w-full border p-2 rounded-md"
              />
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setApprovalModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md"
                onClick={handleFinalApprove}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApprovalRequests;