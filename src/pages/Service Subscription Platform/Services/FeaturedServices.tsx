import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface FeaturedService {
  id: string;
  serviceName: string;
  vendor: string;
  category: string;
  status: "Active" | "Inactive";
  displayPriority: number;
}

const FeaturedServiceSchema = Yup.object().shape({
  displayPriority: Yup.number()
    .min(1, "Priority must be at least 1")
    .required("Display Priority is required"),
});

const FeaturedServices = () => {
  const [services, setServices] = useState<FeaturedService[]>([
    {
      id: "SRV-001",
      serviceName: "Strength Training",
      vendor: "FitPro Gym",
      category: "Gym",
      status: "Active",
      displayPriority: 1,
    },
    {
      id: "SRV-002",
      serviceName: "Men's Haircut",
      vendor: "Elegant Salon",
      category: "Salon",
      status: "Active",
      displayPriority: 2,
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<FeaturedService | null>(null);

  const handleAdd = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEdit = (item: FeaturedService) => {
    setEditingService(item);
    setModalOpen(true);
  };

  const handleDelete = (item: FeaturedService) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Remove "${item.serviceName}" from featured services?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setServices(services.filter((s) => s.id !== item.id));
        Swal.fire("Removed!", `"${item.serviceName}" has been removed.`, "success");
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      id: editingService ? editingService.id : "",
      serviceName: editingService ? editingService.serviceName : "",
      vendor: editingService ? editingService.vendor : "",
      category: editingService ? editingService.category : "",
      status: editingService ? editingService.status : "Active",
      displayPriority: editingService ? editingService.displayPriority : 1,
    },
    enableReinitialize: true,
    validationSchema: FeaturedServiceSchema,
    onSubmit: (values) => {
      if (editingService) {
        setServices(
          services.map((s) =>
            s.id === editingService.id
              ? { ...s, displayPriority: values.displayPriority }
              : s
          )
        );
        Swal.fire({
          icon: "success",
          title: "Priority Updated",
          text: `"${values.serviceName}" priority has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Placeholder for adding new featured service
        Swal.fire("Info", "Add featured service functionality to be implemented.", "info");
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div className="">
      <DataTable
        title="Featured Services"
        data={services}
        columns={[
          { key: "id", label: "Service ID" },
          { key: "serviceName", label: "Service Name" },
          { key: "vendor", label: "Vendor" },
          { key: "category", label: "Category" },
          {
            key: "status",
            label: "Status",
            render: (item: FeaturedService) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Active" ? "text-green-700" : "text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
          { key: "displayPriority", label: "Display Priority" },
          // {
          //   key: "action",
          //   label: "Action",
          //   render: (item: FeaturedService) => (
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
          //         Remove
          //       </button>
          //     </div>
          //   ),
          // },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Add Featured Service"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-6">
              {editingService ? "Edit Featured Service Priority" : "Add Featured Service"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-semibold text-gray-700">Service Name</label>
                <input
                  type="text"
                  name="serviceName"
                  value={formik.values.serviceName}
                  readOnly
                  className="customInput w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">Display Priority</label>
                <input
                  type="number"
                  placeholder="Display Priority"
                  name="displayPriority"
                  value={formik.values.displayPriority}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.displayPriority && formik.errors.displayPriority
                      ? "customInputError"
                      : formik.values.displayPriority
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.displayPriority && formik.errors.displayPriority && (
                  <div className="text-red-500 text-sm">{formik.errors.displayPriority}</div>
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
                <button
                  type="button"
                  onClick={() => formik.resetForm()}
                  className="customBtn"
                >
                  Reset
                </button>
                <button type="submit" className="customBtn">
                  {editingService ? "Update" : "Save"}
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

export default FeaturedServices;