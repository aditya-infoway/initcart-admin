/* src/pages/reports/InquiryReports.tsx */

import DataTable from "../../../components/common/DataTable";

interface Inquiry {
  id: string;
  service: string;
  totalInquiries: number;
  converted: number;
  pending: number;
  rejected: number;
}

const mockData: Inquiry[] = [
  {
    id: "SVC-001",
    service: "Home Deep Cleaning",
    totalInquiries: 245,
    converted: 89,
    pending: 112,
    rejected: 44,
  },
  {
    id: "SVC-002",
    service: "AC Repair",
    totalInquiries: 156,
    converted: 67,
    pending: 54,
    rejected: 35,
  },
  {
    id: "SVC-003",
    service: "Beauty Makeover",
    totalInquiries: 198,
    converted: 76,
    pending: 89,
    rejected: 33,
  },
];

const InquiryReports = () => {
  return (
    <div>
      <DataTable<Inquiry>
        title="Inquiry Reports"
        data={mockData}
        columns={[
          { key: "service", label: "Service" },
          {
            key: "totalInquiries",
            label: "Total Inquiries",
            render: (i) => (
              <span className="font-semibold text-gray-800">
                {i.totalInquiries.toLocaleString()}
              </span>
            ),
          },
          {
            key: "converted",
            label: "Converted",
            render: (i) => (
              <span className="text-green-600 font-medium">
                {i.converted.toLocaleString()}
              </span>
            ),
          },
          {
            key: "pending",
            label: "Pending",
            render: (i) => (
              <span className="text-yellow-600 font-medium">
                {i.pending.toLocaleString()}
              </span>
            ),
          },
          {
            key: "rejected",
            label: "Rejected",
            render: (i) => (
              <span className="text-red-600 font-medium">
                {i.rejected.toLocaleString()}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default InquiryReports;