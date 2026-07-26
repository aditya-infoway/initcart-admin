// superadminpanel/profile/index.tsx
import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import {
  FaUserTie,
  FaUsers,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

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
  brochure_pdf: string;
  brochure_pdf_url: string;
  _file?: File;
  _brochure_file?: File;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

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
    brochure_pdf: "",
    brochure_pdf_url: "",
  });

  const [credData, setCredData] = useState({
    current_password: "",
    new_email: "",
    new_password: "",
    confirm_password: "",
  });

  const [savingCreds, setSavingCreds] = useState(false);

  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const togglePwd = (key: "current" | "next" | "confirm") =>
    setShowPwd((p) => ({ ...p, [key]: !p[key] }));

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setAdmin((prev) => ({
      ...prev,
      profileImage: URL.createObjectURL(file),
      _file: file,
    }));
  };

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please upload PDF file only',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'PDF file size should be less than 10MB',
      });
      return;
    }

    setAdmin((prev) => ({
      ...prev,
      brochure_pdf: file.name,
      _brochure_file: file,
      brochure_pdf_url: URL.createObjectURL(file),
    }));
  };

  const handleRemoveBrochure = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will remove the current brochure",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setAdmin((prev) => ({
          ...prev,
          brochure_pdf: "",
          brochure_pdf_url: "",
          _brochure_file: undefined,
        }));
        Swal.fire('Removed!', 'Brochure has been removed.', 'success');
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({ ...prev, [name]: value }));
  };

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

  const loadProfile = () => {
    apiClient.get("banners/admin-profile/").then((res) => {
      if (res.data) {
        setAdmin(prev => ({
          ...prev,
          ...res.data,
          profileImage: res.data.profile_image,
          brochure_pdf_url: res.data.brochure_pdf_url || "",
        }));
      }
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    const fd = new FormData();

    const fields = [
      "name", "email", "phone", "address",
      "youtube", "instagram", "twitter", "facebook", "whatsapp"
    ];

    fields.forEach((field) => {
      fd.append(field, (admin as any)[field] || "");
    });

    if (admin._file) {
      fd.append("profile_image", admin._file);
    }

    if (admin._brochure_file) {
      fd.append("brochure_pdf", admin._brochure_file);
    } else if (admin.brochure_pdf === "" && admin._brochure_file === undefined) {
      fd.append("brochure_pdf", "");
    }

    try {
      const response = await apiClient.put("banners/admin-profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data?.message || "Profile updated successfully",
        confirmButtonColor: "#2563eb",
      });

      loadProfile();
    } catch (error: any) {
      console.error("Save error:", error);

      try {
        const response = await apiClient.post("banners/admin-profile/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.data?.message || "Profile created successfully",
          confirmButtonColor: "#2563eb",
        });

        loadProfile();
      } catch (postError: any) {
        console.error("Create error:", postError);

        if (postError.response?.data) {
          const errorData = postError.response.data;

          if (typeof errorData === 'object') {
            let errorMessage = '';

            Object.keys(errorData).forEach(key => {
              if (Array.isArray(errorData[key])) {
                errorMessage += `${key}: ${errorData[key].join(', ')}\n`;
              } else if (typeof errorData[key] === 'string') {
                errorMessage += `${errorData[key]}\n`;
              }
            });

            if (errorData.error === "Already exists") {
              errorMessage = "Profile already exists. Please try again or refresh the page.";
            }

            Swal.fire({
              icon: "error",
              title: "Error!",
              text: errorMessage || "Something went wrong",
              confirmButtonColor: "#d33",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: String(errorData),
              confirmButtonColor: "#d33",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Failed to save profile. Please try again.",
            confirmButtonColor: "#d33",
          });
        }
      }
    }
  };

  const saveLoginCredentials = async () => {
    if (!credData.current_password || credData.current_password.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Current Password Required",
        text: "Please enter your current password to update credentials.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    if (credData.new_password && credData.new_password !== credData.confirm_password) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Do Not Match",
        text: "New password and confirm password must match.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    if (credData.new_password && credData.new_password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "New password must be at least 6 characters long.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setSavingCreds(true);

    try {
      const response = await apiClient.patch("auth/superadmin/change-credentials/", {
        current_password: credData.current_password.trim(),
        new_email: credData.new_email?.trim() || undefined,
        new_password: credData.new_password?.trim() || undefined,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: response.data?.message || "Login credentials updated successfully",
        confirmButtonColor: "#2563eb",
      });

      setCredData({
        current_password: "",
        new_email: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPwd({ current: false, next: false, confirm: false });

      loadProfile();

    } catch (error: any) {
      console.error("Credential update error:", error);

      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = errorData.message || "Failed to update credentials";

        if (errorData.message?.toLowerCase().includes("current password")) {
          errorMessage = "Current password is incorrect. Please try again.";
        } else if (errorData.message?.toLowerCase().includes("email already in use")) {
          errorMessage = "This email is already registered. Please use a different email.";
        } else if (errorData.message?.toLowerCase().includes("at least 6 characters")) {
          errorMessage = "New password must be at least 6 characters long.";
        }

        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: errorMessage,
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Network error. Please try again.",
          confirmButtonColor: "#d33",
        });
      }
    } finally {
      setSavingCreds(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">

      <div className="bg-gradient-to-r from-blue-950 to-blue-700 text-white rounded-xl shadow-lg p-8 flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 mb-4">
          <div className="w-full h-full rounded-full border-4 border-blue-200 shadow-lg overflow-hidden bg-white">
            <img
              src={
                admin.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>

          {admin.profileImage && (
            <label className="absolute bottom-0.5 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow">
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
            <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer hover:bg-black/40">
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

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Product Vendors" value={admin.totalProductVendor} />
        <StatCard title="Total Service Vendors" value={admin.totalServiceVendor} />
        <StatCard title="Total Login Costumer" value={admin.totalLoginUsers} />
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        <InfoSection title="Admin Information" icon={<FaUserTie />}>
          <InputInfo label="Name" name="name" value={admin.name} onChange={handleChange} />
          <InputInfo label="Number" name="phone" value={admin.phone} onChange={handleChange} />
          <InputInfo label="Gmail" name="email" value={admin.email} onChange={handleChange} />
          <InputInfo label="Address" name="address" value={admin.address} onChange={handleChange} />
        </InfoSection>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold mb-6 border-b pb-2 text-gray-800">
            Company Brochure
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload your company brochure in PDF format. This will be available for download on your website footer.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <label className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 cursor-pointer transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Brochure (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleBrochureUpload}
                  className="hidden"
                />
              </label>

              {admin.brochure_pdf && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-md">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {admin.brochure_pdf}
                  </span>
                  <button
                    onClick={handleRemoveBrochure}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              )}
            </div>

            {admin.brochure_pdf_url && admin.brochure_pdf_url !== "" && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <a
                  href={admin.brochure_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Preview Uploaded Brochure
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold mb-2 border-b pb-2 text-gray-800">
            Superadmin Panel Login (Email & Password)
          </h3>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded">
            <p className="text-sm text-yellow-700">
              Current password is required to update email or password.
              If you enter an incorrect current password, the update will be rejected.
            </p>
          </div>

          {/*
            NOTE: This <form> has autoComplete="off" and each password/email
            field below also carries its own explicit autoComplete override.
            Chrome/Edge ignore a bare autoComplete="off" on password inputs in
            some cases, so we additionally use non-standard values
            ("new-password" / "one-time-code") and a name that doesn't match
            common patterns — this reliably stops the browser from
            auto-filling a previously saved password into "Current Password".
          */}
          <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd.current ? "text" : "password"}
                    name="sa_current_pwd_field"
                    autoComplete="off"
                    value={credData.current_password}
                    onChange={(e) => setCredData((p) => ({ ...p, current_password: e.target.value }))}
                    placeholder="Enter your current password"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-md p-3 pr-11 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePwd("current")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPwd.current ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Login Email (optional)</label>
                <input
                  type="email"
                  name="sa_new_email_field"
                  autoComplete="off"
                  value={credData.new_email}
                  onChange={(e) => setCredData((p) => ({ ...p, new_email: e.target.value }))}
                  placeholder="Enter new email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password (optional)</label>
                <div className="relative">
                  <input
                    type={showPwd.next ? "text" : "password"}
                    name="sa_new_pwd_field"
                    autoComplete="new-password"
                    value={credData.new_password}
                    onChange={(e) => setCredData((p) => ({ ...p, new_password: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 pr-11 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePwd("next")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPwd.next ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? "text" : "password"}
                    name="sa_confirm_pwd_field"
                    autoComplete="new-password"
                    value={credData.confirm_password}
                    onChange={(e) => setCredData((p) => ({ ...p, confirm_password: e.target.value }))}
                    placeholder="Confirm your new password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 pr-11 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePwd("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPwd.confirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

            </div>
          </form>

          <button
            onClick={saveLoginCredentials}
            disabled={savingCreds}
            className="mt-6 w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {savingCreds ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Update Superadmin Login
              </>
            )}
          </button>
        </div>

        <InfoSection title="Social Links" icon={<FaUsers />}>
          <InputInfo label="YouTube" name="youtube" value={admin.youtube} onChange={handleChange} />
          <InputInfo label="Instagram" name="instagram" value={admin.instagram} onChange={handleChange} />
          <InputInfo label="Twitter" name="twitter" value={admin.twitter} onChange={handleChange} />
          <InputInfo label="Facebook" name="facebook" value={admin.facebook} onChange={handleChange} />
          <InputInfo label="WhatsApp" name="whatsapp" value={admin.whatsapp} onChange={handleChange} />
        </InfoSection>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-wrap gap-4">
          <button
            onClick={saveProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Profile
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/superadmin/login");
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;

const StatCard = ({ title, value }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
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
      autoComplete="off"
      className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  </div>
);