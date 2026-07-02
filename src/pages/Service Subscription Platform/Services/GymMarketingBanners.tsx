import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "../../../api/apiClient";
import Swal from "sweetalert2";

// ================= TYPES =================

type AdData = {
  image: File | null;
  preview: string | null;
  title: string;
  url: string;
};

const emptyAd: AdData = {
  image: null,
  preview: null,
  title: "",
  url: "",
};

// ================= COMPONENT =================

const GymAdsManager: React.FC = () => {
  const [mode, setMode] = useState<"big" | "small">("big");

  const [bigAd, setBigAd] = useState<AdData>(emptyAd);
  const [smallAds, setSmallAds] = useState<AdData[]>([
    { ...emptyAd },
    { ...emptyAd },
  ]);

  // ================= LOAD FROM BACKEND =================

  useEffect(() => {
    loadBigAd();
    loadSmallAds();
  }, []);

  const loadBigAd = async () => {
    try {
      const res = await apiClient.get("gym-big-ad/");
      if (!res.data) return;

      setBigAd({
        image: null,
        preview: res.data.image,
        title: res.data.title,
        url: res.data.url,
      });
    } catch {}
  };

  const loadSmallAds = async () => {
    try {
      const res = await apiClient.get("gym-small-ad/");
      const arr = [{ ...emptyAd }, { ...emptyAd }];

      res.data.forEach((ad: any) => {
        const i = ad.slot - 1;
        arr[i] = {
          image: null,
          preview: ad.image,
          title: ad.title,
          url: ad.url,
        };
      });

      setSmallAds(arr);
    } catch {}
  };

  // ================= IMAGE HANDLER =================

 const handleImage = (
  file: File,
  type: "big" | "small",
  index?: number
) => {  
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.src = objectUrl;

  img.onload = () => {
    const minWidth = type === "big" ? 1920 : 900;
    const minHeight = type === "big" ? 500 : 350;

    const width = img.width;
    const height = img.height;

    // ---------------- Minimum Size Check ----------------
    if (width < minWidth || height < minHeight) {
      Swal.fire({
        icon: "error",
        title: "Image too small",
        text: `Minimum size is ${minWidth} x ${minHeight}px`,
      });

      if (type === "big") {
        setBigAd((prev) => ({ ...prev, image: null, preview: null }));
      } else if (index !== undefined) {
        setSmallAds((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], image: null, preview: null };
          return copy;
        });
      }

      URL.revokeObjectURL(objectUrl);
      return;
    }

    // ---------------- Resize if bigger than container ----------------
    if (width > minWidth || height > minHeight) {
      const canvas = document.createElement("canvas");
      canvas.width = minWidth;
      canvas.height = minHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, minWidth, minHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            if (type === "big") {
              setBigAd((prev) => ({
                ...prev,
                image: resizedFile,
                preview: URL.createObjectURL(resizedFile),
              }));
            } else if (index !== undefined) {
              setSmallAds((prev) => {
                const copy = [...prev];
                copy[index] = {
                  ...copy[index],
                  image: resizedFile,
                  preview: URL.createObjectURL(resizedFile),
                };
                return copy;
              });
            }
          }
          URL.revokeObjectURL(objectUrl);
        }, file.type);
      }
    } else {
      // ---------------- Perfect size ----------------
      if (type === "big") {
        setBigAd((prev) => ({ ...prev, image: file, preview: objectUrl }));
      } else if (index !== undefined) {
        setSmallAds((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], image: file, preview: objectUrl };
          return copy;
        });
      }
    }
  };

  img.onerror = () => {
    Swal.fire({
      icon: "error",
      title: "Invalid image",
      text: "Failed to load image",
    });

    if (type === "big") {
      setBigAd((prev) => ({ ...prev, image: null, preview: null }));
    } else if (index !== undefined) {
      setSmallAds((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], image: null, preview: null };
        return copy;
      });
    }

    URL.revokeObjectURL(objectUrl);
  };
};

  // ================= SAVE BIG =================

  const handleBigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bigAd.title || !bigAd.url) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all big ad fields",
      });
      return;
    }

    const fd = new FormData();
    if (bigAd.image) fd.append("image", bigAd.image);
    fd.append("title", bigAd.title);
    fd.append("url", bigAd.url);

    try {
      await apiClient.post("gym-big-ad/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Big Ad saved successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      loadBigAd();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save Big Ad",
      });
    }
  };

  // ================= SAVE SMALL =================

  const handleSmallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < smallAds.length; i++) {
      const ad = smallAds[i];

      if (!ad.title || !ad.url) {
        Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: `Please fill all fields for slot ${i + 1}`,
        });
        return;
      }

      const fd = new FormData();
      if (ad.image) fd.append("image", ad.image);
      fd.append("title", ad.title);
      fd.append("url", ad.url);
      fd.append("slot", String(i + 1));

      await apiClient.post("gym-small-ad/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    Swal.fire({
      icon: "success",
      title: "Saved",
      text: "Small Ads saved successfully",
      timer: 1500,
      showConfirmButton: false,
    });

    loadSmallAds();
  };

  // ================= COMMON INPUT STYLE =================

  const inputStyle =
    "w-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-xl outline-none transition";

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Gym Ads Manager</h1>
          <p className="text-slate-500">Manage homepage banner & small ads</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("big")}
            className={`py-3 rounded-xl font-medium transition ${
              mode === "big"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            Big Ad
          </button>

          <button
            onClick={() => setMode("small")}
            className={`py-3 rounded-xl font-medium transition ${
              mode === "small"
                ? "bg-green-600 text-white shadow"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            Small Ads
          </button>
        </div>

        {/* BIG AD */}
        {mode === "big" && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleBigSubmit}
            className="bg-white rounded-2xl shadow-sm p-8 space-y-5"
          >
            <h2 className="text-xl font-semibold">Big Banner Ad</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleImage(e.target.files[0], "big")
                }
                className={inputStyle}
              />
            </div>

            {bigAd.preview && (
              <img
                src={bigAd.preview}
                className="w-full h-56 object-cover rounded-xl border"
              />
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Title</label>
              <input
                type="text"
                value={bigAd.title}
                onChange={(e) =>
                  setBigAd({ ...bigAd, title: e.target.value })
                }
                className={inputStyle}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Url</label>
              <input
                type="text"
                value={bigAd.url}
                onChange={(e) => setBigAd({ ...bigAd, url: e.target.value })}
                className={inputStyle}
              />
            </div>
            <span className="text-sm text-black font-semibold mt-2">Note : Upload image size must be 1920 × 500 pixels </span>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium shadow transition">
              Save Big Ad
            </button>
          </motion.form>
        )}

        {/* SMALL ADS */}
        {mode === "small" && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSmallSubmit}
            className="bg-white rounded-2xl shadow-sm p-8 space-y-6"
          >
            <h2 className="text-xl font-semibold">Small Ads (2 Slots)</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {smallAds.map((ad, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50"
                >
                  <p className="font-medium">Ad Slot {i + 1}</p>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files &&
                        handleImage(e.target.files[0], "small", i)
                      }
                      className={inputStyle}
                    />
                  </div>

                  {ad.preview && (
                    <img
                      src={ad.preview}
                      className="w-full h-32 object-cover rounded-xl border"
                    />
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Title
                    </label>
                    <input
                      type="text"
                      value={ad.title}
                      onChange={(e) => {
                        const copy = [...smallAds];
                        copy[i].title = e.target.value;
                        setSmallAds(copy);
                      }}
                      className={inputStyle}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Url
                    </label>
                    <input
                      type="text"
                      value={ad.url}
                      onChange={(e) => {
                        const copy = [...smallAds];
                        copy[i].url = e.target.value;
                        setSmallAds(copy);
                      }}
                      className={inputStyle}
                    />
                  </div>
                </div>
              ))}
            </div>
            <span className="text-sm text-black font-semibold mt-2">Note : Upload image size must be 900 × 350 pixels</span>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium shadow transition">
              Save Small Ads
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default GymAdsManager;
