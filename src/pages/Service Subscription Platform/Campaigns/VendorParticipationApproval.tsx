/* src/pages/campaigns/VendorParticipationApproval.tsx */
import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Participation {
  id: string;
  vendor: string;
  campaign: string;
  service: string;
  discountOffered: number;
  status: "Pending" | "Approved" | "Rejected";
}

const mockData: Participation[] = [
  {
    id: "REQ-001",
    vendor: "CleanPro Services",
    campaign: "Diwali Dhamaka",
    service: "Home Deep Cleaning",
    discountOffered: 25,
    status: "Pending",
  },
  {
    id: "REQ-002",
    vendor: "QuickFix AC",
    campaign: "Summer Cool",
    service: "AC Repair",
    discountOffered: 15,
    status: "Pending",
  },
];

const VendorParticipationApproval = () => {
  const [data, setData] = useState<Participation[]>(mockData);

  const handleApprove = (item: Participation) => {
    Swal.fire({
      title: "Approve?",
      text: `${item.vendor} → ${item.service}`,
      icon: "question",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        setData((prev) =>
          prev.map((d) => (d.id === item.id ? { ...d, status: "Approved" } : d))
        );
        Swal.fire("Approved!", "", "success");
      }
    });
  };

  const handleReject = (item: Participation) => {
    Swal.fire({
      title: "Reject?",
      text: `${item.vendor}`,
      icon: "warning",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        setData((prev) =>
          prev.map((d) => (d.id === item.id ? { ...d, status: "Rejected" } : d))
        );
        Swal.fire("Rejected!", "", "info");
      }
    });
  };

  return (
    <div>
      <DataTable<Participation>
        title="Vendor Participation Approval"
        data={data}
        columns={[
          { key: "id", label: "Request ID" },
          { key: "vendor", label: "Vendor" },
          { key: "campaign", label: "Campaign" },
          { key: "service", label: "Service" },
          {
            key: "discountOffered",
            label: "Discount Offered",
            render: (d) => `${d.discountOffered}%`,
          },
          {
            key: "status",
            label: "Status",
            render: (d) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  d.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : d.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {d.status}
              </span>
            ),
          },
        ]}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default VendorParticipationApproval;