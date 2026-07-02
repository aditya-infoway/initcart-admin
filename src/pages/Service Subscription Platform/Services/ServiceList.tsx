import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import { FiFilter, FiEye, FiCheck, FiX, FiRefreshCw, FiStar, FiHome } from "react-icons/fi";

interface Property {
  id: number;
  property_id: string;
  title: string;
  vendor_name: string;
  vendor_business_name: string;
  property_type: string;
  transaction_type: "sale" | "rent" | "lease";
  city: string;
  state: string;
  price: string;
  total_area_size: string;
  bedrooms: number;
  bathrooms: string;
  status: "draft" | "pending" | "approved" | "rejected" | "sold_rented" | "expired";
  created_at: string;
  is_featured: boolean;
  views_count: number;
  enquiry_count: number;
}

const PropertyApprovalList = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    propertyType: "all",
    transactionType: "all",
    search: ""
  });

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch properties from API
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access') || localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/services/real-estate/admin/properties/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        console.error("Failed to fetch properties:", response.status);
        Swal.fire({
          title: "Error!",
          text: "Failed to load properties. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      Swal.fire({
        title: "Network Error!",
        text: "Cannot connect to server. Please check your connection.",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter properties based on filters
  const filteredProperties = properties.filter(property => {
    if (filters.status !== "all" && property.status !== filters.status) return false;
    if (filters.propertyType !== "all" && property.property_type !== filters.propertyType) return false;
    if (filters.transactionType !== "all" && property.transaction_type !== filters.transactionType) return false;
    if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !property.city.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = async (property: Property) => {
    Swal.fire({
      title: "Approve Property?",
      text: `Are you sure you want to approve "${property.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('access') || localStorage.getItem('access_token');
          
          const response = await fetch(
            `${API_BASE_URL}/services/real-estate/admin/properties/${property.id}/approve/`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                status: 'approved',
                admin_notes: 'Property approved by admin'
              })
            }
          );

          if (response.ok) {
            // Update local state
            setProperties(prev => prev.map(p => 
              p.id === property.id ? { ...p, status: 'approved' } : p
            ));
            
            Swal.fire({
              title: "Approved!",
              text: `"${property.title}" has been approved and published.`,
              icon: "success",
              confirmButtonText: "OK"
            });
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to approve property");
          }
        } catch (error: any) {
          Swal.fire({
            title: "Error!",
            text: error.message || "Failed to approve property",
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      }
    });
  };

const handleReject = async (property: Property) => {
  const { value: reason } = await Swal.fire({
    title: "Reject Property",
    input: "textarea",
    inputLabel: "Rejection Reason (Optional)",
    inputPlaceholder: "Enter reason for rejection... (max 500 characters)",
    showCancelButton: true,
    confirmButtonColor: "#EF4444",
    cancelButtonColor: "#6B7280",
    confirmButtonText: "Yes, reject it!",
    cancelButtonText: "Cancel",
    inputValidator: (value: string) => {
      if (value && value.length > 500) {
        return "Reason must be less than 500 characters";
      }
      return null;
    }
  });

    if (reason !== undefined) {
      try {
        const token = localStorage.getItem('access') || localStorage.getItem('access_token');
        const rejectionReason = reason || "Property rejected by admin";
        
        const response = await fetch(
          `${API_BASE_URL}/services/real-estate/admin/properties/${property.id}/reject/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'rejected',
              admin_notes: rejectionReason
            })
          }
        );

        if (response.ok) {
          // Update local state
          setProperties(prev => prev.map(p => 
            p.id === property.id ? { ...p, status: 'rejected' } : p
          ));
          
          Swal.fire({
            title: "Rejected!",
            text: `"${property.title}" has been rejected.`,
            icon: "success",
            confirmButtonText: "OK"
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to reject property");
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.message || "Failed to reject property",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const handleMarkFeatured = async (property: Property) => {
    const action = property.is_featured ? "remove from featured" : "mark as featured";
    
    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)}?`,
      text: `Are you sure you want to ${action} "${property.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B5CF6",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('access') || localStorage.getItem('access_token');
          
          const response = await fetch(
            `${API_BASE_URL}/services/real-estate/admin/properties/${property.id}/mark_featured/`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                is_featured: !property.is_featured
              })
            }
          );

          if (response.ok) {
            // Update local state
            setProperties(prev => prev.map(p => 
              p.id === property.id ? { ...p, is_featured: !property.is_featured } : p
            ));
            
            Swal.fire({
              title: "Success!",
              text: `Property ${action} successfully.`,
              icon: "success",
              confirmButtonText: "OK"
            });
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update property");
          }
        } catch (error: any) {
          Swal.fire({
            title: "Error!",
            text: error.message || "Failed to update property",
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      }
    });
  };

  const handleView = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  const handleRefresh = () => {
    fetchProperties();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sold_rented': return 'bg-purple-100 text-purple-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'draft': return 'Draft';
      case 'sold_rented': return 'Sold/Rented';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Apartment';
      case 'house': return 'House';
      case 'villa': return 'Villa';
      case 'commercial': return 'Commercial';
      case 'pg_coliving': return 'PG/Co-living';
      case 'plots': return 'Plots';
      default: return type;
    }
  };

  // Custom table columns
  const columns = [
    {
      key: "action",
      label: "Actions",
      render: (property: Property) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(property)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          
          {property.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(property)}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                title="Approve Property"
              >
                <FiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(property)}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                title="Reject Property"
              >
                <FiX className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => handleMarkFeatured(property)}
            className={`p-2 rounded-lg ${property.is_featured 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
            title={property.is_featured ? "Remove from Featured" : "Mark as Featured"}
          >
            <FiStar className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    { 
      key: "property_id", 
      label: "Property ID",
      render: (property: Property) => (
        <span className="font-mono text-sm text-gray-600">
          {property.property_id}
        </span>
      )
    },
    { 
      key: "title", 
      label: "Title",
      render: (property: Property) => (
        <div>
          <div className="font-medium text-gray-800">{property.title}</div>
          <div className="text-sm text-gray-500">
            {getPropertyTypeLabel(property.property_type)} • {getTransactionLabel(property.transaction_type)}
          </div>
        </div>
      )
    },
    { 
      key: "vendor_name", 
      label: "Vendor",
      render: (property: Property) => (
        <div>
          <div className="font-medium text-gray-800">{property.vendor_name}</div>
          <div className="text-sm text-gray-500">{property.vendor_business_name}</div>
        </div>
      )
    },
    { 
      key: "location", 
      label: "Location",
      render: (property: Property) => (
        <div>
          <div className="font-medium text-gray-800">{property.city}</div>
          <div className="text-sm text-gray-500">{property.state}</div>
        </div>
      )
    },
    { 
      key: "specifications", 
      label: "Specifications",
      render: (property: Property) => (
        <div>
          <div className="font-medium text-gray-800">
            {property.bedrooms} BHK • {property.total_area_size} sqft
          </div>
          <div className="text-sm text-gray-500">₹{parseInt(property.price).toLocaleString()}</div>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status",
      render: (property: Property) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
          {getStatusLabel(property.status)}
        </span>
      )
    },
    { 
      key: "stats", 
      label: "Stats",
      render: (property: Property) => (
        <div className="text-sm text-gray-600">
          <div>👁️ {property.views_count} views</div>
          <div>📞 {property.enquiry_count} enquiries</div>
        </div>
      )
    },
    { 
      key: "created_at", 
      label: "Submitted On",
      render: (property: Property) => (
        <div className="text-sm text-gray-600">
          {new Date(property.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Property Approval Dashboard
            </h1>
            <p className="text-gray-600">
              Manage and approve property listings from vendors
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
                <option value="sold_rented">Sold/Rented</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="pg_coliving">PG/Co-living</option>
                <option value="plots">Plots</option>
              </select>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={filters.transactionType}
                onChange={(e) => setFilters({...filters, transactionType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by title or city..."
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold text-gray-800">{properties.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <FiHome className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {properties.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <FiRefreshCw className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.status === 'approved').length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {properties.filter(p => p.status === 'rejected').length}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <FiX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            title="Properties List"
            data={filteredProperties}
            columns={columns}
            emptyMessage="No properties found"
            customActions={[
              {
                label: "Refresh",
                onClick: handleRefresh,
                className: "bg-blue-600 text-white hover:bg-blue-700"
              }
            ]}
            onRefresh={handleRefresh}
            showExport={true}
            exportFileName="property_list"
          />
        )}
      </div>
    </div>
  );
};

export default PropertyApprovalList;