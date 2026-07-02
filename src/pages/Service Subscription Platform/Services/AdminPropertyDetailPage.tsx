// src/pages/Service Subscription Platform/Services/AdminPropertyDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiMapPin,
  FiDollarSign,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCheck,
  FiX,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiEye,
  FiDownload,
  FiChevronRight,
  FiStar,
  FiUsers,
  FiMessageSquare,
  FiExternalLink,
  FiAlertCircle,
  FiFileText,
  FiGrid,
  FiLayers,
  FiNavigation,
  FiClock,
  FiLock,
  FiCreditCard,
  FiShield
} from "react-icons/fi";
import { 
  MdApartment, 
  MdHouse, 
  MdVilla, 
  MdBusinessCenter,
  MdMeetingRoom,
  MdBathtub,
  MdBalcony,
  MdTerrain,
  MdDirections
} from "react-icons/md";
import Swal from "sweetalert2";
import apiClient from "../../../api/apiClient";

interface PropertyDetail {
  id: number;
  property_id: string;
  title: string;
  description: string;
  transaction_type: string;
  property_type: string | { id: string | number; subcategory_name?: string; label?: string } | number;
  address: string;
  google_map_url: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  
  // Specifications
  total_area_size: string;
  carpet_area: string;
  built_up_area: string;
  bedrooms: number;
  bathrooms: string;
  balconies: number;
  furnishing_status: string;
  floor_number: number;
  total_floors: number;
  facing_direction: string;
  property_age: string;
  construction_status: string;
  
  // Legal & Ownership
  ownership_type: string;
  encumbrance_certificate: string;
  rea_number: string;
  rera_number: string;
  rera_registered: boolean;
  loan_availability: boolean;
  documents_available: string;
  negotiable: boolean;
  
  // Price
  price: string;
  maintenance_charges: string;
  booking_amount: string;
  security_deposit: string;
  price_per_sqft: string;
  
  // Contact
  contact_type: string;
  contact_name: string;
  contact_mobile: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_preferred_time: string;
  use_vendor_info: boolean;
  
  // Status
  status: string;
  is_featured: boolean;
  is_verified: boolean;
  is_premium: boolean;
  views_count: number;
  enquiry_count: number;
  
  // Dates
  created_at: string;
  updated_at: string;
  published_at: string;
  approved_at: string;
  approved_by: number;
  
  // Slug field
  slug: string;
  
  // Images
  images: Array<{
    id: number;
    image_url: string;
    image_type: string;
    alt_text: string;
    display_order: number;
  }>;
  
  // JSON Fields
  amenities: string[] | string;
  nearby_facilities: Record<string, string> | string;
  
  // Documents
  documents: string;
  
