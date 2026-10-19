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
  description?: string;
  status: "Active" | "Inactive";
  icon?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
}

interface CategoryOption {
  id: number;
  name: string;
}

const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Icon: center crop 200x200, <= 100KB
const compressImage = async (file: File, targetSize = 200, maxKB = 100): Promise<File> => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  const minSide = Math.min(img.width, img.height);
  const cropX = (img.width - minSide) / 2;
  const cropY = (img.height - minSide) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, cropX, cropY, minSide, minSide, 0, 0, targetSize, targetSize);

  let quality = 0.9;
  let blob: Blob | null = null;
  while (quality > 0.3) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size / 1024 <= maxKB) break;
    quality -= 0.05;
  }
  if (!blob) throw new Error("Image processing failed");
  return new File([blob], file.name, { type: "image/jpeg" });
};

// Banner: center crop 600x900 (2:3), <= 300KB
const compressBanner = async (file: File, w = 600, h = 1000, maxKB = 300): Promise<File> => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  const targetRatio = w / h;
  let sw = img.width,
    sh = img.height;
  if (sw / sh > targetRatio) sw = sh * targetRatio;
  else sh = sw / targetRatio;
  const sx = (img.width - sw) / 2,
    sy = (img.height - sh) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  let quality = 0.92;
  let blob: Blob | null = null;
  while (quality > 0.5) {
    blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size / 1024 <= maxKB) break;
    quality -= 0.05;
  }
  if (!blob) throw new Error("Image processing failed");
  return new File([blob], file.name, { type: "image/jpeg" });
};

const isValidFileType = (file: File) => VALID_TYPES.includes(file.type);

const hexToRgb = (hex: string) => {
  const h = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000";
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
};

// Colour halka ho to text kala, gehra ho to text safed
const textColorFor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
};

const overlayGradient = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return `linear-gradient(to bottom, rgba(${r},${g},${b},0.92) 0%, rgba(${r},${g},${b},0.65) 45%, rgba(${r},${g},${b},0) 100%)`;
};

const SubCategory: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategoryState[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategoryState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<any>(null);
  const [overlayColor, setOverlayColor] = useState<string>("#000000");
  const [colorSaving, setColorSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchSectionColor();
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
          category_name: s.category_name ?? "",
          name: s.name,
          description: s.description ?? "",
          status: s.status ? "Active" : "Inactive",
          icon_url: s.icon_url || null,
          banner_url: s.banner_url || null,
        }));
        setSubCategories(mapped);
      } else {
        setSubCategories([]);
      }
    } catch (err) {
      console.error("Fetch subcategories error:", err);
    }
  };

  const fetchSectionColor = async () => {
    try {
      const res = await apiClient.get("ecommerce/subcategory-section/");
      setOverlayColor(res.data?.overlay_color || "#000000");
    } catch (err) {
      console.error("Fetch section colour error:", err);
    }
  };

  const handleSaveColor = async () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(overlayColor)) {
      Swal.fire("Error", "Valid hex colour daalo, jaise #1a1a1a", "error");
      return;
    }
    try {
      setColorSaving(true);
      await apiClient.put("ecommerce/subcategory-section/", { overlay_color: overlayColor });
      Swal.fire("Saved", "Colour sab cards par apply ho gaya", "success");
    } catch (err: any) {
      console.error("Save colour error:", err);
      Swal.fire("Error", "Failed to save colour", "error");
    } finally {
      setColorSaving(false);
    }
  };

  const resetModalState = () => {
    setPreviewUrl(null);
    setBannerPreview(null);
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
    setBannerPreview(item.banner_url || null);
    setModalOpen(true);
    formik.setValues({
      category: item.category?.toString() || "",
      name: item.name,
      description: item.description || "",
      status: item.status === "Active",
      icon: null,
      banner: null,
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

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerErrors(null);
    const file = e.currentTarget.files?.[0] ?? null;

    if (!file) {
      setPreviewUrl(null);
      formik.setFieldValue("icon", null);
      return;
    }

    if (!isValidFileType(file)) {
      Swal.fire("Invalid file", "Only JPG, JPEG and PNG allowed.", "error");
      formik.setFieldValue("icon", null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
      return;
    }

    try {
      const processed = await compressImage(file, 200, 100);
      formik.setFieldValue("icon", processed);
      setPreviewUrl(URL.createObjectURL(processed));
    } catch (err) {
      console.error("Image processing error:", err);
      Swal.fire("Error", "Unable to process selected image.", "error");
      formik.setFieldValue("icon", null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
    }
  };

  const onBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerErrors(null);
    const file = e.currentTarget.files?.[0] ?? null;

    if (!file) {
      setBannerPreview(editingSubCategory?.banner_url || null);
      formik.setFieldValue("banner", null);
      return;
    }

    if (!isValidFileType(file)) {
      Swal.fire("Invalid file", "Only JPG, JPEG and PNG allowed.", "error");
      formik.setFieldValue("banner", null);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
      return;
    }

    try {
      const processed = await compressBanner(file);
      formik.setFieldValue("banner", processed);
      setBannerPreview(URL.createObjectURL(processed));
    } catch (err) {
      console.error("Banner processing error:", err);
      Swal.fire("Error", "Unable to process selected banner image.", "error");
      formik.setFieldValue("banner", null);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const formik = useFormik({
    initialValues: {
      category: editingSubCategory ? editingSubCategory.category?.toString() : "",
      name: editingSubCategory ? editingSubCategory.name : "",
      description: editingSubCategory ? editingSubCategory.description ?? "" : "",
      status: editingSubCategory ? editingSubCategory.status === "Active" : true,
      icon: null as File | null,
      banner: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
      name: Yup.string().required("Name is required"),
      description: Yup.string().max(150, "Maximum 150 characters"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      setServerErrors(null);

      try {
        const fd = new FormData();
        fd.append("category", values.category);
        fd.append("name", values.name);
        fd.append("description", values.description || "");
        fd.append("status", values.status ? "true" : "false");
        if (values.icon) fd.append("icon", values.icon);
        if (values.banner) fd.append("banner_image", values.banner);

        if (editingSubCategory) {
          const res = await apiClient.put(`ecommerce/subcategory/${editingSubCategory.id}/`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const data = res.data?.data ?? res.data;
          setSubCategories((prev) =>
            prev.map((c) =>
              c.id === editingSubCategory.id
                ? {
                    ...c,
                    name: data.name,
                    category: data.category,
                    category_name: data.category_name || c.category_name,
                    description: data.description ?? "",
                    status: data.status ? "Active" : "Inactive",
                    icon_url: data.icon_url || c.icon_url,
                    banner_url: data.banner_url || c.banner_url,
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
            description: data.description ?? "",
            status: data.status ? "Active" : "Inactive",
            icon_url: data.icon_url || null,
            banner_url: data.banner_url || null,
          };
          setSubCategories((prev) => [newItem, ...prev]);
          Swal.fire("Added", "Sub category added successfully.", "success");
        }

        setModalOpen(false);
        resetForm();
        setPreviewUrl(null);
        setBannerPreview(null);
      } catch (err: any) {
        console.error("Save subcategory error:", err);
        const message = err?.response?.data || err.message || "Save failed";
        setServerErrors(err?.response?.data ?? null);
        Swal.fire("Error", typeof message === "string" ? message : JSON.stringify(message), "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

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
    {
      key: "banner",
      label: "Banner",
      render: (item: SubCategoryState) =>
        item.banner_url ? (
          <img
            src={item.banner_url}
            alt={`${item.name} banner`}
            className="w-12 h-20 rounded border object-cover"
          />
        ) : (
          <span className="text-sm text-gray-500">No Banner</span>
        ),
    },
    {
      key: "parent_category",
      label: "Parent Category",
      render: (item: SubCategoryState) => (
        <span className="font-semibold text-gray-800">{item.category_name || "N/A"}</span>
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "description",
      label: "Description",
      render: (item: SubCategoryState) => (
        <span className="text-sm text-gray-600">{item.description || "-"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: SubCategoryState) => (
        <span
          className={`text-sm font-semibold ${
            item.status === "Active" ? "text-green-700" : "text-red-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const closeModal = () => {
    setModalOpen(false);
    resetModalState();
    formik.resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Card Text Layer Colour - Global setting */}
      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Card Text Layer Colour</h3>

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={overlayColor}
                onChange={(e) => setOverlayColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-1"
              />
              <input
                type="text"
                maxLength={7}
                value={overlayColor}
                onChange={(e) => setOverlayColor(e.target.value)}
                placeholder="#000000"
                className="customInput w-32 uppercase"
              />
              <button
                type="button"
                onClick={() => setOverlayColor("#000000")}
                className="text-xs text-blue-600 hover:underline"
              >
                Reset to black
              </button>
            </div>
            <div>
              <button type="button" onClick={handleSaveColor} disabled={colorSaving} className="customBtn">
                {colorSaving ? "Saving..." : "Save Colour"}
              </button>
            </div>
          </div>

          {/* Live preview (pehli subcategory ka banner use hota hai) */}
          <div className="relative w-36 aspect-[3/5] overflow-hidden rounded-2xl border bg-gray-200">
            {subCategories.find((s) => s.banner_url)?.banner_url && (
              <img
                src={subCategories.find((s) => s.banner_url)!.banner_url!}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div
              className="absolute inset-x-0 top-0 h-[70%] pointer-events-none"
              style={{ background: overlayGradient(overlayColor) }}
            />
            <div className="absolute top-0 left-0 right-0 p-3" style={{ color: textColorFor(overlayColor) }}>
              <div className="text-sm font-semibold">Name</div>
              <div className="mt-1 text-xs opacity-90">Description</div>
              <div className="mt-2 text-xs font-medium underline">SHOP NOW →</div>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        title="Sub Category"
        data={subCategories}
        columns={columns}
        onAdd={openAddModal}
        onEdit={(item: any) => openEditModal(item)}
        onDelete={(item: any) => handleDelete(item)}
        addButtonLabel="Add Sub Category"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-7">
              {editingSubCategory ? "Edit Sub Category" : "Add Sub Category"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Category */}
              <div className="mb-2">
                <label className="block mb-1 font-medium">Category</label>
                <select
                  name="category"
                  value={formik.values.category || ""}
                  onChange={(e) => formik.setFieldValue("category", e.target.value)}
                  onBlur={formik.handleBlur}
                  className={`customSelect ${
                    formik.touched.category && (formik.errors as any).category
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
                  className={`customInput w-full ${
                    formik.touched.name && (formik.errors as any).name
                      ? "customInputError"
                      : formik.values.name
                      ? "filled"
                      : ""
                  }`}
                />
                {formik.touched.name && (formik.errors as any).name ? (
                  <div className="text-red-500 text-sm mt-1 ms-2">{(formik.errors as any).name}</div>
                ) : null}
              </div>

              {/* Description */}
              <div className="mb-2">
                <label className="block mb-1 font-medium">Short Description</label>
                <input
                  type="text"
                  name="description"
                  maxLength={150}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Premium quality fuel for every day."
                  className={`customInput w-full ${formik.values.description ? "filled" : ""}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Website pe card ke upar title ke neeche dikhega ({formik.values.description.length}/150)
                </p>
                {formik.touched.description && (formik.errors as any).description ? (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {(formik.errors as any).description}
                  </div>
                ) : null}
              </div>

              {/* Icon */}
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
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-20 h-20 object-cover rounded border" />
                  ) : editingSubCategory?.icon_url ? (
                    <img
                      src={editingSubCategory.icon_url}
                      alt="current"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : null}
                  <div className="text-sm text-gray-500">
                    Accepted: JPG, JPEG, PNG. Auto resized to 200 × 200 px.
                  </div>
                </div>
                {serverErrors && serverErrors.icon && (
                  <div className="text-red-500 text-sm mt-1">{JSON.stringify(serverErrors.icon)}</div>
                )}
              </div>

              {/* Banner */}
              <div>
                <label className="font-semibold text-gray-700">Homepage Banner (600 × 1000)</label>
                <input
                  ref={bannerInputRef}
                  type="file"
                  name="banner"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={onBannerChange}
                  className={`customInput w-full ${formik.values.banner ? "filled" : ""}`}
                />
                {bannerPreview && (
                  <img
                    src={bannerPreview}
                    alt="banner preview"
                    className="mt-2 w-40 rounded border aspect-[3/5] object-cover"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Portrait (2:3), JPG/PNG. Upar ka hissa khali rakho, wahan text aayega.
                </p>
                {serverErrors && serverErrors.banner_image && (
                  <div className="text-red-500 text-sm mt-1">
                    {JSON.stringify(serverErrors.banner_image)}
                  </div>
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

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer"
                  disabled={isLoading}
                >
                  {editingSubCategory
                    ? isLoading
                      ? "Updating..."
                      : "Update"
                    : isLoading
                    ? "Adding..."
                    : "Add"}
                </button>
              </div>
            </form>

            <button
              disabled={isLoading}
              onClick={closeModal}
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