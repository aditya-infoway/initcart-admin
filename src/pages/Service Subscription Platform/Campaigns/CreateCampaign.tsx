/* src/pages/campaigns/CreateCampaign.tsx */
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Campaign {
  id: string;
  campaignName: string;
  type: "Flash" | "Festival" | "Featured";
  startDate: string;
  endDate: string;
  discountPercentage: number;
  description: string;
  status: "Active" | "Inactive";
}

const CampaignSchema = Yup.object().shape({
  campaignName: Yup.string().required("Required"),
  type: Yup.string().oneOf(["Flash", "Festival", "Featured"]).required("Required"),
  startDate: Yup.date().required("Required"),
  endDate: Yup.date().min(Yup.ref("startDate"), "End > Start").required("Required"),
  discountPercentage: Yup.number().min(0).max(100).required("Required"),
  description: Yup.string().required("Required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required("Required"),
});

const CreateCampaign = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "CAMP-001",
      campaignName: "Diwali Dhamaka",
      type: "Festival",
      startDate: "2025-11-01",
      endDate: "2025-11-10",
      discountPercentage: 30,
      description: "Festival sale on all services",
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);

  const generateId = () => `CAMP-${String(campaigns.length + 1).padStart(3, "0")}`;

  const formik = useFormik({
    initialValues: {
      campaignName: editing?.campaignName ?? "",
      type: editing?.type ?? "",
      startDate: editing?.startDate ?? "",
      endDate: editing?.endDate ?? "",
      discountPercentage: editing?.discountPercentage ?? 0,
      description: editing?.description ?? "",
      status: editing?.status ?? "Active",
    },
    enableReinitialize: true,
    validationSchema: CampaignSchema,
    onSubmit: (values) => {
      const payload = values as Campaign;
      payload.id = editing?.id ?? generateId();

      if (editing) {
        setCampaigns((prev) => prev.map((c) => (c.id === editing.id ? payload : c)));
        Swal.fire("Updated!", payload.campaignName, "success");
      } else {
        setCampaigns((prev) => [payload, ...prev]);
        Swal.fire("Created!", payload.campaignName, "success");
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  const handleEdit = (c: Campaign) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleDelete = (c: Campaign) => {
    Swal.fire({
      title: "Delete?",
      text: c.campaignName,
      icon: "warning",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        setCampaigns((prev) => prev.filter((x) => x.id !== c.id));
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  return (
    <div>
      <DataTable<Campaign>
        title="Create Campaign"
        data={campaigns}
        columns={[
          { key: "id", label: "Campaign ID" },
          { key: "campaignName", label: "Campaign Name" },
          {
            key: "type",
            label: "Type",
            render: (c) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.type === "Flash"
                    ? "bg-orange-100 text-orange-800"
                    : c.type === "Festival"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {c.type}
              </span>
            ),
          },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          {
            key: "discountPercentage",
            label: "Discount %",
            render: (c) => `${c.discountPercentage}%`,
          },
          { key: "description", label: "Description" },
          {
            key: "status",
            label: "Status",
            render: (c) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {c.status}
              </span>
            ),
          },
        ]}
        onAdd={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Campaign"
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-6">
              {editing ? "Edit Campaign" : "Create Campaign"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-medium">Campaign ID</label>
                <input
                  value={editing?.id ?? generateId()}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  name="campaignName"
                  value={formik.values.campaignName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.campaignName && formik.errors.campaignName ? "border-red-500" : ""
                  }`}
                />
                {formik.touched.campaignName && formik.errors.campaignName && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.campaignName}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Type</label>
                <select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.type && formik.errors.type ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select</option>
                  <option value="Flash">Flash</option>
                  <option value="Festival">Festival</option>
                  <option value="Featured">Featured</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.startDate && formik.errors.startDate ? "border-red-500" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.endDate && formik.errors.endDate ? "border-red-500" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Discount %</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formik.values.discountPercentage}
                  onChange={formik.handleChange}
                  min="0"
                  max="100"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.discountPercentage && formik.errors.discountPercentage
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  rows={3}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.description && formik.errors.description ? "border-red-500" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 text-2xl"
            >
              times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;