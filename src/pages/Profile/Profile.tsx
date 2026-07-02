import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import {
  FaUserTie,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";



/* ================= TYPES ================= */

interface SuperAdmin {
  adminId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string;
  joinDate: string;

  totalProductVendor: string;
  totalServiceVendor: string;
  totalLoginUsers: string;

  youtube: string;
  instagram: string;
  twitter: string;
  facebook: string;
  whatsapp: string;
  _file?: File;
}

/* ================= COMPONENT ================= */

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  /* ---------- STATE ---------- */

  const [admin, setAdmin] = useState<SuperAdmin>({
    adminId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
    joinDate: "",

    totalProductVendor: "0",
    totalServiceVendor: "0",
    totalLoginUsers: "0",

    youtube: "",
    instagram: "",
    twitter: "",
    facebook: "",
    whatsapp: "",
  });

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setAdmin((prev) => ({
      ...prev,
      profileImage: URL.createObjectURL(file),
      _file: file, // temp store
    }));
  };

  /* ---------- INPUT CHANGE ---------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- LOAD DASHBOARD STATS ---------- */

  useEffect(() => {
    apiClient.get("banners/dashboard-stats/").then((res) => {
      setAdmin((prev) => ({
        ...prev,
        totalProductVendor: String(res.data.totalProductVendor || 0),
        totalServiceVendor: String(res.data.totalServiceVendor || 0),
        totalLoginUsers: String(res.data.totalLoginUsers || 0),
      }));
    });
  }, []);

  /* ---------- LOAD PROFILE DATA ---------- */

  useEffect(() => {
    apiClient.get("banners/admin-profile/").then((res) => {
      if (!res.data) return;
      setAdmin((prev) => ({
        ...prev,
        ...res.data,
      }));
    });
  }, []);

  const loadProfile = () => {
    apiClient.get("banners/admin-profile/").then((res) => {
      if (res.data) {
        setAdmin(prev => ({
          ...prev,
          ...res.data,
          profileImage: res.data.profile_image,
        }));
      }
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);


  /* ---------- SAVE PROFILE ---------- */

  const saveProfile = async () => {
    const fd = new FormData();

    // Only append fields that backend expects, excluding 'profileImage' and '_file'
    const fields = [
      "name", "email", "phone", "address",
      "youtube", "instagram", "twitter", "facebook", "whatsapp"
    ];

    fields.forEach((field) => {
      fd.append(field, (admin as any)[field] || "");
    });

    // Append the file if user uploaded a new one
    if (admin._file) {
      fd.append("profile_image", admin._file);
    }

    try {
      await apiClient.post("banners/admin-profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully",
        confirmButtonColor: "#2563eb",
      });
    } catch {
      await apiClient.put("banners/admin-profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully",
        confirmButtonColor: "#2563eb",
      });
    }
  };



  /* ================= UI ================= */

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-700 text-white rounded-xl shadow-lg p-8 flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 mb-4">

          {/* circle image wrapper */}
          <div className="w-full h-full rounded-full border-4 border-blue-200 shadow-lg overflow-hidden bg-white">
            <img
              src={
                admin.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              className="w-full h-full object-cover"
            />
          </div>

          {admin.profileImage && (
            <label className="
      absolute bottom-0.5 right-0
      bg-blue-600 text-white
      p-2 rounded-full
      cursor-pointer shadow
    ">
              <FaPlus size={15} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
            </label>
          )}
          {!admin.profileImage && (
            <label className="
      absolute inset-0 flex items-center justify-center
      rounded-full cursor-pointer hover:bg-black/40
    ">
              <FaPlus className="text-white text-3xl" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
            </label>
          )}

        </div>



        <h2 className="text-3xl font-bold">{admin.name || "Super Admin"}</h2>

        <p className="mt-3 text-blue-200 text-sm">
          <FaCalendarAlt className="inline mr-2" />
          Joined: {admin.joinDate || "-"}
        </p>
      </div>

      {/* STATS */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Product Vendors" value={admin.totalProductVendor} />
        <StatCard title="Total Service Vendors" value={admin.totalServiceVendor} />
        <StatCard title="Total Login Costumer" value={admin.totalLoginUsers} />
      </div>

      {/* FORM SECTIONS */}
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ADMIN INFO */}
        <InfoSection title="Admin Information" icon={<FaUserTie />}>
          <InputInfo label="Name" name="name" value={admin.name} onChange={handleChange} />
          <InputInfo label="Number" name="phone" value={admin.phone} onChange={handleChange} />
          <InputInfo label="Gmail" name="email" value={admin.email} onChange={handleChange} />
          <InputInfo label="Address" name="address" value={admin.address} onChange={handleChange} />
        </InfoSection>

        {/* SOCIAL */}
        <InfoSection title="Social Links" icon={<FaUsers />}>
          <InputInfo label="YouTube" name="youtube" value={admin.youtube} onChange={handleChange} />
          <InputInfo label="Instagram" name="instagram" value={admin.instagram} onChange={handleChange} />
          <InputInfo label="Twitter" name="twitter" value={admin.twitter} onChange={handleChange} />
          <InputInfo label="Facebook" name="facebook" value={admin.facebook} onChange={handleChange} />
          <InputInfo label="WhatsApp" name="whatsapp" value={admin.whatsapp} onChange={handleChange} />
        </InfoSection>

        {/* ACTIONS */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-wrap gap-4">
          <button
            onClick={saveProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
          >
            Save Profile
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/superadmin/login");
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;

/* ================= SMALL COMPONENTS ================= */

const StatCard = ({ title, value }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg">
    <p className="text-sm uppercase text-blue-600 font-semibold">{title}</p>
    <p className="text-2xl font-bold mt-2 text-gray-800">{value}</p>
  </div>
);

const InfoSection = ({ title, icon, children }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h3 className="text-2xl font-semibold mb-6 border-b pb-2 text-gray-800">
      <span className="text-blue-600 inline mr-2">{icon}</span>
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const InputInfo = ({ label, name, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);
