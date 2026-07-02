import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";

interface SubscriptionPlan {
  id: string;
  planName: string;
  duration: number;
  price: number;
  allowedServices: number;
  allowedInquiries: number;
  description: string;
  features: { flashDealsAccess: boolean; featuredListing: boolean; prioritySupport: boolean };
  status: "Active" | "Inactive";
}

const PlanSchema = Yup.object().shape({
  planName: Yup.string().required("Plan Name is required"),
  duration: Yup.number().min(1, "Duration must be at least 1").required("Duration is required"),
  price: Yup.number().min(0, "Price cannot be negative").required("Price is required"),
  allowedServices: Yup.number().min(0, "Allowed Services cannot be negative").required("Allowed Services is required"),
  allowedInquiries: Yup.number().min(0, "Allowed Inquiries cannot be negative").required("Allowed Inquiries is required"),
  description: Yup.string().required("Description is required"),
  status: Yup.string().required("Status is required"),
});

const PlanCreation = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    {
      id: "PLAN-001",
      planName: "Premium",
      duration: 12,
      price: 9999,
      allowedServices: 10,
      allowedInquiries: 100,
      description: "Premium plan with full features",
      features: { flashDealsAccess: true, featuredListing: true, prioritySupport: true },
      status: "Active",
    },
    {
      id: "PLAN-002",
      planName: "Basic",
      duration: 6,
      price: 4999,
      allowedServices: 5,
      allowedInquiries: 50,
      description: "Basic plan for small vendors",
      features: { flashDealsAccess: false, featuredListing: false, prioritySupport: false },
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const generatePlanId = () => `PLAN-${(plans.length + 1).toString().padStart(3, "0")}`;

  const handleAdd = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const handleEdit = (item: SubscriptionPlan) => {
    setEditingPlan(item);
    setModalOpen(true);
  };

  const handleDelete = (item: SubscriptionPlan) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${item.planName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setPlans(plans.filter((p) => p.id !== item.id));
        Swal.fire("Deleted!", `"${item.planName}" has been deleted.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      id: editingPlan ? editingPlan.id : generatePlanId(),
      planName: editingPlan ? editingPlan.planName : "",
      duration: editingPlan ? editingPlan.duration : 1,
      price: editingPlan ? editingPlan.price : 0,
      allowedServices: editingPlan ? editingPlan.allowedServices : 0,
      allowedInquiries: editingPlan ? editingPlan.allowedInquiries : 0,
      description: editingPlan ? editingPlan.description : "",
      features: {
        flashDealsAccess: editingPlan ? editingPlan.features.flashDealsAccess : false,
        featuredListing: editingPlan ? editingPlan.features.featuredListing : false,
        prioritySupport: editingPlan ? editingPlan.features.prioritySupport : false,
      },
      status: editingPlan ? editingPlan.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: PlanSchema,
    onSubmit: (values) => {
      if (editingPlan) {
        setPlans(
          plans.map((p) =>
            p.id === editingPlan.id ? { ...p, ...values, status: values.status as "Active" | "Inactive" } : p
          )
        );
        Swal.fire({
          icon: "success",
          title: "Plan Updated",
          text: `"${values.planName}" has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newPlan: SubscriptionPlan = {
          // id: generatePlanId(),
          ...values,
          status: values.status as "Active" | "Inactive",
        };
        setPlans([newPlan, ...plans]);
        Swal.fire({
          icon: "success",
          title: "Plan Added",
          text: `"${values.planName}" has been added!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div >
      <DataTable
        title="Subscription Plans"
        data={plans}
        columns={[
          { key: "id", label: "Plan ID" },
          { key: "planName", label: "Plan Name" },
          { key: "duration", label: "Duration (Months)" },
          { key: "price", label: "Price" },
          { key: "allowedServices", label: "Allowed Services" },
          { key: "allowedInquiries", label: "Allowed Inquiries" },
          { key: "description", label: "Description" },
          {
            key: "features",
            label: "Features",
            render: (item: SubscriptionPlan) => (
              <span>
                {item.features.flashDealsAccess && "Flash Deals, "}
                {item.features.featuredListing && "Featured Listing, "}
                {item.features.prioritySupport && "Priority Support"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item: SubscriptionPlan) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Active" ? "text-green-700" : "text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
    
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Add Plan"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingPlan ? "Edit Plan" : "Add Plan"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Plan ID</label>
                  <input
                    type="text"
                    name="id"
                    value={formik.values.id}
                    readOnly
                    className="customInput w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Plan Name</label>
                  <input
                    type="text"
                    placeholder="Plan Name"
                    name="planName"
                    value={formik.values.planName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.planName && formik.errors.planName
                        ? "customInputError"
                        : formik.values.planName
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.planName && formik.errors.planName && (
                    <div className="text-red-500 text-sm">{formik.errors.planName}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Duration (Months)</label>
                  <input
                    type="number"
                    placeholder="Duration"
                    name="duration"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.duration && formik.errors.duration
                        ? "customInputError"
                        : formik.values.duration
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.duration && formik.errors.duration && (
                    <div className="text-red-500 text-sm">{formik.errors.duration}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    name="price"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.price && formik.errors.price
                        ? "customInputError"
                        : formik.values.price
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.price && formik.errors.price && (
                    <div className="text-red-500 text-sm">{formik.errors.price}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Allowed Services</label>
                  <input
                    type="number"
                    placeholder="Allowed Services"
                    name="allowedServices"
                    value={formik.values.allowedServices}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.allowedServices && formik.errors.allowedServices
                        ? "customInputError"
                        : formik.values.allowedServices
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.allowedServices && formik.errors.allowedServices && (
                    <div className="text-red-500 text-sm">{formik.errors.allowedServices}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Allowed Inquiries</label>
                  <input
                    type="number"
                    placeholder="Allowed Inquiries"
                    name="allowedInquiries"
                    value={formik.values.allowedInquiries}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.allowedInquiries && formik.errors.allowedInquiries
                        ? "customInputError"
                        : formik.values.allowedInquiries
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.allowedInquiries && formik.errors.allowedInquiries && (
                    <div className="text-red-500 text-sm">{formik.errors.allowedInquiries}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700">Description</label>
                  <textarea
                    placeholder="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.description && formik.errors.description
                        ? "customInputError"
                        : formik.values.description
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-sm">{formik.errors.description}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700">Features</label>
                  <div className="flex flex-col gap-2">
                    <label>
                      <input
                        type="checkbox"
                        name="features.flashDealsAccess"
                        checked={formik.values.features.flashDealsAccess}
                        onChange={formik.handleChange}
                      />
                      Flash Deals Access
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="features.featuredListing"
                        checked={formik.values.features.featuredListing}
                        onChange={formik.handleChange}
                      />
                      Featured Listing
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="features.prioritySupport"
                        checked={formik.values.features.prioritySupport}
                        onChange={formik.handleChange}
                      />
                      Priority Support
                    </label>
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value) e.currentTarget.classList.add("filled");
                      else e.currentTarget.classList.remove("filled");
                    }}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.status && formik.errors.status
                        ? "customSelectError"
                        : formik.values.status
                        ? "filled"
                        : ""
                    }`}
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <div className="text-red-500 text-sm">{formik.errors.status}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="customBtn bg-gray-200 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => formik.resetForm()}
                  className="customBtn bg-gray-200 text-gray-800"
                >
                  Reset
                </button>
                <button type="submit" className="customBtn bg-blue-600 text-white">
                  {editingPlan ? "Update" : "Save"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCreation;