// import { useState } from "react";
// import DataTable from "../../../components/common/DataTable";
// import Swal from "sweetalert2";

// interface Renewal {
//   id: number;
//   vendor: string;
//   currentPlan: string;
//   renewalPlan: string;
//   paymentProof: File | null;
//   date: string;
//   status: "Pending" | "Approved" | "Rejected";
// }

// const PlanRenewalRequests = () => {
//   const [renewals, setRenewals] = useState<Renewal[]>([
//     {
//       id: 1,
//       vendor: "TechStore Inc",
//       currentPlan: "Basic",
//       renewalPlan: "Pro",
//       paymentProof: null,
//       date: "2025-10-28",
//       status: "Pending",
//     },
//   ]);

//   const [viewing, setViewing] = useState<Renewal | null>(null);
//   const [proofFile, setProofFile] = useState<File | null>(null);

//   const handleApprove = (r: Renewal) => {
//     Swal.fire({
//       title: "Approve?",
//       text: `${r.vendor} → ${r.renewalPlan}`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Approve",
//     }).then((res) => {
//       if (res.isConfirmed) {
//         setRenewals((prev) =>
//           prev.map((x) => (x.id === r.id ? { ...x, status: "Approved" } : x))
//         );
//         Swal.fire("Approved!", "", "success");
//       }
//     });
//   };

//   const handleReject = (r: Renewal) => {
//     Swal.fire({
//       title: "Reject?",
//       text: `${r.vendor}'s request will be denied.`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Reject",
//       confirmButtonColor: "#d33",
//     }).then((res) => {
//       if (res.isConfirmed) {
//         setRenewals((prev) =>
//           prev.map((x) => (x.id === r.id ? { ...x, status: "Rejected" } : x))
//         );
//         Swal.fire("Rejected!", "", "error");
//       }
//     });
//   };

//   const openView = (r: Renewal) => {
//     setViewing(r);
//     setProofFile(r.paymentProof);
//   };

//   const uploadProof = () => {
//     if (!viewing || !proofFile) return;
//     setRenewals((prev) =>
//       prev.map((x) =>
//         x.id === viewing.id ? { ...x, paymentProof: proofFile } : x
//       )
//     );
//     Swal.fire("Uploaded!", "Payment proof attached.", "success");
//     setViewing(null);
//   };

//   return (
//     <div className="p-4">
//       <DataTable
//         title="Plan Renewal Requests"
//         data={renewals}
//         columns={[
//           {
//             key: "action",
//             label: "Action",
//             render: (item: Renewal) => (
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => openView(item)}
//                   className="px-2 py-1 bg-blue-500 text-white rounded"
//                 >
//                   View
//                 </button>
//                 {item.status === "Pending" && (
//                   <>
//                     <button
//                       onClick={() => handleApprove(item)}
//                       className="text-green-600 hover:underline text-sm mr-2"
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => handleReject(item)}
//                       className="text-red-600 hover:underline text-sm"
//                     >
//                       Reject
//                     </button>
//                   </>
//                 )}
//               </div>
//             ),
//           },
//           { key: "id", label: "Request ID" },
//           { key: "vendor", label: "Vendor" },
//           { key: "currentPlan", label: "Current Plan" },
//           { key: "renewalPlan", label: "Renewal Plan" },
//           { key: "date", label: "Date" },
//           {
//             key: "status",
//             label: "Status",
//             render: (r: Renewal) => (
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                   r.status === "Approved"
//                     ? "bg-green-100 text-green-800"
//                     : r.status === "Rejected"
//                     ? "bg-red-100 text-red-800"
//                     : "bg-yellow-100 text-yellow-800"
//                 }`}
//               >
//                 {r.status}
//               </span>
//             ),
//           },
//         ]}
//         // actions={(r: Renewal) => (
//         //   <>
//         //     <button onClick={() => openView(r)} className="text-blue-600 hover:underline text-sm mr-2">
//         //       View
//         //     </button>
//         //     {r.status === "Pending" && (
//         //       <>
//         //         <button onClick={() => handleApprove(r)} className="text-green-600 hover:underline text-sm mr-2">
//         //           Approve
//         //         </button>
//         //         <button onClick={() => handleReject(r)} className="text-red-600 hover:underline text-sm">
//         //           Reject
//         //         </button>
//         //       </>
//         //     )}
//         //   </>
//         // )}
//       />

//       {/* View / Upload Modal */}
//       {viewing && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
//             <h3 className="text-lg font-bold mb-4">Renewal Details</h3>
//             <p className="text-sm mb-2">
//               <strong>Vendor:</strong> {viewing.vendor}
//             </p>
//             <p className="text-sm mb-4">
//               <strong>Renew to:</strong> {viewing.renewalPlan}
//             </p>

//             <label className="font-semibold text-gray-700">Payment Proof</label>
//             <input
//               type="file"
//               onChange={(e) => setProofFile(e.currentTarget.files?.[0] || null)}
//               className="customInput w-full mb-3"
//             />

//             <div className="flex justify-end gap-2">
//               <button onClick={() => setViewing(null)} className="customBtn">
//                 Cancel
//               </button>
//               <button
//                 onClick={uploadProof}
//                 className="customBtn bg-green-600 text-white"
//               >
//                 Upload & Approve
//               </button>
//             </div>

//             <button
//               onClick={() => setViewing(null)}
//               className="absolute top-5 right-5 text-2xl text-gray-500"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlanRenewalRequests;
