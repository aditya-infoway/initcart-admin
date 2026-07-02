import { useState } from "react";
import DataTable from "../../../components/common/DataTable";

interface LevelReport {
  id: string; // Required by DataTable<T extends { id: ... }>
  level: string;
  totalAgents: number;
  totalSales: number;
  totalCommission: number;
  avgCommission: number;
  period: string;
}

const mockData: LevelReport[] = [
  {
    id: "1",
    level: "Starter",
    totalAgents: 45,
    totalSales: 225000,
    totalCommission: 4500,
    avgCommission: 100,
    period: "Oct 2025",
  },
  {
    id: "2",
    level: "Bronze",
    totalAgents: 32,
    totalSales: 480000,
    totalCommission: 14400,
    avgCommission: 450,
    period: "Oct 2025",
  },
  {
    id: "3",
    level: "Silver",
    totalAgents: 28,
    totalSales: 840000,
    totalCommission: 33600,
    avgCommission: 1200,
    period: "Oct 2025",
  },
  {
    id: "4",
    level: "Gold",
    totalAgents: 15,
    totalSales: 750000,
    totalCommission: 37500,
    avgCommission: 2500,
    period: "Oct 2025",
  },
];

const LevelWiseCommissionReport = () => {
  const [data] = useState<LevelReport[]>(mockData);

  return (
    <div>
      {/* Explicit generic: DataTable<LevelReport> */}
      <DataTable<LevelReport>
        title="Level-wise Commission Report"
        data={data}
        columns={[
          {
            key: "level",
            label: "Level",
            render: (item) => (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.level === "Gold"
                    ? "bg-yellow-100 text-yellow-800"
                    : item.level === "Silver"
                    ? "bg-gray-100 text-gray-700"
                    : item.level === "Bronze"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {item.level}
              </span>
            ),
          },
          {
            key: "totalAgents",
            label: "Total Agents",
            render: (item) => (
              <span className="font-medium text-gray-800">
                {item.totalAgents.toLocaleString()}
              </span>
            ),
          },
          {
            key: "totalSales",
            label: "Total Sales",
            render: (item) => (
              <span className="font-semibold text-green-600">
                ₹{item.totalSales.toLocaleString()}
              </span>
            ),
          },
          {
            key: "totalCommission",
            label: "Total Commission",
            render: (item) => (
              <span className="font-semibold text-purple-600">
                ₹{item.totalCommission.toLocaleString()}
              </span>
            ),
          },
          {
            key: "avgCommission",
            label: "Avg. Comm / Agent",
            render: (item) => (
              <span className="font-medium text-indigo-600">
                ₹{item.avgCommission.toLocaleString()}
              </span>
            ),
          },
          {
            key: "period",
            label: "Period",
            render: (item) => (
              <span className="text-sm text-gray-600">{item.period}</span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default LevelWiseCommissionReport;