import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../api/axiosInstance';
import DataTable from '../../../components/common/DataTable';
import { FaTag, FaCalendarAlt, FaUsers, FaBox, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

interface Campaign {
  id: number;
  campaign_name: string;
  campaign_type: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
  max_products_per_vendor: number;
  minimum_product_limit: number;
  status: 'Draft' | 'Active' | 'Inactive' | 'Expired';
  categories_details?: { id: number; name: string }[];
  vendor_count?: number;
  approved_products_count?: number;
  selected_vendors?: number[];
}

interface VendorParticipation {
  id: number;
  vendor_details: {
    id: number;
    business_name: string;
    email: string;
    phone: string;
  };
  applied_at: string;
  product_count: number;
  approved_products_count: number;
  pending_products_count: number;
}

interface CampaignProduct {
  id: number;
  product_details: {
    id: number;
    product_name: string;
    main_image?: string;
    category?: { name: string };
  };
  vendor_details?: {
    id: number;
    business_name: string;
  };
  original_price: number;
  final_price: number;
  special_price: number | null;
  discount_percentage: number | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejection_reason: string | null;
  added_at: string;
}

const FeaturedCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showVendorParticipations, setShowVendorParticipations] = useState(false);
  const [selectedParticipation, setSelectedParticipation] = useState<VendorParticipation | null>(null);
  const [showVendorProducts, setShowVendorProducts] = useState(false);
  
  const [participations, setParticipations] = useState<VendorParticipation[]>([]);
  const [vendorProducts, setVendorProducts] = useState<CampaignProduct[]>([]);
  const [loadingParticipations, setLoadingParticipations] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      const params: any = { campaign_type: 'Featured' };
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await axiosInstance.get('ecommerce/admin/campaigns/', { params });
      
      const now = new Date();
      const activeCampaigns = response.data.filter((campaign: Campaign) => {
        const endDate = new Date(campaign.end_datetime);
        return endDate >= now || campaign.status !== 'Expired';
      });
      
      setCampaigns(activeCampaigns);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      Swal.fire('Error', 'Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignParticipations = async (campaignId: number) => {
    try {
      setLoadingParticipations(true);
      
      const response = await axiosInstance.get('ecommerce/admin/campaign-participations/', {
        params: { campaign_id: campaignId }
      });
      
      setParticipations(response.data);
    } catch (error: any) {
      console.error('Error fetching participations:', error);
      Swal.fire('Error', 'Failed to load vendor participations', 'error');
    } finally {
      setLoadingParticipations(false);
    }
  };

  const fetchVendorProducts = async (participationId: number) => {
    try {
      setLoadingProducts(true);
      
      const response = await axiosInstance.get(`ecommerce/admin/participation-products/${participationId}/`);
      
      const processedProducts = response.data.map((product: any) => ({
        ...product,
        original_price: parseFloat(product.original_price || 0),
        final_price: parseFloat(product.final_price || 0),
        product_details: product.product_details || {
          id: 0,
          product_name: 'Unknown Product',
          main_image: '',
          category: { name: 'No Category' }
        },
        vendor_details: product.vendor_details || selectedParticipation?.vendor_details,
      }));
      
      setVendorProducts(processedProducts);
    } catch (error: any) {
      console.error('Error fetching vendor products:', error);
      Swal.fire('Error', `Failed to load vendor products: ${error.message}`, 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    fetchCampaignParticipations(campaign.id);
    setShowVendorParticipations(true);
  };

  const handleViewVendorProducts = async (participation: VendorParticipation) => {
    setSelectedParticipation(participation);
    await fetchVendorProducts(participation.id);
    setShowVendorProducts(true);
  };

  const handleApproveProduct = async (productId: number) => {
    try {
      await axiosInstance.post(`ecommerce/admin/approve-product/${productId}/`);
      
      Swal.fire({
        title: 'Approved!',
        text: 'Product has been approved.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      if (selectedParticipation) {
        setTimeout(() => {
          fetchVendorProducts(selectedParticipation.id);
        }, 500);
      }
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to approve product', 'error');
    }
  };

  const handleRejectProduct = async (productId: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Product',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Please provide a reason';
        return null;
      }
    });
    
    if (reason) {
      try {
        await axiosInstance.post(`ecommerce/admin/reject-product/${productId}/`, { 
          rejection_reason: reason 
        });
        
        Swal.fire({
          title: 'Rejected!',
          text: 'Product has been rejected.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        if (selectedParticipation) {
          setTimeout(() => {
            fetchVendorProducts(selectedParticipation.id);
          }, 500);
        }
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to reject product', 'error');
      }
    }
  };

  const handleApproveAllPendingProducts = async () => {
    if (!selectedParticipation) return;
    
    const pendingProducts = vendorProducts.filter(p => p.status === 'Pending');
    if (pendingProducts.length === 0) {
      Swal.fire('Info', 'No pending products to approve', 'info');
      return;
    }
    
    const result = await Swal.fire({
      title: 'Approve All Pending Products?',
      text: `This will approve ${pendingProducts.length} pending products.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve All',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        const productIds = pendingProducts.map(p => p.id);
        const response = await axiosInstance.post(`ecommerce/admin/approve-products-bulk/${selectedParticipation.id}/`, {
          product_ids: productIds
        });
        
        Swal.fire({
          title: 'Success!',
          text: `${response.data.approved_count} products approved successfully`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          fetchVendorProducts(selectedParticipation.id);
        }, 500);
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to approve products', 'error');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Draft': 'bg-blue-100 text-blue-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Expired': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const getCampaignTypeBadge = (type: string) => {
    return (
      <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-semibold">
        {type}
      </span>
    );
  };

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const now = new Date();
      const endDate = new Date(campaign.end_datetime);
      const isExpired = endDate < now || campaign.status === 'Expired';
      return !isExpired;
    })
    .filter(campaign => 
      campaign.campaign_name.toLowerCase().includes(search.toLowerCase()) ||
      campaign.campaign_type.toLowerCase().includes(search.toLowerCase())
    );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    if (isNaN(price)) return '₹0.00';
    return `₹${price.toFixed(2)}`;
  };

  // Campaign columns
  const campaignColumns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'campaign_name', 
      label: 'Campaign Name',
      render: (item: Campaign) => (
        <div className="font-medium">{item.campaign_name}</div>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (item: Campaign) => getCampaignTypeBadge(item.campaign_type)
    },
    { 
      key: 'duration', 
      label: 'Duration',
      render: (item: Campaign) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="text-gray-400 text-xs" />
            {formatDate(item.start_datetime)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <FaCalendarAlt className="text-gray-400 text-xs" />
            {formatDate(item.end_datetime)}
          </div>
        </div>
      )
    },
    { 
      key: 'vendors', 
      label: 'Vendors',
      render: (item: Campaign) => (
        <div className="flex items-center gap-1">
          <FaUsers className="text-gray-400" />
          {item.vendor_count || 0} / {item.selected_vendors?.length || 0}
        </div>
      )
    },
    { 
      key: 'products', 
      label: 'Approved',
      render: (item: Campaign) => (
        <div className="flex items-center gap-1">
          <FaBox className="text-gray-400" />
          {item.approved_products_count || 0}
        </div>
      )
    },
    { 
      key: 'requirements', 
      label: 'Requirements',
      render: (item: Campaign) => (
        <div className="text-xs">
          <div>Min Products: {item.minimum_product_limit}</div>
          <div>Max Products: {item.max_products_per_vendor}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: Campaign) => getStatusBadge(item.status)
    },
  ];

  // Participations columns
  const participationColumns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'vendor', 
      label: 'Vendor',
      render: (item: VendorParticipation) => (
        <div>
          <div className="font-medium">{item.vendor_details.business_name}</div>
          <div className="text-xs text-gray-500">{item.vendor_details.email}</div>
        </div>
      )
    },
    { 
      key: 'products', 
      label: 'Products',
      render: (item: VendorParticipation) => (
        <div className="space-y-1">
          <div className="text-sm">Total: {item.product_count}</div>
          <div className="flex gap-2 text-xs">
            <span className="text-green-600">✓ {item.approved_products_count}</span>
            <span className="text-yellow-600">⏳ {item.pending_products_count}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'applied_date', 
      label: 'Applied',
      render: (item: VendorParticipation) => formatDate(item.applied_at)
    },
  ];

  // Products columns
  const productColumns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'product', 
      label: 'Product',
      render: (item: CampaignProduct) => (
        <div className="flex items-center gap-2">
          {item.product_details?.main_image ? (
            <img 
              src={item.product_details.main_image} 
              alt={item.product_details.product_name}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <FaBox className="text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium">{item.product_details?.product_name}</div>
            <div className="text-xs text-gray-500">{item.product_details?.category?.name}</div>
            {item.vendor_details && (
              <div className="text-xs text-gray-400">{item.vendor_details.business_name}</div>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'pricing', 
      label: 'Price',
      render: (item: CampaignProduct) => (
        <div>
          <div className="text-sm font-bold text-green-600">{formatPrice(item.final_price)}</div>
          {item.discount_percentage && (
            <div className="text-xs text-gray-500">{item.discount_percentage}% off</div>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: CampaignProduct) => getStatusBadge(item.status)
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Featured Campaigns</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
          </select>
          
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Campaigns DataTable */}
      <DataTable
        data={filteredCampaigns}
        columns={campaignColumns}
        loading={loading}
        title="Featured Campaigns"
        customActions={[
          {
            label:"View",
            onClick: (item: Campaign) => handleViewCampaign(item),
            className: 'p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          }
        ]}
        emptyMessage="No Featured campaigns found"
      />

      {/* Vendor Participations Popup */}
      {showVendorParticipations && selectedCampaign && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowVendorParticipations(false)}
          />
          
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Vendor Participations - {selectedCampaign.campaign_name}
                  </h2>
                  <p className="text-gray-600">Total: {participations.length} participations</p>
                </div>
                <button
                  onClick={() => setShowVendorParticipations(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <DataTable
                data={participations}
                columns={participationColumns}
                loading={loadingParticipations}
                customActions={[
                  {
                    label: 'Manage Products',
                    onClick: (item: VendorParticipation) => handleViewVendorProducts(item),
                    className: 'px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700'
                  }
                ]}
                emptyMessage="No vendor participations found"
              />

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVendorParticipations(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Products Popup */}
      {showVendorProducts && selectedParticipation && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowVendorProducts(false)}
          />
          
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Products - {selectedParticipation.vendor_details.business_name}
                  </h2>
                  <p className="text-gray-600">Total: {vendorProducts.length} products</p>
                </div>
                <button
                  onClick={() => setShowVendorProducts(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-800 font-bold text-xl">
                    {vendorProducts.filter(p => p.status === 'Approved').length}
                  </div>
                  <div className="text-green-600 text-sm">Approved Products</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-yellow-800 font-bold text-xl">
                    {vendorProducts.filter(p => p.status === 'Pending').length}
                  </div>
                  <div className="text-yellow-600 text-sm">Pending Approval</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-800 font-bold text-xl">
                    {vendorProducts.filter(p => p.status === 'Rejected').length}
                  </div>
                  <div className="text-red-600 text-sm">Rejected Products</div>
                </div>
              </div>

              {/* Bulk Approve Button */}
              {vendorProducts.filter(p => p.status === 'Pending').length > 0 && (
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleApproveAllPendingProducts}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve All Pending ({vendorProducts.filter(p => p.status === 'Pending').length})
                  </button>
                </div>
              )}

              <DataTable
                data={vendorProducts}
                columns={productColumns}
                loading={loadingProducts}
                customActions={[
                  {
                    label: (item: CampaignProduct) => item.status === 'Pending' ? 'Approve' : '',
                    onClick: (item: CampaignProduct) => handleApproveProduct(item.id),
                    className: (item: CampaignProduct) => 
                      item.status === 'Pending' 
                        ? 'px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700' 
                        : 'hidden'
                  },
                  {
                    label: (item: CampaignProduct) => item.status === 'Pending' ? 'Reject' : '',
                    onClick: (item: CampaignProduct) => handleRejectProduct(item.id),
                    className: (item: CampaignProduct) => 
                      item.status === 'Pending' 
                        ? 'px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700' 
                        : 'hidden'
                  }
                ]}
                emptyMessage="No products found"
              />

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVendorProducts(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedCampaigns;