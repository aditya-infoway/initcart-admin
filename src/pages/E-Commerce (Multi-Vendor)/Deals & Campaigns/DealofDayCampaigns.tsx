import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../api/axiosInstance';
import DataTable from '../../../components/common/DataTable';
import {
  FaTag, FaCalendarAlt, FaUsers, FaBox, FaPercentage,
  FaEye, FaCheck, FaTimes, FaImage, FaFilter, FaStore,
  FaEnvelope, FaPhone, FaDollarSign, FaClock, FaExclamationTriangle,
  FaSave,
  FaCampground,
  FaQuestionCircle,
} from 'react-icons/fa';
import { FaFileLines, FaSquare } from 'react-icons/fa6';
interface ProductStock {
  id: number;
  variant_image?: string;
}

interface ProductDetails {
  id: number;
  product_name: string;
  main_image?: string | null;

  category_details?: {
    name: string;
  };

  stocks?: ProductStock[];
}

interface CampaignProduct {
  id: number;
  product_details: {
    stocks: any;
    id: number;
    product_name: string;
    main_image?: string;
    variant_image?: string; 
    category?: { name: string };
  };
  vendor_details?: {
    id: number;
    business_name: string;
    email: string;
    phone: string;
  };
  campaign_details?: {
    id: number;
    campaign_name: string;
    campaign_type: string;
    start_datetime: string;
    end_datetime: string;
    minimum_discount: number;
  };
  original_price: number;
  final_price: number;
  special_price: number | null;
  discount_percentage: number | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejection_reason: string | null;
  added_at: string;
  deal_of_day_placement?: string;
  meets_minimum_discount?: boolean;
  has_banner_details?: boolean;
  banner_image_url?: string;
  banner_title?: string;
  banner_subtitle?: string;
  banner_button_url?: string;
}

interface Campaign {
  id: number;
  campaign_name: string;
  campaign_type: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
}

const DEAL_OF_DAY_PLACEMENTS = [
  { value: 'all', label: 'All Placements', icon: <FaCampground></FaCampground>, color: 'gray' },
  { value: 'main', label: 'Main Section', icon: <FaSquare></FaSquare>, color: 'blue' },
  { value: 'product_list', label: 'Product List', icon: <FaFileLines></FaFileLines>, color: 'green' },
  { value: 'banner', label: 'Hero Banner', icon: <FaImage></FaImage>, color: 'purple' },
  // { value: 'unassigned', label: 'Unassigned', icon: <FaQuestionCircle></FaQuestionCircle>, color: 'gray' },
];

const DealOfDayCampaigns: React.FC = () => {
  const [allProducts, setAllProducts] = useState<CampaignProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<CampaignProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CampaignProduct | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    banner_image: null as File | null,
    banner_title: '',
    banner_subtitle: '',
    banner_button_url: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  useEffect(() => {
    fetchAllDealOfDayProducts();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allProducts, placementFilter, campaignFilter, statusFilter, searchTerm]);

  const fetchAllDealOfDayProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch all Deal of the Day campaigns
      const campaignsResponse = await axiosInstance.get('ecommerce/admin/campaigns/', {
        params: { campaign_type: 'Deal of the Day' }
      });
      
      const dealCampaigns = campaignsResponse.data;
      let allDealProducts: CampaignProduct[] = [];
      
      // For each campaign, fetch all products
      for (const campaign of dealCampaigns) {
        try {
          // Get all participations for this campaign
          const participationsResponse = await axiosInstance.get('ecommerce/admin/campaign-participations/', {
            params: { campaign_id: campaign.id }
          });
          
          const participations = participationsResponse.data;
          
          // For each participation, fetch products
          for (const participation of participations) {
            try {
              const productsResponse = await axiosInstance.get(`ecommerce/admin/participation-products/${participation.id}/`);
              
              const productsWithDetails = productsResponse.data.map((product: any) => ({
                ...product,
                original_price: parseFloat(product.original_price || 0),
                final_price: parseFloat(product.final_price || 0),
                campaign_details: {
                  id: campaign.id,
                  campaign_name: campaign.campaign_name,
                  campaign_type: campaign.campaign_type,
                  start_datetime: campaign.start_datetime,
                  end_datetime: campaign.end_datetime,
                  minimum_discount: campaign.minimum_discount
                },
                vendor_details: participation.vendor_details,
                product_details: product.product_details || {
                  id: 0,
                  product_name: 'Unknown Product',
                  main_image: '',
                  
                  category: { name: 'No Category' }
                },
                has_banner_details: product.has_banner_details || !!(product.banner_image_url || product.banner_title),
                meets_minimum_discount: checkMinimumDiscount(product, campaign)
              }));
              
              allDealProducts = [...allDealProducts, ...productsWithDetails];
            } catch (error) {
              console.error(`Error fetching products for participation ${participation.id}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error fetching participations for campaign ${campaign.id}:`, error);
        }
      }
      
      setAllProducts(allDealProducts);
    } catch (error: any) {
      console.error('Error fetching Deal of the Day products:', error);
      Swal.fire('Error', 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axiosInstance.get('ecommerce/admin/campaigns/', {
        params: { campaign_type: 'Deal of the Day' }
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const checkMinimumDiscount = (product: any, campaign: any): boolean => {
    if (product.discount_percentage) {
      return product.discount_percentage >= campaign.minimum_discount;
    } else if (product.special_price) {
      const originalPrice = parseFloat(product.original_price || 0);
      const specialPrice = parseFloat(product.special_price);
      const discountPercentage = ((originalPrice - specialPrice) / originalPrice) * 100;
      return discountPercentage >= campaign.minimum_discount;
    }
    return false;
  };


  const applyFilters = () => {
    let filtered = [...allProducts];

    // Placement filter
    if (placementFilter !== 'all') {
      if (placementFilter === 'unassigned') {
        filtered = filtered.filter(p => !p.deal_of_day_placement);
      } else {
        filtered = filtered.filter(p => p.deal_of_day_placement === placementFilter);
      }
    }

    // Campaign filter
    if (campaignFilter !== 'all') {
      filtered = filtered.filter(p => p.campaign_details?.id === parseInt(campaignFilter));
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // ✅ Enhanced Search with multiple fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();

      // Agar search term mein @ hai to email search priority
      if (term.includes('@')) {
        // Exact email match
        filtered = filtered.filter(p =>
          p.vendor_details?.email?.toLowerCase() === term ||
          p.vendor_details?.email?.toLowerCase().includes(term)
        );
      } else {
        // General search in all fields
        filtered = filtered.filter(p =>
          // Product fields
          p.product_details?.product_name?.toLowerCase().includes(term) ||
          p.product_details?.id?.toString().includes(term) ||
          p.product_details?.category?.name?.toLowerCase().includes(term) ||

          // Vendor fields
          p.vendor_details?.business_name?.toLowerCase().includes(term) ||
          p.vendor_details?.email?.toLowerCase().includes(term) ||  // ✅ Email search
          p.vendor_details?.phone?.toLowerCase().includes(term) ||
          p.vendor_details?.id?.toString().includes(term) ||

          // Campaign fields
          p.campaign_details?.campaign_name?.toLowerCase().includes(term) ||
          p.campaign_details?.id?.toString().includes(term) ||

          // Product ID
          p.id?.toString().includes(term)
        );
      }
    }

    setFilteredProducts(filtered);
  };
  const handleOpenBannerModal = (product: CampaignProduct) => {
    setSelectedProduct(product);
    setBannerForm({
      banner_image: null,
      banner_title: product.banner_title || '',
      banner_subtitle: product.banner_subtitle || '',
      banner_button_url: product.banner_button_url || ''
    });
    setImagePreview(product.banner_image_url || null);
    setShowBannerModal(true);
  };
   
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Image file size must be less than 5MB', 'error');
      e.target.value = '';
      return;
    }

    setBannerForm(prev => ({ ...prev, banner_image: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async () => {
    if (!selectedProduct) return;

    if (!bannerForm.banner_title.trim()) {
      Swal.fire('Error', 'Banner title is required', 'error');
      return;
    }

    if (!bannerForm.banner_image && !selectedProduct.banner_image_url) {
      Swal.fire('Error', 'Banner image is required', 'error');
      return;
    }

    try {
      setUploadingBanner(true);

      const formData = new FormData();
      formData.append('product_id', selectedProduct.id.toString());
      formData.append('banner_title', bannerForm.banner_title);
      formData.append('banner_subtitle', bannerForm.banner_subtitle || '');
      formData.append('banner_button_url', bannerForm.banner_button_url || '');

      if (bannerForm.banner_image) {
        formData.append('banner_image', bannerForm.banner_image);
      }

      await axiosInstance.post('ecommerce/admin/save-banner-details/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        title: 'Success!',
        text: 'Banner details saved successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      await fetchAllDealOfDayProducts();
      setShowBannerModal(false);
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to save banner', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

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
        const formData = new FormData();
        formData.append('product_id', productId.toString());
        formData.append('remove_banner', 'true');

        await axiosInstance.post('ecommerce/admin/save-banner-details/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        Swal.fire({
          title: 'Removed!',
          text: 'Banner details removed',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        await fetchAllDealOfDayProducts();
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

      await fetchAllDealOfDayProducts();
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

        await fetchAllDealOfDayProducts();
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to reject product', 'error');
      }
    }
  };

  const getPlacementBadge = (placement: string | undefined) => {
    if (!placement) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Unassigned</span>;
    }

    const colors: Record<string, string> = {
      'main': 'bg-blue-100 text-blue-800',
      'banner': 'bg-purple-100 text-purple-800',
      'product_list': 'bg-green-100 text-green-800'
    };

    const labels: Record<string, string> = {
      'main': 'Main Section',
      'banner': 'Hero Banner',
      'product_list': 'Product List'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[placement]}`}>
        {labels[placement]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    if (isNaN(price)) return '₹0.00';
    return `₹${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Columns for DataTable
const columns = [
  { key: "id", label: "ID" },

  {
    key: "product",
    label: "Product",

    render: (item: CampaignProduct) => {

      const variantImage =
        item.product_details?.stocks?.find(
          (s: ProductStock) => s.variant_image
        )?.variant_image || "";

      const productImage =
        item.product_details?.main_image || variantImage;

      return (
        <div className="flex items-center gap-3">

          {productImage ? (
            <img
              src={productImage}
              alt={item.product_details.product_name}
              className="w-12 h-12 rounded object-cover border"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
              <FaBox className="text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium">{item.product_details?.product_name}</div>
            <div className="text-xs text-gray-500">{item.product_details?.category?.name}</div>
          </div>
        </div>
      )
    }
    },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (item: CampaignProduct) => (
        <div>
          <div className="font-medium flex items-center gap-1">
            <FaStore className="text-xs text-gray-400" />
            {item.vendor_details?.business_name}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <FaEnvelope className="text-xs" />
            {item.vendor_details?.email}
          </div>
        </div>
      )
    },
    {
      key: 'campaign',
      label: 'Campaign',
      render: (item: CampaignProduct) => (
          <div className="font-medium">{item.campaign_details?.campaign_name}</div>
      )
    },
    {
      key: 'duration_start',
      label: 'Start Time',
      render: (item: CampaignProduct) => (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <FaClock className="text-xs" />
            {formatDate(item.campaign_details?.start_datetime || '')}
          </div>
      )
    },
        {
      key: 'duration_end',
      label: 'End time',
      render: (item: CampaignProduct) => (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <FaClock className="text-xs" />
            {formatDate(item.campaign_details?.end_datetime || '')}
          </div>
      )
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (item: CampaignProduct) => (
        <div>
          <div className="text-sm text-gray-500 line-through">{formatPrice(item.original_price)}</div>
          <div className="text-sm font-bold text-green-600">{formatPrice(item.final_price)}</div>
          {item.discount_percentage && (
            <div className="text-xs text-gray-500">{item.discount_percentage}% off</div>
          )}
        </div>
      )
    },
    {
      key: 'placement',
      label: 'Placement',
      render: (item: CampaignProduct) => (
        <div className="whitespace-nowrap">
          {getPlacementBadge(item.deal_of_day_placement)}
          {item.deal_of_day_placement === 'banner' && (
            <div className="mt-1">
              {item.has_banner_details ? (
                <span className="text-xs text-purple-600 flex items-center whitespace-nowrap gap-1">
                  <FaImage /> Banner Set
                </span>
              ) : (
                <span className="text-xs text-yellow-600 flex items-center gap-1">
                  <FaExclamationTriangle /> No Banner
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'discount_check',
      label: 'Discount Check',
      render: (item: CampaignProduct) => (
        item.meets_minimum_discount ? (
          <span className="text-green-600 flex items-center gap-1">
            <FaCheck /> Meets {item.campaign_details?.minimum_discount}%
          </span>
        ) : (
          <span className="text-red-600 flex items-center gap-1">
            <FaTimes /> Below {item.campaign_details?.minimum_discount}%
          </span>
        )
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
        <h1 className="text-2xl font-bold text-gray-900">Deal of the Day - All Products</h1>
        <div className="text-sm text-gray-500">
          Total Products: {filteredProducts.length} / {allProducts.length}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-blue-500" />
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Placement Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placement
            </label>
            <div className="flex flex-wrap gap-2">
              {DEAL_OF_DAY_PLACEMENTS.map((placement) => (
                <button
                  key={placement.value}
                  onClick={() => setPlacementFilter(placement.value)}
                  className={`px-4 py-3 rounded-md whitespace-nowrap text-sm font-medium transition-colors flex-1 items-center gap-2 ${placementFilter === placement.value
                      ? `bg-${placement.color}-600 text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span>{placement.icon}</span>
                  {placement.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign
            </label>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.campaign_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by product, vendor name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-800 font-bold text-xl">
              {filteredProducts.length}
            </div>
            <div className="text-blue-600 text-sm">Filtered Products</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-800 font-bold text-xl">
              {filteredProducts.filter(p => p.status === 'Approved').length}
            </div>
            <div className="text-green-600 text-sm">Approved</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-800 font-bold text-xl">
              {filteredProducts.filter(p => p.status === 'Pending').length}
            </div>
            <div className="text-yellow-600 text-sm">Pending</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-800 font-bold text-xl">
              {filteredProducts.filter(p => p.deal_of_day_placement === 'banner').length}
            </div>
            <div className="text-purple-600 text-sm">Banner Products</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-800 font-bold text-xl">
              {filteredProducts.filter(p => !p.deal_of_day_placement).length}
            </div>
            <div className="text-gray-600 text-sm">Unassigned</div>
          </div>
        </div>
      </div>

      {/* Products DataTable */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        loading={loading}
        title="Deal of the Day Products"
        customActions={[
          {
            label: (item: CampaignProduct) =>
              item.status === 'Pending' ? 'Approve' : '',
            onClick: (item: CampaignProduct) => handleApproveProduct(item.id),
            className: (item: CampaignProduct) =>
              item.status === 'Pending'
                ? 'px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700'
                : 'hidden'
          },
          {
            label: (item: CampaignProduct) =>
              item.status === 'Pending' ? 'Reject' : '',
            onClick: (item: CampaignProduct) => handleRejectProduct(item.id),
            className: (item: CampaignProduct) =>
              item.status === 'Pending'
                ? 'px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700'
                : 'hidden'
          },
          {
            label: (item: CampaignProduct) =>
              item.deal_of_day_placement === 'banner' ?
                (item.has_banner_details ? 'Edit Banner' : 'Add Banner') : '',
            onClick: (item: CampaignProduct) => handleOpenBannerModal(item),
            className: (item: CampaignProduct) =>
              item.deal_of_day_placement === 'banner'
                ? `px-3 py-1 ${item.has_banner_details ? 'bg-purple-600' : 'bg-blue-600'} text-white text-sm rounded hover:bg-opacity-90`
                : 'hidden'
          },
          {
            label: (item: CampaignProduct) =>
              item.deal_of_day_placement === 'banner' && item.has_banner_details ? 'Remove' : '',
            onClick: (item: CampaignProduct) => handleRemoveBanner(item.id),
            className: (item: CampaignProduct) =>
              item.deal_of_day_placement === 'banner' && item.has_banner_details
                ? 'px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700'
                : 'hidden'
          }
        ]}
        emptyMessage="No Deal of the Day products found"
      />

      {/* Banner Configuration Modal */}
      {showBannerModal && selectedProduct && (
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
                  <p className="text-gray-600">Product: {selectedProduct.product_details?.product_name}</p>
                  <p className="text-sm text-gray-500">Vendor: {selectedProduct.vendor_details?.business_name}</p>
                </div>
                <button
                  onClick={() => setShowBannerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image <span className="text-red-500">*</span>
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Banner preview"
                          className="w-full h-auto rounded-lg shadow-md"
                        />
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
                            Change Image
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <FaImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
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
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                          Upload Image
                        </label>
                      </div>
                    )}
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
                  />
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
                  />
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
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowBannerModal(false)}
                    disabled={uploadingBanner}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBanner}
                    disabled={uploadingBanner || !bannerForm.banner_title.trim() || (!bannerForm.banner_image && !selectedProduct.banner_image_url)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploadingBanner ? 'Saving...' : 'Save Banner'}
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

export default DealOfDayCampaigns;