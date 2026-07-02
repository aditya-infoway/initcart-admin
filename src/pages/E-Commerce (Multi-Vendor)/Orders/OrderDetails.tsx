import { useState, useEffect } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaDownload, FaEnvelope, FaPrint, FaShareAlt } from "react-icons/fa";
import apiClient from "../../../api/apiClient";
import { 
  FaEye, 
  FaFileInvoice, 
  FaSearch, 
  FaFilter, 
  FaShoppingCart, 
  FaChartLine,
  FaTimes,
  FaSpinner,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaCheck,
  FaTruck,
  FaTimesCircle,
  FaUndo,
  FaExclamationTriangle,
  FaFileAlt,
  FaArchive,
  FaEdit,
  FaCreditCard,
  FaRupeeSign,
  FaUser,
  FaStore,
  
} from "react-icons/fa";
import { 
  GiConfirmed,
  GiReturnArrow
} from "react-icons/gi";

// TypeScript interfaces
interface ProductOrdered {
  product: string;
  qty: number;
  rate: number;
  tax: number;
  discount: number;
  net: number;
}

interface Order {
  id: number;
  order_number: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  vendor: {
    name: string;
    store: string;
    contact: string;
  };
  products: ProductOrdered[];
  payment: {
    transactionId: string;
    method: "Credit Card" | "Debit Card" | "UPI" | "COD";
    status: "Paid" | "Pending" | "Failed";
  };
  shipping: {
    courier: string;
    trackingId: string;
    estimatedDate: string;
  };
  returnRefund: {
    status: "None" | "Requested" | "Approved" | "Rejected";
    reason?: string;
  };
  deliveryStatus: "Pending" | "Shipped" | "Delivered" | "Cancelled";
}

// Yup validation schema
const OrderStatusSchema = Yup.object().shape({
  deliveryStatus: Yup.string().required("Delivery Status is required"),
});

const OrderDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>(); // Get orderId from URL params
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  // Use orderId from params first, then from location state
  const actualOrderId = orderId || location.state?.orderId;

  // Fetch order details from API
// OrderDetails.tsx में fetchOrderDetails function update करें:

