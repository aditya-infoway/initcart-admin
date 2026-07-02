/* src/pages/reports/VendorEarningsReport.tsx */

import DataTable from "../../../components/common/DataTable";

interface VendorEarnings {
  id: string;
  vendor: string;
  serviceCount: number;
  totalInquiries: number;
  revenue: number;
  withdrawals: number;
  balance: number;
}

const mockData: VendorEarnings[] = [
  {
    id: "EARN-001",
    vendor: "CleanPro Services",
    serviceCount: 12,
    totalInquiries: 245,
    revenue: 125000,
    withdrawals: 85000,
    balance: 40000,
  },
  {
    id: "EARN-002",
    vendor: "QuickFix AC",
    serviceCount: 8,
    totalInquiries: 156,
    revenue: 78000,
    withdrawals: 52000,
    balance: 26000,
  },
  {
    id: "EARN-003",
    vendor: "BeautyHub Salon",
    serviceCount: 15,
    totalInquiries: 198,
    revenue: 142000,
    withdrawals: 95000,
    balance: 47000,
  },
];

const VendorEarningsReport = () => {
  return (
    <div>
      <DataTable<VendorEarnings>
        title="Vendor Earnings Report"
        data={mockData}
        columns={[
          { key: "vendor", label: "Vendor" },
          {
            key: "serviceCount",
            label: "Service Count",
            render: (e) => (
              <span className="font-medium">{e.serviceCount}</span>
            ),
          },
          {
            key: "totalInquiries",
            label: "Total Inquiries",
            render: (e) => (
              <span className="font-medium">{e.totalInquiries.toLocaleString()}</span>
            ),
          },
          {
            key: "revenue",
            label: "Revenue",
            render: (e) => (
              <span className="font-semibold text-green-600">
                ₹{e.revenue.toLocaleString()}
              </span>
            ),
          },
          {
            key: "withdrawals",
            label: "Withdrawals",
            render: (e) => (
              <span className="font-semibold text-orange-600">
                ₹{e.withdrawals.toLocaleString()}
              </span>
            ),
          },
          {
            key: "balance",
            label: "Balance",
            render: (e) => (
              <span className="font-bold text-blue-600">
                ₹{e.balance.toLocaleString()}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default VendorEarningsReport;