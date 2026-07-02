import { useState } from "react";
import DataTable from "../../../components/common/DataTable";
import Swal from "sweetalert2";

interface Withdrawal {
  id: number;
  vendorName: string;
  walletBalance: number;
  requestedAmount: number;
  requestDate: string;
  paymentMode: "Bank" | "UPI";
  status: "Pending" | "Approved" | "Rejected";
  approvedAmount: number | null;
  paidDate: string | null;
  referenceNo: string | null;
}

const VendorWalletWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: 1,
      vendorName: "Elite Electronics",
      walletBalance: 5000,
      requestedAmount: 2000,
      requestDate: "2025-01-15",
      paymentMode: "Bank",
      status: "Pending",
      approvedAmount: null,
      paidDate: null,
      referenceNo: null,
    },
    // Add more sample data as needed
  ]);

  const handleApprove = (item: Withdrawal) => {
    Swal.fire({
      title: "Approve Withdrawal?",
      text: `Do you want to approve ${item.requestedAmount} for "${item.vendorName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === item.id
              ? {
                  ...w,
                  status: "Approved",
                  approvedAmount: item.requestedAmount,
                  paidDate: new Date().toISOString().split("T")[0],
                  referenceNo: `REF${w.id}${Date.now()}`,
                }
              : w
          )
        );
        Swal.fire("Approved!", `Withdrawal for "${item.vendorName}" has been approved.`, "success");
      }
    });
  };

  const handleReject = (item: Withdrawal) => {
    Swal.fire({
      title: "Reject Withdrawal?",
      text: `Do you want to reject ${item.requestedAmount} for "${item.vendorName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === item.id ? { ...w, status: "Rejected" } : w
          )
        );
        Swal.fire("Rejected!", `Withdrawal for "${item.vendorName}" has been rejected.`, "error");
      }
    });
  };

  const handleView = (item: Withdrawal) => {
    Swal.fire({
      title: `${item.vendorName} Withdrawal Details`,
      html: `
        <p><strong>Vendor Name:</strong> ${item.vendorName}</p>
        <p><strong>Wallet Balance:</strong> ${item.walletBalance}</p>
        <p><strong>Requested Amount:</strong> ${item.requestedAmount}</p>
        <p><strong>Request Date:</strong> ${item.requestDate}</p>
        <p><strong>Payment Mode:</strong> ${item.paymentMode}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Approved Amount:</strong> ${item.approvedAmount || "N/A"}</p>
        <p><strong>Paid Date:</strong> ${item.paidDate || "N/A"}</p>
        <p><strong>Reference No:</strong> ${item.referenceNo || "N/A"}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  return (
    <div className="">
      <DataTable
        title="Vendor Wallet & Withdrawals"
        data={withdrawals}
        columns={[
        //   { key: "id", label: "SR No" },
          { key: "vendorName", label: "Vendor Name" },
          { key: "walletBalance", label: "Wallet Balance" },
          { key: "requestedAmount", label: "Requested Amount" },
          { key: "requestDate", label: "Request Date" },
          { key: "paymentMode", label: "Payment Mode" },
          {
            key: "status",
            label: "Status",
            render: (item: Withdrawal) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Approved"
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
          { key: "approvedAmount", label: "Approved Amount", render: (item: Withdrawal) => item.approvedAmount || "N/A" },
          { key: "paidDate", label: "Paid Date", render: (item: Withdrawal) => item.paidDate || "N/A" },
          // { key: "referenceNo", label: "Reference No", render: (item: Withdrawal) => item.referenceNo || "N/A" },
          // {
          //   key: "action",
          //   label: "Action",
          //   render: (item: Withdrawal) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleView(item)}
          //         className="px-2 py-1 bg-blue-500 text-white rounded"
          //       >
          //         View
          //       </button>
          //       {item.status === "Pending" && (
          //         <>
          //           <button
          //             onClick={() => handleApprove(item)}
          //             className="px-2 py-1 bg-green-500 text-white rounded"
          //           >
          //             Approve
          //           </button>
          //           <button
          //             onClick={() => handleReject(item)}
          //             className="px-2 py-1 bg-red-500 text-white rounded"
          //           >
          //             Reject
          //           </button>
          //         </>
          //       )}
          //     </div>
          //   ),
          // },
        ]}
        // onView={handleView}
        // onApprove={handleApprove}
        // onReject={handleReject}
      />
    </div>
  );
};

export default VendorWalletWithdrawals;