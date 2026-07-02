import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface ServiceCategory {
  id: string;
  serviceName: string;
  status: "Active" | "Inactive";
}

interface ServiceTag {
  id: string;
  tagName: string;
  category: string;
  description: string;
  status: "Active" | "Inactive";
}

const ServiceTagSchema = Yup.object().shape({
  tagName: Yup.string().required("Tag Name is required"),
  category: Yup.string().required("Category is required"),
  description: Yup.string().required("Description is required"),
  status: Yup.string().required("Status is required"),
});

const ServiceTags = () => {
  const [categories] = useState<ServiceCategory[]>([
    { id: "CAT-001", serviceName: "Gym", status: "Active" },
    { id: "CAT-002", serviceName: "Salon", status: "Active" },
    { id: "CAT-003", serviceName: "Restaurant & Hotel", status: "Active" },
    { id: "CAT-004", serviceName: "Travel", status: "Active" },
    { id: "CAT-005", serviceName: "Finance", status: "Active" },
    { id: "CAT-006", serviceName: "Healthcare", status: "Active" },
    { id: "CAT-007", serviceName: "Education", status: "Active" },
    { id: "CAT-008", serviceName: "Tech Industry", status: "Active" },
    { id: "CAT-009", serviceName: "Workplace", status: "Active" },
    { id: "CAT-010", serviceName: "Professional", status: "Active" },
    { id: "CAT-011", serviceName: "Other", status: "Active" },
  ]);
  const [tags, setTags] = useState<ServiceTag[]>([
    {
      id: "TAG-001",
      tagName: "Fitness",
      category: "Gym",
      description: "Related to fitness and gym services",
      status: "Active",
    },
    {
      id: "TAG-002",
      tagName: "Haircare",
      category: "Salon",
      description: "Haircare and styling services",
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTag, setEditingTag] = useState<ServiceTag | null>(null);

  const generateTagId = () => {
    const nextId = tags.length + 1;
    return `TAG-${nextId.toString().padStart(3, "0")}`;
  };

  const handleAdd = () => {
    setEditingTag(null);
    setModalOpen(true);
  };

  const handleEdit = (item: ServiceTag) => {
    setEditingTag(item);
    setModalOpen(true);
  };

  const handleDelete = (item: ServiceTag) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.tagName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setTags(tags.filter((t) => t.id !== item.id));
        Swal.fire("Deleted!", `"${item.tagName}" has been deleted.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      id: editingTag ? editingTag.id : generateTagId(),
      tagName: editingTag ? editingTag.tagName : "",
      category: editingTag ? editingTag.category : "",
      description: editingTag ? editingTag.description : "",
      status: editingTag ? editingTag.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: ServiceTagSchema,
    onSubmit: (values) => {
      if (editingTag) {
        setTags(
          tags.map((t) =>
            t.id === editingTag.id
              ? { ...t, ...values, status: values.status as "Active" | "Inactive" }
              : t
          )
        );
        Swal.fire({
          icon: "success",
          title: "Tag Updated",
          text: `"${values.tagName}" has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newTag: ServiceTag = {
        //   id: generateTagId(),
          ...values,
          status: values.status as "Active" | "Inactive",
        };
        setTags([newTag, ...tags]);
        Swal.fire({
          icon: "success",
          title: "Tag Added",
          text: `"${values.tagName}" has been added!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div className="p-4">
      <DataTable
        title="Service Tags"
        data={tags}
        columns={[
          { key: "id", label: "Tag ID" },
          { key: "tagName", label: "Tag Name" },
          { key: "category", label: "Category" },
          { key: "description", label: "Description" },
          {
            key: "status",
            label: "Status",
            render: (item: ServiceTag) => (
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
          //   render: (item: ServiceTag) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleEdit(item)}
          //         className="px-2 py-1 bg-yellow-500 text-white rounded"
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Add Service Tag"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingTag ? "Edit Service Tag" : "Add Service Tag"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Tag ID</label>
                  <input
                    type="text"
                    name="id"
                    value={formik.values.id}
                    readOnly
                    className="customInput w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Tag Name</label>
                  <input
                    type="text"
                    placeholder="Tag Name"
                    name="tagName"
                    value={formik.values.tagName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.tagName && formik.errors.tagName
                        ? "customInputError"
                        : formik.values.tagName
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.tagName && formik.errors.tagName && (
                    <div className="text-red-500 text-sm">{formik.errors.tagName}</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formik.values.category}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value) e.currentTarget.classList.add("filled");
                      else e.currentTarget.classList.remove("filled");
                    }}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.category && formik.errors.category
                        ? "customSelectError"
                        : formik.values.category
                        ? "filled"
                        : ""
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c.status === "Active")
                      .map((category) => (
                        <option key={category.id} value={category.serviceName}>
                          {category.serviceName}
                        </option>
                      ))}
                  </select>
                  {formik.touched.category && formik.errors.category && (
                    <div className="text-red-500 text-sm">{formik.errors.category}</div>
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
                  className="customBtn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => formik.resetForm()}
                  className="customBtn"
                >
                  Reset
                </button>
                <button type="submit" className="customBtn">
                  {editingTag ? "Update" : "Save"}
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

export default ServiceTags;