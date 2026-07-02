import { useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import DataTable from "../../components/common/DataTable";
import Swal from "sweetalert2";

interface AuditLog {
  id: number;
  user: string;
  module: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  remarks: string;
}

const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 1,
      user: "admin@ecommerce.com",
      module: "Vendor Management",
      action: "Approved Vendor",
      timestamp: "2025-10-16 06:30:00",
      ipAddress: "192.168.1.1",
      remarks: "Approved vendor Elite Electronics",
    },
    {
      id: 2,
      user: "superadmin@ecommerce.com",
      module: "Order Management",
      action: "Cancelled Order",
      timestamp: "2025-10-15 14:45:00",
      ipAddress: "192.168.1.2",
      remarks: "Order #123 cancelled due to customer request",
    },
  ]);

  const handleView = (item: AuditLog) => {
    Swal.fire({
      title: `Audit Log #${item.id}`,
      html: `
        <p><strong>User:</strong> ${item.user}</p>
        <p><strong>Module:</strong> ${item.module}</p>
        <p><strong>Action:</strong> ${item.action}</p>
        <p><strong>Timestamp:</strong> ${item.timestamp}</p>
        <p><strong>IP Address:</strong> ${item.ipAddress}</p>
        <p><strong>Remarks:</strong> ${item.remarks || "N/A"}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  return (
    <div className="">
      <DataTable
        title="Audit Log"
        data={logs}
        columns={[
          { key: "user", label: "User" },
          { key: "module", label: "Module" },
          { key: "action", label: "Action" },
          { key: "timestamp", label: "Timestamp" },
          { key: "ipAddress", label: "IP Address" },
          { key: "remarks", label: "Remarks", render: (item: AuditLog) => <span>{item.remarks || "N/A"}</span> },
          // {
          //   key: "logAction",
          //   label: "Action",
          //   render: (item: AuditLog) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleView(item)}
          //         className="px-2 py-1 bg-blue-500 text-white rounded"
          //       >
          //         View
          //       </button>
          //     </div>
          //   ),
          // },
        ]}
        onView={handleView}
      />
    </div>
  );
};

export default AuditLog;