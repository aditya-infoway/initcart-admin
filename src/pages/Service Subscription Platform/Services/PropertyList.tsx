// src/pages/Service Subscription Platform/Services/PropertyList.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFilter,
  FiEye,
  FiEdit,
  FiCheck,
  FiX,
  FiStar,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiUser,
  FiAlertCircle,
  FiFileText,
  FiMessageSquare,
  FiTrendingUp,
  FiMapPin
} from "react-icons/fi";
import { MdApartment, MdHouse, MdVilla, MdBusiness } from "react-icons/md";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";

interface Property {
  id: number;
  property_id: string;
  title: string;
  vendor_details: {
    id: number;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
  };
  property_type: string;
  transaction_type: string;
  city: string;
  state: string;
  price: string;
  total_area_size: string;
  bedrooms: number;
  bathrooms: string;
  status: string;
  created_at: string;
  is_featured: boolean;
  is_premium: boolean;
  views_count: number;
  enquiry_count: number;
  short_description?: string;
  furnishing_status: string;
  construction_status: string;
  property_age: string;
  address?: string;
  landmark?: string;
  price_per_sqft?: string;
  main_image?: string | null;
  thumbnail_image?: string | null;
}

interface Subcategory {
  id: string;
  subcategory_name: string;
  parent_service: string;
  status: string;
}

interface Stats {
  total_properties: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  draft: number;
  recent_approvals?: any[];
  top_vendors?: any[];
  property_types?: { property_type: string; count: number }[];
  transaction_types?: { transaction_type: string; count: number }[];
}

const AdminPropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    propertyType: "all",
    transactionType: "all",
    search: "",
  });
  const [stats, setStats] = useState<Stats>({
    total_properties: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    draft: 0
  });

  const fetchSubcategories = async () => {
  try {
    const response = await apiClient.get("/services/service-subcategories/active_by_service/?service=Real-Estate");
    if (response.data) {
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setSubcategories(data);
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
  }
};

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      Swal.fire({
        title: "Session Expired",
        text: "Please login again to continue.",
        icon: "warning",
        confirmButtonText: "Login"
      }).then(() => {
        window.location.href = "/login";
      });
      return;
    }

    fetchProperties();
    fetchStats();
    fetchSubcategories();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/services/real-estate/admin/properties/");
      
      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          setProperties(response.data);
        } else if (response.data.results) {
          setProperties(response.data.results);
        } else if (response.data.data) {
          setProperties(response.data.data);
        } else {
          setProperties([]);
        }
      } else {
        setProperties([]);
      }
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      
      if (error.response?.status === 401) {
        Swal.fire({
          title: "Session Expired!",
          text: "Please login again to continue.",
          icon: "warning",
          confirmButtonText: "Login"
        }).then(() => {
          window.location.href = "/login";
        });
      } else if (error.response?.status === 403) {
        Swal.fire({
          title: "Access Denied",
          text: "You don't have permission to view properties.",
          icon: "error",
          confirmButtonText: "OK"
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to load properties. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await apiClient.get("/services/real-estate/admin/properties/stats/");
      setStats(response.data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      // Don't show error for stats - it's okay if it fails
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewDetails = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  const handleQuickApprove = async (property: Property) => {
    if (property.status !== 'pending') return;

    const { isConfirmed } = await Swal.fire({
      title: "Approve Property?",
      html: `<p>Approve "<strong>${property.title}</strong>" by <strong>${property.vendor_details.business_name}</strong>?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await apiClient.post(
            `/services/real-estate/admin/properties/${property.id}/approve/`,
            {
              status: 'approved',
              admin_notes: 'Quick approved by admin'
            }
          );
          return response.data;
        } catch (error) {
          Swal.showValidationMessage('Failed to approve property');
          return null;
        }
      }
    });

    if (isConfirmed) {
      Swal.fire({
        title: "Approved!",
        text: "Property has been approved and published.",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => {
        fetchProperties();
        fetchStats();
      });
    }
  };

  const handleQuickReject = async (property: Property) => {
    if (property.status !== 'pending') return;

    const { value: reason } = await Swal.fire({
      title: "Reject Property",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter the reason for rejecting this property...",
      inputAttributes: {
        rows: 4
      },
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Please provide a reason for rejection";
        }
        return null;
      }
    } as any);

    if (reason) {
      try {
        await apiClient.post(
          `/services/real-estate/admin/properties/${property.id}/reject/`,
          {
            status: 'rejected',
            admin_notes: reason
          }
        );

        Swal.fire({
          title: "Rejected!",
          text: "Property has been rejected.",
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
          fetchProperties();
          fetchStats();
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to reject property.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const handleExportProperties = async () => {
    try {
      Swal.fire({
        title: 'Exporting Properties...',
        text: 'Please wait while we generate the report.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await apiClient.get("/services/real-estate/admin/properties/export/", {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `properties-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        title: "Exported!",
        text: "Properties data has been exported successfully.",
        icon: "success",
        confirmButtonText: "OK"
      });
    } catch (error) {
      console.error("Error exporting properties:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to export properties.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleViewPending = () => {
    setFilters(prev => ({ ...prev, status: 'pending' }));
  };

const filteredProperties = properties.filter(property => {
  if (filters.status !== "all" && property.status !== filters.status) return false;
  
  // Compare property_type by ID
  if (filters.propertyType !== "all") {
    const propTypeId = typeof property.property_type === 'object' && property.property_type !== null
      ? (property.property_type as any).id
      : property.property_type;
    
    if (String(propTypeId) !== String(filters.propertyType)) return false;
  }
  
  if (filters.transactionType !== "all" && property.transaction_type !== filters.transactionType) return false;
  if (filters.search && 
      !property.title.toLowerCase().includes(filters.search.toLowerCase()) && 
      !property.city.toLowerCase().includes(filters.search.toLowerCase()) &&
      !property.vendor_details?.business_name?.toLowerCase().includes(filters.search.toLowerCase())) {
    return false;
  }
  return true;
});

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit";
    
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <FiCheck className="w-3 h-3" /> Approved
        </span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <FiAlertCircle className="w-3 h-3" /> Pending
        </span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <FiX className="w-3 h-3" /> Rejected
        </span>;
      case 'draft':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <FiFileText className="w-3 h-3" /> Draft
        </span>;
      case 'sold_rented':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
          Sold/Rented
        </span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {status}
        </span>;
    }
  };

const getPropertyTypeDisplay = (type: any): string => {
  if (!type) return 'Unknown';
  
  const typeStr = String(type);
  
  // Look for matching subcategory by ID
  const matchingSub = subcategories.find(
    (sub) => String(sub.id) === typeStr
  );
  
  if (matchingSub) {
    return matchingSub.subcategory_name;
  }
  
  // Fallback to hardcoded types
  const typeMap: Record<string, string> = {
    'apartment': 'Apartment',
    'house': 'House',
    'villa': 'Villa',
    'commercial': 'Commercial',
    'pg_coliving': 'PG/Co-living',
    'plots': 'Plots'
  };
  
  return typeMap[typeStr] || typeStr; 
};

// Updated icon function
const getPropertyTypeIcon = (type: any) => {
  const typeStr = String(type).toLowerCase();
  
  if (typeStr.includes('apartment')) return <MdApartment className="w-4 h-4" />;
  if (typeStr.includes('house') || typeStr.includes('villa')) return <MdHouse className="w-4 h-4" />;
  if (typeStr.includes('commercial') || typeStr.includes('office') || typeStr.includes('shop')) return <MdBusiness className="w-4 h-4" />;
  return <FiHome className="w-4 h-4" />;
};
  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Real Estate Properties</h1>
              <p className="text-gray-600">Manage and approve property listings from vendors</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleViewPending}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <FiFilter className="w-4 h-4" />
                Pending ({stats.pending_approval || 0})
              </button>
              <button
                onClick={handleExportProperties}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={fetchProperties}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                disabled={loading}
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Properties</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800">
                    {statsLoading ? '...' : stats.total_properties || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiHome className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pending Approval</p>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                    {statsLoading ? '...' : stats.pending_approval || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Approved</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">
                    {statsLoading ? '...' : stats.approved || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FiCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Rejected</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600">
                    {statsLoading ? '...' : stats.rejected || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <FiX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Featured</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-600">
                    {properties.filter(p => p.is_featured).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FiStar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Draft</option>
                  <option value="sold_rented">Sold/Rented</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
<select
  value={filters.propertyType}
  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
>
  <option value="all">All Types</option>
  {subcategories.map((sub) => (
    <option key={sub.id} value={sub.id}>
      {sub.subcategory_name}
    </option>
  ))}
</select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => setFilters({...filters, transactionType: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="all">All Transactions</option>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                  <option value="lease">Lease</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Search by title, city, or vendor..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Table Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Properties ({filteredProperties.length})
            </h2>
            <div className="text-sm text-gray-600">
              Showing {filteredProperties.length} of {properties.length} properties
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading properties...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the data</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price & Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr 
                      key={property.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
<td className="px-6 py-4">
  <div className="flex items-start">
    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200 overflow-hidden">
      {property.thumbnail_image ? (
        <img 
          src={property.thumbnail_image} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
      ) : (
        getPropertyTypeIcon(property.property_type)
      )}
    </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                              <span>{getPropertyTypeDisplay(property.property_type)} • {property.bedrooms} BHK</span>
                              <span className="flex items-center gap-1 text-xs">
                                <FiMapPin className="w-3 h-3" /> {property.city}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {property.property_id} • Added: {formatDate(property.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {property.vendor_details?.business_name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {property.vendor_details?.owner_name || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(property.price)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{property.total_area_size} sqft</span>
                            {property.price_per_sqft && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {formatCurrency(property.price_per_sqft)}/sqft
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getTransactionTypeDisplay(property.transaction_type)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {getStatusBadge(property.status)}
                            {property.is_featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                                <FiStar className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiEye className="w-3 h-3" /> {property.views_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiMessageSquare className="w-3 h-3" /> {property.enquiry_count}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(property)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" /> View
                          </button>
                          
                          {property.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleQuickApprove(property)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                                title="Quick Approve"
                              >
                                <FiCheck className="w-4 h-4" /> Approve
                              </button>
                              <button
                                onClick={() => handleQuickReject(property)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                                title="Quick Reject"
                              >
                                <FiX className="w-4 h-4" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <FiHome className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                No properties match your current filters. Try adjusting your search criteria or clear filters.
              </p>
              <button
                onClick={() => setFilters({
                  status: "all",
                  propertyType: "all",
                  transactionType: "all",
                  search: ""
                })}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {!loading && filteredProperties.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>Total {filteredProperties.length} properties found</p>
                <p className="text-xs text-gray-400 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Approved: {properties.filter(p => p.status === 'approved').length}</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending: {properties.filter(p => p.status === 'pending').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyList;