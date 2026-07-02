// src/pages/category/SubCategory.tsx
import React, { useEffect, useState, useRef } from "react";
import DataTable from "../../components/common/DataTable";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import apiClient from "../../api/apiClient";

interface SubCategoryState {
  id: number;
  category: number | string;
  category_name?: string;
  name: string;
  status: "Active" | "Inactive";
  icon?: string | null;
  icon_url?: string | null;
}

interface CategoryOption {
  id: number;
  name: string;
}

const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png"];

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
  canvas.width = targetSize;
  canvas.height = targetSize;

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

const SubCategory: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategoryState[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategoryState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch categories + subcategories on mount
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("ecommerce/category/");
      setCategories(
        Array.isArray(res.data) ? res.data.map((c: any) => ({ id: c.id, name: c.name })) : []
      );
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await apiClient.get("ecommerce/subcategory/");
      if (Array.isArray(res.data)) {
        const mapped: SubCategoryState[] = res.data.map((s: any) => ({
          id: s.id,
          category: s.category,
          category_name: s.category_name ?? (s.category_name ? s.category_name : ""),
          name: s.name,
          status: s.status ? "Active" : "Inactive",
          icon_url: s.icon_url || null,
        }));
        setSubCategories(mapped);
      } else {
        setSubCategories([]);
      }
    } catch (err) {
      console.error("Fetch subcategories error:", err);
    }
  };

  const resetModalState = () => {
    setPreviewUrl(null);
    setServerErrors(null);
    setEditingSubCategory(null);
  };

  const openAddModal = () => {
    resetModalState();
    setModalOpen(true);
  };

  const openEditModal = (item: SubCategoryState) => {
    setEditingSubCategory(item);
    setPreviewUrl(item.icon_url || null);
    setModalOpen(true);
    formik.setValues({
      category: item.category?.toString() || "",
      name: item.name,
      status: item.status === "Active",
      icon: null,
    });
  };

  const handleDelete = async (item: SubCategoryState) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`ecommerce/subcategory/${item.id}/`);
      setSubCategories((prev) => prev.filter((c) => c.id !== item.id));
      Swal.fire("Deleted!", `"${item.name}" has been deleted.`, "success");
    } catch (err: any) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Unable to delete. Try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ helper: validate file type only (no dimension check)
  const isValidFileType = (file: File) => {
    return VALID_TYPES.includes(file.type);
  };

  // ✅ handle file input change (same as CategoryMaster.tsx)
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerErrors(null);
    const file = e.currentTarget.files?.[0] ?? null;

    if (!file) {
      setPreviewUrl(null);
      formik.setFieldValue("icon", null);
      return;
    }

    // ✅ Only type validation (no dimension validation)
    if (!isValidFileType(file)) {
      Swal.fire("Invalid file", "Only JPG, JPEG and PNG allowed.", "error");
      formik.setFieldValue("icon", null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
      return;
    }

    try {
      // ✅ AUTO CROP + RESIZE 200x200 + COMPRESS ≤100KB
      const processed = await compressImage(file, 200, 100);

      // ✅ set in formik
      formik.setFieldValue("icon", processed);

      // ✅ preview
      const url = URL.createObjectURL(processed);
      setPreviewUrl(url);

    } catch (err) {
      console.error("Image processing error:", err);
      Swal.fire("Error", "Unable to process selected image.", "error");
      formik.setFieldValue("icon", null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
    }
  };

  // Formik
  const formik = useFormik({
    initialValues: {
      category: editingSubCategory ? editingSubCategory.category?.toString() : "",
      name: editingSubCategory ? editingSubCategory.name : "",
      status: editingSubCategory ? editingSubCategory.status === "Active" : true,
      icon: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      setServerErrors(null);

      try {
        const fd = new FormData();
        fd.append("category", values.category);
        fd.append("name", values.name);
        fd.append("status", values.status ? "true" : "false");
        if (values.icon) {
          fd.append("icon", values.icon);
        }

        if (editingSubCategory) {
          const res = await apiClient.put(
            `ecommerce/subcategory/${editingSubCategory.id}/`,
            fd,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          const data = res.data?.data ?? res.data;
          setSubCategories((prev) =>
            prev.map((c) =>
              c.id === editingSubCategory.id
                ? {
                  ...c,
                  name: data.name,
                  category: data.category,
                  category_name: data.category_name || c.category_name,
                  status: data.status ? "Active" : "Inactive",
                  icon_url: data.icon_url || c.icon_url,
                }
                : c
            )
          );
          Swal.fire("Updated", "Sub category updated successfully.", "success");
        } else {
          const res = await apiClient.post("ecommerce/subcategory/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const data = res.data?.data ?? res.data;
          const newItem: SubCategoryState = {
            id: data.id,
            category: data.category,
            category_name: data.category_name || "",
            name: data.name,
            status: data.status ? "Active" : "Inactive",
            icon_url: data.icon_url || null,
          };
          setSubCategories((prev) => [newItem, ...prev]);
          Swal.fire("Added", "Sub category added successfully.", "success");
        }

        setModalOpen(false);
        resetForm();
        setPreviewUrl(null);
      } catch (err: any) {
        console.error("Save subcategory error:", err);
        const message = err?.response?.data || err.message || "Save failed";
        // If detailed validation errors from backend (object), save
        setServerErrors(err?.response?.data ?? null);
        Swal.fire("Error", typeof message === "string" ? message : JSON.stringify(message), "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // DataTable columns (keeps UI same; adds icon thumbnail column + parent category column)
  const columns = [
    {
      key: "icon",
      label: "Icon",
      render: (item: SubCategoryState) => (
        <div className="flex items-center">
          {item.icon_url ? (
            <img
              src={item.icon_url}
              alt={item.name}
              className="w-12 h-12 rounded object-cover"
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">
              N/A
            </div>
          )}
        </div>
      ),
    },

    // ⭐ NEW COLUMN — Parent Category Name
    {
      key: "parent_category",
      label: "Parent Category",
      render: (item: SubCategoryState) => (
        <span className="font-semibold text-gray-800">
          {item.category_name || "N/A"}
        </span>
      ),
    },

    { key: "name", label: "Name" },

    { key: "category_name", label: "Category" },

    {
      key: "status",
      label: "Status",
      render: (item: SubCategoryState) => (
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-semibold ${item.status === "Active" ? "text-green-700" : "text-red-700"
              }`}
          >
            {item.status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <DataTable
        title="Sub Category"
        data={subCategories}
        columns={columns}
        onAdd={openAddModal}
        onEdit={(item: any) => openEditModal(item)}
        onDelete={(item: any) => handleDelete(item)}
        addButtonLabel="Add Sub Category"
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className=" bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative
                max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-7">
              {editingSubCategory ? "Edit Sub Category" : "Add Sub Category"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Category select */}
              <div className="mb-2">
                <label className="block mb-1 font-medium">Category</label>
                <select
                  name="category"
                  value={formik.values.category || ""}
                  onChange={(e) => formik.setFieldValue("category", e.target.value)}
                  onBlur={formik.handleBlur}
                  className={`customSelect ${formik.touched.category && (formik.errors as any).category
                    ? "paymentSelectError"
                    : formik.values.category
                      ? "filled"
                      : ""
                    }`}
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {formik.touched.category && (formik.errors as any).category ? (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {(formik.errors as any).category}
                  </div>
                ) : null}
              </div>

              {/* Name */}
              <div className="mb-2">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={(e) => formik.setFieldValue("name", e.target.value)}
                  placeholder="Enter Name"
                  className={`customInput w-full ${formik.touched.name && (formik.errors as any).name
                    ? "customInputError"
                    : formik.values.name
                      ? "filled"
                      : ""
                    } `}
                />
                {formik.touched.name && (formik.errors as any).name ? (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {(formik.errors as any).name}
                  </div>
                ) : null}
              </div>

              {/* ✅ Icon upload (EXACTLY like CategoryMaster.tsx) */}
              <div>
                <label className="font-semibold text-gray-700">Icon</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="icon"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={onFileChange}
                  className={`customInput w-full ${formik.values.icon ? "filled" : ""}`}
                />

                <div className="mt-2 flex items-center gap-3">
                  {/* preview: newly selected or existing */}
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-20 h-20 object-cover rounded border" />
                  ) : editingSubCategory?.icon_url ? (
                    <img src={editingSubCategory.icon_url} alt="current" className="w-20 h-20 object-cover rounded border" />
                  ) : null}
                  <div className="text-sm text-gray-500">
                    Accepted: JPG, JPEG, PNG. Auto resized to 200 × 200 px.
                  </div>
                </div>
                {serverErrors && serverErrors.icon && (
                  <div className="text-red-500 text-sm mt-1">{JSON.stringify(serverErrors.icon)}</div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <label className="font-medium">Status</label>
                <ToggleSwitch
                  checked={formik.values.status}
                  onChange={(val) => formik.setFieldValue("status", val)}
                />
                <span>{formik.values.status ? "Active" : "Inactive"}</span>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetModalState();
                    formik.resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer"
                  disabled={isLoading}
                >
                  {editingSubCategory ? (isLoading ? "Updating..." : "Update") : (isLoading ? "Adding..." : "Add")}
                </button>
              </div>
            </form>

            <button
              disabled={isLoading}
              onClick={() => {
                setModalOpen(false);
                resetModalState();
                formik.resetForm();
              }}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
              type="button"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategory;