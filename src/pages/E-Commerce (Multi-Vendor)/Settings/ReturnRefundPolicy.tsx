import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";

interface Policy {
  id: number;
  title: string;
  description: string;
  activeFrom: string;
  activeTo: string;
  status: "Active" | "Inactive";
}

const PolicySchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  activeFrom: Yup.string().required("Active From is required"),
  activeTo: Yup.string()
    .required("Active To is required")
    .test(
      "is-after-active-from",
      "Active To must be after Active From",
      function (value) {
        return (
          !this.parent.activeFrom ||
          new Date(value) >= new Date(this.parent.activeFrom)
        );
      }
    ),
  status: Yup.string().required("Status is required"),
});

const ReturnRefundPolicy = () => {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: 1,
      title: "Standard Return Policy",
      description: "Returns accepted within 7 days of delivery.",
      activeFrom: "2025-10-01",
      activeTo: "2025-12-31",
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const handleAdd = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Policy) => {
    setEditingPolicy(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Policy) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setPolicies(policies.filter((p) => p.id !== item.id));
        Swal.fire("Deleted!", `"${item.title}" has been deleted.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      title: editingPolicy ? editingPolicy.title : "",
      description: editingPolicy ? editingPolicy.description : "",
      activeFrom: editingPolicy ? editingPolicy.activeFrom : "",
      activeTo: editingPolicy ? editingPolicy.activeTo : "",
      status: editingPolicy ? editingPolicy.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: PolicySchema,
    onSubmit: (values) => {
      if (editingPolicy) {
        setPolicies(
          policies.map((p) =>
            p.id === editingPolicy.id
              ? {
                  ...p,
                  ...values,
                  status: values.status as "Active" | "Inactive",
                }
              : p
          )
        );
        Swal.fire({
          icon: "success",
          title: "Policy Updated",
          text: `"${values.title}" has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newPolicy: Policy = {
          id: policies.length + 1,
          ...values,
          status: values.status as "Active" | "Inactive",
        };
        setPolicies([newPolicy, ...policies]);
        Swal.fire({
          icon: "success",
          title: "Policy Added",
          text: `"${values.title}" has been added!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div className="">
      <DataTable
        title="Return & Refund Policy"
        data={policies}
        columns={[
          { key: "id", label: "Policy ID" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description" },
          { key: "activeFrom", label: "Active From" },
          { key: "activeTo", label: "Active To" },
          {
            key: "status",
            label: "Status",
            render: (item: Policy) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Active" ? "text-green-700" : "text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
          // {
          //   key: "action",
          //   label: "Action",
          //   render: (item: Policy) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleEdit(item)}
          //         className="px-2 py-1 bg-blue-500 text-white rounded"
          //       >
          //         Edit
          //       </button>
          //       <button
          //         onClick={() => handleDelete(item)}
          //         className="px-2 py-1 bg-red-500 text-white rounded"
          //       >
          //         Delete
          //       </button>
          //     </div>
          //   ),
          // },
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Policy"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingPolicy ? "Edit Policy" : "Add Policy"}
            </h2>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="font-semibold text-gray-700">Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.title && formik.errors.title
                      ? "customInputError"
                      : formik.values.title
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.title}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.values.description ? "filled" : ""
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Active From
                </label>
                <input
                  type="date"
                  name="activeFrom"
                  value={formik.values.activeFrom}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.activeFrom && formik.errors.activeFrom
                      ? "customInputError"
                      : formik.values.activeFrom
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.activeFrom && formik.errors.activeFrom && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.activeFrom}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Active To</label>
                <input
                  type="date"
                  name="activeTo"
                  value={formik.values.activeTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.activeTo && formik.errors.activeTo
                      ? "customInputError"
                      : formik.values.activeTo
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.activeTo && formik.errors.activeTo && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.activeTo}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) {
                      e.currentTarget.classList.add("filled");
                    } else {
                      e.currentTarget.classList.remove("filled");
                    }
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
                  <div className="text-red-500 text-sm">
                    {formik.errors.status}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="customBtn"
                >
                  Cancel
                </button>
                <button type="submit" className="customBtn">
                  {editingPolicy ? "Update" : "Add"}
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

export default ReturnRefundPolicy;
