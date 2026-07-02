// MobileBannerManager.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../api/apiClient";
import Swal from "sweetalert2";

type MobileBanner = {
    id: number;
    image: string | null;
    title: string;
    subtitle: string;
    button_text: string;
    button_url: string;
    order: number;
    is_active: boolean;
};

const MobileBannerManager: React.FC = () => {
    const [banners, setBanners] = useState<MobileBanner[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState<MobileBanner | null>(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        image: null as File | null,
        title: "",
        subtitle: "",
        button_text: "",
        button_url: "",
        order: 0,
        is_active: true,
    });
    const fileRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await apiClient.get("banners/admin/mobile-banners/");
            console.log("Fetched banners:", res.data);
            setBanners(res.data);
        } catch (error: any) {
            console.error("Error fetching banners:", error);
            Swal.fire("Error", "Failed to load banners", "error");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        console.log("Selected file:", file.name, file.type, file.size);
        setFormData({ ...formData, image: file });
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: null });
        if (imagePreview && !imagePreview.startsWith('http')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitForm = new FormData();
        
        // IMPORTANT: Append image FIRST
        if (formData.image) {
            submitForm.append("image", formData.image);
            console.log("Appending image:", formData.image.name);
        } else if (!editingBanner) {
            Swal.fire("Error", "Please select an image", "error");
            return;
        }
        
        submitForm.append("title", formData.title);
        submitForm.append("subtitle", formData.subtitle);
        submitForm.append("button_text", formData.button_text);
        submitForm.append("button_url", formData.button_url);
        submitForm.append("order", String(formData.order));
        submitForm.append("is_active", String(formData.is_active));

        // Debug: Log FormData contents
        console.log("Submitting FormData:");
        for (let pair of submitForm.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {
            setLoading(true);
            let response;
            if (editingBanner) {
                response = await apiClient.put(`banners/admin/mobile-banners/${editingBanner.id}/`, submitForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                console.log("Update response:", response.data);
                Swal.fire("Success", "Banner updated successfully", "success");
            } else {
                response = await apiClient.post("banners/admin/mobile-banners/", submitForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                console.log("Create response:", response.data);
                Swal.fire("Success", "Banner added successfully", "success");
            }
            fetchBanners();
            handleCloseModal();
        } catch (error: any) {
            console.error("Error saving banner:", error);
            console.error("Response data:", error.response?.data);
            Swal.fire("Error", error.response?.data?.error || error.response?.data?.message || "Failed to save banner", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Banner?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await apiClient.delete(`banners/admin/mobile-banners/${id}/`);
                fetchBanners();
                Swal.fire("Deleted!", "Banner has been deleted", "success");
            } catch (error) {
                Swal.fire("Error", "Failed to delete banner", "error");
            }
        }
    };

    const handleEdit = (banner: MobileBanner) => {
        setEditingBanner(banner);
        setFormData({
            image: null,
            title: banner.title,
            subtitle: banner.subtitle,
            button_text: banner.button_text,
            button_url: banner.button_url,
            order: banner.order,
            is_active: banner.is_active,
        });
        setImagePreview(banner.image);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBanner(null);
        setFormData({
            image: null,
            title: "",
            subtitle: "",
            button_text: "",
            button_url: "",
            order: 0,
            is_active: true,
        });
        if (imagePreview && !imagePreview.startsWith('http')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await apiClient.patch(`banners/admin/mobile-banners/${id}/`, { is_active: !currentStatus });
            fetchBanners();
        } catch (error) {
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Mobile Banners</h1>
                        <p className="text-slate-500 text-sm">Manage mobile app banners</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2 rounded-xl bg-orange-600 text-white font-medium shadow hover:bg-orange-700 transition"
                    >
                        + Add Banner
                    </button>
                </div>

                {/* Banners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative h-48 bg-gray-100">
                                {banner.image ? (
                                    <img
                                        src={banner.image}
                                        alt={banner.title || 'Banner'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Image failed to load:', banner.image);
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(banner.id, banner.is_active)}
                                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                            banner.is_active ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                                        }`}
                                    >
                                        {banner.is_active ? "Active" : "Inactive"}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg">{banner.title || "Untitled"}</h3>
                                {banner.subtitle && <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>}
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-xs text-gray-400">Order: {banner.order}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {banners.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <p className="text-gray-400">No mobile banners added yet</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-3 text-orange-600 font-semibold"
                        >
                            + Add your first banner
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">
                                    {editingBanner ? "Edit Banner" : "Add Mobile Banner"}
                                </h2>
                                <button onClick={handleCloseModal} className="text-slate-500">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Banner Image *</label>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full border p-2 rounded-lg"
                                        required={!editingBanner}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Recommended: 750x400px</p>
                                    {imagePreview && (
                                        <div className="mt-2 relative">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-32 object-cover rounded-lg" 
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-1 right-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Special Offer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Subtitle (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Limited time deal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Button Text (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.button_text}
                                        onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Shop Now"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Button URL (optional)</label>
                                    <input
                                        type="url"
                                        value={formData.button_url}
                                        onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm font-medium">Active</label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:opacity-60"
                                >
                                    {loading ? "Saving..." : (editingBanner ? "Update Banner" : "Add Banner")}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileBannerManager;