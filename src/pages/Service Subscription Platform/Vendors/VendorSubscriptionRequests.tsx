import { useState } from "react";
import { RiUserSettingsLine } from "react-icons/ri";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface SubscriptionRequest {
  id: string;
  vendorName: string;
  requestedPlan: string;
  paymentProof: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

const VendorSubscriptionRequests = () => {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([
    {
      id: "SUB-001",
      vendorName: "Rajesh Patel",
      requestedPlan: "Premium",
      paymentProof: "Payment_001.pdf",
      date: "2025-10-15",
      status: "Pending",
    },
    {
      id: "SUB-002",
      vendorName: "Anita Sharma",
      requestedPlan: "Basic",
      paymentProof: "Payment_002.pdf",
      date: "2025-10-14",
      status: "Approved",
    },
  ]);

  const handleView = (item: SubscriptionRequest) => {
    Swal.fire({
      title: `Subscription Request #${item.id}`,
      html: `
        <p><strong>Vendor Name:</strong> ${item.vendorName}</p>
        <p><strong>Requested Plan:</strong> ${item.requestedPlan}</p>
        <p><strong>Payment Proof:</strong> ${item.paymentProof}</p>
        <p><strong>Date:</strong> ${item.date}</p>
        <p><strong>Status:</strong> ${item.status}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const handleApprove = (item: SubscriptionRequest) => {
    Swal.fire({
      title: "Approve Subscription",
      text: `Are you sure you want to approve ${item.vendorName}'s ${item.requestedPlan} plan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(
          requests.map((r) =>
            r.id === item.id ? { ...r, status: "Approved" } : r
          )
        );
        Swal.fire(
          "Approved!",
          `Subscription request #${item.id} has been approved.`,
          "success"
        );
      }
    });
  };

  const handleReject = (item: SubscriptionRequest) => {
    Swal.fire({
      title: "Reject Subscription",
      text: `Are you sure you want to reject ${item.vendorName}'s ${item.requestedPlan} plan?`,
      input: "text",
      inputPlaceholder: "Enter rejection reason (optional)",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(
          requests.map((r) =>
            r.id === item.id
              ? {
                  ...r,
                  status: "Rejected",
                  remarks: result.value || "Rejected by admin",
                }
              : r
          )
        );
        Swal.fire(
          "Rejected!",
          `Subscription request #${item.id} has been rejected.`,
          "success"
        );
      }
    });
  };

  return (
    <div className="">
      <DataTable
        title="Vendor Subscription Requests"
        data={requests}
        columns={[
          {
            key: "subscriptionAction",
            label: "Action",
            render: (item: SubscriptionRequest) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  View
                </button>
                {item.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(item)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            ),
          },
          { key: "id", label: "Request ID" },
          { key: "vendorName", label: "Vendor Name" },
          { key: "requestedPlan", label: "Requested Plan" },
          { key: "paymentProof", label: "Payment Proof" },
          { key: "date", label: "Date" },
          {
            key: "status",
            label: "Status",
            render: (item: SubscriptionRequest) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Approved"
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
        ]}
      />
    </div>
  );
};

export default VendorSubscriptionRequests;
