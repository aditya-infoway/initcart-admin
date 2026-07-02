// import DataTable from "../../components/common/DataTable";

// interface SubscriptionReport {
//   vendor: string;
//   plan: string;
//   startDate: string;
//   endDate: string;
//   revenue: number;
//   status: "Active" | "Expired";
// }

// const SubscriptionReports = () => {
//   const reports: SubscriptionReport[] = [
//     {
//       vendor: "FitPro Gym",
//       plan: "Premium",
//       startDate: "2025-01-01",
//       endDate: "2025-12-31",
//       revenue: 9999,
//       status: "Active",
//     },
//     {
//       vendor: "Elegant Salon",
//       plan: "Basic",
//       startDate: "2025-06-01",
//       endDate: "2025-11-30",
//       revenue: 4999,
//       status: "Active",
//     },
//   ];

//   return (
//     <div className="p-4">
//       <DataTable
//         title="Subscription Reports"
//         data={reports}
//         columns={[
//           { key: "vendor", label: "Vendor" },
//           { key: "plan", label: "Plan" },
//           { key: "startDate", label: "Start Date" },
//           { key: "endDate", label: "End Date" },
//           { key: "revenue", label: "Revenue" },
//           {
//             key: "status",
//             label: "Status",
//             render: (item: SubscriptionReport) => (
//               <span
//                 className={`text-sm font-semibold ${
//                   item.status === "Active" ? "text-green-700" : "text-red-700"
//                 }`}
//               >
//                 {item.status}
//               </span>
//             ),
//           },
//         ]}
//       />
//     </div>
//   );
// };

// export default SubscriptionReports;