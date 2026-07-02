import { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable";
import Swal from "sweetalert2";
import axiosInstance from "../../../api/axiosInstance";

// ✅ API Response Types - COMPLETE
interface VendorDetails {
  id: number;
  business_name: string;
  vendor_type: string;
  email: string;
  phone: string;
  owner_name: string;
}

interface BrandDetails {
  id: number;
  brand_name: string;
}

interface CategoryDetails {
  id: number;
  name: string;
}

interface SubCategoryDetails {
  id: number;
  name: string;
}

interface SubSubCategoryDetails {
  id: number;
  name: string;
}

interface ProductStock {
  id: number;
  mrp: number;
  selling_price: number;
  production_cost: number;
  discount_type: string;
  discount_value: number;
  tax: number;
  stock_quantity: number;
  color: string | null;
  size: string | null;
  barcode: string | null;
  unit: string | null;
  weight: string | null;
  maximum_order_quantity: number;
  final_price: number;
}

interface ProductGallery {
  id: number;
  image: string;
}

interface Product {
  id: number;
  vendor: number;
  vendor_details: VendorDetails;
  brand: number | null;
  brand_details: BrandDetails | null;
  product_name: string;
  sku: string;
  category: number | null;
  category_details: CategoryDetails | null;
  subcategory: number | null;
  subcategory_details: SubCategoryDetails | null;
  subsubcategory: number | null;
  subsubcategory_details: SubSubCategoryDetails | null;
  product_type: "simple" | "variant";
  keywords: string;
  short_description: string;
  full_description: string;
  product_video_url: string;
  main_image: string | null;
  thumbnail_image: string | null;
  product_condition: string;
  manufacturing_date: string | null;
  expiry_date: string | null;
  return_policy: string;
  estimated_delivery_time: string;
  free_shipping: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  gallery: ProductGallery[];
  stocks: ProductStock[];
}

const ProductVerification = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get full URL for media files
  const getFullUrl = (mediaPath: string | undefined | null) => {
    if (!mediaPath) return '#';
    
    if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
      return mediaPath;
    }
    
    // Add your API base URL - adjust this based on your backend
    const API_BASE_URL = "http://localhost:8000";
    if (mediaPath.startsWith('/media/')) {
      return `${API_BASE_URL}${mediaPath}`;
    }
    
    if (!mediaPath.includes('/')) {
      return `${API_BASE_URL}/media/${mediaPath}`;
    }
    
    return `${API_BASE_URL}${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`;
  };

  // ✅ Fetch Products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching products from API...");
      
      const response = await axiosInstance.get("ecommerce/admin/products/");
      console.log("✅ Products API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Loaded ${response.data.length} products`);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        console.error("❌ Invalid API response format:", response.data);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching products:", error);
      if (error.response?.status === 401) {
        Swal.fire({
          title: "Session Expired",
          text: "Your session has expired. Please login again.",
          icon: "warning",
          confirmButtonText: "Login Now"
        }).then(() => {
          window.location.href = '/superadmin/login';
        });
      } else {
        Swal.fire("Error", "Failed to fetch products", "error");
      }
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply Status Filter
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.status === statusFilter);
      setFilteredProducts(filtered);
    }
  }, [statusFilter, products]);

  // ✅ Apply Search Filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // If search is empty, apply only status filter
      if (statusFilter === "all") {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(product => product.status === statusFilter);
        setFilteredProducts(filtered);
      }
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = products.filter(product => 
        product.product_name.toLowerCase().includes(searchLower) ||
        (product.vendor_details?.business_name?.toLowerCase().includes(searchLower) || false) ||
        (product.vendor_details?.owner_name?.toLowerCase().includes(searchLower) || false) ||
        product.sku.toLowerCase().includes(searchLower) ||
        (product.brand_details?.brand_name?.toLowerCase().includes(searchLower) || false) ||
        (product.category_details?.name?.toLowerCase().includes(searchLower) || false) ||
        (product.subcategory_details?.name?.toLowerCase().includes(searchLower) || false) ||
        (product.subsubcategory_details?.name?.toLowerCase().includes(searchLower) || false)
      );
      
      // Apply status filter on searched results
      if (statusFilter !== "all") {
        const statusFiltered = filtered.filter(product => product.status === statusFilter);
        setFilteredProducts(statusFiltered);
      } else {
        setFilteredProducts(filtered);
      }
    }
  }, [searchTerm, statusFilter, products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ FIXED: Calculate final selling price with tax
  const calculateFinalPrice = (basePrice: any, taxRate: any) => {
    try {
      const price = parseFloat(basePrice) || 0;
      const tax = parseFloat(taxRate) || 0;
      
      if (!price || price <= 0) return 0;
      const taxAmount = (price * tax) / 100;
      return parseFloat((price + taxAmount).toFixed(2));
    } catch (error) {
      return 0;
    }
  };

  // ✅ Handle Approve Product
  const handleApprove = async (product: Product) => {
    try {
      const result = await Swal.fire({
        title: "Approve Product",
        text: `Are you sure you want to approve "${product.product_name}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await axiosInstance.patch(`ecommerce/admin/products/${product.id}/approve/`, {
          status: "approved"
        });

        await fetchProducts(); // Refresh list
        Swal.fire("Approved!", `"${product.product_name}" has been approved.`, "success");
      }
    } catch (error: any) {
      console.error("Approve error:", error);
      Swal.fire("Error", "Failed to approve product", "error");
    }
  };

  // ✅ Handle Reject Product
  const handleReject = async (product: Product) => {
    try {
      const { value: comment } = await Swal.fire({
        title: "Reject Product",
        text: "Please provide a reason for rejection:",
        input: "text",
        inputPlaceholder: "Enter rejection reason",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Reject",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value) {
            return "Please provide a rejection reason!";
          }
        },
      });

      if (comment) {
        await axiosInstance.patch(`ecommerce/admin/products/${product.id}/approve/`, {
          status: "rejected"
        });

        await fetchProducts(); // Refresh list
        Swal.fire("Rejected!", `"${product.product_name}" has been rejected.`, "success");
      }
    } catch (error: any) {
      console.error("Reject error:", error);
      Swal.fire("Error", "Failed to reject product", "error");
    }
  };

  // ✅ UPDATED: Handle View Product Details - Matching CreateVendor grid layout
  const handleView = (product: Product) => {
    const stock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
    
    Swal.fire({
      title: `<strong>${product.product_name}</strong>`,
      html: `
        <div class="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <!-- Product Header with Status -->
          <div class="border rounded-lg p-3 bg-gray-50">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Status:</span>
                <span class="w-2/3">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                    product.status === "approved" ? "bg-green-100 text-green-800" :
                    product.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }">
                    ${product.status.toUpperCase()}
                  </span>
                </span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">SKU:</span>
                <span class="w-2/3 font-medium">${product.sku}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Type:</span>
                <span class="w-2/3">${product.product_type}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Condition:</span>
                <span class="w-2/3">${product.product_condition || 'N/A'}</span>
              </div>
            </div>
          </div>

          <!-- Vendor Information -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-3">Vendor Information</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Business:</span>
                <span class="w-2/3">${product.vendor_details?.business_name || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Owner:</span>
                <span class="w-2/3">${product.vendor_details?.owner_name || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Type:</span>
                <span class="w-2/3">${product.vendor_details?.vendor_type || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Email:</span>
                <span class="w-2/3">${product.vendor_details?.email || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Phone:</span>
                <span class="w-2/3">${product.vendor_details?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <!-- Category Information -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-3">Category Information</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Brand:</span>
                <span class="w-2/3">${product.brand_details?.brand_name || "N/A"}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Category:</span>
                <span class="w-2/3">${product.category_details?.name || "N/A"}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Sub-category:</span>
                <span class="w-2/3">${product.subcategory_details?.name || "N/A"}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Sub-sub-category:</span>
                <span class="w-2/3">${product.subsubcategory_details?.name || "N/A"}</span>
              </div>
            </div>
          </div>

          <!-- Pricing & Stock Information -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-3">Pricing & Stock</h4>
            <div class="grid grid-cols-2 gap-4">
              ${stock ? `
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">MRP:</span>
                  <span class="w-2/3 font-medium">₹${stock.mrp}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Selling Price:</span>
                  <span class="w-2/3 font-medium text-green-600">₹${stock.selling_price}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Final Price:</span>
                  <span class="w-2/3 font-bold text-green-600">₹${stock.final_price}</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Stock:</span>
                  <span class="w-2/3 font-semibold ${stock.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}">
                    ${stock.stock_quantity} units
                  </span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Tax:</span>
                  <span class="w-2/3">${stock.tax}%</span>
                </div>
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Discount:</span>
                  <span class="w-2/3">${stock.discount_value} (${stock.discount_type})</span>
                </div>
              ` : `
                <div class="col-span-2 text-gray-500 text-center py-2">
                  No stock information available
                </div>
              `}
            </div>
          </div>

          <!-- Additional Product Details -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-3">Product Details</h4>
            <div class="grid grid-cols-1 gap-4">
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Short Description:</span>
                <span class="w-2/3">${product.short_description || "N/A"}</span>
              </div>
              ${product.full_description ? `
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Full Description:</span>
                  <span class="w-2/3">${product.full_description}</span>
                </div>
              ` : ''}
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Return Policy:</span>
                <span class="w-2/3">${product.return_policy || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Delivery Time:</span>
                <span class="w-2/3">${product.estimated_delivery_time || 'N/A'}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Free Shipping:</span>
                <span class="w-2/3">${product.free_shipping ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <!-- Dates Information -->
          <div class="border rounded-lg p-3">
            <h4 class="font-semibold text-gray-800 mb-3">Date Information</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Submitted:</span>
                <span class="w-2/3">${new Date(product.created_at).toLocaleString()}</span>
              </div>
              <div class="flex border-b pb-2">
                <span class="w-1/3 font-semibold text-gray-700">Last Updated:</span>
                <span class="w-2/3">${new Date(product.updated_at).toLocaleString()}</span>
              </div>
              ${product.manufacturing_date ? `
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Manufacturing:</span>
                  <span class="w-2/3">${new Date(product.manufacturing_date).toLocaleDateString()}</span>
                </div>
              ` : ''}
              ${product.expiry_date ? `
                <div class="flex border-b pb-2">
                  <span class="w-1/3 font-semibold text-gray-700">Expiry:</span>
                  <span class="w-2/3">${new Date(product.expiry_date).toLocaleDateString()}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Images Section -->
          ${product.main_image || product.gallery.length > 0 ? `
            <div class="border rounded-lg p-3">
              <h4 class="font-semibold text-gray-800 mb-3">Product Images</h4>
              <div class="grid grid-cols-2 gap-4">
                ${product.main_image ? `
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Main Image:</span>
                    <span class="w-2/3">
                      <a href="${getFullUrl(product.main_image)}" target="_blank" class="text-blue-600 hover:underline">
                        View Image
                      </a>
                    </span>
                  </div>
                ` : ''}
                ${product.thumbnail_image ? `
                  <div class="flex border-b pb-2">
                    <span class="w-1/3 font-semibold text-gray-700">Thumbnail :</span>
                    <span class="w-2/3">
                      <a href="${getFullUrl(product.thumbnail_image)}" target="_blank" class="text-blue-600 hover:underline">
                        View Image
                      </a>
                    </span>
                  </div>
                ` : ''}
                ${product.gallery.length > 0 ? `
                  <div class="col-span-2 flex border-b pb-2">
                    <span class="w-2/3 font-semibold text-gray-700">Gallery:</span>
                    <span class="w-2/3">${product.gallery.length} image(s)</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      width: '650px',
      showCloseButton: true,
      customClass: {
        popup: "text-sm",
        htmlContainer: "text-left"
      }
    });
  };

  // ✅ Table Columns - COMPLETE with all original fields
  const columns = [
    { 
      key: "id", 
      label: "ID" 
    },
    { 
      key: "vendor", 
      label: "Vendor", 
      render: (item: Product) => (
        <div>
          <div className="font-semibold">{item.vendor_details?.business_name || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            {item.vendor_details?.owner_name || 'N/A'} • {item.vendor_details?.vendor_type || 'N/A'}
          </div>
          <div className="text-xs text-blue-600">{item.vendor_details?.email || 'N/A'}</div>
        </div>
      )
    },
    { 
      key: "product_name", 
      label: "Product Name" 
    },
    { 
      key: "sku", 
      label: "SKU" 
    },
    { 
      key: "brand", 
      label: "Brand", 
      render: (item: Product) => (
        <span className="font-medium">{item.brand_details?.brand_name || "N/A"}</span>
      )
    },
    { 
      key: "category", 
      label: "Category", 
      render: (item: Product) => (
        <div>
          <div className="font-medium">{item.category_details?.name || "N/A"}</div>
          {item.subcategory_details && (
            <div className="text-xs text-gray-500">
              {item.subcategory_details.name}
              {item.subsubcategory_details && ` → ${item.subsubcategory_details.name}`}
            </div>
          )}
        </div>
      )
    },
    { 
      key: "pricing", 
      label: "Pricing", 
      render: (item: Product) => {
        const stock = item.stocks && item.stocks.length > 0 ? item.stocks[0] : null;
        
        return stock ? (
          <div className="text-xs">
            <div>MRP: ₹{stock.mrp}</div>
            <div className="text-green-600 font-semibold">SP: ₹{stock.selling_price}</div>
            <div className="text-green-600 font-bold">Final: ₹{stock.final_price}</div> 
          </div>
        ) : "N/A";
      }
    },
    { 
      key: "stock", 
      label: "Stock", 
      render: (item: Product) => {
        const stock = item.stocks && item.stocks.length > 0 ? item.stocks[0] : null;
        return stock ? (
          <div className={`text-center font-semibold ${stock.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.stock_quantity} units
          </div>
        ) : "N/A";
      }
    },
    { 
      key: "status", 
      label: "Status", 
      render: (item: Product) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.status === "approved"
              ? "bg-green-100 text-green-800"
              : item.status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {item.status.toUpperCase()}
        </span>
      )
    },
    { 
      key: "created_at", 
      label: "Submitted", 
      render: (item: Product) => new Date(item.created_at).toLocaleDateString()
    }
  ];

  // ✅ Status Filter Component - ORIGINAL
  const StatusFilter = () => (
    <div className="flex items-center space-x-4 mb-4">
      <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
      <select 
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Products ({products.length})</option>
        <option value="pending">Pending ({products.filter(p => p.status === 'pending').length})</option>
        <option value="approved">Approved ({products.filter(p => p.status === 'approved').length})</option>
        <option value="rejected">Rejected ({products.filter(p => p.status === 'rejected').length})</option>
      </select>
      
      {/* Quick Status Stats */}
      <div className="flex space-x-2 text-sm">
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          ⏳ Pending: {products.filter(p => p.status === 'pending').length}
        </span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
          ✅ Approved: {products.filter(p => p.status === 'approved').length}
        </span>
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
          ❌ Rejected: {products.filter(p => p.status === 'rejected').length}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Verification</h1>
        <p className="text-gray-600">
          Review and manage product submissions from vendors
        </p>
      </div>

      {/* Search Bar - SIMPLE AND WORKING */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by product name, vendor, business name, SKU, brand, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredProducts.length} of {products.length} products matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Status Filter */}
      <StatusFilter />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {products.length === 0 
              ? "No products found for verification" 
              : `No ${statusFilter} products found${searchTerm ? ` matching "${searchTerm}"` : ''}`
            }
          </p>
          <button 
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : (
        <DataTable
          title={`Products (${filteredProducts.length} ${statusFilter !== 'all' ? statusFilter : ''} of ${products.length} total)`}
          data={filteredProducts}
          columns={columns}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={handleView}
          showActions={true}
        />
      )}
    </div>
  );
};

export default ProductVerification;