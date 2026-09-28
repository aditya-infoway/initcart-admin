import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";
import apiClient from "../../api/apiClient"; // path apne project ke hisaab se adjust karo

interface QRCard {
  id?: number;
  name: string;
  slug?: string;
  logo?: string | null;
  qr_image?: string;
  map_link?: string;
  whatsapp_link?: string;
  google_review_link?: string;
  instagram_link?: string;
  facebook_link?: string;
  youtube_link?: string;
  website_link?: string;
}

interface QRCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: QRCard | null;
}

const emptyForm: QRCard = {
  name: "",
  map_link: "",
  whatsapp_link: "",
  google_review_link: "",
  instagram_link: "",
  facebook_link: "",
  youtube_link: "",
  website_link: "",
};

const LINK_FIELDS: { key: keyof QRCard; label: string; placeholder: string }[] = [
  { key: "map_link", label: "Map Link", placeholder: "https://maps.google.com/..." },
  { key: "whatsapp_link", label: "WhatsApp Link", placeholder: "https://wa.me/91XXXXXXXXXX" },
  { key: "google_review_link", label: "Google Review Link", placeholder: "https://g.page/r/..." },
  { key: "instagram_link", label: "Instagram Link", placeholder: "https://instagram.com/..." },
  { key: "facebook_link", label: "Facebook Link", placeholder: "https://facebook.com/..." },
  { key: "youtube_link", label: "YouTube Link", placeholder: "https://youtube.com/..." },
  { key: "website_link", label: "Website Link", placeholder: "https://..." },
];

const QRCardModal: React.FC<QRCardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
}) => {
  const [form, setForm] = useState<QRCard>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm(editData);
      setLogoPreview(editData.logo || "");
    } else {
      setForm(emptyForm);
      setLogoPreview("");
    }
    setLogoFile(null);
  }, [editData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      Swal.fire("Error", "Name required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());

      LINK_FIELDS.forEach(({ key }) => {
        const value = (form as any)[key];
        if (value) fd.append(key, value);
      });

      if (logoFile) fd.append("logo", logoFile);

      if (editData?.id) {
        await apiClient.patch(`ecommerce/qrcards/${editData.id}/`, fd);
        Swal.fire("Success", "QR Card updated", "success");
      } else {
        await apiClient.post("ecommerce/qrcards/", fd);
        Swal.fire("Success", "QR Card generated", "success");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      Swal.fire(
        "Error",
        err?.response?.data?.detail || "something went wrong, try again",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-800">
              {editData ? "Edit QR " : "New QR"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <MdClose size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Logo upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="logo preview"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-sm text-gray-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name   "
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {editData?.slug && (
                <p className="text-xs text-gray-400 mt-1">
                  QR link: initcart.com/{editData.slug}
                </p>
              )}
            </div>

            {LINK_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                </label>
                <input
                  type="url"
                  name={f.key}
                  value={(form as any)[f.key] || ""}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Generating..." : editData ? "Update" : "Generate"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCardModal;