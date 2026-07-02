import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Verification {
  id: number;
  agentName: string;
  invoiceNo: string;
  saleValue: number;
  proofDoc: string | null;
  commissionValue: number;
  status: "Pending" | "Verified" | "Rejected";
  verifiedBy: string | null;
  verifiedDate: string | null;
}

const mockVerifications: Verification[] = [
  {
    id: 1,
    agentName: "Rohit Sharma",
    invoiceNo: "INV-2025-001",
    saleValue: 10000,
    proofDoc: null,
    commissionValue: 60,
    status: "Pending",
    verifiedBy: null,
    verifiedDate: null,
  },
];

const AgentSaleVerification = () => {
  const [verifications, setVerifications] = useState<Verification[]>(mockVerifications);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const handleStatus = (id: number, status: "Verified" | "Rejected") => {
    Swal.fire({
      title: `${status} Sale?`,
      text: `Mark as ${status.toLowerCase()}?`,
      icon: status === "Verified" ? "question" : "warning",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        setVerifications(
          verifications.map((v) =>
            v.id === id
              ? {
                  ...v,
                  status,
                  verifiedBy: "Admin",
                  verifiedDate: new Date().toISOString().split("T")[0],
                }
              : v
          )
        );
        Swal.fire(`${status}!`, "", "success");
      }
    });
  };

  return (
    <div>
      <DataTable
        data={verifications}
        columns={[
            {
            key: "action",
            label: "Action",
            render: (v) =>
              v.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatus(v.id, "Verified")}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatus(v.id, "Rejected")}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                  >
                    Reject
                  </button>
                </div>
              ),
          },
          { key: "id", label: "Verification ID" },
          { key: "agentName", label: "Agent Name" },
          { key: "invoiceNo", label: "Invoice No" },
          {
            key: "saleValue",
            label: "Sale Value",
            render: (v) => `₹${v.saleValue.toLocaleString()}`,
          },
          {
            key: "proofDoc",
            label: "Proof",
            render: (v) => (
              <button
                onClick={() => setSelectedProof("Proof uploaded")}
                className="text-blue-600 underline text-sm"
              >
                View Proof
              </button>
            ),
          },
          {
            key: "commissionValue",
            label: "Commission",
            render: (v) => `₹${v.commissionValue.toLocaleString()}`,
          },
          {
            key: "status",
            label: "Status",
            render: (v) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  v.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : v.status === "Verified"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {v.status}
              </span>
            ),
          },
          { key: "verifiedBy", label: "Verified By" },
          { key: "verifiedDate", label: "Verified Date" },
          
        ]}
        title="Agent Sale Verification"
      />

      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Proof Document</h3>
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
              <p className="text-gray-500">Document Preview</p>
            </div>
            <button
              onClick={() => setSelectedProof(null)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSaleVerification;