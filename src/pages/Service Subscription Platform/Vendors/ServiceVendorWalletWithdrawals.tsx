import { useState } from "react";
import { RiUserSettingsLine } from "react-icons/ri";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Withdrawal {
  id: string;
  vendor: string;
  walletBalance: number;
  requestedAmount: number;
  paymentMode: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected" | "Paid";
  approvedAmount: number | null;
  paidDate: string | null;
  referenceNo: string | null;
}

const ServiceVendorWalletWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: "WDR-001",
      vendor: "FitPro Gym",
      walletBalance: 75000,
      requestedAmount: 50000,
      paymentMode: "Bank Transfer",
      requestDate: "2025-10-15",
      status: "Pending",
      approvedAmount: null,
      paidDate: null,
      referenceNo: null,
    },
    {
      id: "WDR-002",
      vendor: "Serenity Spa",
      walletBalance: 30000,
      requestedAmount: 20000,
      paymentMode: "UPI",
      requestDate: "2025-10-14",
      status: "Paid",
      approvedAmount: 20000,
      paidDate: "2025-10-15",
      referenceNo: "REF123456",
    },
  ]);

  const handleView = (item: Withdrawal) => {
    Swal.fire({
      title: `Withdrawal Request #${item.id}`,
      html: `
        <p><strong>Vendor:</strong> ${item.vendor}</p>
        <p><strong>Wallet Balance:</strong> ₹${item.walletBalance}</p>
        <p><strong>Requested Amount:</strong> ₹${item.requestedAmount}</p>
        <p><strong>Payment Mode:</strong> ${item.paymentMode}</p>
        <p><strong>Request Date:</strong> ${item.requestDate}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Approved Amount:</strong> ${item.approvedAmount ? `₹${item.approvedAmount}` : "N/A"}</p>
        <p><strong>Paid Date:</strong> ${item.paidDate || "N/A"}</p>
        <p><strong>Reference No:</strong> ${item.referenceNo || "N/A"}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const handleApprove = (item: Withdrawal) => {
    Swal.fire({
      title: "Approve Withdrawal",
      text: `Are you sure you want to approve the withdrawal of ₹${item.requestedAmount} for ${item.vendor}?`,
      input: "number",
      inputPlaceholder: "Enter approved amount",
      inputAttributes: { min: "0", step: "1", max: `${item.requestedAmount}` },
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === item.id
              ? {
                  ...w,
                  status: "Approved",
                  approvedAmount: Number(result.value),
                  paidDate: new Date().toISOString().split("T")[0],
                  referenceNo: `REF${Math.floor(100000 + Math.random() * 900000)}`,
                }
              : w
          )
        );
        Swal.fire("Approved!", `Withdrawal #${item.id} has been approved.`, "success");
      }
    });
  };

  const handleReject = (item: Withdrawal) => {
    Swal.fire({
      title: "Reject Withdrawal",
      text: `Are you sure you want to reject the withdrawal for ${item.vendor}?`,
      input: "text",
      inputPlaceholder: "Enter rejection reason (optional)",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === item.id
              ? { ...w, status: "Rejected", remarks: result.value || "Rejected by admin" }
              : w
          )
        );
        Swal.fire("Rejected!", `Withdrawal #${item.id} has been rejected.`, "success");
      }
    });
  };

  return (
    <div className="">
      <DataTable
        title="Vendor Wallet & Withdrawal Requests"
        data={withdrawals}
        columns={[
          {
            key: "withdrawalAction",
            label: "Action",
            render: (item: Withdrawal) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  View
                </button>
                {item.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(item)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            ),
          },
          { key: "id", label: "Request ID" },
          { key: "vendor", label: "Vendor" },
          { key: "walletBalance", label: "Wallet Balance", render: (item: Withdrawal) => <span>₹{item.walletBalance}</span> },
          { key: "requestedAmount", label: "Requested Amount", render: (item: Withdrawal) => <span>₹${item.requestedAmount}</span> },
          { key: "paymentMode", label: "Payment Mode" },
          { key: "requestDate", label: "Request Date" },
          {
            key: "status",
            label: "Status",
            render: (item: Withdrawal) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Approved" || item.status === "Paid"
                    ? "text-green-700"
                    : item.status === "Pending"
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
          {
            key: "approvedAmount",
            label: "Approved Amount",
            render: (item: Withdrawal) => <span>{item.approvedAmount ? `₹${item.approvedAmount}` : "N/A"}</span>,
          },
          { key: "paidDate", label: "Paid Date", render: (item: Withdrawal) => <span>{item.paidDate || "N/A"}</span> },
          { key: "referenceNo", label: "Reference No", render: (item: Withdrawal) => <span>{item.referenceNo || "N/A"}</span> },
          
        ]}
      />
    </div>
  );
};

export default ServiceVendorWalletWithdrawals;