import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface FlashDeal {
  id: string;
  vendor: string;
  serviceName: string;
  campaign: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

const FlashDealParticipation = () => {
  const navigate = useNavigate();
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([
    {
      id: "FD-001",
      vendor: "FitPro Gym",
      serviceName: "Strength Training",
      campaign: "Summer Fitness Sale",
      discountPercentage: 20,
      startDate: "2025-11-01",
      endDate: "2025-11-15",
      status: "Pending",
    },
    {
      id: "FD-002",
      vendor: "Elegant Salon",
      serviceName: "Men's Haircut",
      campaign: "Winter Glow Campaign",
      discountPercentage: 15,
      startDate: "2025-12-01",
      endDate: "2025-12-10",
      status: "Approved",
    },
  ]);

  const handleApprove = (item: FlashDeal) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Approve "${item.serviceName}" for "${item.campaign}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setFlashDeals(
          flashDeals.map((fd) =>
            fd.id === item.id ? { ...fd, status: "Approved" } : fd
          )
        );
        Swal.fire(
          "Approved!",
          `"${item.serviceName}" has been approved.`,
          "success"
        );
      }
    });
  };

  const handleReject = (item: FlashDeal) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Reject "${item.serviceName}" for "${item.campaign}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setFlashDeals(
          flashDeals.map((fd) =>
            fd.id === item.id ? { ...fd, status: "Rejected" } : fd
          )
        );
        Swal.fire(
          "Rejected!",
          `"${item.serviceName}" has been rejected.`,
          "success"
        );
      }
    });
  };

  const handleView = (item: FlashDeal) => {
    // Navigate to service detail for simplicity
    Swal.fire("Info", `Viewing details for "${item.serviceName}".`, "info");
    navigate(`/service-detail/SRV-${item.id.split("-")[1]}`);
  };

  return (
    <div className="">
      <DataTable
        title="Flash Deal Participation"
        data={flashDeals}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (item: FlashDeal) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  View
                </button>
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
              </div>
            ),
          },
          { key: "id", label: "Request ID" },
          { key: "vendor", label: "Vendor" },
          { key: "serviceName", label: "Service Name" },
          { key: "campaign", label: "Campaign" },
          { key: "discountPercentage", label: "Discount %" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          {
            key: "status",
            label: "Status",
            render: (item: FlashDeal) => (
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

export default FlashDealParticipation;
