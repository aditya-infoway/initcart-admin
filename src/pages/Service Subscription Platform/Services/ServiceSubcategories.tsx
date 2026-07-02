import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import api from "../../../api/apiClient";

interface ServiceCategory {
  id: string;
  serviceName: string;
  status: "Active" | "Inactive";
}

interface Subcategory {
  id: string;
  parent_service: string;
  subcategory_name: string;
  description: string;
  image?: string | null;
  image_url?: string | null;
  status: "Active" | "Inactive";
  created_at?: string;
  updated_at?: string;
}

const SubcategorySchema = Yup.object().shape({
  parent_service: Yup.string().required("Parent Service is required"),
  subcategory_name: Yup.string().required("Subcategory Name is required"),
  description: Yup.string().required("Description is required"),
  status: Yup.string().required("Status is required"),
});

const ServiceSubcategories = () => {
  const [categories] = useState<ServiceCategory[]>([
    { id: "CAT-001", serviceName: "Gym", status: "Active" },
    { id: "CAT-002", serviceName: "Salon", status: "Active" },
    { id: "CAT-003", serviceName: "Hotel", status: "Active" },
    { id: "CAT-004", serviceName: "Travel", status: "Active" },
    { id: "CAT-005", serviceName: "Finance", status: "Active" },
    { id: "CAT-006", serviceName: "Healthcare", status: "Active" },
    { id: "CAT-007", serviceName: "Education", status: "Active" },
    { id: "CAT-008", serviceName: "Tech Industry", status: "Active" },
    { id: "CAT-009", serviceName: "Restaurant", status: "Active" },
    { id: "CAT-010", serviceName: "Professional", status: "Active" },
    { id: "CAT-011", serviceName: "Real-Estate", status: "Active" },
  ]);
  
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/services/service-subcategories/");
      setSubcategories(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load subcategories",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
    
  }, []);

  const handleAdd = () => {
    setEditingSubcategory(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Subcategory) => {
    setEditingSubcategory(item);
    setImagePreview(item.image_url || null);
    setModalOpen(true);
  };

  const handleDelete = async (item: Subcategory) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.subcategory_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/services/service-subcategories/${item.id}/`);
          setSubcategories(subcategories.filter((s) => s.id !== item.id));
          Swal.fire("Deleted!", `"${item.subcategory_name}" has been deleted.`, "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete subcategory.", "error");
        }
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      id: editingSubcategory ? editingSubcategory.id : "",
      parent_service: editingSubcategory ? editingSubcategory.parent_service : "",
      subcategory_name: editingSubcategory ? editingSubcategory.subcategory_name : "",
      description: editingSubcategory ? editingSubcategory.description : "",
      image: null as File | null,
      image_base64: "",
      status: editingSubcategory ? editingSubcategory.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: SubcategorySchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        
        // Prepare data for API
        const payload: any = {
          parent_service: values.parent_service,
          subcategory_name: values.subcategory_name,
          description: values.description,
          status: values.status,
        };

        // Handle image
        if (values.image) {
          formData.append("image", values.image);
        } else if (values.image_base64) {
          payload.image_base64 = values.image_base64;
        }

        if (editingSubcategory) {
          // Update existing subcategory
          await api.patch(`/services/service-subcategories/${editingSubcategory.id}/`, payload);
          
          Swal.fire({
            icon: "success",
            title: "Subcategory Updated",
            text: `"${values.subcategory_name}" has been updated!`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          // Create new subcategory
          await api.post("/services/service-subcategories/", payload);
          
          Swal.fire({
            icon: "success",
            title: "Subcategory Added",
            text: `"${values.subcategory_name}" has been added!`,
            timer: 2000,
            showConfirmButton: false,
          });
        }

        // Refresh list
        fetchSubcategories();
        setModalOpen(false);
        formik.resetForm();
        setImagePreview(null);
      } catch (error: any) {
        console.error("Error saving subcategory:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to save subcategory",
        });
      }
    },
  });

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue("image", file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        formik.setFieldValue("image_base64", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          title="Service Subcategories"
          data={subcategories}
          columns={[
            { key: "id", label: "Subcategory ID" },
            { key: "parent_service", label: "Parent Service" },
            { key: "subcategory_name", label: "Subcategory Name" },
            { key: "description", label: "Description" },
            {
              key: "image_url",
              label: "Image",
              render: (item: Subcategory) => (
                item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.subcategory_name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400">No image</span>
                )
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item: Subcategory) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.status === "Active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.status}
                </span>
              ),
            },
            {
              key: "created_at",
              label: "Created On",
              render: (item: Subcategory) => (
                item.created_at ? formatDate(item.created_at) : "-"
              ),
            },
          ]}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          addButtonLabel="Add Subcategory"
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Parent Service</label>
                  <select
                    name="parent_service"
                    value={formik.values.parent_service}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.parent_service && formik.errors.parent_service
                        ? "customSelectError"
                        : formik.values.parent_service
                        ? "filled"
                        : ""
                    }`}
                  >
                    <option value="">Select Parent Service</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.serviceName}>
                        {category.serviceName}
                      </option>
                    ))}
                  </select>
                  {formik.touched.parent_service && formik.errors.parent_service && (
                    <div className="text-red-500 text-sm">{formik.errors.parent_service}</div>
                  )}
                </div>
                
                <div>
                  <label className="font-semibold text-gray-700">Subcategory Name</label>
                  <input
                    type="text"
                    placeholder="Subcategory Name"
                    name="subcategory_name"
                    value={formik.values.subcategory_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.subcategory_name && formik.errors.subcategory_name
                        ? "customInputError"
                        : formik.values.subcategory_name
                        ? "filled"
                        : ""
                    }`}
                  />
                  {formik.touched.subcategory_name && formik.errors.subcategory_name && (
                    <div className="text-red-500 text-sm">{formik.errors.subcategory_name}</div>
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
                    rows={3}
                    className={`customInput w-full ${
                      formik.touched.description && formik.errors.description
                        ? "customInputError"
                        : formik.values.description
                        ? "filled"
                        : ""
                    }`}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-sm">{formik.errors.description}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="customInput w-full"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.status && formik.errors.status
                        ? "customSelectError"
                        : formik.values.status
                        ? "filled"
                        : ""
                    }`}
                  >
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
                  onClick={() => {
                    setModalOpen(false);
                    setImagePreview(null);
                    formik.resetForm();
                  }}
                  className="customBtn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    formik.resetForm();
                    setImagePreview(null);
                  }}
                  className="customBtn"
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  className="customBtn"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Saving..." : (editingSubcategory ? "Update" : "Save")}
                </button>
              </div>
            </form>
            <button
              onClick={() => {
                setModalOpen(false);
                setImagePreview(null);
              }}
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

export default ServiceSubcategories;