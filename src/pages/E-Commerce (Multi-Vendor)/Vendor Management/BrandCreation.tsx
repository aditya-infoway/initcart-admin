import { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import apiClient from "../../../api/apiClient";

// ---------------------- INTERFACE ----------------------
interface Brand {
  id: number;
  brandName: string;
  description: string;
  brandLogo: any;
  totalProducts: number;
  product_count: number;
  status: "Active" | "Inactive";
}

// ---------------------- VALIDATION ----------------------
const BrandSchema = Yup.object().shape({
  brandName: Yup.string().required("Brand Name is required"),
  description: Yup.string().required("Description is required"),
  status: Yup.string().required("Status is required"),
  // brandLogo को optional रखा है, ताकि edit के time पर existing logo को keep किया जा सके
});

// ======================================================
//                 MAIN COMPONENT START
// ======================================================
const BrandCreation = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ---------------------- LOAD BRAND LIST ----------------------
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const res = await apiClient.get("ecommerce/brands/");
      const list = res.data.results ?? res.data;

      const mapped: Brand[] = list.map((b: any) => ({
        id: b.id,
        brandName: b.brand_name,
        description: b.description || "",
        brandLogo: b.brand_logo ? b.brand_logo : null,
        totalProducts: b.total_products || 0,
        product_count: b.product_count || 0,
        status: b.status === "active" ? "Active" : "Inactive",
      }));

      setBrands(mapped);
    } catch (err) {
      console.error("Brand load error:", err);
    }
  };

  // ---------------------- ACTIONS ----------------------
  const handleAdd = () => {
    setEditingBrand(null);
    setLogoPreview(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Brand) => {
    setEditingBrand(item);
    // Edit mode में current logo को preview में set करें
    setLogoPreview(item.brandLogo || null);
    setModalOpen(true);
  };

  const handleDelete = async (item: Brand) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Delete brand "${item.brandName}"?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiClient.delete(`ecommerce/brands/${item.id}/`);
      setBrands((prev) => prev.filter((b) => b.id !== item.id));

      Swal.fire("Deleted!", `${item.brandName} removed.`, "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete brand.", "error");
    }
  };

  // File change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    formik.setFieldValue("brandLogo", file);
    
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    } else {
      // अगर file remove कर दी गई है, तो current brand logo दिखाएं
      setLogoPreview(editingBrand?.brandLogo || null);
    }
  };

  // Clear logo handler
  const handleClearLogo = () => {
    formik.setFieldValue("brandLogo", null);
    setLogoPreview(null);
  };

  // ---------------------- FORMIK ----------------------
  const formik = useFormik({
    initialValues: {
      brandName: editingBrand ? editingBrand.brandName : "",
      description: editingBrand ? editingBrand.description : "",
      brandLogo: null as File | null,
      totalProducts: editingBrand ? editingBrand.totalProducts : 0,
      status: editingBrand ? editingBrand.status : "Active",
    },
    enableReinitialize: true,
    validationSchema: BrandSchema,

    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append("brand_name", values.brandName);
        formData.append("description", values.description);
        formData.append("status", values.status.toLowerCase());

        // Edit करते समय brandLogo नहीं है लेकिन logoPreview है तो current logo maintain रहेगा
        if (values.brandLogo) {
          formData.append("brand_logo", values.brandLogo);
        } else if (editingBrand && !values.brandLogo && logoPreview && logoPreview.startsWith("blob:")) {
          // अगर blob preview है, तो file upload नहीं करना चाहिए
          // API existing logo को maintain करेगा
        } else if (editingBrand && !values.brandLogo && !logoPreview) {
          // अगर logoPreview भी नहीं है, तो existing logo को clear करना होगा
          formData.append("brand_logo", "");
        }

        let res;

        // ---------- UPDATE ----------
        if (editingBrand) {
          res = await apiClient.patch(
            `ecommerce/brands/${editingBrand.id}/`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          const updated: Brand = {
            id: res.data.id,
            brandName: res.data.brand_name,
            description: res.data.description || "",
            brandLogo: res.data.brand_logo || null,
            totalProducts: res.data.total_products || editingBrand.totalProducts,
            product_count: res.data.product_count || editingBrand.product_count,
            status: res.data.status === "active" ? "Active" : "Inactive",
          };

          setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));

          Swal.fire("Updated!", "Brand updated successfully.", "success");
        }

        // ---------- CREATE ----------
        else {
          if (!values.brandLogo) {
            Swal.fire("Warning", "Please select a brand logo.", "warning");
            setIsLoading(false);
            return;
          }

          res = await apiClient.post("ecommerce/brands/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const created: Brand = {
            id: res.data.id,
            brandName: res.data.brand_name,
            description: res.data.description || "",
            brandLogo: res.data.brand_logo || null,
            totalProducts: res.data.total_products || 0,
            product_count: res.data.product_count || 0,
            status: res.data.status === "active" ? "Active" : "Inactive",
          };
          setBrands((prev) => [created, ...prev]);

          Swal.fire("Added!", "Brand added successfully.", "success");
        }

        setModalOpen(false);
        resetForm();
        setLogoPreview(null);
      } catch (err: any) {
        console.error(err);
        Swal.fire("Error", "Failed to save brand.", "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // ======================================================
  //                     UI
  // ======================================================
  return (
    <div className="">
      <DataTable
        title="Brand Creation"
        data={brands}
        columns={[
          { key: "id", label: "SR No" },
          { key: "brandName", label: "Brand Name" },
          {
            key: "brandLogo",
            label: "Brand Logo",
            render: (item: Brand) => (
              <span>
                {item.brandLogo ? (
                  <img
                    src={item.brandLogo}
                    alt="logo"
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  "No Logo"
                )}
              </span>
            ),
          },
          {
            key: "totalProducts",
            label: "Total Products",
            render: (item: Brand) => (
              <span className="font-semibold text-blue-600">
                {item.totalProducts}
              </span>
            )
          },
          {
            key: "product_count",
            label: "Approved Products",
            render: (item: Brand) => (
              <span className="font-semibold text-green-600">
                {item.product_count}
              </span>
            )
          },
          {
            key: "status",
            label: "Status",
            render: (item: Brand) => (
              <span
                className={`text-sm font-semibold ${item.status === "Active" ? "text-green-700" : "text-red-700"
                  }`}
              >
                {item.status}
              </span>
            ),
          },
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Brand"
      />

      {/* ---------------------- MODAL ---------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007a] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setModalOpen(false);
                setLogoPreview(null);
              }}
              className="absolute top-4 right-4 text-gray-600 text-3xl"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editingBrand ? "Edit Brand" : "Add Brand"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

              {/* BRAND NAME */}
              <div>
                <label className="font-semibold text-gray-700">Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  placeholder="Brand Name"
                  value={formik.values.brandName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${formik.touched.brandName && formik.errors.brandName
                    ? "customInputError"
                    : formik.values.brandName
                      ? "filled"
                      : ""
                    }`}
                />
                {formik.touched.brandName && formik.errors.brandName && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.brandName}</div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="font-semibold text-gray-700">Description</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${formik.touched.description && formik.errors.description
                    ? "customInputError"
                    : formik.values.description
                      ? "filled"
                      : ""
                    }`}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
                )}
              </div>

              {/* Logo - UPDATED SECTION */}
              <div>
                <label className="font-semibold text-gray-700">Brand Logo</label>
                <input
                  type="file"
                  name="brandLogo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={`customInput w-full ${logoPreview || formik.values.brandLogo ? "filled" : ""}`}
                />
                
                {/* Logo Preview and Current Logo */}
                <div className="mt-2">
                  {logoPreview ? (
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Logo Preview:</p>
                        <img
                          src={logoPreview}
                          alt="logo preview"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleClearLogo}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : editingBrand?.brandLogo ? (
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Current Logo:</p>
                        <img
                          src={editingBrand.brandLogo}
                          alt="current logo"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleClearLogo}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No logo selected</p>
                  )}
                </div>
              </div>

              {/* STATUS */}
              <div>
                <label className="font-semibold text-gray-700">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full ${formik.touched.status && formik.errors.status
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
                  <div className="text-red-500 text-sm mt-1">{formik.errors.status}</div>
                )}
              </div>

              {/* BOTTOM BUTTONS */}
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  className="customBtn" 
                  onClick={() => {
                    setModalOpen(false);
                    setLogoPreview(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="customBtn" 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : editingBrand ? "Update" : "Add"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandCreation;