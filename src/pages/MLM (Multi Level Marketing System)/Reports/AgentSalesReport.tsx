import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface AgentSale {
  id: string;                     
  agentId: string;
  agentName: string;
  level: string;
  totalSales: number;
  directSales: number;
  indirectSales: number;
  commissionEarned: number;
  period: string;
}

const mockData: AgentSale[] = [
  {
    id: "1",
    agentId: "AGT-001",
    agentName: "Rohit Sharma",
    level: "Gold",
    totalSales: 85000,
    directSales: 50000,
    indirectSales: 35000,
    commissionEarned: 1700,
    period: "Oct 2025",
  },
  {
    id: "2",
    agentId: "AGT-002",
    agentName: "Virat Kohli",
    level: "Silver",
    totalSales: 42000,
    directSales: 30000,
    indirectSales: 12000,
    commissionEarned: 840,
    period: "Oct 2025",
  },
];

const AgentSalesReport = () => {
  const [data] = useState<AgentSale[]>(mockData);

  const handleView = (item: AgentSale) => {
    Swal.fire({
      title: `<span class="text-lg font-bold">${item.agentName}</span>`,
      html: `
        <div class="text-left space-y-2 text-sm">
          <p><strong>Agent ID:</strong> <span class="font-mono">${item.agentId}</span></p>
          <p><strong>Level:</strong> <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">${item.level}</span></p>
          <p><strong>Total Sales:</strong> <span class="font-semibold">₹${item.totalSales.toLocaleString()}</span></p>
          <p><strong>Direct Sales:</strong> <span class="text-green-600">₹${item.directSales.toLocaleString()}</span></p>
          <p><strong>Indirect Sales:</strong> <span class="text-blue-600">₹${item.indirectSales.toLocaleString()}</span></p>
          <p><strong>Commission Earned:</strong> <span class="text-purple-600 font-bold">₹${item.commissionEarned.toLocaleString()}</span></p>
          <p><strong>Period:</strong> ${item.period}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      customClass: {
        confirmButton: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
      },
      buttonsStyling: false,
    });
  };

  const handleExport = (item: AgentSale) => {
    const csv = [
      [
        "Agent ID",
        "Agent Name",
        "Level",
        "Total Sales",
        "Direct Sales",
        "Indirect Sales",
        "Commission Earned",
        "Period",
      ],
      [
        item.agentId,
        item.agentName,
        item.level,
        item.totalSales,
        item.directSales,
        item.indirectSales,
        item.commissionEarned,
        item.period,
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.agentId}_${item.agentName.replace(/ /g, "_")}_sales_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Exported!",
      text: `${item.agentName}'s report downloaded as CSV`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div>
      {/* Explicit generic: DataTable<AgentSale> */}
      <DataTable<AgentSale>
        title="Agent Sales Report"
        data={data}
        columns={[
          { key: "agentId", label: "Agent ID" },
          { key: "agentName", label: "Agent Name" },
          {
            key: "level",
            label: "Level",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.level === "Gold"
                    ? "bg-yellow-100 text-yellow-800"
                    : item.level === "Silver"
                    ? "bg-gray-100 text-gray-800"
                    : item.level === "Bronze"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {item.level}
              </span>
            ),
          },
          {
            key: "totalSales",
            label: "Total Sales",
            render: (item) => `₹${item.totalSales.toLocaleString()}`,
          },
          {
            key: "directSales",
            label: "Direct Sales",
            render: (item) => `₹${item.directSales.toLocaleString()}`,
          },
          {
            key: "indirectSales",
            label: "Indirect Sales",
            render: (item) => `₹${item.indirectSales.toLocaleString()}`,
          },
          {
            key: "commissionEarned",
            label: "Commission",
            render: (item) => (
              <span className="font-medium text-purple-600">
                ₹{item.commissionEarned.toLocaleString()}
              </span>
            ),
          },
          { key: "period", label: "Period" },
        ]}
        onView={handleView}
        onDownload={handleExport}
      />
    </div>
  );
};

export default AgentSalesReport;