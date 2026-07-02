import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Payout {
  id: number;
  agentId: string;
  agentName: string;
  period: string;
  totalCommission: number;
  deductions: number;
  netPayable: number;
  paymentMode: "Wallet" | "Bank Transfer";
  reference: string | null;
  status: "Pending" | "Paid";
  paidDate: string | null;
}

const mockPayouts: Payout[] = [
  {
    id: 1,
    agentId: "AGT-001",
    agentName: "Rohit Sharma",
    period: "Oct 2025",
    totalCommission: 5000,
    deductions: 200,
    netPayable: 4800,
    paymentMode: "Wallet",
    reference: null,
    status: "Pending",
    paidDate: null,
  },
];

const CommissionPayouts = () => {
  const [payouts, setPayouts] = useState<Payout[]>(mockPayouts);

  const handlePay = (payout: Payout) => {
    Swal.fire({
      title: "Pay Now?",
      text: `Pay ₹${payout.netPayable} to ${payout.agentName}?`,
      icon: "question",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        setPayouts(
          payouts.map((p) =>
            p.id === payout.id
              ? { ...p, status: "Paid", reference: "REF-12345", paidDate: new Date().toISOString().split("T")[0] }
              : p
          )
        );
        Swal.fire("Paid!", "", "success");
      }
    });
  };

  return (
    <div>
      <DataTable
        data={payouts}
        columns={[
            {
            key: "action",
            label: "Action",
            render: (p) =>
              p.status === "Pending" && (
                <button
                  onClick={() => handlePay(p)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs cursor-pointer"
                >
                  Pay Now
                </button>
              ),
          },
          { key: "id", label: "Payout ID" },
          { key: "agentId", label: "Agent ID" },
          { key: "agentName", label: "Agent Name" },
          { key: "period", label: "Period" },
          {
            key: "totalCommission",
            label: "Total Comm",
            render: (p) => `₹${p.totalCommission.toLocaleString()}`,
          },
          {
            key: "deductions",
            label: "Deductions",
            render: (p) => `₹${p.deductions.toLocaleString()}`,
          },
          {
            key: "netPayable",
            label: "Net Payable",
            render: (p) => `₹${p.netPayable.toLocaleString()}`,
          },
          { key: "paymentMode", label: "Mode" },
          { key: "reference", label: "Ref No" },
          {
            key: "status",
            label: "Status",
            render: (p) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  p.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {p.status}
              </span>
            ),
          },
          { key: "paidDate", label: "Paid Date" },
          
        ]}
        title="Commission Payouts"
      />
    </div>
  );
};

export default CommissionPayouts;