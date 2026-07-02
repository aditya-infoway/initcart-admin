import DataTable from "../../../components/common/DataTable";

interface ServicePerformance {
  id: string;
  serviceName: string;
  vendor: string;
  views: number;
  inquiries: number;
  dealsJoined: number;
  avgRating: number;
}

const mockData: ServicePerformance[] = [
  {
    id: "PERF-001",
    serviceName: "Home Deep Cleaning",
    vendor: "CleanPro Services",
    views: 1250,
    inquiries: 245,
    dealsJoined: 89,
    avgRating: 4.7,
  },
  {
    id: "PERF-002",
    serviceName: "AC Repair",
    vendor: "QuickFix AC",
    views: 890,
    inquiries: 156,
    dealsJoined: 67,
    avgRating: 4.5,
  },
  {
    id: "PERF-003",
    serviceName: "Beauty Makeover",
    vendor: "BeautyHub Salon",
    views: 1670,
    inquiries: 198,
    dealsJoined: 76,
    avgRating: 4.8,
  },
];

const ServicePerformanceReport = () => {
  return (
    <div>
      <DataTable<ServicePerformance>
        title="Service Performance Report"
        data={mockData}
        columns={[
          { key: "serviceName", label: "Service Name" },
          { key: "vendor", label: "Vendor" },
          {
            key: "views",
            label: "Views",
            render: (p) => (
              <span className="font-semibold text-blue-600">
                {p.views.toLocaleString()}
              </span>
            ),
          },
          {
            key: "inquiries",
            label: "Inquiries",
            render: (p) => (
              <span className="font-semibold text-green-600">
                {p.inquiries.toLocaleString()}
              </span>
            ),
          },
          {
            key: "dealsJoined",
            label: "Deals Joined",
            render: (p) => (
              <span className="font-semibold text-purple-600">
                {p.dealsJoined.toLocaleString()}
              </span>
            ),
          },
          {
            key: "avgRating",
            label: "Avg Rating",
            render: (p) => (
              <span className="font-semibold text-yellow-600">
                {p.avgRating} ⭐
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ServicePerformanceReport;