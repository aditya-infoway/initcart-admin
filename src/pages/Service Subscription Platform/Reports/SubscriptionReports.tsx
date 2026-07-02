/* src/pages/reports/SubscriptionReports.tsx */

import DataTable from "../../../components/common/DataTable";

interface Subscription {
  id: string;
  vendor: string;
  plan: "Basic" | "Pro" | "Enterprise";
  startDate: string;
  endDate: string;
  revenue: number;
  status: "Active" | "Expired" | "Cancelled";
}

const mockData: Subscription[] = [
  {
    id: "SUB-001",
    vendor: "CleanPro Services",
    plan: "Pro",
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    revenue: 2999,
    status: "Active",
  },
  {
    id: "SUB-002",
    vendor: "QuickFix AC",
    plan: "Basic",
    startDate: "2025-09-15",
    endDate: "2025-10-31",
    revenue: 999,
    status: "Expired",
  },
  {
    id: "SUB-003",
    vendor: "BeautyHub Salon",
    plan: "Enterprise",
    startDate: "2025-11-01",
    endDate: "2026-10-31",
    revenue: 5999,
    status: "Active",
  },
];

const SubscriptionReports = () => {
  return (
    <div>
      <DataTable<Subscription>
        title="Subscription Reports"
        data={mockData}
        columns={[
          { key: "vendor", label: "Vendor" },
          {
            key: "plan",
            label: "Plan",
            render: (s) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  s.plan === "Basic"
                    ? "bg-blue-100 text-blue-800"
                    : s.plan === "Pro"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {s.plan}
              </span>
            ),
          },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          {
            key: "revenue",
            label: "Revenue",
            render: (s) => `₹${s.revenue.toLocaleString()}`,
          },
          {
            key: "status",
            label: "Status",
            render: (s) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  s.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : s.status === "Expired"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {s.status}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SubscriptionReports;