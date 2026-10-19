// src/pages/category/CategoryMaster.tsx
import React, { useEffect, useRef, useState } from "react";
import DataTable from "../../../components/common/DataTable";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import apiClient from "../../../api/apiClient";

interface CategoryItem {
  id: number;
  name: string;
  description: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  status: boolean;
  is_featured: boolean;
  web_home: boolean;
  platform_charge: number;
}

interface FormValues {
  category: string;
  description: string;
  image: File | null;
  banner: File | null;
  status: "Active" | "Inactive";
  web_home: boolean;
  platform_charge: string;
}

const DEFAULT_EYEBROW = "Shop by category";
const DEFAULT_HEADING = "Curated for retailers and shoppers";

const CategorySchema = Yup.object().shape({
  category: Yup.string().required("Category is required"),
  description: Yup.string().required("Description is required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required("Status is required"),
  platform_charge: Yup.number()
    .min(0, "Platform charge cannot be negative")
    .max(100, "Platform charge cannot exceed 100%")
    .required("Platform charge is required"),
  web_home: Yup.boolean(),
});

const isValidFileType = (file: File) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  return allowed.includes(file.type);
};

const compressImage = async (file: File, targetSize = 200, maxKB = 100): Promise<File> => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.src = url;

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

// Banner compress (800x500 center crop)
const compressBanner = async (file: File, w = 800, h = 500, maxKB = 300): Promise<File> => {
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

const CategoryMaster: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Homepage section heading state
  const [sectionEyebrow, setSectionEyebrow] = useState<string>(DEFAULT_EYEBROW);
  const [sectionHeading, setSectionHeading] = useState<string>(DEFAULT_HEADING);
  const [sectionSaving, setSectionSaving] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/ecommerce/category/");
      const data = res.data;
      const list: CategoryItem[] = Array.isArray(data) ? data : data?.data || [];
      setCategories(
        list.map((c: any) => ({
          id: c.id,
          name: c.name ?? c.category ?? "",
          description: c.description ?? "",
          icon_url: c.icon_url ?? c.icon ?? null,
          banner_url: c.banner_url ?? null,
          status:
            typeof c.status === "boolean"
              ? c.status
              : c.status === "Active" || c.status === "active",
          is_featured: c.is_featured || false,
          web_home: c.web_home || false,
          platform_charge: c.platform_charge || 0,
        }))
      );
    } catch (err) {
      console.error("Fetch categories error:", err);
      Swal.fire("Error", "Failed to load categories", "error");
    }
  };

  // ✅ Fetch section heading
  const fetchSectionSetting = async () => {
    try {
      const res = await apiClient.get("/ecommerce/category-section/");
      setSectionEyebrow(res.data?.eyebrow ?? DEFAULT_EYEBROW);
      setSectionHeading(res.data?.heading ?? DEFAULT_HEADING);
    } catch (err) {
      console.error("Fetch section setting error:", err);
    }
  };

  // ✅ Save section heading
  const handleSaveSection = async () => {
    if (!sectionHeading.trim()) {
      Swal.fire("Error", "Heading cannot be empty", "error");
      return;
    }
    try {
      setSectionSaving(true);
      await apiClient.put("/ecommerce/category-section/", {
        eyebrow: sectionEyebrow.trim(),
        heading: sectionHeading.trim(),
      });
      Swal.fire("Saved", "Homepage heading updated successfully", "success");
    } catch (err: any) {
      console.error("Save section error:", err);
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to update heading",
        "error"
      );
    } finally {
      setSectionSaving(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSectionSetting();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const resetModalState = () => {
    setPreviewUrl(null);
    setBannerPreview(null);
    setServerErrors(null);
    setEditingCategory(null);
  };

  const handleAdd = () => {
    resetModalState();
    setModalOpen(true);
  };

  const handleEdit = (item: CategoryItem) => {
    resetModalState();
    setEditingCategory(item);
    setPreviewUrl(item.icon_url || null);
    setBannerPreview(item.banner_url || null);
    setModalOpen(true);
  };

  const handleToggleWebHome = async (item: CategoryItem) => {
    try {
      const result = await Swal.fire({
        title: item.web_home ? "Remove from Homepage?" : "Show on Homepage?",
        text: item.web_home
          ? `Remove "${item.name}" from homepage sliders?`
          : `Show "${item.name}" category on homepage sliders?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Updating...",
          text: "Please wait",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const fd = new FormData();
        fd.append("web_home", (!item.web_home).toString());

        const response = await apiClient.put(`/ecommerce/category/${item.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.close();

        if (response.data?.success) {
          setCategories((prev) =>
            prev.map((c) => (c.id === item.id ? { ...c, web_home: !c.web_home } : c))
          );

          Swal.fire(
            "Success!",
            item.web_home
              ? "Category removed from homepage."
              : "Category will now appear on homepage!",
            "success"
          );
        } else {
          throw new Error(response.data?.message || "Update failed");
        }
      }
    } catch (err: any) {
      console.error("Toggle web_home error:", err);
      Swal.close();
      Swal.fire(
        "Error",
        err.response?.data?.message || err.message || "Failed to update homepage status",
        "error"
      );
    }
  };

  const handleToggleFeatured = async (item: CategoryItem) => {
    try {
      const result = await Swal.fire({
        title: item.is_featured ? "Remove from Featured?" : "Mark as Featured?",
        text: item.is_featured
          ? `Remove "${item.name}" from featured categories?`
          : `Mark "${item.name}" as featured category?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await apiClient.patch(`/ecommerce/category/${item.id}/feature/`);

        setCategories((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, is_featured: !c.is_featured } : c))
        );

        Swal.fire(
          "Success!",
          item.is_featured
            ? "Category removed from featured."
            : "Category marked as featured!",
          "success"
        );
      }
    } catch (err) {
      console.error("Toggle featured error:", err);
      Swal.fire("Error", "Failed to update featured status", "error");
    }
  };

  const handleDelete = (item: CategoryItem) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/ecommerce/category/${item.id}/`);
          setCategories((prev) => prev.filter((c) => c.id !== item.id));
          Swal.fire("Deleted!", `"${item.name}" has been deleted.`, "success");
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire("Error", "Failed to delete category", "error");
        }
      }
    });
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      category: editingCategory ? editingCategory.name : "",
      description: editingCategory ? editingCategory.description ?? "" : "",
      image: null,
      banner: null,
      status: editingCategory ? (editingCategory.status ? "Active" : "Inactive") : "Active",
      web_home: editingCategory ? editingCategory.web_home : false,
      platform_charge: editingCategory ? editingCategory.platform_charge.toString() : "0",
    },
    enableReinitialize: true,
    validationSchema: CategorySchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setServerErrors(null);

      try {
        if (values.image && !isValidFileType(values.image)) {
          throw new Error("Invalid file type. Only JPG, JPEG and PNG allowed.");
        }
        if (values.banner && !isValidFileType(values.banner)) {
          throw new Error("Invalid banner file type. Only JPG, JPEG and PNG allowed.");
        }

        const fd = new FormData();
        fd.append("name", values.category);
        fd.append("description", values.description);
        fd.append("status", values.status === "Active" ? "true" : "false");
        fd.append("web_home", values.web_home ? "true" : "false");
        fd.append("platform_charge", values.platform_charge);

        if (values.image) fd.append("icon", values.image);
        if (values.banner) fd.append("banner_image", values.banner);

        if (editingCategory) {
          const res = await apiClient.put(`/ecommerce/category/${editingCategory.id}/`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const updated = res.data?.data ?? res.data;

          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? {
                    id: updated.id ?? editingCategory.id,
                    name: updated.name ?? updated.category ?? values.category,
                    description: updated.description ?? values.description,
                    icon_url: updated.icon_url ?? editingCategory.icon_url ?? null,
                    banner_url: updated.banner_url ?? editingCategory.banner_url ?? null,
                    status:
                      typeof updated.status === "boolean"
                        ? updated.status
                        : updated.status === "Active" || updated.status === "active",
                    is_featured: updated.is_featured ?? editingCategory.is_featured ?? false,
                    web_home:
                      typeof updated.web_home === "boolean" ? updated.web_home : values.web_home,
                    platform_charge:
                      updated.platform_charge ?? parseFloat(values.platform_charge),
                  }
                : c
            )
          );
          Swal.fire("Updated", "Category updated successfully", "success");
        } else {
          const res = await apiClient.post("/ecommerce/category/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const created = res.data?.data ?? res.data;

          setCategories((prev) => [
            {
              id: created.id,
              name: created.name ?? values.category,
              description: created.description ?? values.description,
              icon_url: created.icon_url ?? null,
              banner_url: created.banner_url ?? null,
              status:
                typeof created.status === "boolean"
                  ? created.status
                  : created.status === "Active" || created.status === "active",
              is_featured: created.is_featured ?? false,
              web_home:
                typeof created.web_home === "boolean" ? created.web_home : values.web_home,
              platform_charge: created.platform_charge ?? parseFloat(values.platform_charge),
            },
            ...prev,
          ]);
          Swal.fire("Added", "Category added successfully", "success");
        }

        setModalOpen(false);
        formik.resetForm();
        setPreviewUrl(null);
        setBannerPreview(null);
      } catch (err: any) {
        console.error("Save error:", err);
        const message = err?.response?.data || err.message || "Save failed";
        setServerErrors(err?.response?.data ?? null);
        Swal.fire(
          "Error",
          typeof message === "string" ? message : JSON.stringify(message),
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerErrors(null);
    const file = e.currentTarget.files?.[0] ?? null;

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (!isValidFileType(file)) {
      Swal.fire("Invalid file", "Only JPG, JPEG and PNG allowed.", "error");
      formik.setFieldValue("image", null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
      return;
    }

    try {
      const processed = await compressImage(file, 200, 100);
      formik.setFieldValue("image", processed);
      const url = URL.createObjectURL(processed);
      setPreviewUrl(url);
    } catch (err) {
      console.error("Image processing error:", err);
      Swal.fire("Error", "Unable to process selected image.", "error");
      formik.setFieldValue("image", null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
    }
  };

  return (
    <div className="">
      {/* ✅ Homepage Section Heading Card */}
      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Homepage Section Heading</h3>
        <p className="text-sm text-gray-500 mb-4">
          Ye text website ke homepage par "Featured Categories" grid ke upar dikhega.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-gray-700">Small Label (optional)</label>
            <input
              type="text"
              value={sectionEyebrow}
              onChange={(e) => setSectionEyebrow(e.target.value)}
              placeholder="Shop by category"
              maxLength={100}
              className={`customInput w-full ${sectionEyebrow ? "filled" : ""}`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700">Main Heading</label>
            <input
              type="text"
              value={sectionHeading}
              onChange={(e) => setSectionHeading(e.target.value)}
              placeholder="Curated for retailers and shoppers"
              maxLength={255}
              className={`customInput w-full ${sectionHeading ? "filled" : ""}`}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveSection}
            disabled={sectionSaving}
            className="customBtn"
          >
            {sectionSaving ? "Saving..." : "Save Heading"}
          </button>
        </div>
      </div>

      <DataTable
        title="Category"
        data={categories}
        columns={[
          { key: "id", label: "SR No" },
          { key: "name", label: "Category" },
          { key: "description", label: "Description" },
          {
            key: "platform_charge",
            label: "Platform Charge",
            render: (item: CategoryItem) => (
              <span className="font-medium">{item.platform_charge}%</span>
            ),
          },
          {
            key: "image",
            label: "Icon",
            render: (item: CategoryItem) => (
              <div className="flex items-center gap-2">
                {item.icon_url ? (
                  <img
                    src={item.icon_url}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <span className="text-sm text-gray-500">No Image</span>
                )}
              </div>
            ),
          },
          {
            key: "banner",
            label: "Banner",
            render: (item: CategoryItem) => (
              <div className="flex items-center gap-2">
                {item.banner_url ? (
                  <img
                    src={item.banner_url}
                    alt={`${item.name} banner`}
                    className="w-24 h-14 object-cover rounded border"
                  />
                ) : (
                  <span className="text-sm text-gray-500">No Banner</span>
                )}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item: CategoryItem) => (
              <span
                className={`text-sm font-semibold ${
                  item.status ? "text-green-700" : "text-red-700"
                }`}
              >
                {item.status ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "web_home",
            label: "Show on Homepage",
            render: (item: CategoryItem) => (
              <button
                onClick={() => handleToggleWebHome(item)}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  item.web_home
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {item.web_home ? "✓ On Homepage" : "○ Add to Homepage"}
              </button>
            ),
          },
          {
            key: "featured",
            label: "Featured",
            render: (item: CategoryItem) => (
              <button
                onClick={() => handleToggleFeatured(item)}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  item.is_featured
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {item.is_featured ? "★ Featured" : "☆ Mark as Featured"}
              </button>
            ),
          },
        ]}
        onEdit={(row: any) => handleEdit(row)}
        onDelete={(row: any) => handleDelete(row)}
        onAdd={handleAdd}
        addButtonLabel="Add Category"
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-semibold text-gray-700">Category</label>
                <input
                  type="text"
                  placeholder="Category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.category && formik.errors.category
                      ? "customInputError"
                      : formik.values.category
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.category && formik.errors.category && (
                  <div className="text-red-500 text-sm">{formik.errors.category}</div>
                )}
              </div>

              <div>
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
                <label className="font-semibold text-gray-700">Platform Charge (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Platform charge percentage"
                  name="platform_charge"
                  value={formik.values.platform_charge}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.platform_charge && formik.errors.platform_charge
                      ? "customInputError"
                      : formik.values.platform_charge
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.platform_charge && formik.errors.platform_charge && (
                  <div className="text-red-500 text-sm">{formik.errors.platform_charge}</div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This percentage will be charged on each sale in this category
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Icon</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={onFileChange}
                  className={`customInput w-full ${formik.values.image ? "filled" : ""}`}
                />

                <div className="mt-2 flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : editingCategory?.icon_url ? (
                    <img
                      src={editingCategory.icon_url}
                      alt="current"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : null}
                  <div className="text-sm text-gray-500">
                    Accepted: JPG, JPEG, PNG. Auto resized to 200 x 200 px.
                  </div>
                </div>
                {serverErrors && serverErrors.icon && (
                  <div className="text-red-500 text-sm mt-1">
                    {JSON.stringify(serverErrors.icon)}
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-gray-700">Homepage Banner (800 × 500)</label>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className={`customInput w-full ${formik.values.banner ? "filled" : ""}`}
                  onChange={async (e) => {
                    const file = e.currentTarget.files?.[0];
                    if (!file) return;
                    if (!isValidFileType(file)) {
                      Swal.fire("Invalid file", "Only JPG and PNG allowed.", "error");
                      return;
                    }
                    try {
                      const processed = await compressBanner(file);
                      formik.setFieldValue("banner", processed);
                      setBannerPreview(URL.createObjectURL(processed));
                    } catch (err) {
                      console.error("Banner processing error:", err);
                      Swal.fire("Error", "Unable to process selected banner image.", "error");
                    }
                  }}
                />
                {(bannerPreview || editingCategory?.banner_url) && (
                  <img
                    src={bannerPreview || editingCategory?.banner_url!}
                    alt="banner preview"
                    className="mt-2 w-full rounded border aspect-[8/5] object-cover"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">Size: 800×500, JPG/PNG.</p>
                {serverErrors && serverErrors.banner_image && (
                  <div className="text-red-500 text-sm mt-1">
                    {JSON.stringify(serverErrors.banner_image)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
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
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm">{formik.errors.status}</div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2">
                <label className="font-semibold text-gray-700">Show on Homepage:</label>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue("web_home", !formik.values.web_home)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    formik.values.web_home
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {formik.values.web_home ? "✓ Yes, show on homepage" : "○ No, hide from homepage"}
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetModalState();
                    formik.resetForm();
                  }}
                  className="customBtn"
                >
                  Cancel
                </button>
                <button type="submit" className="customBtn" disabled={isLoading}>
                  {editingCategory
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
              onClick={() => {
                setModalOpen(false);
                resetModalState();
                formik.resetForm();
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

export default CategoryMaster;