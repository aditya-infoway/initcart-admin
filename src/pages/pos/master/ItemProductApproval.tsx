// pos/frontend/src/pages/admin/AdminWebsiteItems.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiAlertCircle, FiEye } from 'react-icons/fi';
import apiClient from '../../../api/apiClient';

// Types
interface ItemVariant {
  id: number;
  salesPrice: number;
  mrp: number;
  size?: string;
  color?: string;
  opStock: number;
  current_stock: number;
  purchasePrice: number;
  barcode: string;
  variant_image?: string | null;
  variant_image_url?: string | null;
}

interface AdminWebsiteItem {
  id: number;
  itemName: string;
  branch_name: string;
  category: string;
  subCategory: string;
  variants_count: number;
  total_stock: number;
  final_price: number;
  original_price: number;
  website_status: 'pending' | 'approved' | 'rejected' | 'draft';
  main_image: string | null;
  thumbnail_image: string | null;
  linked_product: number | null;
  short_description: string;
  full_description: string;
  description_features: any[];
  specifications: any[];
  warranty_available: boolean;
  warranty_period: string;
  warranty_type: string;
  warranty_description: string;
  return_policy: string;
  estimated_delivery_time: string;
  free_shipping: boolean;
  product_condition: string;
  variants: ItemVariant[];
  created_at: string;
  updated_at: string;
}

const AdminWebsiteItems: React.FC = () => {
  const [items, setItems] = useState<AdminWebsiteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [branchFilterInput, setBranchFilterInput] = useState<string>('');

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get full URL for media files
  const getFullUrl = (mediaPath: string | undefined | null) => {
    if (!mediaPath) return '#';
    if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
      return mediaPath;
    }
    const API_BASE_URL = "http://localhost:8000";
    if (mediaPath.startsWith('/media/')) {
      return `${API_BASE_URL}${mediaPath}`;
    }
    if (!mediaPath.includes('/')) {
      return `${API_BASE_URL}/media/${mediaPath}`;
    }
    return `${API_BASE_URL}${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`;
  };
  const getDisplayImage = (item: AdminWebsiteItem): string | null => {
    if (item.main_image) {
      return getFullUrl(item.main_image);
    }
    if (item.thumbnail_image) {
      return getFullUrl(item.thumbnail_image);
    }
    if (item.variants && item.variants.length > 0) {
      const firstVariant = item.variants[0];
      if (firstVariant.variant_image_url) {
        return firstVariant.variant_image_url;
      }
      if (firstVariant.variant_image) {
        return getFullUrl(firstVariant.variant_image);
      }
    }
    return null;
  };
  // Get all variant images for display
  const getAllVariantImages = (item: AdminWebsiteItem): string[] => {
    const images: string[] = [];
    if (item.variants && item.variants.length > 0) {
      item.variants.forEach(variant => {
        const img = variant.variant_image_url || getFullUrl(variant.variant_image);
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    return images;
  };
  // Fetch items - wrapped in useCallback to prevent recreation
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (branchFilter) params.append('branch', branchFilter);

      const url = params.toString() ? `/pos/admin/website-items/?${params.toString()}` : '/pos/admin/website-items/';
      const response = await apiClient.get(url);

      console.log(" Admin Items API Response:", response.data);

      if (response.data && response.data.items) {
        setItems(response.data.items);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to load items',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, branchFilter]);

  // Handle branch filter input change with debounce
  const handleBranchFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBranchFilterInput(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setBranchFilter(value);
    }, 500); // 500ms debounce
  };

  // Fetch items when statusFilter or branchFilter changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

const handleViewDetails = (item: AdminWebsiteItem) => {
    console.log("🔍 Viewing item details:", item);

    let descriptionFeatures = item.description_features || [];
    if (typeof descriptionFeatures === 'string') {
      try {
        descriptionFeatures = JSON.parse(descriptionFeatures);
      } catch (e) {
        descriptionFeatures = [];
      }
    }

    let specifications = item.specifications || [];
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch (e) {
        specifications = [];
      }
    }

    const variants = item.variants || [];

    Swal.fire({
      title: item.itemName,
      html: `
        <div class="max-h-[70vh] overflow-y-auto">
          <!-- Status Bar -->
          <div class="flex justify-between items-center border-b pb-3 mb-3">
            <span class="text-xs font-medium text-gray-500">Status:</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${item.website_status === "approved" ? "bg-green-100 text-green-700" :
          item.website_status === "rejected" ? "bg-red-100 text-red-700" :
            item.website_status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-700"
        }">
              ${item.website_status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>

          <!-- Basic Info Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs mb-3">
            <div><span class="font-medium text-gray-600">Branch:</span> ${item.branch_name || 'N/A'}</div>
            <div><span class="font-medium text-gray-600">Created:</span> ${item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</div>
            <div><span class="font-medium text-gray-600">Category:</span> ${item.category || "N/A"}</div>
            <div><span class="font-medium text-gray-600">Sub Category:</span> ${item.subCategory || "N/A"}</div>
          </div>

          <!-- Description -->
          <div class="bg-gray-50 rounded p-2 mb-3 text-xs">
            <div class="mb-1"><span class="font-medium text-gray-600">Short:</span> ${item.short_description || "N/A"}</div>
            ${item.full_description ? `<div><span class="font-medium text-gray-600">Full:</span> ${item.full_description}</div>` : ''}
          </div>

          <!-- Features & Specifications -->
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="border rounded p-2">
              <div class="font-medium text-gray-700 text-xs mb-1">Features</div>
              ${descriptionFeatures && descriptionFeatures.length > 0 ? 
                `<div class="text-xs space-y-0.5 max-h-24 overflow-y-auto">
                  ${descriptionFeatures.map((f: any) => `<div>• ${f.value || f}</div>`).join('')}
                </div>` : 
                '<div class="text-xs text-gray-400">No features</div>'
              }
            </div>
            <div class="border rounded p-2">
              <div class="font-medium text-gray-700 text-xs mb-1">Specifications</div>
              ${specifications && specifications.length > 0 ? 
                `<div class="text-xs space-y-1 max-h-24 overflow-y-auto">
                  ${specifications.map((s: any) => `<div><span class="font-medium">${s.title || 'Spec'}:</span> ${s.value}</div>`).join('')}
                </div>` : 
                '<div class="text-xs text-gray-400">No specs</div>'
              }
            </div>
          </div>

          <!-- Warranty & Shipping -->
          <div class="grid grid-cols-3 gap-2 text-xs mb-3 p-2 bg-gray-50 rounded">
            <div><span class="font-medium text-gray-600">Warranty:</span> ${item.warranty_available ? 'Yes' : 'No'}</div>
            ${item.warranty_available ? `
              <div><span class="font-medium text-gray-600">Type:</span> ${item.warranty_type || 'N/A'}</div>
              <div><span class="font-medium text-gray-600">Period:</span> ${item.warranty_period || 'N/A'}</div>
            ` : '<div></div><div></div>'}
            <div><span class="font-medium text-gray-600">Return:</span> ${item.return_policy || 'N/A'}</div>
            <div><span class="font-medium text-gray-600">Delivery:</span> ${item.estimated_delivery_time || 'N/A'}</div>
            <div><span class="font-medium text-gray-600">Free Shipping:</span> ${item.free_shipping ? 'Yes' : 'No'}</div>
            <div><span class="font-medium text-gray-600">Condition:</span> ${item.product_condition || 'New'}</div>
          </div>

          ${item.warranty_available && item.warranty_description ? `
            <div class="text-xs bg-gray-50 rounded p-2 mb-3">
              <span class="font-medium text-gray-600">Warranty Description:</span> ${item.warranty_description}
            </div>
          ` : ''}

          <!-- Variants Table -->
          <div class="mb-3">
            <div class="font-medium text-gray-700 text-xs mb-1">Variants (${variants.length})</div>
            ${variants.length > 0 ? `
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-1 py-0.5 text-left">#</th>
                      <th class="px-1 py-0.5 text-left">Img</th>
                      <th class="px-1 py-0.5 text-left">Size</th>
                      <th class="px-1 py-0.5 text-left">Color</th>
                      <th class="px-1 py-0.5 text-right">MRP</th>
                      <th class="px-1 py-0.5 text-right">Price</th>
                      <th class="px-1 py-0.5 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${variants.map((v: any, idx: number) => {
          const variantImage = v.variant_image_url || v.variant_image;
          return `
                    <tr class="border-b">
                      <td class="px-1 py-1">${idx + 1}</td>
                      <td class="px-1 py-1">
                        ${variantImage ?
              `<img src="${getFullUrl(variantImage)}" style="width:24px;height:24px;object-fit:cover;border-radius:2px;" onerror="this.src='https://placehold.co/24x24/f0f4f8/94a3b8?text=?'" />` :
              `<div style="width:24px;height:24px;background:#f3f4f6;border-radius:2px;"></div>`
            }
                      </td>
                      <td class="px-1 py-1">${v.size || '-'}</td>
                      <td class="px-1 py-1">${v.color || '-'}</td>
                      <td class="px-1 py-1 text-right">₹${v.mrp || 0}</td>
                      <td class="px-1 py-1 text-right font-semibold">₹${v.salesPrice || 0}</td>
                      <td class="px-1 py-1 text-right">${v.current_stock || v.opStock || 0}</td>
                    </tr>
                  `;
        }).join('')}
                  </tbody>
                </table>
              </div>
            ` : '<div class="text-xs text-gray-400 text-center py-2">No variants</div>'}
          </div>

          <!-- Images -->
          ${item.main_image || item.thumbnail_image ? `
            <div class="flex gap-3 pt-2 border-t">
              ${item.main_image ? `
                <div>
                  <div class="text-xs font-medium text-gray-600 mb-0.5">Main</div>
                  <img src="${getFullUrl(item.main_image)}" style="height:48px;width:auto;max-width:80px;object-fit:contain;border:1px solid #e5e7eb;border-radius:4px;" onerror="this.src='https://placehold.co/80x48/f0f4f8/94a3b8?text=No'" />
                </div>
              ` : ''}
              ${item.thumbnail_image ? `
                <div>
                  <div class="text-xs font-medium text-gray-600 mb-0.5">Thumb</div>
                  <img src="${getFullUrl(item.thumbnail_image)}" style="height:48px;width:auto;max-width:80px;object-fit:contain;border:1px solid #e5e7eb;border-radius:4px;" onerror="this.src='https://placehold.co/80x48/f0f4f8/94a3b8?text=No'" />
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      width: '800px',
      showCloseButton: true,
      customClass: {
        popup: "text-sm",
        htmlContainer: "text-left"
      }
    });
};

  const handleApprove = async (item: AdminWebsiteItem): Promise<void> => {
    const result = await Swal.fire({
      title: 'Approve Item?',
      html: `
        <div class="text-left">
          <p class="font-semibold">Approve "${item.itemName}" to be displayed on the website?</p>
          <p class="text-sm text-gray-600 mt-2">This will:</p>
          <ul class="text-sm text-gray-600 list-disc pl-5 mt-1">
            <li>Create a product in the ecommerce system</li>
            <li>Make it visible on the website</li>
            <li>Use the branch's vendor account</li>
          </ul>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Approve!'
    });

    if (result.isConfirmed) {
      try {
        const response = await apiClient.patch(`/pos/admin/website-items/${item.id}/approve/`, {
          website_status: 'approved'
        });

        await Swal.fire({
          title: 'Approved!',
          html: `
            <div class="text-left">
              <p class="text-green-600">${response.data.message}</p>
              ${response.data.item.linked_product_id ?
              `<p class="text-blue-600 mt-2">📦 Product ID: ${response.data.item.linked_product_id}</p>
                 <p class="text-xs text-gray-500 mt-1">Product is now live on the website</p>` :
              '<p class="text-yellow-600 mt-2">⚠️ Product creation may have issues. Please check.</p>'}
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });

        await fetchItems();
      } catch (error: any) {
        console.error('Approve error:', error);
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.error || 'Failed to approve item',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const handleReject = async (item: AdminWebsiteItem): Promise<void> => {
    const result = await Swal.fire({
      title: 'Reject Item?',
      html: `
        <p>Are you sure you want to reject "${item.itemName}"?</p>
        <p class="text-sm text-gray-600 mt-2">This item will not be displayed on the website.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Reject!'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.patch(`/pos/admin/website-items/${item.id}/approve/`, {
          website_status: 'rejected'
        });

        await Swal.fire({
          title: 'Rejected!',
          text: 'Item has been rejected.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        await fetchItems();
      } catch (error) {
        console.error('Reject error:', error);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to reject item',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const handleSync = async (item: AdminWebsiteItem): Promise<void> => {
    const result = await Swal.fire({
      title: 'Sync to Product?',
      html: `
        <p>Force sync "${item.itemName}" to product?</p>
        <p class="text-sm text-yellow-600 mt-2">⚠️ Use this only if the product wasn't created automatically.</p>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sync Now'
    });

    if (result.isConfirmed) {
      try {
        const response = await apiClient.post(`/pos/admin/website-items/${item.id}/sync/`);

        await Swal.fire({
          title: 'Synced!',
          html: `
            <p class="text-green-600">${response.data.message}</p>
            <p class="text-blue-600 mt-2">📦 Product ID: ${response.data.product_id}</p>
          `,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });

        await fetchItems();
      } catch (error: any) {
        console.error('Sync error:', error);
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.error || 'Failed to sync item',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' }
    };
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Item Verification</h1>
        <p className="text-gray-600">Review and approve items to be displayed on the website</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition ${statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex-1"></div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filter by branch name..."
              value={branchFilterInput}
              onChange={handleBranchFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
            <button
              onClick={fetchItems}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Image Display Section */}
                        <div className="relative">
                          {(() => {
                            const displayImage = getDisplayImage(item);
                            const variantImages = getAllVariantImages(item);

                            if (displayImage) {
                              return (
                                <>
                                  <img
                                    src={displayImage}
                                    alt={item.itemName}
                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f0f4f8/94a3b8?text=No+Image";
                                    }}
                                  />
                                </>
                              );
                            } else {
                              return (
                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">No img</span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{item.short_description?.substring(0, 50)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.branch_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.category || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.variants_count} variants<br />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">Stock: {item.total_stock}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{item.final_price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.website_status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        {item.website_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(item)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1 transition"
                            >
                              <FiCheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1 transition"
                            >
                              <FiXCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        {item.website_status === 'approved' && !item.linked_product && (
                          <button
                            onClick={() => handleSync(item)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                          >
                            Sync Now
                          </button>
                        )}
                        {item.website_status === 'approved' && item.linked_product && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm flex items-center gap-1">
                            <FiCheckCircle size={14} /> Live (ID: {item.linked_product})
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsiteItems;