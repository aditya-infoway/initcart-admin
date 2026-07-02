import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface Service {
  id: string;
  vendor: string;
  category: string;
  subcategory: string;
  serviceName: string;
  description: string;
  city: string;
  address: string;
  priceRange: string;
  subscriptionPlan: "Premium" | "Basic" | "Free Trial";
  subscriptionValidity: string;
  renewalStatus: string;
  status: "Active" | "Inactive" | "Pending" | "Blocked";
  approvedBy: string;
}

const ServiceDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service>({
    id: id || "SRV-001",
    vendor: "FitPro Gym",
    category: "Gym",
    subcategory: "Personal Training",
    serviceName: "Strength Training",
    description: "Comprehensive strength training program",
    city: "Mumbai",
    address: "Bandra West, Mumbai",
    priceRange: "₹2000 - ₹5000",
    subscriptionPlan: "Premium",
    subscriptionValidity: "2025-10-15 to 2026-10-15",
    renewalStatus: "Auto-renew",
    status: "Active",
    approvedBy: "Admin1",
  });

  const handleApprove = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Approve "${service.serviceName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setService({ ...service, status: "Active", approvedBy: "Admin" });
        Swal.fire("Approved!", `"${service.serviceName}" has been approved.`, "success");
      }
    });
  };

  const handleReject = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Reject "${service.serviceName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setService({ ...service, status: "Inactive", approvedBy: "" });
        Swal.fire("Rejected!", `"${service.serviceName}" has been rejected.`, "success");
      }
    });
  };

  const handleBlock = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Block "${service.serviceName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, block it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setService({ ...service, status: "Blocked" });
        Swal.fire("Blocked!", `"${service.serviceName}" has been blocked.`, "success");
      }
    });
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Service Details: {service.serviceName}</h2>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Basic Info */}
        <h3 className="text-xl font-semibold mb-4">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold text-gray-700">Service Name</label>
            <p>{service.serviceName}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Vendor</label>
            <p>{service.vendor}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Category</label>
            <p>{service.category}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Subcategory</label>
            <p>{service.subcategory}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">City</label>
            <p>{service.city}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Address</label>
            <p>{service.address}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Price Range</label>
            <p>{service.priceRange}</p>
          </div>
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700">Description</label>
            <p>{service.description}</p>
          </div>
        </div>

        {/* Gallery */}
        <h3 className="text-xl font-semibold mb-4">Gallery</h3>
        <div className="mb-6">
          <p className="text-gray-600">No images/videos available.</p>
          {/* Placeholder for gallery; implement with file preview if needed */}
        </div>

        {/* Offers */}
        <h3 className="text-xl font-semibold mb-4">Offers</h3>
        <div className="mb-6">
          <p className="text-gray-600">No offers available.</p>
          {/* Placeholder for discounts/deals */}
        </div>

        {/* Ratings & Reviews */}
        <h3 className="text-xl font-semibold mb-4">Ratings & Reviews</h3>
        <div className="mb-6">
          <p className="text-gray-600">No reviews available.</p>
          {/* Placeholder for user feedback */}
        </div>

        {/* Subscription Details */}
        <h3 className="text-xl font-semibold mb-4">Subscription Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold text-gray-700">Plan Type</label>
            <p>{service.subscriptionPlan}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Validity</label>
            <p>{service.subscriptionValidity}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700">Renewal Status</label>
            <p>{service.renewalStatus}</p>
          </div>
        </div>

        {/* Actions */}
        <h3 className="text-xl font-semibold mb-4">Actions</h3>
        <div className="flex gap-2">
          {service.status !== "Active" && (
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Approve
            </button>
          )}
          {service.status !== "Inactive" && (
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          )}
          {service.status !== "Blocked" && (
            <button
              onClick={handleBlock}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Block
            </button>
          )}
          <button
            onClick={() => navigate("/service-list")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailView;