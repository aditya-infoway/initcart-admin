// import { useState } from "react";
// import Swal from "sweetalert2";
// import DataTable from "../../components/common/DataTable";

// interface ExpiryNotification {
//   vendor: string;
//   plan: string;
//   expiryDate: string;
//   notificationStatus: "Sent" | "Pending" | "Failed";
// }

// const PlanExpiryNotifications = () => {
//   const [notifications, setNotifications] = useState<ExpiryNotification[]>([
//     {
//       vendor: "FitPro Gym",
//       plan: "Premium",
//       expiryDate: "2025-10-30",
//       notificationStatus: "Sent",
//     },
//     {
//       vendor: "Elegant Salon",
//       plan: "Basic",
//       expiryDate: "2025-11-05",
//       notificationStatus: "Pending",
//     },
//   ]);

//   const handleResend = (item: ExpiryNotification) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: `Resend notification to "${item.vendor}"?`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, resend it!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setNotifications(
//           notifications.map((n) =>
//             n.vendor === item.vendor && n.plan === item.plan
//               ? { ...n, notificationStatus: "Sent" }
//               : n
//           )
//         );
//         Swal.fire("Resent!", `Notification resent to "${item.vendor}".`, "success");
//       }
//     });
//   };

//   const handleExtend = (item: ExpiryNotification) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: `Extend plan for "${item.vendor}"?`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, extend it!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         // Placeholder for extending expiry
//         Swal.fire("Extended!", `Plan for "${item.vendor}" extended.`, "success");
//       }
//     });
//   };

//   return (
//     <div className="p-4">
//       <DataTable
//         title="Plan Expiry Notifications"
//         data={notifications}
//         columns={[
//           { key: "vendor", label: "Vendor" },
//           { key: "plan", label: "Plan" },
//           { key: "expiryDate", label: "Expiry Date" },
//           {
//             key: "notificationStatus",
//             label: "Notification Status",
//             render: (item: ExpiryNotification) => (
//               <span
//                 className={`text-sm font-semibold ${
//                   item.notificationStatus === "Sent"
//                     ? "text-green-700"
//                     : item.notificationStatus === "Pending"
//                     ? "text-yellow-700"
//                     : "text-red-700"
//                 }`}
//               >
//                 {item.notificationStatus}
//               </span>
//             ),
//           },
//           {
//             key: "action",
//             label: "Action",
//             render: (item: ExpiryNotification) => (
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleResend(item)}
//                   className="px-2 py-1 bg-blue-500 text-white rounded"
//                 >
//                   Resend
//                 </button>
//                 <button
//                   onClick={() => handleExtend(item)}
//                   className="px-2 py-1 bg-green-500 text-white rounded"
//                 >
//                   Extend
//                 </button>
//               </div>
//             ),
//           },
//         ]}
//       />
//     </div>
//   );
// };

// export default PlanExpiryNotifications;