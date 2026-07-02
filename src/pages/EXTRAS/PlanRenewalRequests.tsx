import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";

interface RenewalRequest {
  id: string;
  vendor: string;
  currentPlan: string;
  renewalPlan: string;
  paymentProof: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

const PlanRenewalRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RenewalRequest[]>([
    {
      id: "REN-001",
      vendor: "FitPro Gym",
      currentPlan: "Premium",
      renewalPlan: "Premium",
      paymentProof: "proof1.pdf",
      date: "2025-10-10",
      status: "Pending",
    },
    {
      id: "REN-002",
      vendor: "Elegant Salon",
      currentPlan: "Basic",
      renewalPlan: "Premium",
      paymentProof: "proof2.pdf",
      date: "2025-10-12",
      status: "Approved",
    },
  ]);

  const handleApprove = (item: RenewalRequest) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Approve renewal for "${item.vendor}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(
          requests.map((r) => (r.id === item.id ? { ...r, status: "Approved" } : r))
        );
        Swal.fire("Approved!", `Renewal for "${item.vendor}" approved.`, "success");
      }
    });
  };

  const handleReject = (item: RenewalRequest) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Reject renewal for "${item.vendor}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(
          requests.map((r) => (r.id === item.id ? { ...r, status: "Rejected" } : r))
        );
        Swal.fire("Rejected!", `Renewal for "${item.vendor}" rejected.`, "success");
      }
    });
  };

  const handleView = (item: RenewalRequest) => {
    Swal.fire("Info", `Viewing payment proof: ${item.paymentProof}`, "info");
    // Placeholder for viewing payment proof
  };

  return (
    <div>
      <DataTable
        title="Plan Renewal Requests"
        data={requests}
        columns={[
           {
            key: "action",
            label: "Action",
            render: (item: RenewalRequest) => (
              <div className="flex gap-2">
                {item.status !== "Approved" && (
                  <button
                    onClick={() => handleApprove(item)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Approve
                  </button>
                )}
                {item.status !== "Rejected" && (
                  <button
                    onClick={() => handleReject(item)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleView(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  View
                </button>
              </div>
            ),
          },
          { key: "id", label: "Request ID" },
          { key: "vendor", label: "Vendor" },
          { key: "currentPlan", label: "Current Plan" },
          { key: "renewalPlan", label: "Renewal Plan" },
          { key: "paymentProof", label: "Payment Proof" },
          { key: "date", label: "Date" },
          {
            key: "status",
            label: "Status",
            render: (item: RenewalRequest) => (
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

export default PlanRenewalRequests;