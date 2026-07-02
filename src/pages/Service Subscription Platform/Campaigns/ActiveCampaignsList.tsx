/* src/pages/campaigns/ActiveCampaignsList.tsx */

import DataTable from "../../../components/common/DataTable";

interface ActiveCampaign {
  id: string;
  campaign: string;
  type: "Flash" | "Festival" | "Featured";
  dateRange: string;
  totalVendors: number;
  servicesCount: number;
  status: "Live" | "Upcoming" | "Ended";
}

const mockData: ActiveCampaign[] = [
  {
    id: "CAMP-001",
    campaign: "Diwali Dhamaka",
    type: "Festival",
    dateRange: "Nov 1 - Nov 10",
    totalVendors: 42,
    servicesCount: 156,
    status: "Live",
  },
  {
    id: "CAMP-002",
    campaign: "Summer Cool",
    type: "Flash",
    dateRange: "Jun 15 - Jun 20",
    totalVendors: 28,
    servicesCount: 89,
    status: "Ended",
  },
];

const ActiveCampaignsList = () => {
  return (
    <div>
      <DataTable<ActiveCampaign>
        title="Active Campaigns List"
        data={mockData}
        columns={[
          { key: "campaign", label: "Campaign" },
          {
            key: "type",
            label: "Type",
            render: (c) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.type === "Flash"
                    ? "bg-orange-100 text-orange-800"
                    : c.type === "Festival"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {c.type}
              </span>
            ),
          },
          { key: "dateRange", label: "Start-End" },
          { key: "totalVendors", label: "Total Vendors" },
          { key: "servicesCount", label: "Services Count" },
          {
            key: "status",
            label: "Status",
            render: (c) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.status === "Live"
                    ? "bg-green-100 text-green-800"
                    : c.status === "Upcoming"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {c.status}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ActiveCampaignsList;