const fetchOrderDetails = async () => {
  try {
    setLoading(true);
    
    if (!actualOrderId) {
      Swal.fire({
        title: "Error",
        text: "Order ID not provided",
        icon: "error",
        timer: 2000
      }).then(() => {
        navigate("/filteredorders");
      });
      return;
    }
    
    // Method 1: Direct API call with order_number
    try {
      const response = await apiClient.get(`/ecommerce/superadmin/orders/${actualOrderId}/`);
      transformOrderData(response.data);
      return;
    } catch (directError) {
      console.log("Direct fetch failed, trying search...");
    }
    
    // Method 2: Search by order_number
    try {
      const response = await apiClient.get(`/ecommerce/superadmin/orders/?search=${actualOrderId}`);
      if (response.data.results && response.data.results.length > 0) {
        const apiOrder = response.data.results[0];
        transformOrderData(apiOrder);
        return;
      }
    } catch (searchError) {
      console.log("Search also failed");
    }
    
    // Method 3: If orderId has 'ORD' prefix, try without it
    if (actualOrderId.startsWith('ORD')) {
      const numericId = actualOrderId.replace('ORD', '');
      if (numericId) {
        try {
          const response = await apiClient.get(`/ecommerce/superadmin/orders/${numericId}/`);
          transformOrderData(response.data);
          return;
        } catch (numericError) {
          console.log("Numeric ID fetch failed");
        }
      }
    }
    
    // All methods failed, use dummy data
    setDummyOrder();
    
  } catch (error) {
    console.error("Error fetching order details:", error);
    setDummyOrder();
  } finally {
    setLoading(false);
  }
};

  const transformOrderData = (apiOrder: any) => {
    const transformedOrder: Order = {
      id: apiOrder.id,
      order_number: apiOrder.order_number || `ORD${apiOrder.id}`,
      customer: {
        name: apiOrder.billing_name || "Customer",
        email: apiOrder.billing_email || "N/A",
        phone: apiOrder.billing_phone || "N/A",
        address: `${apiOrder.billing_address || ""}, ${apiOrder.billing_city || ""}, ${apiOrder.billing_state || ""} - ${apiOrder.billing_pincode || ""}`
      },
      vendor: getVendorInfo(apiOrder),
      products: getProductsInfo(apiOrder),
      payment: {
        transactionId: apiOrder.razorpay_payment_id || apiOrder.razorpay_order_id || "N/A",
        method: apiOrder.payment_method === "razorpay" ? "UPI" : "COD",
        status: apiOrder.payment_status === "completed" ? "Paid" : 
                apiOrder.payment_status === "pending" ? "Pending" : "Failed"
      },
      shipping: {
        courier: "BlueDart Express",
        trackingId: `TRK${apiOrder.order_number?.slice(-8) || "12345678"}`,
        estimatedDate: calculateEstimatedDate(apiOrder.created_at)
      },
      returnRefund: {
        status: "None",
        reason: ""
      },
      deliveryStatus: mapDeliveryStatus(apiOrder.order_status)
    };
    
    setOrder(transformedOrder);
  };

  const setDummyOrder = () => {
    const dummyOrder: Order = {
      id: parseInt(actualOrderId?.replace('ORD', '') || '1'),
      order_number: actualOrderId || "ORD001",
      customer: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "9876543210",
        address: "123 Main St, Mumbai, MH 400001",
      },
      vendor: {
        name: "Elite Electronics",
        store: "Elite Store",
        contact: "elite@gmail.com",
      },
      products: [
        {
          product: "Smartphone X",
          qty: 1,
          rate: 25000,
          tax: 18,
          discount: 10,
          net: 25000 * (1 - 0.1) * (1 + 0.18),
        },
        {
          product: "Wireless Earbuds",
          qty: 2,
          rate: 2000,
          tax: 18,
          discount: 5,
          net: 4000 * (1 - 0.05) * (1 + 0.18),
        },
      ],
      payment: {
        transactionId: `TXN${actualOrderId?.slice(-6) || "123456"}`,
        method: "UPI",
        status: "Paid",
      },
      shipping: {
        courier: "BlueDart",
        trackingId: `TRACK${actualOrderId?.slice(-6) || "123"}`,
        estimatedDate: "2025-10-20",
      },
      returnRefund: {
        status: "None",
        reason: "",
      },
      deliveryStatus: "Shipped",
    };
    
    setOrder(dummyOrder);
  };

  // Helper functions
  const getVendorInfo = (apiOrder: any) => {
    if (apiOrder.items && apiOrder.items.length > 0) {
      const vendor = apiOrder.items[0].vendor_details || apiOrder.items[0].vendor;
      return {
        name: vendor?.owner_name || "Vendor",
        store: vendor?.business_name || "Store",
        contact: vendor?.email || "contact@store.com"
      };
    }
    return {
      name: "Unknown Vendor",
      store: "Unknown Store",
      contact: "N/A"
    };
  };

  const getProductsInfo = (apiOrder: any): ProductOrdered[] => {
    if (!apiOrder.items || apiOrder.items.length === 0) {
      return [{
        product: "Product Name",
        qty: 1,
        rate: 0,
        tax: 0,
        discount: 0,
        net: 0
      }];
    }
    
    return apiOrder.items.map((item: any) => ({
      product: item.product_name || "Product",
      qty: item.quantity || 1,
      rate: parseFloat(item.unit_price) || 0,
      tax: parseFloat(item.tax_rate) || 0,
      discount: parseFloat(item.discount_amount) || 0,
      net: parseFloat(item.total_price) || 0
    }));
  };

  const calculateEstimatedDate = (createdDate: string): string => {
    const date = new Date(createdDate);
    date.setDate(date.getDate() + 5); // Add 5 days for delivery
    return date.toISOString().split('T')[0];
  };

  const mapDeliveryStatus = (apiStatus: string): "Pending" | "Shipped" | "Delivered" | "Cancelled" => {
    const statusMap: {[key: string]: "Pending" | "Shipped" | "Delivered" | "Cancelled"} = {
      "pending": "Pending",
      "confirmed": "Pending",
      "processing": "Pending",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      "refunded": "Cancelled"
    };
    
    return statusMap[apiStatus] || "Pending";
  };

  // Update order status in API
  const updateOrderStatusAPI = async (newStatus: string) => {
    if (!order) return false;
    
    try {
      await apiClient.post(`/ecommerce/superadmin/orders/${order.id}/update_status/`, {
        order_status: newStatus.toLowerCase()
      });
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  };

  // CORRECT: useEffect at top level
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      Swal.fire({
        title: "Error",
        text: "Order ID not found in URL",
        icon: "error",
        timer: 2000
      }).then(() => {
        navigate("/filteredorders"); // Back to orders list
      });
    }
  }, [orderId]);

  const handleInvoice = () => {
    if (!order) return;
    
    Swal.fire({
      title: "Invoice Options",
      html: `
        <div class="text-left p-3">
          <p class="mb-2"><strong>Order #:</strong> ${order.order_number}</p>
          <p class="mb-2"><strong>Customer:</strong> ${order.customer.name}</p>
          <p class="mb-2"><strong>Amount:</strong> ₹${order.products.reduce((sum, p) => sum + p.net, 0).toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.deliveryStatus}</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      cancelButtonText: "Print",
      showDenyButton: true,
      denyButtonText: "Email",
      confirmButtonColor: "#1e3a8a",
      cancelButtonColor: "#10b981",
      denyButtonColor: "#8b5cf6",
    }).then((result) => {
      if (result.isConfirmed) {
        // Download invoice
        window.open(`${apiClient.defaults.baseURL}ecommerce/orders/${order.id}/invoice/`, '_blank');
      } else if (result.isDenied) {
        // Email invoice
        Swal.fire({
          title: "Email Invoice",
          text: `Invoice will be sent to ${order.customer.email}`,
          icon: "success",
          timer: 2000
        });
      }
    });
  };

  const handleRefund = () => {
    if (!order) return;
    
    Swal.fire({
      title: "Initiate Refund",
      text: `Are you sure you want to initiate a refund for Order #${order.order_number}?`,
      input: "text",
      inputPlaceholder: "Enter refund reason (optional)",
      showCancelButton: true,
      confirmButtonColor: "#1e3a8a",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, refund it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await updateOrderStatusAPI("cancelled");
        
        if (success && order) {
          setOrder({
            ...order,
            deliveryStatus: "Cancelled",
            returnRefund: { status: "Approved", reason: result.value || "No reason provided" },
          });
          Swal.fire({
            title: "Refund Initiated!",
            text: `Refund for Order #${order.order_number} has been initiated.`,
            icon: "success",
            confirmButtonColor: "#1e3a8a",
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to initiate refund",
            icon: "error",
          });
        }
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      deliveryStatus: order?.deliveryStatus || "Pending",
    },
    enableReinitialize: true,
    validationSchema: OrderStatusSchema,
    onSubmit: async (values) => {
      if (!order) return;
      
      const statusMap: {[key: string]: string} = {
        "Pending": "pending",
        "Shipped": "shipped",
        "Delivered": "delivered",
        "Cancelled": "cancelled"
      };
      
      const apiStatus = statusMap[values.deliveryStatus];
      const success = await updateOrderStatusAPI(apiStatus);
      
      if (success) {
        setOrder({ ...order, deliveryStatus: values.deliveryStatus as Order["deliveryStatus"] });
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Order #${order.order_number} status has been updated to ${values.deliveryStatus}!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update order status",
        });
      }
      
      setModalOpen(false);
    },
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Delivered": return "text-green-600 bg-green-50";
      case "Shipped": return "text-blue-600 bg-blue-50";
      case "Pending": return "text-yellow-600 bg-yellow-50";
      case "Cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          
          <p className="text-gray-600 text-lg font-medium mb-4">Order not found</p>
          <button
            onClick={() => navigate("/filteredorders")}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
          >
            Go Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = order.products.reduce((sum, p) => sum + p.net, 0);

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header with back button */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/filteredorders")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FaArrowLeft /> Back to Orders
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Order Details #{order.order_number}
            </h2>
            <div className="flex items-center gap-4 mt-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.deliveryStatus)}`}>
                {order.deliveryStatus}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{order.payment.status}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">Total: ₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleInvoice}
              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md flex items-center gap-2"
            >
              <FaDownload /> Invoice
            </button>
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md flex items-center gap-2"
            >
              <FaShareAlt /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Customer & Vendor Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Customer Information</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUser></FaUser>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold text-gray-800">{order.customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-lg font-semibold text-gray-800">{order.customer.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg font-semibold text-gray-800">{order.customer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Shipping Address</label>
                  <p className="text-lg font-semibold text-gray-800">{order.customer.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Vendor Information</h3>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaStore></FaStore>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vendor Name</label>
                  <p className="text-lg font-semibold text-gray-800">{order.vendor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Store Name</label>
                  <p className="text-lg font-semibold text-gray-800">{order.vendor.store}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Email</label>
                  <p className="text-lg font-semibold text-gray-800">{order.vendor.contact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-lg font-semibold text-green-600">Active ✓</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Ordered Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Products Ordered</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <FaArchive></FaArchive>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="p-4 text-left font-semibold text-gray-700 rounded-l-xl">Product</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Qty</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Rate</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Tax</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Discount</th>
                    <th className="p-4 text-left font-semibold text-gray-700 rounded-r-xl">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50">
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{product.product}</div>
                      </td>
                      <td className="p-4">
                        <div className="bg-gray-100 w-10 h-10 flex items-center justify-center rounded-lg font-semibold">
                          {product.qty}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">₹{product.rate.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                          {product.tax}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">
                          {product.discount}%
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">₹{product.net.toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <td colSpan={5} className="p-4 text-right font-bold text-gray-700">Total Amount</td>
                    <td className="p-4 font-bold text-2xl text-gray-900">₹{totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Payment, Shipping, Actions */}
        <div className="space-y-8">
          {/* Payment Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Payment Information</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCreditCard></FaCreditCard>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                <p className="text-lg font-semibold text-gray-800">{order.payment.transactionId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p className="text-lg font-semibold text-gray-800">{order.payment.method}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  order.payment.status === "Paid" 
                    ? "bg-green-50 text-green-600" 
                    : order.payment.status === "Pending"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-red-50 text-red-600"
                }`}>
                  {order.payment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Shipping Information</h3>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaShoppingCart></FaShoppingCart>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Courier Partner</label>
                <p className="text-lg font-semibold text-gray-800">{order.shipping.courier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tracking ID</label>
                <p className="text-lg font-semibold text-gray-800">{order.shipping.trackingId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estimated Delivery</label>
                <p className="text-lg font-semibold text-gray-800">{order.shipping.estimatedDate}</p>
              </div>
            </div>
          </div>

          {/* Return/Refund Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Return / Refund</h3>
              <div className="p-2 bg-red-100 rounded-lg">
              <GiReturnArrow></GiReturnArrow>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  order.returnRefund.status === "Approved" 
                    ? "bg-green-50 text-green-600" 
                    : order.returnRefund.status === "Rejected"
                    ? "bg-red-50 text-red-600"
                    : order.returnRefund.status === "Requested"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-gray-50 text-gray-600"
                }`}>
                  {order.returnRefund.status}
                </span>
              </div>
              {order.returnRefund.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <p className="text-gray-800">{order.returnRefund.reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              >
                Update Order Status
              </button>
              {order.deliveryStatus !== "Cancelled" && (
                <button
                  onClick={handleRefund}
                  className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                >
                  Initiate Refund
                </button>
              )}
              <button
                onClick={handleInvoice}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
              >
                <FaPrint /> Print Invoice
              </button>
              <button
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
              >
                <FaEnvelope /> Email Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Update Order Status</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="deliveryStatus"
                  value={formik.values.deliveryStatus}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 ${
                    formik.touched.deliveryStatus && formik.errors.deliveryStatus
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {formik.touched.deliveryStatus && formik.errors.deliveryStatus && (
                  <div className="text-red-500 text-sm mt-2">{formik.errors.deliveryStatus}</div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add some custom styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;