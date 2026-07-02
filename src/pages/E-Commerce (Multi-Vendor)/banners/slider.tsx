import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../api/apiClient";
import Swal from "sweetalert2";


// ================= TYPES =================

type SliderRow = {
    id: number;
    url: string;
};

// ================= COMPONENT =================

const SliderImageManager: React.FC = () => {
    const [rows, setRows] = useState<SliderRow[]>([]);
    const [showModal, setShowModal] = useState(false);

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileRef = useRef<HTMLInputElement | null>(null);

    // ✅ update support
    const updateRef = useRef<HTMLInputElement | null>(null);
    const [updateId, setUpdateId] = useState<number | null>(null);

    // ================= LOAD FROM BACKEND =================

    useEffect(() => {
        apiClient.get("banners/slider/")
            .then(res => {
                setRows(
                    res.data.map((x: any) => ({
                        id: x.id,
                        url: x.image
                    }))
                );
            });
    }, []);

    // ================= IMAGE SELECT =================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        const objectUrl = URL.createObjectURL(file);

        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
            const width = img.width;
            const height = img.height;

            // Minimum size check
            if (width < 1920 || height < 700) {
                Swal.fire({
                    icon: "error",
                    title: "Image too small",
                    text: "Minimum size is 1920 x 700px",
                });
                handleRemove();
                URL.revokeObjectURL(objectUrl);
                return; // ⚠️ stop here, na resize na save
            }

            // Resize only if bigger than required
            if (width > 1920 || height > 700) {
                const canvas = document.createElement("canvas");
                canvas.width = 1920;
                canvas.height = 700;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, 1920, 700);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now(),
                            });
                            setImage(resizedFile);
                            setPreview(URL.createObjectURL(resizedFile));
                        }
                        URL.revokeObjectURL(objectUrl);
                    }, file.type);
                }
            } else {
                // Already perfect size
                setImage(file);
                setPreview(objectUrl);
            }
        };


        img.onerror = () => {
            Swal.fire({
                icon: "error",
                title: "Invalid image",
                text: "Failed to load image",
            });
            handleRemove();
            URL.revokeObjectURL(objectUrl);
        };
    };



    const handleRemove = () => {
        setImage(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    // ================= CREATE =================

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) return alert("Select image first");

        const formData = new FormData();
        formData.append("image", image);

        try {
            setLoading(true);

            const res = await apiClient.post(
                "banners/slider/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            const data = res.data;

            setRows(prev => [
                { id: data.id, url: data.image },
                ...prev
            ]);

            setShowModal(false);
            handleRemove();

        } finally {
            setLoading(false);
        }
    };

    // ================= DELETE =================

    const handleDelete = async (id: number) => {
        await apiClient.delete(`banners/slider/${id}/`);
        setRows(prev => prev.filter(r => r.id !== id));
    };

    // ================= UPDATE =================

    const handleUpdatePick = (id: number) => {
        setUpdateId(id);
        updateRef.current?.click();
    };

    const handleUpdateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !updateId) return;

        const file = e.target.files[0];
        const objectUrl = URL.createObjectURL(file);

        const img = new Image();
        img.src = objectUrl;

        img.onload = async () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            // Minimum size check
            if (width > 1920 || height > 700) {
                Swal.fire({
                    icon: "error",
                    title: "Image too small",
                    text: "Minimum size is 1920 x 700px",
                });
                URL.revokeObjectURL(objectUrl);
                if (updateRef.current) updateRef.current.value = "";
                return;
            }

            let fileToUpload = file;

            // Resize if bigger
            if (width < 1920 || height < 700) {
                const canvas = document.createElement("canvas");
                canvas.width = 1920;
                canvas.height = 700;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, 1920, 700);
                    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, file.type));
                    if (blob) {
                        fileToUpload = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                    }
                }
            }

            // Upload
            const fd = new FormData();
            fd.append("image", fileToUpload);

            try {
                const res = await apiClient.put(
                    `banners/slider/${updateId}/`,
                    fd,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                const data = res.data;

                setRows(prev =>
                    prev.map(r =>
                        r.id === updateId
                            ? { id: data.id, url: data.image }
                            : r
                    )
                );

            } finally {
                setUpdateId(null);
                URL.revokeObjectURL(objectUrl);
                if (updateRef.current) updateRef.current.value = "";
            }
        };

        img.onerror = () => {
            Swal.fire({
                icon: "error",
                title: "Invalid image",
                text: "Failed to load image",
            });
            URL.revokeObjectURL(objectUrl);
            if (updateRef.current) updateRef.current.value = "";
            setUpdateId(null);
        };
    };


    // ================= UI =================

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Slider Images</h1>
                        <p className="text-slate-500 text-sm">Manage homepage slider</p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
                    >
                        + Add Image
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <table className="w-full text-sm table-fixed">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="w-1/12 text-left p-4">SR</th>
                                <th className="w-6/12 text-center p-4">Preview</th>
                                <th className="w-5/12 text-right p-4">Actions</th>
                            </tr>
                        </thead>


                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-slate-400">
                                        No images uploaded
                                    </td>
                                </tr>
                            )}

                            {rows.map((row, index) => (
                                <tr key={row.id} className="border-t">

                                    <td className="p-4 font-medium">
                                        {index + 1}
                                    </td>

                                    <td className="p-4">
                                        <div className="flex justify-center items-center">
                                            <div className="w-44 h-24 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
                                                <img
                                                    src={row.url}
                                                    alt="slider"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </td>


                                    <td className="p-4 text-right space-x-2">

                                        <button
                                            onClick={() => handleUpdatePick(row.id)}
                                            className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs"
                                        >
                                            Update
                                        </button>

                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs"
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* hidden update input */}
            <input
                type="file"
                accept="image/*"
                ref={updateRef}
                onChange={handleUpdateFile}
                className="hidden"
            />

            {/* ================= MODAL ================= */}

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
                            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Upload Slider Image</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-500"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="w-full border p-3 rounded-xl"
                                />

                                {preview ? (
                                    <div className="relative">
                                        <img
                                            src={preview}
                                            className="w-full h-52 object-cover rounded-xl border"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemove}
                                            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-52 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400">
                                        Preview here
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {loading ? "Uploading..." : "Upload"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SliderImageManager;
