// src/pages/category/SubSubCategory.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DataTable from "../../components/common/DataTable";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";

type CategoryType = {
  id: number;
  name: string;
};

type SubCategoryType = {
  id: number;
  name: string;
  category: number;
  category_name?: string;
};

type SubSubCategoryType = {
  id: number;
  name: string;
  subcategory: number;
  subcategory_name?: string;
  category_id?: number;
  icon_url?: string | null;
  status: boolean;
};

const API_BASE = "/api/ecommerce"; // adjust if your base differs

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const validateImageFile = (file: File): Promise<{ ok: boolean; message?: string }> => {
  return new Promise((resolve) => {
    if (!file) return resolve({ ok: true });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return resolve({ ok: false, message: "Only JPG, JPEG and PNG files are allowed." });
    }

    // ✅ NO DIMENSION CHECK — auto-crop will handle it
    resolve({ ok: true });
  });
};



// ✅ helper: AUTO CROP + RESIZE to EXACT 200x200 + compress to ≤ 100KB
const compressImage = async (
  file: File,
  targetSize = 200,
  maxKB = 100
): Promise<File> => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.src = url;

  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  // ✅ center crop logic
  const minSide = Math.min(img.width, img.height);
  const cropX = (img.width - minSide) / 2;
  const cropY = (img.height - minSide) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = targetSize;   // exact 200
  canvas.height = targetSize;  // exact 200

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    img,
    cropX,
    cropY,
    minSide,
    minSide,
    0,
    0,
    targetSize,
    targetSize
  );

  let quality = 0.9;
  let blob: Blob | null = null;

  while (quality > 0.3) {
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (blob && blob.size / 1024 <= maxKB) break;
    quality -= 0.05;
  }

  if (!blob) throw new Error("Image processing failed");

  return new File([blob], file.name, { type: "image/jpeg" });
};


const SubSubCategory: React.FC = () => {
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategoryType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategoryType[]>([]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<SubSubCategoryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchCategories();
    fetchSubSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/category/`, { headers: getAuthHeaders() });
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      Swal.fire("Error", "Could not fetch categories. Check API or token.", "error");
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const res = await axios.get(`${API_BASE}/subcategory/?category=${categoryId}`, {
        headers: getAuthHeaders(),
      });
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to load subcategories:", err);
      setSubcategories([]);
    }
  };

  const fetchSubSubCategories = async (filterSubcategoryId?: number) => {
    try {
      const url =
        typeof filterSubcategoryId === "number"
          ? `${API_BASE}/subsubcategory/?subcategory=${filterSubcategoryId}`
          : `${API_BASE}/subsubcategory/`;
      const res = await axios.get(url, { headers: getAuthHeaders() });
      const normalized: SubSubCategoryType[] = res.data.map((i: any) => ({
        id: i.id,
        name: i.name,
        subcategory: i.subcategory,
        subcategory_name: i.subcategory_name || i.subcategory?.name || "",
        category_id: i.category_id,
        icon_url: i.icon_url || null,
        status: !!i.status,
      }));
      setSubSubCategories(normalized);
    } catch (err) {
      console.error("Failed to load sub-sub categories:", err);
      Swal.fire("Error", "Could not fetch Sub-Sub categories.", "error");
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setPreviewSrc(null);
    setModalOpen(true);
  };

  const handleEdit = (item: SubSubCategoryType) => {
    setEditing(item);
    setPreviewSrc(item.icon_url || null);

    // if category_id provided, fetch subcategories for that category safely
    if (item.category_id != null) {
      // ensure numeric
      const catId = Number(item.category_id);
      if (!Number.isNaN(catId)) {
        fetchSubcategories(catId).catch(() => {/* swallow */ });
      }
    }

    setModalOpen(true);
  };

  const handleDelete = (item: SubSubCategoryType) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#0165ff",
      confirmButtonText: "Yes, delete it!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axios.delete(`${API_BASE}/subsubcategory/${item.id}/`, {
            headers: getAuthHeaders(),
          });
          Swal.fire("Deleted", "Sub-Sub Category deleted.", "success");
          fetchSubSubCategories();
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Failed to delete.", "error");
        }
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      category: "" as number | "",
      subcategory: "" as number | "",
      name: "",
      icon: null as File | null,
      status: true,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      category: Yup.number().required("Category is required"),
      subcategory: Yup.number().required("Sub Category is required"),
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);

      if (values.icon) {
        const check = await validateImageFile(values.icon);
        if (!check.ok) {
          setIsLoading(false);
          return Swal.fire("Image error", check.message || "Invalid image", "error");
        }
      }

      try {
        const form = new FormData();
        form.append("subcategory", String(values.subcategory));
        form.append("name", values.name);
        form.append("status", values.status ? "true" : "false");
        if (values.icon) {
          form.append("icon", values.icon);
        }

        const headers = {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        };

        if (editing) {
          await axios.put(`${API_BASE}/subsubcategory/${editing.id}/`, form, { headers });
          Swal.fire("Updated", "Sub-Sub Category updated.", "success");
        } else {
          await axios.post(`${API_BASE}/subsubcategory/`, form, { headers });
          Swal.fire("Created", "Sub-Sub Category created.", "success");
        }

        setModalOpen(false);
        formik.resetForm();
        setPreviewSrc(null);
        fetchSubSubCategories();
      } catch (err: any) {
        console.error("Save error:", err);
        const msg =
          err?.response?.data?.detail ||
          (err?.response?.data && JSON.stringify(err.response.data)) ||
          "Failed to save. Check inputs or server.";
        Swal.fire("Error", msg, "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // When category selection changes: load its subcategories
  useEffect(() => {
    const cat = formik.values.category;
    if (cat) {
      fetchSubcategories(Number(cat));
    } else {
      setSubcategories([]);
    }
    formik.setFieldValue("subcategory", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.category]);

  // Populate form when editing
  useEffect(() => {
    if (modalOpen && editing) {
      if (editing.category_id != null) {
        const catId = Number(editing.category_id);
        if (!Number.isNaN(catId)) {
          (async () => {
            await fetchSubcategories(catId);
            formik.setFieldValue("subcategory", editing.subcategory);
          })();
          formik.setFieldValue("category", catId);
        } else {
          formik.setFieldValue("subcategory", editing.subcategory);
        }
      } else {
        formik.setFieldValue("subcategory", editing.subcategory);
      }
      formik.setFieldValue("name", editing.name);
      formik.setFieldValue("status", editing.status);
    } else if (modalOpen && !editing) {
      formik.resetForm();
      setPreviewSrc(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, editing]);

const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.currentTarget.files?.[0] || null;

  if (!file) {
    setPreviewSrc(null);
    formik.setFieldValue("icon", null);
    return;
  }

  const check = await validateImageFile(file);
  if (!check.ok) {
    formik.setFieldValue("icon", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreviewSrc(null);
    return Swal.fire("Image error", check.message || "Invalid image", "error");
  }

  try {
    // ✅ ALWAYS auto-crop + resize to 200x200 + compress ≤100KB
    const compressed = await compressImage(file, 200, 100);

    formik.setFieldValue("icon", compressed);

    const url = URL.createObjectURL(compressed);
    setPreviewSrc(url);
  } catch (err) {
    console.error("Compression error:", err);
    formik.setFieldValue("icon", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreviewSrc(null);
    Swal.fire("Error", "Unable to process selected image.", "error");
  }
};



  const columns = [
    { key: "id", label: "SR No" },

    // ⭐ ADD COLUMN — Main Category (from backend category_name)
    {
      key: "category_name",
      label: "Category",
      render: (item: SubSubCategoryType) => (
        <span className="font-semibold text-gray-800">
          {item.category_id
            ? categories.find((c) => c.id === item.category_id)?.name || "N/A"
            : "N/A"}
        </span>
      ),
    },

    // ⭐ ADD COLUMN — Parent Sub Category
    {
      key: "subcategory_name",
      label: "Sub Category",
      render: (item: SubSubCategoryType) => (
        <span className="font-semibold text-gray-800">
          {item.subcategory_name || "N/A"}
        </span>
      ),
    },

    // ORIGINAL COLUMNS CONTINUE BELOW ✔ (unchanged)
    { key: "name", label: "Name" },

    {
      key: "icon_url",
      label: "Icon",
      render: (item: SubSubCategoryType) => (
        <div className="flex items-center">
          {item.icon_url ? (
            <img
              src={item.icon_url}
              alt={item.name}
              className="w-10 h-10 object-cover rounded"
              style={{ maxWidth: 48, maxHeight: 48 }}
            />
          ) : (
            <span className="text-sm text-gray-500">No Icon</span>
          )}
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (item: SubSubCategoryType) => (
        <span
          className={`text-sm font-semibold ${item.status ? "text-green-700" : "text-red-700"
            }`}
        >
          {item.status ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];


  const openCreateModal = () => {
    setEditing(null);
    formik.resetForm();
    setPreviewSrc(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <DataTable
        title="Sub Sub Category"
        data={subSubCategories}
        columns={columns}
        onAdd={openCreateModal}
        onEdit={(item: SubSubCategoryType) => handleEdit(item)}
        onDelete={(item: SubSubCategoryType) => handleDelete(item)}
        addButtonLabel="Add Sub Sub Category"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className=" bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative
                max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-7">{editing ? "Edit Sub Sub Category" : "Add Sub Sub Category"}</h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div className="mb-2">
                <label className="block mb-1 font-medium">Category</label>
                <select
                  name="category"
                  value={formik.values.category as any}
                  onChange={(e) => {
                    const val = e.target.value;
                    formik.setFieldValue("category", val ? Number(val) : "");
                  }}
                  className={`customSelect ${formik.touched.category && (formik.errors as any).category ? "paymentSelectError" : formik.values.category ? "filled" : ""}`}
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {formik.touched.category && (formik.errors as any).category && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{(formik.errors as any).category}</div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Sub Category</label>
                <select
                  name="subcategory"
                  value={formik.values.subcategory as any}
                  onChange={(e) => {
                    const val = e.target.value;
                    formik.setFieldValue("subcategory", val ? Number(val) : "");
                  }}
                  className={`customSelect ${formik.touched.subcategory && (formik.errors as any).subcategory ? "paymentSelectError" : formik.values.subcategory ? "filled" : ""}`}
                >
                  <option value="">Select</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {formik.touched.subcategory && (formik.errors as any).subcategory && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{(formik.errors as any).subcategory}</div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={(e) => formik.setFieldValue("name", e.target.value)}
                  placeholder="Enter Name"
                  className={`${formik.touched.name && formik.errors.name ? "customInputError" : "customInput"
                    }`}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{(formik.errors as any).name}</div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Icon (JPG/JPEG/PNG, max 200x200)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/*"
                  onChange={onFileChange}
                  className={`customInput w-full ${formik.values.icon ? "filled" : ""}`}
                />

                {previewSrc ? (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Preview:</div>
                    <img src={previewSrc} alt="preview" style={{ maxWidth: 120, maxHeight: 120 }} />
                  </div>
                ) : editing && editing.icon_url ? (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Current Icon:</div>
                    <img src={editing.icon_url} alt="current" style={{ maxWidth: 120, maxHeight: 120 }} />
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <label className="font-medium">Status</label>
                <ToggleSwitch
                  checked={formik.values.status}
                  onChange={(val: boolean) => formik.setFieldValue("status", val)}
                />
                <span>{formik.values.status ? "Active" : "Inactive"}</span>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="customBtn">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="customBtn">
                  {editing ? "Update" : "Add"}
                </button>
              </div>
            </form>

            <button disabled={isLoading} onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl" type="button">
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubSubCategory;
