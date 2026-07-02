// src/components/admin/campaigns/VendorParticipationApproval.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { campaignApi } from '../../../api/campaignApi';

// TypeScript interfaces for the component
interface CampaignWithDetails {
  id: number;
  campaign_name: string;
  campaign_type: string;
  start_datetime: string;
  end_datetime: string;
  duration: string;
  max_products_per_vendor: number;
  categories_details?: { id: number; name: string }[];
}

interface VendorWithDetails {
  id: number;
  business_name: string;
  email: string;
  phone: string;
}

interface CampaignProductWithDetails {
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
}

interface CampaignParticipationWithDetails {
  id: number;
  campaign_details: CampaignWithDetails;
  vendor_details: VendorWithDetails;
  campaign_products: CampaignProductWithDetails[];
  total_products: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_at: string;
}

const VendorParticipationApproval: React.FC = () => {
  const { participationId } = useParams<{ participationId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [participation, setParticipation] = useState<CampaignParticipationWithDetails | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch participation details
  useEffect(() => {
    if (participationId) {
      fetchParticipationDetails();
    }
  }, [participationId]);

  const fetchParticipationDetails = async () => {
    try {
      setLoading(true);

      const response = await campaignApi.getParticipationDetail(parseInt(participationId!));

      setParticipation(response.data);
    } catch (error: any) {
      console.error('Error fetching participation:', error);

      // Check for authentication error
      if (error.response?.status === 401) {
        handleUnauthorizedError();
        return;
      }

      const errorMessage = error.response?.data?.error || error.message || 'Failed to load participation details';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthorizedError = () => {
    Swal.fire({
      title: 'Session Expired',
      text: 'Your session has expired. Please login again.',
      icon: 'warning',
      confirmButtonText: 'Login',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear storage
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('email');
        localStorage.removeItem('role');

        // Redirect to login
        window.location.href = '/superadmin/login';
      }
    });
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (!participation) return;

    const pendingProductIds = participation.campaign_products
      .filter(p => p.status === 'Pending')
      .map(p => p.id);

    if (selectedProducts.length === pendingProductIds.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(pendingProductIds);
    }
  };

  const handleApproveSelected = async () => {
    if (selectedProducts.length === 0) {
      Swal.fire('Warning', 'Please select products to approve', 'warning');
      return;
    }

    Swal.fire({
      title: 'Approve Selected Products',
      text: `Are you sure you want to approve ${selectedProducts.length} product(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve them!',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await campaignApi.approveProductBulk(
            parseInt(participationId!),
            selectedProducts
          );
          return response.data;
        } catch (error: any) {
          if (error.response?.status === 401) {
            handleUnauthorizedError();
            throw error;
          }
          const errorMessage = error.response?.data?.error || error.message || 'Failed to approve products';
          Swal.showValidationMessage(errorMessage);
          throw error;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: ` products have been approved.`, // या जो भी variable आप use कर रहे हैं
        });

        // Refresh data
        fetchParticipationDetails();
        setSelectedProducts([]);
      }
    });
  };

  const handleRejectSelected = async () => {
    if (selectedProducts.length === 0) {
      Swal.fire('Warning', 'Please select products to reject', 'warning');
      return;
    }

    const { value: reason } = await Swal.fire({
      title: 'Reject Selected Products',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection...',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a rejection reason';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel'
    });

    if (reason) {
      try {
        setActionLoading(true);

        const response = await campaignApi.rejectProductBulk(
          parseInt(participationId!),
          selectedProducts,
          reason
        );

        Swal.fire(
          'Rejected!',
          `${response.data.rejected_count} products have been rejected.`,
          'success'
        );

        // Refresh data
        fetchParticipationDetails();
        setSelectedProducts([]);
        setRejectionReason('');
      } catch (error: any) {
        console.error('Error rejecting products:', error);
        if (error.response?.status === 401) {
          handleUnauthorizedError();
          return;
        }
        const errorMessage = error.response?.data?.error || error.message || 'Failed to reject products';
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleApproveParticipation = async () => {
    if (!participation) return;

    // Check if there are approved products
    const approvedProducts = participation.campaign_products.filter(p => p.status === 'Approved');
    if (approvedProducts.length === 0) {
      Swal.fire('Warning', 'Cannot approve participation without any approved products', 'warning');
      return;
    }

    Swal.fire({
      title: 'Approve Participation',
      text: `Approve ${participation.vendor_details.business_name}'s participation in "${participation.campaign_details.campaign_name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve!',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await campaignApi.approveParticipation(parseInt(participationId!));
          return true;
        } catch (error: any) {
          if (error.response?.status === 401) {
            handleUnauthorizedError();
            throw error;
          }
          const errorMessage = error.response?.data?.error || error.message || 'Failed to approve participation';
          Swal.showValidationMessage(errorMessage);
          throw error;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Approved!',
          'Participation has been approved successfully.',
          'success'
        );

        // Refresh data
        fetchParticipationDetails();
      }
    });
  };

  const handleRejectParticipation = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Participation',
      text: 'Please provide a reason for rejection:',
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection...',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a rejection reason';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel'
    });

    if (reason) {
      try {
        setActionLoading(true);

        await campaignApi.rejectParticipation(parseInt(participationId!), reason);

        Swal.fire(
          'Rejected!',
          'Participation has been rejected.',
          'success'
        );

        // Refresh data
        fetchParticipationDetails();
      } catch (error: any) {
        console.error('Error rejecting participation:', error);
        if (error.response?.status === 401) {
          handleUnauthorizedError();
          return;
        }
        const errorMessage = error.response?.data?.error || error.message || 'Failed to reject participation';
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleApproveAllWithParticipation = async () => {
    if (!participation) return;

    const pendingProducts = participation.campaign_products.filter(p => p.status === 'Pending');
    if (pendingProducts.length === 0) {
      Swal.fire('Info', 'No pending products to approve', 'info');
      return;
    }

    Swal.fire({
      title: 'Approve All & Finalize',
      text: `Approve all ${pendingProducts.length} pending products and finalize participation?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve all!',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await campaignApi.approveWithProducts(parseInt(participationId!));
          return response.data;
        } catch (error: any) {
          if (error.response?.status === 401) {
            handleUnauthorizedError();
            throw error;
          }
          const errorMessage = error.response?.data?.error || error.message || 'Failed to approve all products';
          Swal.showValidationMessage(errorMessage);
          throw error;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Operation completed successfully.', // या कोई specific message
        });

        // Refresh data
        fetchParticipationDetails();
        setSelectedProducts([]);
      }
    });
  };

  const handleApproveSingleProduct = async (productId: number) => {
    try {
      await campaignApi.approveProduct(productId);
      Swal.fire('Approved!', 'Product has been approved.', 'success');
      fetchParticipationDetails();
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleUnauthorizedError();
        return;
      }
      const errorMessage = error.response?.data?.error || error.message || 'Failed to approve product';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const handleRejectSingleProduct = async (productId: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Product',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection...',
      inputValidator: (value) => {
        if (!value) return 'Please provide a reason';
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel'
    });

    if (reason) {
      try {
        await campaignApi.rejectProduct(productId, reason);
        Swal.fire('Rejected!', 'Product has been rejected.', 'success');
        fetchParticipationDetails();
      } catch (error: any) {
        if (error.response?.status === 401) {
          handleUnauthorizedError();
          return;
        }
        const errorMessage = error.response?.data?.error || error.message || 'Failed to reject product';
        Swal.fire('Error', errorMessage, 'error');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Active': 'bg-blue-100 text-blue-800',
      'Draft': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
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

  if (!participation) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Participation not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested participation could not be found.</p>
        <button
          onClick={() => navigate('/admin/campaigns/participations')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Participations
        </button>
      </div>
    );
  }

  const pendingProducts = participation.campaign_products.filter(p => p.status === 'Pending');
  const approvedProducts = participation.campaign_products.filter(p => p.status === 'Approved');
  const rejectedProducts = participation.campaign_products.filter(p => p.status === 'Rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {participation.campaign_details.campaign_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {participation.campaign_details.campaign_type} •
              Applied on: {new Date(participation.applied_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            {getStatusBadge(participation.status)}
            <p className="text-sm text-gray-500 mt-1">
              {approvedProducts.length} / {participation.total_products} products approved
            </p>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Vendor Information</h3>
            <div className="mt-2 space-y-1">
              <p><span className="font-medium">Business:</span> {participation.vendor_details.business_name}</p>
              <p><span className="font-medium">Email:</span> {participation.vendor_details.email}</p>
              <p><span className="font-medium">Phone:</span> {participation.vendor_details.phone}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Campaign Information</h3>
            <div className="mt-2 space-y-1">
              <p><span className="font-medium">Type:</span> {participation.campaign_details.campaign_type}</p>
              <p><span className="font-medium">Duration:</span> {participation.campaign_details.duration}</p>
              <p><span className="font-medium">Max Products:</span> {participation.campaign_details.max_products_per_vendor}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {participation.status === 'Pending' && (
            <>
              <button
                onClick={handleApproveParticipation}
                disabled={actionLoading || approvedProducts.length === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${approvedProducts.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Approve Participation
              </button>

              <button
                onClick={handleApproveAllWithParticipation}
                disabled={actionLoading || pendingProducts.length === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${pendingProducts.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Approve All & Finalize
              </button>

              <button
                onClick={handleRejectParticipation}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Reject Participation
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/admin/campaigns/participations')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Products ({participation.total_products})</h2>

          {pendingProducts.length > 0 && participation.status === 'Pending' && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedProducts.length === pendingProducts.length ? 'Deselect All' : 'Select All Pending'}
              </button>

              {selectedProducts.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleApproveSelected}
                    disabled={actionLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Approve Selected ({selectedProducts.length})
                  </button>
                  <button
                    onClick={handleRejectSelected}
                    disabled={actionLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Reject Selected ({selectedProducts.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">{approvedProducts.length}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-800">Approved</h3>
                <p className="text-sm text-green-600">Ready to go live</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">{pendingProducts.length}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
                <p className="text-sm text-yellow-600">Awaiting approval</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold">{rejectedProducts.length}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-800">Rejected</h3>
                <p className="text-sm text-red-600">Not approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {pendingProducts.length > 0 && participation.status === 'Pending' && (
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === pendingProducts.length && pendingProducts.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                )}
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Price
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal Price
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
              {participation.campaign_products.map((product) => (
                <tr key={product.id}>
                  {pendingProducts.length > 0 && participation.status === 'Pending' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.status === 'Pending' && (
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleProductSelect(product.id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.product_details.main_image && (
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.product_details.main_image}
                            alt={product.product_details.product_name}
                          />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.product_details.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.product_details.category?.name || 'No category'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.original_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      ₹{product.final_price.toFixed(2)}
                    </div>
                    {product.discount_percentage && (
                      <div className="text-xs text-gray-500">
                        {product.discount_percentage}% discount
                      </div>
                    )}
                    {product.special_price && (
                      <div className="text-xs text-gray-500">
                        Special price
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {product.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveSingleProduct(product.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectSingleProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {product.status === 'Rejected' && product.rejection_reason && (
                      <div className="text-xs text-gray-500" title={product.rejection_reason}>
                        Reason: {product.rejection_reason.substring(0, 50)}...
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {participation.campaign_products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No products added</h3>
            <p className="mt-1 text-sm text-gray-500">This vendor hasn't added any products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorParticipationApproval;