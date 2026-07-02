// import { useState } from "react";
// import DataTable from "../../../components/common/DataTable";
// import { useFormik } from "formik";
// import Swal from "sweetalert2";
// import * as Yup from "yup";

// interface Plan {
//   id: number;
//   planName: string;
//   durationMonths: number;
//   price: number;
//   allowedServices: string;
//   allowedInquiries: number;
//   description: string;
//   flashDeals: boolean;
//   featuredListing: boolean;
//   prioritySupport: boolean;
//   status: "Active" | "Inactive";
// }

// const PlanSchema = Yup.object().shape({
//   planName: Yup.string().required("Plan name required"),
//   durationMonths: Yup.number().min(1).required("Duration required"),
//   price: Yup.number().min(0).required("Price required"),
//   allowedServices: Yup.string().required("Allowed services required"),
//   allowedInquiries: Yup.number().min(0).required("Inquiries required"),
//   description: Yup.string().required("Description required"),
//   status: Yup.string().required("Status required"),
// });

// const PlanCreation = () => {
//   const [plans, setPlans] = useState<Plan[]>([
//     {
//       id: 1,
//       planName: "Basic",
//       durationMonths: 1,
//       price: 99,
//       allowedServices: "Basic Listing",
//       allowedInquiries: 50,
//       description: "Entry-level plan",
//       flashDeals: false,
//       featuredListing: false,
//       prioritySupport: false,
//       status: "Active",
//     },
//   ]);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

//   // ---------- Handlers ----------
//   const openAdd = () => {
//     setEditingPlan(null);
//     setModalOpen(true);
//   };

//   const openEdit = (p: Plan) => {
//     setEditingPlan(p);
//     setModalOpen(true);
//   };

//   const deletePlan = (p: Plan) => {
//     Swal.fire({
//       title: "Delete?",
//       text: `Remove "${p.planName}"?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes",
//     }).then((r) => {
//       if (r.isConfirmed) {
//         setPlans((prev) => prev.filter((x) => x.id !== p.id));
//         Swal.fire("Deleted!", "", "success");
//       }
//     });
//   };

//   // ---------- Formik ----------
//   const formik = useFormik({
//     initialValues: {
//       planName: editingPlan?.planName ?? "",
//       durationMonths: editingPlan?.durationMonths ?? 1,
//       price: editingPlan?.price ?? 0,
//       allowedServices: editingPlan?.allowedServices ?? "",
//       allowedInquiries: editingPlan?.allowedInquiries ?? 0,
//       description: editingPlan?.description ?? "",
//       flashDeals: editingPlan?.flashDeals ?? false,
//       featuredListing: editingPlan?.featuredListing ?? false,
//       prioritySupport: editingPlan?.prioritySupport ?? false,
//       status: editingPlan?.status ?? "Active",
//     },
//     enableReinitialize: true,
//     validationSchema: PlanSchema,
//     onSubmit: (v) => {
//       if (editingPlan) {
//         setPlans((prev) =>
//           prev.map((p) => (p.id === editingPlan.id ? { ...p, ...v } : p))
//         );
//         Swal.fire("Updated!", "", "success");
//       } else {
//         const newPlan: Plan = {
//           id: Math.max(...plans.map((p) => p.id), 0) + 1,
//           ...v,
//           status: v.status as "Active" | "Inactive",
//         };
//         setPlans((prev) => [newPlan, ...prev]);
//         Swal.fire("Created!", "", "success");
//       }
//       setModalOpen(false);
//       formik.resetForm();
//     },
//   });

//   return (
//     <div className="p-4">
//       <DataTable
//         title="Subscription Plans"
//         data={plans}
//         columns={[
//           { key: "id", label: "Plan ID" },
//           { key: "planName", label: "Plan Name" },
//           { key: "durationMonths", label: "Duration (Months)" },
//           { key: "price", label: "Price ($)" },
//           { key: "allowedInquiries", label: "Inquiries" },
//           {
//             key: "status",
//             label: "Status",
//             render: (p: Plan) => (
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                   p.status === "Active"
//                     ? "bg-green-100 text-green-800"
//                     : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {p.status}
//               </span>
//             ),
//           },
//         ]}
//         onAdd={openAdd}
//         onEdit={openEdit}
//         onDelete={deletePlan}
//         addButtonLabel="Create Plan"
//       />

//       {/* ---------- Modal ---------- */}
//       {modalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
//             <h2 className="text-xl font-bold mb-6">
//               {editingPlan ? "Edit Plan" : "Create Plan"}
//             </h2>

//             <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Plan Name */}
//               <div>
//                 <label className="font-semibold text-gray-700">Plan Name</label>
//                 <input
//                   name="planName"
//                   value={formik.values.planName}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className={`customInput w-full ${
//                     formik.touched.planName && formik.errors.planName
//                       ? "customInputError"
//                       : formik.values.planName
//                       ? "filled"
//                       : ""
//                   }`}
//                 />
//                 {formik.touched.planName && formik.errors.planName && (
//                   <div className="text-red-500 text-sm">{formik.errors.planName}</div>
//                 )}
//               </div>

//               {/* Duration */}
//               <div>
//                 <label className="font-semibold text-gray-700">Duration (Months)</label>
//                 <input
//                   type="number"
//                   name="durationMonths"
//                   value={formik.values.durationMonths}
//                   onChange={formik.handleChange}
//                   className={`customInput w-full ${formik.values.durationMonths ? "filled" : ""}`}
//                 />
//               </div>

//               {/* Price */}
//               <div>
//                 <label className="font-semibold text-gray-700">Price ($)</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={formik.values.price}
//                   onChange={formik.handleChange}
//                   className={`customInput w-full ${formik.values.price ? "filled" : ""}`}
//                 />
//               </div>

//               {/* Inquiries */}
//               <div>
//                 <label className="font-semibold text-gray-700">Allowed Inquiries</label>
//                 <input
//                   type="number"
//                   name="allowedInquiries"
//                   value={formik.values.allowedInquiries}
//                   onChange={formik.handleChange}
//                   className={`customInput w-full ${formik.values.allowedInquiries ? "filled" : ""}`}
//                 />
//               </div>

//               {/* Allowed Services */}
//               <div className="md:col-span-2">
//                 <label className="font-semibold text-gray-700">Allowed Services</label>
//                 <input
//                   name="allowedServices"
//                   value={formik.values.allowedServices}
//                   onChange={formik.handleChange}
//                   className={`customInput w-full ${formik.values.allowedServices ? "filled" : ""}`}
//                 />
//               </div>

//               {/* Description */}
//               <div className="md:col-span-2">
//                 <label className="font-semibold text-gray-700">Description</label>
//                 <textarea
//                   name="description"
//                   rows={3}
//                   value={formik.values.description}
//                   onChange={formik.handleChange}
//                   className={`customInput w-full ${formik.values.description ? "filled" : ""}`}
//                 />
//               </div>

//               {/* Features */}
//               <div className="md:col-span-2">
//                 <label className="font-semibold text-gray-700">Features</label>
//                 <div className="flex gap-6 mt-2">
//                   {["flashDeals", "featuredListing", "prioritySupport"].map((f) => (
//                     <label key={f} className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         name={f}
//                         checked={formik.values[f as keyof typeof formik.values] as boolean}
//                         onChange={formik.handleChange}
//                         className="w-4 h-4 text-blue-600 rounded"
//                       />
//                       <span className="capitalize">
//                         {f.replace(/([A-Z])/g, " $1").trim()}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Status */}
//               <div>
//                 <label className="font-semibold text-gray-700">Status</label>
//                 <select
//                   name="status"
//                   value={formik.values.status}
//                   onChange={formik.handleChange}
//                   className={`customSelect w-full ${formik.values.status ? "filled" : ""}`}
//                 >
//                   <option value="">Select</option>
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>

//               {/* Buttons */}
//               <div className="md:col-span-2 flex justify-end gap-2 mt-4">
//                 <button type="button" onClick={() => setModalOpen(false)} className="customBtn">
//                   Cancel
//                 </button>
//                 <button type="submit" className="customBtn bg-blue-600 text-white hover:bg-blue-700">
//                   {editingPlan ? "Update" : "Create"}
//                 </button>
//               </div>
//             </form>

//             <button
//               onClick={() => setModalOpen(false)}
//               className="absolute top-5 right-5 text-2xl text-gray-500 hover:text-gray-700"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlanCreation;