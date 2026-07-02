import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface ServiceCategory {
  id: string;
  serviceName: string;
  description: string;
  icon?: File | null;
  status: "Active" | "Inactive";
}

const ServiceCategorySchema = Yup.object().shape({
  serviceName: Yup.string().required("Service Name is required"),
  description: Yup.string().required("Description is required"),
  status: Yup.string().required("Status is required"),
});

const ServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([
    {
      id: "CAT-001",
      serviceName: "Gym",
      description: "Fitness and gym services",
      status: "Active",
    },
    {
      id: "CAT-002",
      serviceName: "Salon",
      description: "Beauty and haircare services",
      status: "Active",
    },
    {
      id: "CAT-003",
      serviceName: "Restaurant & Hotel",
      description: "Dining and hospitality services",
      status: "Active",
    },
    {
      id: "CAT-004",
      serviceName: "Travel",
      description: "Travel and tourism services",
      status: "Active",
    },
    {
      id: "CAT-005",
      serviceName: "Finance",
      description: "Financial and banking services",
      status: "Active",
    },
    {
      id: "CAT-006",
      serviceName: "Healthcare",
      description: "Medical and healthcare services",
      status: "Active",
    },
    {
      id: "CAT-007",
      serviceName: "Education",
      description: "Educational and training services",
      status: "Active",
    },
    {
      id: "CAT-008",
      serviceName: "Tech Industry",
      description: "Technology and IT services",
      status: "Active",
    },
    {
      id: "CAT-009",
      serviceName: "Workplace",
      description: "Workplace management services",
      status: "Active",
    },
    {
      id: "CAT-010",
      serviceName: "Professional",
      description: "Professional consulting services",
      status: "Active",
    },
    {
      id: "CAT-011",
      serviceName: "Other",
      description: "Miscellaneous services",
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);

  const generateCategoryId = () => {
    const nextId = categories.length + 1;
    return `CAT-${nextId.toString().padStart(3, "0")}`;
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (item: ServiceCategory) => {
    setEditingCategory(item);
    setModalOpen(true);
  };

  const handleDelete = (item: ServiceCategory) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.serviceName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setCategories(categories.filter((c) => c.id !== item.id));
        Swal.fire(
          "Deleted!",
          `"${item.serviceName}" has been deleted.`,
          "success"
        );
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      id: editingCategory ? editingCategory.id : generateCategoryId(),
      serviceName: editingCategory ? editingCategory.serviceName : "",
      description: editingCategory ? editingCategory.description : "",
      icon: null as File | null,
      status: editingCategory ? editingCategory.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: ServiceCategorySchema,
    onSubmit: (values) => {
      if (editingCategory) {
        setCategories(
          categories.map((c) =>
            c.id === editingCategory.id
              ? {
                  ...c,
                  ...values,
                  status: values.status as "Active" | "Inactive",
                }
              : c
          )
        );
        Swal.fire({
          icon: "success",
          title: "Category Updated",
          text: `"${values.serviceName}" has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newCategory: ServiceCategory = {
          //   id: generateCategoryId(),
          ...values,
          status: values.status as "Active" | "Inactive",
        };
        setCategories([newCategory, ...categories]);
        Swal.fire({
          icon: "success",
          title: "Category Added",
          text: `"${values.serviceName}" has been added!`,
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
        title="Service Categories"
        data={categories}
        columns={[
          { key: "id", label: "Category ID" },
          { key: "serviceName", label: "Service Name" },
          { key: "description", label: "Description" },
          {
            key: "status",
            label: "Status",
            render: (item: ServiceCategory) => (
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
        addButtonLabel="Add Service Category"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingCategory
                ? "Edit Service Category"
                : "Add Service Category"}
            </h2>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">
                    Category ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formik.values.id}
                    readOnly
                    className="customInput w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Service Name
                  </label>
                  <input
                    type="text"
                    placeholder="Service Name"
                    name="serviceName"
                    value={formik.values.serviceName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.serviceName && formik.errors.serviceName
                        ? "customInputError"
                        : formik.values.serviceName
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.serviceName && formik.errors.serviceName && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.serviceName}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
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
                      formik.touched.description && formik.errors.description
                        ? "customInputError"
                        : formik.values.description
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.description}
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Icon/Image
                  </label>
                  <input
                    type="file"
                    name="icon"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0] || null;
                      formik.setFieldValue("icon", file);
                      if (file) e.currentTarget.classList.add("filled");
                      else e.currentTarget.classList.remove("filled");
                    }}
                    className={`customInput w-full ${
                      formik.values.icon ? "filled" : ""
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value)
                        e.currentTarget.classList.add("filled");
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
                    <div className="text-red-500 text-sm">
                      {formik.errors.status}
                    </div>
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
                  {editingCategory ? "Update" : "Save"}
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

export default ServiceCategories;
