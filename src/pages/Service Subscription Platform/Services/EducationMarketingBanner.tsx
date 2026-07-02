// src/pages/admin/ads/EducationAdsManager.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "../../../api/apiClient";
import Swal from "sweetalert2";

type AdData = { image: File | null; preview: string | null; title: string; url: string; };
const emptyAd: AdData = { image: null, preview: null, title: "", url: "" };

const EducationAdsManager: React.FC = () => {
  const [mode, setMode] = useState<"big" | "small">("big");
  const [bigAd, setBigAd] = useState<AdData>(emptyAd);
  const [smallAds, setSmallAds] = useState<AdData[]>([{ ...emptyAd }, { ...emptyAd }]);

  useEffect(() => { loadBigAd(); loadSmallAds(); }, []);

  const loadBigAd = async () => { try { const res = await apiClient.get("education-big-ad/"); if (res.data) setBigAd({ image: null, preview: res.data.image, title: res.data.title, url: res.data.url }); } catch {} };
  const loadSmallAds = async () => { try { const res = await apiClient.get("education-small-ad/"); const arr = [{ ...emptyAd }, { ...emptyAd }]; res.data.forEach((ad: any) => { arr[ad.slot - 1] = { image: null, preview: ad.image, title: ad.title, url: ad.url }; }); setSmallAds(arr); } catch {} };

  const handleImage = (file: File, type: "big" | "small", index?: number) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      const minWidth = type === "big" ? 1920 : 900;
      const minHeight = type === "big" ? 500 : 350;
      if (img.width < minWidth || img.height < minHeight) {
        Swal.fire({ icon: "error", title: "Image too small", text: `Minimum size is ${minWidth} x ${minHeight}px` });
        if (type === "big") setBigAd(prev => ({ ...prev, image: null, preview: null }));
        else if (index !== undefined) setSmallAds(prev => { const copy = [...prev]; copy[index] = { ...copy[index], image: null, preview: null }; return copy; });
        URL.revokeObjectURL(objectUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = minWidth;
      canvas.height = minHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, minWidth, minHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: file.type });
            if (type === "big") setBigAd(prev => ({ ...prev, image: resizedFile, preview: URL.createObjectURL(resizedFile) }));
            else if (index !== undefined) setSmallAds(prev => { const copy = [...prev]; copy[index] = { ...copy[index], image: resizedFile, preview: URL.createObjectURL(resizedFile) }; return copy; });
          }
          URL.revokeObjectURL(objectUrl);
        }, file.type);
      }
    };
  };

  const handleBigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bigAd.title || !bigAd.url) { Swal.fire({ icon: "warning", title: "Missing Fields" }); return; }
    const fd = new FormData();
    if (bigAd.image) fd.append("image", bigAd.image);
    fd.append("title", bigAd.title);
    fd.append("url", bigAd.url);
    await apiClient.post("education-big-ad/", fd);
    Swal.fire({ icon: "success", title: "Saved", timer: 1500, showConfirmButton: false });
    loadBigAd();
  };

  const handleSmallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < smallAds.length; i++) {
      const ad = smallAds[i];
      if (!ad.title || !ad.url) { Swal.fire({ icon: "warning", title: `Missing fields for slot ${i + 1}` }); return; }
      const fd = new FormData();
      if (ad.image) fd.append("image", ad.image);
      fd.append("title", ad.title);
      fd.append("url", ad.url);
      fd.append("slot", String(i + 1));
      await apiClient.post("education-small-ad/", fd);
    }
    Swal.fire({ icon: "success", title: "Saved", timer: 1500, showConfirmButton: false });
    loadSmallAds();
  };

  const inputStyle = "w-full border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-3 rounded-xl outline-none transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
        <div className="text-center"><h1 className="text-4xl font-bold">Education Ads Manager</h1><p className="text-slate-500">Manage homepage banners for Education Services</p></div>
        <div className="bg-white rounded-2xl p-3 grid grid-cols-2 gap-3">
          <button onClick={() => setMode("big")} className={`py-3 rounded-xl font-medium ${mode === "big" ? "bg-purple-600 text-white" : "bg-slate-100"}`}>Big Ad</button>
          <button onClick={() => setMode("small")} className={`py-3 rounded-xl font-medium ${mode === "small" ? "bg-green-600 text-white" : "bg-slate-100"}`}>Small Ads</button>
        </div>
        {mode === "big" && (
          <form onSubmit={handleBigSubmit} className="bg-white rounded-2xl p-8 space-y-5">
            <h2 className="text-xl font-semibold">Big Banner Ad</h2>
            <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImage(e.target.files[0], "big")} className={inputStyle} />
            {bigAd.preview && <img src={bigAd.preview} className="w-full h-56 object-cover rounded-xl" />}
            <input type="text" placeholder="Title" value={bigAd.title} onChange={(e) => setBigAd({ ...bigAd, title: e.target.value })} className={inputStyle} />
            <input type="text" placeholder="URL" value={bigAd.url} onChange={(e) => setBigAd({ ...bigAd, url: e.target.value })} className={inputStyle} />
            <button className="w-full bg-purple-600 text-white py-3 rounded-xl">Save Big Ad</button>
          </form>
        )}
        {mode === "small" && (
          <form onSubmit={handleSmallSubmit} className="bg-white rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-semibold">Small Ads (2 Slots)</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {smallAds.map((ad, i) => (
                <div key={i} className="border rounded-2xl p-4 space-y-3">
                  <p className="font-medium">Slot {i + 1}</p>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImage(e.target.files[0], "small", i)} className={inputStyle} />
                  {ad.preview && <img src={ad.preview} className="w-full h-32 object-cover rounded-xl" />}
                  <input type="text" placeholder="Title" value={ad.title} onChange={(e) => { const copy = [...smallAds]; copy[i].title = e.target.value; setSmallAds(copy); }} className={inputStyle} />
                  <input type="text" placeholder="URL" value={ad.url} onChange={(e) => { const copy = [...smallAds]; copy[i].url = e.target.value; setSmallAds(copy); }} className={inputStyle} />
                </div>
              ))}
            </div>
            <button className="w-full bg-green-600 text-white py-3 rounded-xl">Save Small Ads</button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EducationAdsManager;