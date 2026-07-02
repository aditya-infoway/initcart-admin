// AvailableCampaigns.tsx - UPDATED VERSION WITH BANNER MANAGEMENT
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../api/axiosInstance';

interface Campaign {
  id: number;
  campaign_name: string;
  campaign_type: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
  max_products_per_vendor: number;
  minimum_discount: number;
  minimum_product_limit: number;
  deal_of_day_placement?: string;
  status: 'Draft' | 'Active' | 'Inactive' | 'Expired';
  is_active: boolean;
  duration: string;
  categories_details?: { id: number; name: string }[];
  created_by_name?: string;
  vendor_count?: number;
  approved_products_count?: number;
  total_products?: number;
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
  meets_minimum_requirements?: {
    meets: boolean;
    message: string;
  };
}

interface CampaignProduct {
  id: number;
  product_details: {
    id: number;
    product_name: string;
    main_image?: string;
    category?: { name: string };
  };
  original_price: number;
  final_price: number;
  special_price: number | null;
  discount_percentage: number | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejection_reason: string | null;
  vendor_name?: string;
  added_at: string;
  deal_of_day_placement?: string;
  meets_minimum_discount?: boolean;
  has_banner_details?: boolean;
  banner_image_url?: string;
  banner_title?: string;
  banner_subtitle?: string;
  banner_button_url?: string;
}

interface BannerFormData {
  product_id: number;
  banner_image: File | null;
  banner_title: string;
  banner_subtitle: string;
  banner_button_url: string;
}

const AvailableCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [showVendorParticipations, setShowVendorParticipations] = useState(false);
  const [selectedParticipation, setSelectedParticipation] = useState<VendorParticipation | null>(null);
  const [showVendorProducts, setShowVendorProducts] = useState(false);
  
  const [participations, setParticipations] = useState<VendorParticipation[]>([]);
  const [vendorProducts, setVendorProducts] = useState<CampaignProduct[]>([]);
  const [loadingParticipations, setLoadingParticipations] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Banner Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedProductForBanner, setSelectedProductForBanner] = useState<CampaignProduct | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormData>({
    product_id: 0,
    banner_image: null,
    banner_title: '',
    banner_subtitle: '',
    banner_button_url: ''
  });
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
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
    
    // Log the first product to see what fields are coming from API
    if (response.data.length > 0) {
      console.log('API Response - First product:', response.data[0]);
      console.log('Banner fields present:', {
        banner_image_url: response.data[0].banner_image_url,
        banner_title: response.data[0].banner_title,
        banner_subtitle: response.data[0].banner_subtitle,
        banner_button_url: response.data[0].banner_button_url,
        has_banner_details: response.data[0].has_banner_details
      });
    }
    
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
      // Explicitly map banner fields
      banner_image_url: product.banner_image_url || null,
      banner_title: product.banner_title || '',
      banner_subtitle: product.banner_subtitle || '',
      banner_button_url: product.banner_button_url || '',
      has_banner_details: product.has_banner_details || !!(product.banner_image_url || product.banner_title),
      meets_minimum_discount: checkMinimumDiscount(product, selectedCampaign)
    }));
    
    setVendorProducts(processedProducts);
  } catch (error: any) {
    console.error('Error fetching vendor products:', error);
    Swal.fire('Error', `Failed to load vendor products: ${error.message}`, 'error');
  } finally {
    setLoadingProducts(false);
  }
};

  const checkMinimumDiscount = (product: CampaignProduct, campaign: Campaign | null): boolean => {
    if (!campaign || campaign.campaign_type === "Featured") return true;
    
    if (product.discount_percentage) {
      return product.discount_percentage >= campaign.minimum_discount;
    } else if (product.special_price) {
      const originalPrice = product.original_price;
      const specialPrice = parseFloat(product.special_price.toString());
      const discountPercentage = ((originalPrice - specialPrice) / originalPrice) * 100;
      return discountPercentage >= campaign.minimum_discount;
    }
    
    return false;
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleViewVendorParticipations = async () => {
    if (!selectedCampaign) return;
    await fetchCampaignParticipations(selectedCampaign.id);
    setShowVendorParticipations(true);
  };

  const handleViewVendorProducts = async (participation: VendorParticipation) => {
    setSelectedParticipation(participation);
    await fetchVendorProducts(participation.id);
    setShowVendorProducts(true);
  };

// In handleImageUpload function, update the validation message
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Only validate file size, not dimensions
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire('Error', 'Image file size must be less than 5MB', 'error');
    e.target.value = '';
    return;
  }

  setBannerForm(prev => ({
    ...prev,
    banner_image: file
  }));

  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};

  // Open Banner Modal
  const handleOpenBannerModal = (product: CampaignProduct) => {
    setSelectedProductForBanner(product);
    setBannerForm({
      product_id: product.id,
      banner_image: null,
      banner_title: product.banner_title || '',
      banner_subtitle: product.banner_subtitle || '',
      banner_button_url: product.banner_button_url || `https://yourdomain.com/product/${product.product_details?.id || ''}`
    });
    setImagePreview(product.banner_image_url || null);
    setShowBannerModal(true);
  };

  // Save Banner Details
