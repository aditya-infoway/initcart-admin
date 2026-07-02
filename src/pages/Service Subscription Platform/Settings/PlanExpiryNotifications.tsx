/* src/pages/notifications/PlanExpiryNotifications.tsx */
import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Expiry {
  id: number;                     // required by DataTable
  vendor: string;
  plan: string;
  expiryDate: string;             // YYYY-MM-DD
  notificationStatus: "Sent" | "Pending" | "Failed";
}

const mockData: Expiry[] = [
  {
    id: 1,
    vendor: "FashionHub",
    plan: "Pro",
    expiryDate: "2025-11-05",
    notificationStatus: "Pending",
  },
  {
    id: 2,
    vendor: "TechGadgets",
    plan: "Basic",
    expiryDate: "2025-11-08",
    notificationStatus: "Failed",
  },
  {
    id: 3,
    vendor: "BeautyPro",
    plan: "Enterprise",
    expiryDate: "2025-11-12",
    notificationStatus: "Sent",
  },
];

const PlanExpiryNotifications = () => {
  const [items, setItems] = useState<Expiry[]>(mockData);

  /* ------------------- Action Handlers (same pattern as PlanRenewalRequests) ------------------- */
  const handleResend = (item: Expiry) => {
    Swal.fire({
      title: "Resend Notification?",
      text: `To ${item.vendor} (Plan: ${item.plan})`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, resend",
    }).then((res) => {
      if (res.isConfirmed) {
        setItems((prev) =>
          prev.map((x) =>
            x.id === item.id ? { ...x, notificationStatus: "Sent" } : x
          )
        );
        Swal.fire("Resent!", "Notification sent.", "success");
      }
    });
  };

  const handleExtend = (item: Expiry) => {
    Swal.fire({
      title: "Extend Expiry",
      input: "number",
      inputLabel: "Days to add",
      inputValue: 7,
      inputAttributes: { min: "1", step: "1" },
      showCancelButton: true,
      confirmButtonText: "Extend",
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        const days = Number(res.value);
        const d = new Date(item.expiryDate);
        d.setDate(d.getDate() + days);
        const newDate = d.toISOString().split("T")[0];

        setItems((prev) =>
          prev.map((x) =>
            x.id === item.id ? { ...x, expiryDate: newDate } : x
          )
        );
        Swal.fire(`Extended ${days} day(s)`, `New expiry: ${newDate}`, "success");
      }
    });
  };

  const handleView = (item: Expiry) => {
    Swal.fire({
      title: "Expiry Details",
      html: `
        <p><strong>Vendor:</strong> ${item.vendor}</p>
        <p><strong>Plan:</strong> ${item.plan}</p>
        <p><strong>Current Expiry:</strong> ${item.expiryDate}</p>
        <p><strong>Status:</strong> 
          <span class="font-bold ${item.notificationStatus === 'Sent' ? 'text-green-600' : item.notificationStatus === 'Failed' ? 'text-red-600' : 'text-yellow-600'}">
            ${item.notificationStatus}
          </span>
        </p>
      `,
      icon: "info",
    });
  };

  /* ------------------- Render ------------------- */
  return (
    <div>
      <DataTable<Expiry>
        title="Plan Expiry Notifications"
        data={items}
        columns={[
          { key: "vendor", label: "Vendor" },
          { key: "plan", label: "Plan" },
          { key: "expiryDate", label: "Expiry Date" },
          {
            key: "notificationStatus",
            label: "Status",
            render: (e) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  e.notificationStatus === "Sent"
                    ? "bg-green-100 text-green-800"
                    : e.notificationStatus === "Failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {e.notificationStatus}
              </span>
            ),
          },
        ]}
        // Use same action pattern as PlanRenewalRequests
        onApprove={handleResend}
        onReject={handleExtend}
        onView={handleView}
      />
    </div>
  );
};

export default PlanExpiryNotifications;