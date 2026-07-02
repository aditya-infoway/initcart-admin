import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Payout {
  id: string; // Required by DataTable
  agent: string;
  amount: number;
  date: string;
  paymentMode: "Wallet" | "Bank Transfer";
  reference: string;
  status: "Paid" | "Failed" | "Processing";
}

const mockData: Payout[] = [
  {
    id: "PAY-001",
    agent: "Rohit Sharma",
    amount: 4800,
    date: "2025-10-20",
    paymentMode: "Wallet",
    reference: "REF-WAL-123",
    status: "Paid",
  },
  {
    id: "PAY-002",
    agent: "Virat Kohli",
    amount: 2100,
    date: "2025-10-18",
    paymentMode: "Bank Transfer",
    reference: "REF-BNK-456",
    status: "Processing",
  },
  {
    id: "PAY-003",
    agent: "MS Dhoni",
    amount: 3200,
    date: "2025-10-15",
    paymentMode: "Wallet",
    reference: "REF-WAL-789",
    status: "Failed",
  },
];

const PayoutHistory = () => {
  const [data] = useState<Payout[]>(mockData);

  const handleView = (item: Payout) => {
    Swal.fire({
      title: `Payout ${item.id}`,
      html: `
        <div class="text-left space-y-2 text-sm">
          <p><strong>Agent:</strong> <span class="font-medium">${item.agent}</span></p>
          <p><strong>Amount:</strong> <span class="font-bold text-green-600">₹${item.amount.toLocaleString()}</span></p>
          <p><strong>Date:</strong> <span class="text-gray-600">${item.date}</span></p>
          <p><strong>Mode:</strong> <span class="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">${item.paymentMode}</span></p>
          <p><strong>Reference:</strong> <span class="font-mono text-xs">${item.reference}</span></p>
          <p><strong>Status:</strong> 
            <span class="px-2 py-1 rounded-full text-xs font-medium ${
              item.status === "Paid"
                ? "bg-green-100 text-green-800"
                : item.status === "Failed"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }">
              ${item.status}
            </span>
          </p>
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

  return (
    <div>
      {/* Explicit generic: DataTable<Payout> */}
      <DataTable<Payout>
        title="Payout History"
        data={data}
        columns={[
          { key: "id", label: "Payout ID" },
          { key: "agent", label: "Agent" },
          {
            key: "amount",
            label: "Amount",
            render: (item) => (
              <span className="font-semibold text-green-600">
                ₹{item.amount.toLocaleString()}
              </span>
            ),
          },
          {
            key: "date",
            label: "Date",
            render: (item) => (
              <span className="text-gray-600">{item.date}</span>
            ),
          },
          {
            key: "paymentMode",
            label: "Payment Mode",
            render: (item) => (
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                {item.paymentMode}
              </span>
            ),
          },
          {
            key: "reference",
            label: "Reference",
            render: (item) => (
              <span className="font-mono text-xs text-gray-500">
                {item.reference}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : item.status === "Failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status}
              </span>
            ),
          },
        ]}
        onView={handleView} // Uses the built-in "View" button
      />
    </div>
  );
};

export default PayoutHistory;