const handleSaveBanner = async () => {
  if (!selectedProductForBanner) return;

  // Validate required fields
  if (!bannerForm.banner_title.trim()) {
    Swal.fire('Error', 'Banner title is required', 'error');
    return;
  }

  if (!bannerForm.banner_image && !selectedProductForBanner.banner_image_url) {
    Swal.fire('Error', 'Banner image is required', 'error');
    return;
  }

  try {
    setUploadingBanner(true);

    const formData = new FormData();
    formData.append('product_id', selectedProductForBanner.id.toString());
    formData.append('banner_title', bannerForm.banner_title);
    formData.append('banner_subtitle', bannerForm.banner_subtitle || '');
    formData.append('banner_button_url', bannerForm.banner_button_url || '');
    
    if (bannerForm.banner_image) {
      formData.append('banner_image', bannerForm.banner_image);
      console.log('📸 Uploading image:', bannerForm.banner_image.name, bannerForm.banner_image.size);
    }

    // 🚨 DEBUG: Log FormData contents
    console.log('📦 FormData contents:');
    for (let pair of formData.entries()) {
      if (pair[0] === 'banner_image') {
        console.log(`   ${pair[0]}: ${(pair[1] as File).name} (${(pair[1] as File).size} bytes)`);
      } else {
        console.log(`   ${pair[0]}: ${pair[1]}`);
      }
    }

    const response = await axiosInstance.post('ecommerce/admin/save-banner-details/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(' Response:', response.data);

    Swal.fire({
      title: 'Success!',
      text: 'Banner details saved successfully',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });

    if (selectedParticipation) {
      await fetchVendorProducts(selectedParticipation.id);
    }

    setShowBannerModal(false);
  } catch (error: any) {
    console.error('❌ Error saving banner:', error);
    console.error('   Response data:', error.response?.data);
    console.error('   Response status:', error.response?.status);
    console.error('   Response headers:', error.response?.headers);
    
    Swal.fire('Error', error.response?.data?.error || 'Failed to save banner details', 'error');
  } finally {
    setUploadingBanner(false);
  }
};  

// Remove Banner
const handleRemoveBanner = async (productId: number) => {
  const result = await Swal.fire({
    title: 'Remove Banner?',
    text: 'This will remove banner details for this product.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      // Clear banner fields using super admin endpoint
      const formData = new FormData();
      formData.append('product_id', productId.toString());
      formData.append('banner_title', '');
      formData.append('banner_subtitle', '');
      formData.append('banner_button_url', '');
      formData.append('remove_banner', 'true');  

      await axiosInstance.post('ecommerce/admin/save-banner-details/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        title: 'Removed!',
        text: 'Banner details removed',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      // Refresh products list
      if (selectedParticipation) {
        await fetchVendorProducts(selectedParticipation.id);
      }
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to remove banner', 'error');
    }
  }
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
    
    // Check minimum requirements for pending products
    if (selectedCampaign && selectedCampaign.campaign_type !== "Featured") {
      const nonCompliantProducts = pendingProducts.filter(p => !p.meets_minimum_discount);
      if (nonCompliantProducts.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Discount Requirements Not Met',
          html: `${nonCompliantProducts.length} products don't meet minimum ${selectedCampaign.minimum_discount}% discount requirement.<br><br>Do you want to approve only compliant products?`,
          showCancelButton: true,
          confirmButtonText: 'Approve Compliant Only',
          cancelButtonText: 'Cancel'
        }).then(async (result) => {
          if (result.isConfirmed) {
            const compliantProductIds = pendingProducts
              .filter(p => p.meets_minimum_discount)
              .map(p => p.id);
            
            if (compliantProductIds.length === 0) {
              Swal.fire('Info', 'No products meet the minimum discount requirement', 'info');
              return;
            }
            
            try {
              const response = await axiosInstance.post(`ecommerce/admin/approve-products-bulk/${selectedParticipation.id}/`, {
                product_ids: compliantProductIds
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
        });
        return;
      }
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
    const colors: { [key: string]: string } = {
      "Flash": "bg-purple-100 text-purple-800 border border-purple-200",
      "Deal of the Day": "bg-orange-100 text-orange-800 border border-orange-200",
      "Featured": "bg-pink-100 text-pink-800 border border-pink-200"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[type] || "bg-gray-100 text-gray-800"}`}>
        {type}
      </span>
    );
  };

  const getPlacementLabel = (placement: string) => {
    switch(placement) {
      case 'main': return 'Main Section';
      case 'banner': return 'Hero Banner';
      case 'product_list': return 'Product List';
      default: return placement;
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Available Campaigns</h1>
        <div className="text-sm text-gray-500">
          Showing: {filteredCampaigns.length} active campaigns
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="all">All Campaigns</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.campaign_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getCampaignTypeBadge(campaign.campaign_type)}
                      {getStatusBadge(campaign.status)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDateTime(campaign.start_datetime)} - {formatDateTime(campaign.end_datetime)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{campaign.vendor_count || 0} Vendors • {campaign.selected_vendors?.length || 0} Selected</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{campaign.approved_products_count || 0} Approved Products</span>
                  </div>

                  {/* Requirements */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Requirements:</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{campaign.campaign_type}</span>
                      </div>
                      {campaign.campaign_type !== "Featured" && (
                        <div className="flex justify-between">
                          <span>Min Discount:</span>
                          <span className="font-medium">{campaign.minimum_discount}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Min Products/Vendor:</span>
                        <span className="font-medium">{campaign.minimum_product_limit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Products/Vendor:</span>
                        <span className="font-medium">{campaign.max_products_per_vendor}</span>
                      </div>
                      {campaign.campaign_type === "Deal of the Day" && campaign.deal_of_day_placement && (
                        <div className="flex justify-between">
                          <span>Default Placement:</span>
                          <span className="font-medium">{getPlacementLabel(campaign.deal_of_day_placement)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {campaign.description || 'No description available'}
                </p>
                
                <button
                  onClick={() => handleViewCampaign(campaign)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredCampaigns.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No active campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'No campaigns match your search' : 'No active campaigns available at the moment'}
          </p>
        </div>
      )}

      {/* Campaign Details Popup */}
      {showCampaignDetails && selectedCampaign && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowCampaignDetails(false)}
          />
          
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.campaign_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {getCampaignTypeBadge(selectedCampaign.campaign_type)}
                    {getStatusBadge(selectedCampaign.status)}
                  </div>
                </div>
                <button
                  onClick={() => setShowCampaignDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Campaign Status</h3>
                    <div className="mt-1">{getStatusBadge(selectedCampaign.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                    <p className="mt-1 text-gray-900">
                      {formatDateTime(selectedCampaign.start_datetime)}<br/>
                      to<br/>
                      {formatDateTime(selectedCampaign.end_datetime)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Max Products per Vendor</h3>
                    <p className="mt-1 text-gray-900">{selectedCampaign.max_products_per_vendor}</p>
                  </div>
                  
                  {selectedCampaign.campaign_type === "Deal of the Day" && selectedCampaign.deal_of_day_placement && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Default Product Placement</h3>
                      <p className="mt-1 text-gray-900">{getPlacementLabel(selectedCampaign.deal_of_day_placement)}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Minimum Requirements</h3>
                    <div className="mt-2 space-y-2">
                      {selectedCampaign.campaign_type !== "Featured" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Discount:</span>
                          <span className="font-semibold">{selectedCampaign.minimum_discount}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Products per Vendor:</span>
                        <span className="font-semibold">{selectedCampaign.minimum_product_limit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vendor Selection:</span>
                        <span className="font-semibold">
                          {selectedCampaign.selected_vendors?.length || 0} vendors selected
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Vendors:</span>
                        <span className="font-semibold">{selectedCampaign.vendor_count || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Approved Products</h3>
                    <p className="mt-1 text-gray-900">{selectedCampaign.approved_products_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">{selectedCampaign.description || 'No description available'}</p>
                </div>
              </div>

              {selectedCampaign.categories_details && selectedCampaign.categories_details.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.categories_details.map(category => (
                      <span key={category.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCampaignDetails(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleViewVendorParticipations}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  View Vendor Participations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingParticipations ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-800 font-bold text-xl">
                        {participations.length}
                      </div>
                      <div className="text-blue-600 text-sm">Total Vendors</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-800 font-bold text-xl">
                        {participations.reduce((sum, p) => sum + p.approved_products_count, 0)}
                      </div>
                      <div className="text-green-600 text-sm">Total Approved Products</div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-yellow-800 font-bold text-xl">
                        {participations.reduce((sum, p) => sum + p.pending_products_count, 0)}
                      </div>
                      <div className="text-yellow-600 text-sm">Total Pending Products</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Products Summary
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Requirements Status
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applied Date
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {participations.map((participation) => (
                          <tr key={participation.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {participation.vendor_details.business_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {participation.vendor_details.email}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-900">
                                  Total: <span className="font-semibold">{participation.product_count}</span> products
                                </div>
                                <div className="flex space-x-3 text-xs">
                                  <span className="text-green-600">
                                    ✓ Approved: {participation.approved_products_count}
                                  </span>
                                  <span className="text-yellow-600">
                                    ⏳ Pending: {participation.pending_products_count}
                                  </span>
                                  <span className="text-red-600">
                                    ✗ Rejected: {participation.product_count - participation.approved_products_count - participation.pending_products_count}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {participation.meets_minimum_requirements ? (
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  participation.meets_minimum_requirements.meets
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {participation.meets_minimum_requirements.meets ? '✓ Meets' : '✗ Not Met'}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">Not checked</span>
                              )}
                              {participation.meets_minimum_requirements && !participation.meets_minimum_requirements.meets && (
                                <div className="text-xs text-gray-500 mt-1" title={participation.meets_minimum_requirements.message}>
                                  {participation.meets_minimum_requirements.message.substring(0, 50)}...
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(participation.applied_at)}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleViewVendorProducts(participation)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                disabled={participation.product_count === 0}
                              >
                                {participation.product_count === 0 ? 'No Products' : 'Manage Products'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {participations.length === 0 && (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No vendor participations</h3>
                        <p className="mt-1 text-sm text-gray-500">No vendors have participated in this campaign yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVendorParticipations(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Products Popup */}
      {showVendorProducts && selectedParticipation && selectedCampaign && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowVendorProducts(false)}
          />
          
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative z-10">
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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Vendor Name</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedParticipation.vendor_details.business_name}
                  </div>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Campaign Requirements</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedCampaign.campaign_type !== "Featured" && (
                      <div>Min Discount: {selectedCampaign.minimum_discount}%</div>
                    )}
                    <div>Min Products: {selectedCampaign.minimum_product_limit}</div>
                  </div>
                </div>
              </div>

              {loadingProducts ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
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
                    
                    <div className="flex space-x-2">
                      {vendorProducts.filter(p => p.status === 'Pending').length > 0 && (
                        <>
                          <button
                            onClick={handleApproveAllPendingProducts}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Approve All Pending
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Original Price
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deal Price
                          </th>
                          {selectedCampaign.campaign_type === "Deal of the Day" && (
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Placement
                            </th>
                          )}
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Discount Check
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vendorProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {product.product_details?.main_image && (
                                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                                    <img
                                      className="h-10 w-10 rounded-md object-cover"
                                      src={product.product_details.main_image}
                                      alt={product.product_details?.product_name || 'Product'}
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.product_details?.product_name || 'Unknown Product'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.product_details?.category?.name || 'No category'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatPrice(product.original_price)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-green-600">
                                {formatPrice(product.final_price)}
                              </div>
                              {product.discount_percentage ? (
                                <div className="text-xs text-gray-500">
                                  {product.discount_percentage}% off
                                </div>
                              ) : product.special_price ? (
                                <div className="text-xs text-gray-500">
                                  Special Price
                                </div>
                              ) : null}
                            </td>
                            {selectedCampaign.campaign_type === "Deal of the Day" && (
                              <td className="px-6 py-4">
                                {product.deal_of_day_placement && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {getPlacementLabel(product.deal_of_day_placement)}
                                  </span>
                                )}
                                {product.deal_of_day_placement === 'banner' && product.has_banner_details && (
                                  <div className="mt-1">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                      Banner Configured
                                    </span>
                                  </div>
                                )}
                              </td>
                            )}
                            <td className="px-6 py-4">
                              {selectedCampaign.campaign_type === "Featured" ? (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                  N/A for Featured
                                </span>
                              ) : product.meets_minimum_discount ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  ✓ Meets {selectedCampaign.minimum_discount}%
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  ✗ Below {selectedCampaign.minimum_discount}%
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(product.status)}
                              {product.status === 'Rejected' && product.rejection_reason && (
                                <div className="text-xs text-gray-500 mt-1" title={product.rejection_reason}>
                                  Reason: {product.rejection_reason.substring(0, 30)}...
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {product.status === 'Pending' ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveProduct(product.id)}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                    disabled={selectedCampaign.campaign_type !== "Featured" && !product.meets_minimum_discount}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectProduct(product.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <div className="text-sm">
                                    <span className={`px-2 py-1 rounded ${product.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {product.status}
                                    </span>
                                  </div>
                                  {selectedCampaign.campaign_type === "Deal of the Day" && 
                                   product.deal_of_day_placement === 'banner' && 
                                   product.status === 'Approved' && (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => handleOpenBannerModal(product)}
                                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                                      >
                                        {product.has_banner_details ? 'Edit Banner' : 'Add Banner'}
                                      </button>
                                      {product.has_banner_details && (
                                        <button
                                          onClick={() => handleRemoveBanner(product.id)}
                                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {vendorProducts.length === 0 && (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No products added</h3>
                        <p className="mt-1 text-sm text-gray-500">This vendor hasn't added any products to the campaign.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVendorProducts(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Configuration Modal */}
      {showBannerModal && selectedProductForBanner && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBannerModal(false)}
          />
          
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Configure Hero Banner
                  </h2>
                  <p className="text-gray-600">Product: {selectedProductForBanner.product_details?.product_name}</p>
                </div>
                <button
                  onClick={() => setShowBannerModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Preview */}
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Banner Image <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-gray-500">Required: 1920x700 pixels</span>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative mx-auto max-w-2xl">
                            <img
                              src={imagePreview}
                              alt="Banner preview"
                              className="w-full h-auto rounded-lg shadow-md"
                            />
                            <div className="mt-2 text-sm text-gray-600 text-center">
                              Preview: 1920x700 pixels
                            </div>
                          </div>
                          <div>
                            <input
                              type="file"
                              id="banner-image"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <label
                              htmlFor="banner-image"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Change Image
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-center mb-4">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Upload banner image (1920x700 pixels, max 5MB)
                            </p>
                            <input
                              type="file"
                              id="banner-image"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <label
                              htmlFor="banner-image"
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Upload Image
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bannerForm.banner_title}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, banner_title: e.target.value }))}
                    placeholder="Enter main title for banner"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={255}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be the main heading on the banner
                  </p>
                </div>

                {/* Banner Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Subtitle
                  </label>
                  <textarea
                    value={bannerForm.banner_subtitle}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, banner_subtitle: e.target.value }))}
                    placeholder="Enter subtitle or description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Supporting text or description (max 500 characters)
                  </p>
                </div>

                {/* Button URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Now Button URL
                  </label>
                  <input
                    type="url"
                    value={bannerForm.banner_button_url}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, banner_button_url: e.target.value }))}
                    placeholder="https://example.com/shop-now"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: URL for Shop Now button. If empty, will link to product page.
                  </p>
                </div>

                {/* Current Product Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Product Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Product Name:</div>
                      <div className="font-medium">{selectedProductForBanner.product_details?.product_name}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Original Price:</div>
                      <div className="font-medium">{formatPrice(selectedProductForBanner.original_price)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Deal Price:</div>
                      <div className="font-medium text-green-600">{formatPrice(selectedProductForBanner.final_price)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Discount:</div>
                      <div className="font-medium">
                        {selectedProductForBanner.discount_percentage ? 
                          `${selectedProductForBanner.discount_percentage}% off` : 
                          'Special Price'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowBannerModal(false)}
                    disabled={uploadingBanner}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBanner}
                    disabled={uploadingBanner || !bannerForm.banner_title.trim() || (!bannerForm.banner_image && !selectedProductForBanner.banner_image_url)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingBanner ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Banner'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableCampaigns;