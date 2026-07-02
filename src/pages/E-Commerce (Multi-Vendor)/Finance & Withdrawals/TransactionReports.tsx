import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Transaction {
  id: number;
  type: "Sale" | "Payout" | "Refund";
  vendor: string;
  date: string;
  amount: number;
  mode: "Credit Card" | "Debit Card" | "UPI" | "COD" | "Bank Transfer";
  reference: string;
  status: "Completed" | "Pending" | "Failed";
}

const TransactionReports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: "Sale",
      vendor: "Elite Electronics",
      date: "2025-10-15",
      amount: 25000,
      mode: "UPI",
      reference: "TXN123456",
      status: "Completed",
    },
    {
      id: 2,
      type: "Payout",
      vendor: "TechTrend",
      date: "2025-10-14",
      amount: 30000,
      mode: "Bank Transfer",
      reference: "REF123456",
      status: "Pending",
    },
    {
      id: 3,
      type: "Refund",
      vendor: "Elite Electronics",
      date: "2025-10-13",
      amount: 15000,
      mode: "UPI",
      reference: "REF789012",
      status: "Completed",
    },
  ]);

  const handleView = (item: Transaction) => {
    Swal.fire({
      title: `Transaction #${item.id}`,
      html: `
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Vendor:</strong> ${item.vendor}</p>
        <p><strong>Date:</strong> ${item.date}</p>
        <p><strong>Amount:</strong> ₹${item.amount}</p>
        <p><strong>Mode:</strong> ${item.mode}</p>
        <p><strong>Reference:</strong> ${item.reference}</p>
        <p><strong>Status:</strong> ${item.status}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const handleExport = (format: "CSV" | "PDF") => {
    Swal.fire({
      title: `Export ${format}`,
      text: `Exporting Transaction Report as ${format}. This is a placeholder action.`,
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  return (
    <div className="">
      <DataTable
        title="Transaction Reports"
        data={transactions}
        columns={[
           {
            key: "export",
            label: "Export",
            render: (item: Transaction) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport("CSV")}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport("PDF")}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  PDF
                </button>
                <button
                  onClick={() => handleView(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  View
                </button>
              </div>
            ),
          },
          { key: "id", label: "Transaction ID" },
          { key: "type", label: "Type" },
          { key: "vendor", label: "Vendor" },
          { key: "date", label: "Date" },
          { key: "amount", label: "Amount", render: (item: Transaction) => <span>₹{item.amount}</span> },
          { key: "mode", label: "Mode" },
          { key: "reference", label: "Reference" },
          {
            key: "status",
            label: "Status",
            render: (item: Transaction) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Completed" ? "text-green-700" : item.status === "Pending" ? "text-yellow-700" : "text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
         
        ]}
      />
    </div>
  );
};

export default TransactionReports;