  // Vendor
  vendor: number;
  vendor_details: {
    id: number;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    vendor_type: string;
    vendor_subtype: string;
    status: string;
    created_at: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

interface Enquiry {
  id: number;
  name: string;
  email: string;
  mobile: string;
  enquiry_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminPropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'vendor' | 'enquiries' | 'admin'>('overview');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [vendorDetails, setVendorDetails] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchEnquiries();
      fetchSubcategories();
    }
  }, [id]);

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

  useEffect(() => {
    if (activeTab === 'vendor' && property?.vendor) {
      fetchVendorDetails();
    }
  }, [activeTab, property]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
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

      const response = await apiClient.get(`/services/real-estate/admin/properties/${id}/`);
      setProperty(response.data);
      
    } catch (error: any) {
      console.error("Error fetching property:", error);
      
      if (error.response?.status === 401) {
        Swal.fire({
          title: "Session Expired!",
          text: "Please login again to continue.",
          icon: "warning",
          confirmButtonText: "Login"
        }).then(() => {
          window.location.href = "/login";
        });
      } else if (error.response?.status === 404) {
        Swal.fire({
          title: "Not Found",
          text: "Property not found.",
          icon: "error",
          confirmButtonText: "OK"
        }).then(() => {
          navigate('/admin/real-estate/properties');
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to load property details.",
          icon: "error",
          confirmButtonText: "OK"
        }).then(() => {
          navigate('/admin/real-estate/properties');
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await apiClient.get(`/services/real-estate/admin/properties/${id}/enquiries_list/`);
      setEnquiries(response.data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      // Silently fail for enquiries
    }
  };

  const fetchVendorDetails = async () => {
    try {
      const response = await apiClient.get(`/services/real-estate/admin/properties/${id}/vendor_details/`);
      setVendorDetails(response.data);
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      // Silently fail for vendor details
    }
  };

  const handleApprove = async () => {
    const { value: adminNotes } = await Swal.fire({
      title: 'Approve Property?',
      html: `
        <p>Are you sure you want to approve <strong>${property?.title}</strong>?</p>
        <p class="text-green-600 text-sm mt-2">Once approved, it will be visible on the website.</p>
        <textarea 
          id="approval-notes" 
          class="swal2-textarea mt-3" 
          placeholder="Add approval notes (optional)..."
          rows="3"
        ></textarea>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve!',
      cancelButtonText: 'Cancel',
      width: 500,
      preConfirm: () => {
        const notes = (document.getElementById('approval-notes') as HTMLTextAreaElement).value;
        return { notes };
      }
    });

    if (adminNotes) {
      try {
        const notes = adminNotes.notes || '';

        const response = await apiClient.post(
          `/services/real-estate/admin/properties/${id}/approve/`,
          {
            status: 'approved',
            admin_notes: notes
          }
        );

        Swal.fire({
          title: "Approved!",
          text: "Property has been approved and published.",
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
          fetchProperty(); // Refresh data
        });
      } catch (error: any) {
        console.error("Error approving property:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.error || "Unable to approve property.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const handleReject = async () => {
    const { value: rejectData } = await Swal.fire({
      title: 'Reject Property?',
      html: `
        <p>Are you sure you want to reject <strong>${property?.title}</strong>?</p>
        <p class="text-red-600 text-sm mt-2">This property will not be published.</p>
        <textarea 
          id="reject-reason" 
          class="swal2-textarea mt-3" 
          placeholder="Reason for rejection (required)..."
          rows="3"
          required
        ></textarea>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reject!',
      cancelButtonText: 'Cancel',
      width: 500,
      preConfirm: () => {
        const reason = (document.getElementById('reject-reason') as HTMLTextAreaElement).value;
        if (!reason) {
          Swal.showValidationMessage('Please provide a reason for rejection');
          return false;
        }
        return { reason };
      }
    });

    if (rejectData) {
      try {
        const rejectReason = rejectData.reason;

        const response = await apiClient.post(
          `/services/real-estate/admin/properties/${id}/reject/`,
          {
            status: 'rejected',
            admin_notes: rejectReason
          }
        );

        Swal.fire({
          title: "Rejected!",
          text: "Property has been rejected.",
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
          fetchProperty(); // Refresh data
        });
      } catch (error: any) {
        console.error("Error rejecting property:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.error || "Unable to reject property.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const handleMarkFeatured = async (featured: boolean) => {
    const result = await Swal.fire({
      title: `${featured ? 'Mark as Featured?' : 'Remove from Featured?'}`,
      text: `Are you sure you want to ${featured ? 'mark this property as featured' : 'remove this property from featured'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: featured ? '#f59e0b' : '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: featured ? 'Mark Featured' : 'Remove Featured',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.post(
          `/services/real-estate/admin/properties/${id}/mark_featured/`,
          {
            is_featured: featured
          }
        );

        Swal.fire({
          title: "Success!",
          text: `Property ${featured ? 'marked as featured' : 'removed from featured'}.`,
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
          fetchProperty();
        });
      } catch (error: any) {
        console.error("Error updating featured status:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.error || "Unable to update featured status.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const handleViewWebsite = () => {
    if (property?.slug && property?.status === 'approved') {
      const websiteUrl = `http://localhost:3000/properties/${property.slug}`;
      window.open(websiteUrl, '_blank');
    } else {
      Swal.fire({
        title: "Not Available",
        text: "This property is not published yet.",
        icon: "info",
        confirmButtonText: "OK"
      });
    }
  };


  const handleExportEnquiries = async () => {
    try {
      Swal.fire({
        title: 'Exporting Enquiries...',
        text: 'Please wait while we generate the report.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await apiClient.get(`/services/real-estate/admin/properties/${id}/export_enquiries/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `enquiries-${property?.property_id || id}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        title: "Exported!",
        text: "Enquiries data has been exported successfully.",
        icon: "success",
        confirmButtonText: "OK"
      });
    } catch (error) {
      console.error("Error exporting enquiries:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to export enquiries.",
        icon: "error",
        confirmButtonText: "OK"
      });
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
          <FiCheck className="w-3 h-3" /> Approved
        </span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
          <FiAlertCircle className="w-3 h-3" /> Pending
        </span>;
      case 'draft':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Draft</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full flex items-center gap-1">
          <FiX className="w-3 h-3" /> Rejected
        </span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{status}</span>;
    }
  };

const getPropertyTypeIcon = (type: any) => {
  const typeStr = String(type).toLowerCase();
  
  // Check subcategory name
  const matchingSub = subcategories.find(
    (sub) => String(sub.id) === String(type)
  );  
  
  if (matchingSub) {
    const name = matchingSub.subcategory_name.toLowerCase();
    if (name.includes('apartment')) return <MdApartment className="w-5 h-5" />;
    if (name.includes('villa')) return <MdVilla className="w-5 h-5" />;
    if (name.includes('house')) return <MdHouse className="w-5 h-5" />;
    if (name.includes('commercial') || name.includes('office') || name.includes('shop')) return <MdBusinessCenter className="w-5 h-5" />;
  }
  
  // Fallback
  switch (typeStr) {
    case 'apartment': return <MdApartment className="w-5 h-5" />;
    case 'house': return <MdHouse className="w-5 h-5" />;
    case 'villa': return <MdVilla className="w-5 h-5" />;
    case 'commercial': return <MdBusinessCenter className="w-5 h-5" />;
    default: return <FiHome className="w-5 h-5" />;
  }
};

const getPropertyTypeDisplay = (type: any): string => {
  if (!type) return 'Unknown';
  
  // If type is an object (ForeignKey serialized as object)
  if (typeof type === 'object' && type !== null) {
    return type.subcategory_name || type.label || String(type.id || 'Unknown');
  }
  
  const typeStr = String(type);
  
  // Look for matching subcategory by ID
  const matchingSub = subcategories.find(
    (sub) => String(sub.id) === typeStr
  );
  
  if (matchingSub) {
    return matchingSub.subcategory_name;
  }
  
  // Fallback to hardcoded types
  switch (typeStr.toLowerCase()) {
    case 'apartment': return 'Apartment';
    case 'house': return 'House';
    case 'villa': return 'Villa';
    case 'commercial': return 'Commercial';
    case 'pg_coliving': return 'PG/Co-living';
    case 'plots': return 'Plots';
    default: return typeStr.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  }
};

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseAmenities = (amenities: string[] | string): string[] => {
    try {
      if (Array.isArray(amenities)) {
        return amenities;
      } else if (typeof amenities === 'string') {
        return JSON.parse(amenities);
      }
    } catch (e) {
      console.error("Error parsing amenities:", e);
    }
    return [];
  };

  const parseNearbyFacilities = (facilities: Record<string, string> | string): Record<string, string> => {
    try {
      if (typeof facilities === 'object' && facilities !== null) {
        return facilities;
      } else if (typeof facilities === 'string') {
        return JSON.parse(facilities);
      }
    } catch (e) {
      console.error("Error parsing nearby facilities:", e);
    }
    return {};
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading property details...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the property information</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <FiHome className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Property Not Found</h3>
            <p className="text-gray-500 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Back to Properties List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = property.images?.find(img => img.image_type === 'main')?.image_url;
  const amenities = parseAmenities(property.amenities);
  const nearbyFacilities = parseNearbyFacilities(property.nearby_facilities);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Properties List
          </button>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{property.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(property.status)}
                  {property.is_featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
                      <FiStar className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {property.is_premium && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-1">
                      <FiStar className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>{property.city}, {property.state}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">ID: {property.property_id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {getPropertyTypeIcon(property.property_type)}
                    {getPropertyTypeDisplay(property.property_type)}
                  </span>
                  <span>•</span>
                  <span>{getTransactionTypeDisplay(property.transaction_type)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Admin Actions */}
              {property.status === 'pending' && (
                <>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    <FiCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              
              <button
                onClick={() => handleMarkFeatured(!property.is_featured)}
                className={`flex items-center gap-2 px-4 py-2 ${property.is_featured 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg text-sm font-medium transition-colors`}
              >
                <FiStar className="w-4 h-4" />
                {property.is_featured ? 'Remove Featured' : 'Mark Featured'}
              </button>
              <button
                onClick={handleViewWebsite}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                disabled={property.status !== 'approved'}
              >
                <FiExternalLink className="w-4 h-4" />
                View on Website
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Price</div>
              <div className="text-xl font-bold text-gray-800">{formatCurrency(property.price)}</div>
              {property.price_per_sqft && (
                <div className="text-xs text-gray-400 mt-1">
                  {formatCurrency(property.price_per_sqft)}/sqft
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Area</div>
              <div className="text-xl font-bold text-gray-800">{property.total_area_size} sqft</div>
              <div className="text-xs text-gray-400 mt-1">Carpet: {property.carpet_area} sqft</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Bed & Bath</div>
              <div className="text-xl font-bold text-gray-800">{property.bedrooms} BHK</div>
              <div className="text-xs text-gray-400 mt-1">{property.bathrooms} Bathrooms</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Engagement</div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xl font-bold text-gray-800">{property.views_count}</div>
                  <div className="text-xs text-gray-400">Views</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">{property.enquiry_count}</div>
                  <div className="text-xs text-gray-400">Enquiries</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Created</div>
              <div className="text-sm font-medium text-gray-800">
                {new Date(property.created_at).toLocaleDateString('en-IN')}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                By: {property.vendor_details?.business_name || 'Vendor'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto bg-white rounded-t-lg">
          {[
            { id: 'overview', label: 'Overview', icon: <FiEye /> },
            { id: 'specs', label: 'Specifications', icon: <FiGrid /> },
            { id: 'vendor', label: 'Vendor', icon: <FiUser /> },
            { id: 'enquiries', label: 'Enquiries', icon: <FiMessageSquare />, count: enquiries.length },
            { id: 'admin', label: 'Admin', icon: <FiShield /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap relative border-b-2 ${activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 border-transparent'
                }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Images */}
                <div className="lg:col-span-2">
                  {property.images && property.images.length > 0 ? (
                    <div className="space-y-4">
                      {/* Main Image */}
                      {mainImage && (
                        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
                          <img
                            src={mainImage}
                            alt="Main property image"
                            className="w-full h-full object-cover"
                            onClick={() => openImageModal(mainImage)}
                          />
                          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                            Main Image
                          </div>
                        </div>
                      )}
                      
                      {/* Thumbnail Images */}
                      {property.images.filter(img => img.image_type !== 'main').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Gallery</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {property.images
                              .filter(img => img.image_type !== 'main')
                              .slice(0, 8)
                              .map((image) => (
                                <div key={image.id} className="relative">
                                  <img
                                    src={image.image_url}
                                    alt={image.alt_text || 'Property image'}
                                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => openImageModal(image.image_url)}
                                  />
                                </div>
                              ))}
                          </div>
                          {property.images.length > 9 && (
                            <p className="text-sm text-gray-500 mt-2">
                              +{property.images.length - 9} more images
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg h-64 md:h-80 flex items-center justify-center">
                      <FiHome className="w-16 h-16 text-gray-400" />
                      <p className="text-gray-500 ml-4">No images available</p>
                    </div>
                  )}
                  
                  {/* Description */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FiMapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700 font-medium">{property.address}</p>
                          <p className="text-gray-600 mt-1">
                            {property.city}, {property.state} - {property.pincode}
                          </p>
                          {property.google_map_url && (
                            <a
                              href={property.google_map_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                            >
                              <FiExternalLink className="w-4 h-4" />
                              View on Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Quick Info */}
                <div className="space-y-6">
                  {/* Quick Info Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Property ID</span>
                        <span className="font-medium">{property.property_id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Listed On</span>
                        <span className="font-medium">{formatDate(property.created_at)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">{formatDate(property.updated_at)}</span>
                      </div>
                      {property.published_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Published On</span>
                          <span className="font-medium">{formatDate(property.published_at)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Vendor</span>
                        <span className="font-medium">{property.vendor_details?.business_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FiUser className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Contact Person</div>
                          <div className="font-medium">{property.contact_name || property.vendor_details?.owner_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiPhone className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="font-medium">{property.contact_mobile || property.vendor_details?.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiMail className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="font-medium">{property.contact_email || property.vendor_details?.email}</div>
                        </div>
                      </div>
                      {property.contact_preferred_time && (
                        <div className="flex items-center gap-3">
                          <FiClock className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">Preferred Time</div>
                            <div className="font-medium">{property.contact_preferred_time}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Amenities Preview */}
                  {amenities.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Amenities</h3>
                      <div className="space-y-2">
                        {amenities.slice(0, 5).map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FiCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                        {amenities.length > 5 && (
                          <p className="text-sm text-gray-500 mt-2">
                            +{amenities.length - 5} more amenities
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Property Specifications */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiHome className="w-5 h-5" /> Basic Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Property Type</span>
                        <span className="font-medium">{getPropertyTypeDisplay(property.property_type)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transaction Type</span>
                        <span className="font-medium">{getTransactionTypeDisplay(property.transaction_type)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Furnishing</span>
                        <span className="font-medium">{property.furnishing_status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Construction Status</span>
                        <span className="font-medium">{property.construction_status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MdTerrain className="w-5 h-5" /> Area Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Area</span>
                        <span className="font-medium">{property.total_area_size} sqft</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Carpet Area</span>
                        <span className="font-medium">{property.carpet_area} sqft</span>
                      </div>
                      {property.built_up_area && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Built-up Area</span>
                          <span className="font-medium">{property.built_up_area} sqft</span>
                        </div>
                      )}
                      {property.price_per_sqft && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Price per sqft</span>
                          <span className="font-medium">{formatCurrency(property.price_per_sqft)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Room Specifications */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MdMeetingRoom className="w-5 h-5" /> Room Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <MdMeetingRoom className="w-4 h-4" /> Bedrooms
                        </span>
                        <span className="font-medium">{property.bedrooms}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <MdBathtub className="w-4 h-4" /> Bathrooms
                        </span>
                        <span className="font-medium">{property.bathrooms}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <MdBalcony className="w-4 h-4" /> Balconies
                        </span>
                        <span className="font-medium">{property.balconies}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiLayers className="w-5 h-5" /> Floor Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Floor Number</span>
                        <span className="font-medium">{property.floor_number}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Floors</span>
                        <span className="font-medium">{property.total_floors}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <MdDirections className="w-4 h-4" /> Facing
                        </span>
                        <span className="font-medium">{property.facing_direction}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Property Age</span>
                        <span className="font-medium">{property.property_age}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legal & Price */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5" /> Price Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Price</span>
                        <span className="font-medium text-lg text-green-600">{formatCurrency(property.price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Maintenance</span>
                        <span className="font-medium">{formatCurrency(property.maintenance_charges)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Booking Amount</span>
                        <span className="font-medium">{formatCurrency(property.booking_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Security Deposit</span>
                        <span className="font-medium">{formatCurrency(property.security_deposit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Negotiable</span>
                        <span className={`font-medium ${property.negotiable ? 'text-green-600' : 'text-red-600'}`}>
                          {property.negotiable ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiLock className="w-5 h-5" /> Legal Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ownership Type</span>
                        <span className="font-medium">{property.ownership_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">RERA Registered</span>
                        <span className={`font-medium ${property.rera_registered ? 'text-green-600' : 'text-red-600'}`}>
                          {property.rera_registered ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Loan Available</span>
                        <span className={`font-medium ${property.loan_availability ? 'text-green-600' : 'text-red-600'}`}>
                          {property.loan_availability ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Documents</span>
                        <span className="font-medium">{property.documents_available}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Amenities Section */}
              {amenities.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">All Amenities</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FiCheck className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Nearby Facilities */}
              {Object.keys(nearbyFacilities).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Facilities</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(nearbyFacilities).map(([facility, distance]) => (
                        <div key={facility} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium text-gray-700">{facility}</span>
                          <span className="text-green-600 font-medium">{distance} km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vendor' && (
            <div className="p-6">
              {vendorDetails ? (
                <div className="space-y-6">
                  {/* Vendor Profile Card */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-2xl font-bold">
                            {vendorDetails.business_name?.charAt(0) || 'V'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{vendorDetails.business_name}</h3>
                          <p className="opacity-90">Real Estate Vendor</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-opacity-20 rounded-full text-sm">
                              {vendorDetails.vendor_type || 'Service Vendor'}
                            </span>
                            <span className="px-3 py-1 bg-opacity-20 rounded-full text-sm">
                              {vendorDetails.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90">Vendor ID</p>
                        <p className="text-lg font-bold">#{vendorDetails.id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <FiUser className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-500">Owner Name</div>
                            <div className="font-medium">{vendorDetails.owner_name}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FiPhone className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-500">Phone Number</div>
                            <div className="font-medium">{vendorDetails.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FiMail className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-500">Email Address</div>
                            <div className="font-medium">{vendorDetails.email}</div>
                          </div>
                        </div>
                        {vendorDetails.address && (
                          <div className="flex items-start gap-3">
                            <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <div className="text-sm text-gray-500">Address</div>
                              <div className="font-medium">{vendorDetails.address}</div>
                              {vendorDetails.city && vendorDetails.state && (
                                <div className="text-sm text-gray-500">
                                  {vendorDetails.city}, {vendorDetails.state} - {vendorDetails.pincode}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Vendor Stats */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Statistics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vendor Since</span>
                          <span className="font-medium">
                            {formatDate(vendorDetails.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vendor Type</span>
                          <span className="font-medium capitalize">
                            {vendorDetails.vendor_type || 'Service Vendor'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vendor Subtype</span>
                          <span className="font-medium capitalize">
                            {vendorDetails.vendor_subtype || 'Real Estate'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium ${vendorDetails.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {vendorDetails.status || 'Active'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Properties Listed</span>
                          <span className="font-medium">1 (this property)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes Section */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">Contact Information Used</h3>
                    <div className="text-yellow-700">
                      {property.use_vendor_info ? (
                        <p className="mb-2">This property uses the vendor's contact information for enquiries:</p>
                      ) : (
                        <p className="mb-2">This property uses custom contact information provided by the vendor:</p>
                      )}
                      {property.contact_name && (
                        <p><span className="font-medium">Contact Person:</span> {property.contact_name}</p>
                      )}
                      {property.contact_mobile && property.use_vendor_info && (
                        <p><span className="font-medium">Phone:</span> {property.contact_mobile}</p>
                      )}
                      {property.contact_email && property.use_vendor_info && (
                        <p><span className="font-medium">Email:</span> {property.contact_email}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Vendor Details</h3>
                  <p className="text-gray-500">Please wait while we fetch vendor information...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'enquiries' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Property Enquiries ({enquiries.length})</h3>
                {enquiries.length > 0 && (
                  <button
                    onClick={handleExportEnquiries}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    Export Enquiries
                  </button>
                )}
              </div>

              {enquiries.length > 0 ? (
                <div className="space-y-4">
                  {enquiries.map((enquiry) => (
                    <div key={enquiry.id} className={`border rounded-lg p-5 ${enquiry.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{enquiry.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <FiMail className="w-4 h-4" /> {enquiry.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FiPhone className="w-4 h-4" /> {enquiry.mobile}
                                </span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full ${enquiry.is_read 
                              ? 'bg-gray-100 text-gray-700' 
                              : 'bg-blue-100 text-blue-700'}`}>
                              {enquiry.is_read ? 'Read' : 'New'}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 mt-3">
                            <p className="text-gray-700">{enquiry.message}</p>
                          </div>
                        </div>
                        <div className="md:text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {formatDate(enquiry.created_at)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {enquiry.enquiry_type.replace('_', ' ')}
                            </span>
                            <button
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                              onClick={() => {/* Mark as read */}}
                            >
                              Mark Read
                            </button>
                            <button
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                              onClick={() => {/* Reply */}}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Enquiries Yet</h4>
                  <p className="text-gray-500">This property hasn't received any enquiries yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Management */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Current Status</span>
                      {getStatusBadge(property.status)}
                    </div>
                    
                    {property.status === 'approved' && property.published_at && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-800 font-medium mb-1">Published</div>
                        <div className="text-xs text-green-600">
                          Published on: {formatDate(property.published_at)}
                        </div>
                      </div>
                    )}
                    
                    {property.status === 'approved' && (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleMarkFeatured(!property.is_featured)}
                          className={`w-full ${property.is_featured 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-purple-600 hover:bg-purple-700'} text-white py-2.5 rounded-lg font-medium transition-colors`}
                        >
                          {property.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                        </button>

                      </div>
                    )}
                    
                    {(property.status === 'draft' || property.status === 'rejected') && (
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: 'Move to Pending?',
                            text: 'This will move the property back to pending approval.',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#f59e0b',
                            cancelButtonColor: '#6b7280',
                            confirmButtonText: 'Move to Pending',
                            cancelButtonText: 'Cancel'
                          });
                        }}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                      >
                        Move to Pending
                      </button>
                    )}
                  </div>
                </div>

                {/* Approval History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Approval History</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium">{formatDate(property.created_at)}</span>
                    </div>
                    
                    {property.published_at && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Published</span>
                        <span className="font-medium">{formatDate(property.published_at)}</span>
                      </div>
                    )}
                    
                    {property.approved_at && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Approved</span>
                        <span className="font-medium">{formatDate(property.approved_at)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">{formatDate(property.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <FiX className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Property"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyDetailPage;