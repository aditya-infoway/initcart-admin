import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Withdrawal {
  id: number;
  agentName: string;
  level: string;
  requestedAmount: number;
  requestedDate: string;
  allowPartial: boolean;
  approvedAmount: number | null;
  paymentMode: "Wallet" | "Bank Transfer";
  reference: string | null;
  status: "Pending" | "Approved" | "Rejected";
}

const mockWithdrawals: Withdrawal[] = [
  {
    id: 1,
    agentName: "Virat Kohli",
    level: "Gold",
    requestedAmount: 8000,
    requestedDate: "2025-10-20",
    allowPartial: true,
    approvedAmount: null,
    paymentMode: "Bank Transfer",
    reference: null,
    status: "Pending",
  },
];

const WithdrawalRequests = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals);

  const handleAction = (
    id: number,
    action: "approve" | "reject" | "partial",
    amount?: number
  ) => {
    const withdrawal = withdrawals.find((w) => w.id === id)!;
    if (action === "partial" && !amount) return;

    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Request?`,
      input: action === "partial" ? "number" : undefined,
      inputLabel: action === "partial" ? "Approved Amount" : undefined,
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        const finalAmount =
          action === "partial" ? Number(res.value) : withdrawal.requestedAmount;
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === id
              ? {
                  ...w,
                  status: action === "reject" ? "Rejected" : "Approved",
                  approvedAmount: finalAmount,
                  reference: "REF-WD-001",
                }
              : w
          )
        );
        Swal.fire(
          `${action === "reject" ? "Rejected" : "Approved"}!`,
          "",
          "success"
        );
      }
    });
  };

  return (
    <div>
      <DataTable
        data={withdrawals}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (w) =>
              w.status === "Pending" && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAction(w.id, "approve")}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs cursor-pointer"
                  >
                    Approve
                  </button>
                  {w.allowPartial && (
                    <button
                      onClick={() => handleAction(w.id, "partial")}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs cursor-pointer"
                    >
                      Partial
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(w.id, "reject")}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              ),
          },
          { key: "id", label: "Request ID" },
          { key: "agentName", label: "Agent Name" },
          { key: "level", label: "Level" },
          {
            key: "requestedAmount",
            label: "Requested",
            render: (w) => `₹${w.requestedAmount.toLocaleString()}`,
          },
          { key: "requestedDate", label: "Date" },
          {
            key: "allowPartial",
            label: "Partial?",
            render: (w) => (w.allowPartial ? "Yes" : "No"),
          },
          {
            key: "approvedAmount",
            label: "Approved",
            render: (w) =>
              w.approvedAmount ? `₹${w.approvedAmount.toLocaleString()}` : "-",
          },
          { key: "paymentMode", label: "Mode" },
          { key: "reference", label: "Ref No" },
          {
            key: "status",
            label: "Status",
            render: (w) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  w.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : w.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {w.status}
              </span>
            ),
          },
        ]}
        title="Withdrawal Requests"
      />
    </div>
  );
};

export default WithdrawalRequests;
