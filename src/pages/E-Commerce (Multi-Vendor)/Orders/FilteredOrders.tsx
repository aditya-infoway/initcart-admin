import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaFileInvoice,
  FaEnvelope,
  FaSearch,
  FaFilter,
  FaShoppingCart,
  FaChartLine,
  FaSpinner,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,

} from "react-icons/fa";
import {
  MdCancel
} from "react-icons/md";
import {
  HiClipboardCheck,

} from "react-icons/hi";
import {
  GiReturnArrow
} from "react-icons/gi";
import {
  TbTruckDelivery
} from "react-icons/tb";
import apiClient from "../../../api/apiClient";

interface Order {
  sl: number;
  orderId: string;
  orderDate: string;
  customerInfo: string;
  store: string;
  totalAmount: string;
  orderStatus: "Pending" | "Confirmed" | "Packaging" | "Out for Delivery" | "Delivered" | "Canceled" | "Returned" | "Failed to Deliver";
}

const FilteredOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState({
    total: 195,
    pending: 58,
    confirmed: 21,
    packaging: 9,
    outForDelivery: 8,
    delivered: 81,
    canceled: 9,
    returned: 4,
    failedToDeliver: 5
  });

  const [activeFilter, setActiveFilter] = useState<string>("All Orders");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const changePage = (newPage:number) => {
  setPage(newPage);
  fetchOrders(searchTerm, newPage);
};
  const navigate = useNavigate();

  // Focus search input on component mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch dashboard stats from API
  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get(
        "/ecommerce/superadmin/orders/dashboard_stats/",
        { timeout: 10000 }
      );

      if (response.data.success && response.data.data) {
        const stats = response.data.data;

        const newStats = {
          total: stats.total_orders || 0,
          pending: stats.status_counts?.pending || 0,
          confirmed: stats.status_counts?.confirmed || 0,
          packaging: stats.status_counts?.processing || 0,
          outForDelivery: stats.status_counts?.shipped || 0,
          delivered: stats.status_counts?.delivered || 0,
          canceled: stats.status_counts?.cancelled || 0,
          returned: stats.status_counts?.refunded || 0,
          failedToDeliver: 0
        };

        setOrderStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

const fetchOrders = async (searchValue?: string, pageNumber: number = page) => {
  setLoading(true);
  try {
    const params: any = {
      page: pageNumber
    };

    const statusMap: { [key: string]: string } = {
      "Pending": "pending",
      "Confirmed": "confirmed",
      "Packaging": "processing",
      "Out for Delivery": "shipped",
      "Delivered": "delivered",
      "Canceled": "cancelled",
      "Returned": "refunded"
    };

    if (activeFilter !== "All Orders") {
      params.order_status = statusMap[activeFilter] || activeFilter.toLowerCase();
    }

    const searchToUse = searchValue !== undefined ? searchValue : searchTerm;
    if (searchToUse) {
      params.search = searchToUse;
    }

    const response = await apiClient.get(
      "/ecommerce/superadmin/orders/",
      { params }
    );

    if (response.data.results || response.data) {

      // total count
      if (response.data.count) {
        setTotalOrders(response.data.count);
      }

      const apiOrders = response.data.results || response.data;

      const transformedOrders: Order[] = apiOrders.map((apiOrder: any, index: number) => {
        const statusMapReverse: { [key: string]: Order["orderStatus"] } = {
          "pending": "Pending",
          "confirmed": "Confirmed",
          "processing": "Packaging",
          "shipped": "Out for Delivery",
          "delivered": "Delivered",
          "cancelled": "Canceled",
          "refunded": "Returned"
        };

        return {
          sl: (pageNumber - 1) * 20 + index + 1,
          orderId: apiOrder.order_number || `ORD${apiOrder.id}`,
          orderDate: formatDate(apiOrder.created_at),
          customerInfo: `${apiOrder.billing_name || "Customer"} ${apiOrder.billing_phone ? `(${apiOrder.billing_phone})` : ""}`,
          store: apiOrder.vendor_name || "Vendor Store",
          totalAmount: formatAmount(apiOrder.final_amount, apiOrder.payment_status),
          orderStatus: statusMapReverse[apiOrder.order_status] || "Pending"
        };
      });

      setOrders(transformedOrders);
    }

  } catch (error) {
    console.error("Error fetching orders:", error);
    Swal.fire({
      title: "Error",
      text: "Failed to load orders from server",
      icon: "error",
      timer: 2000
    });
  } finally {
    setLoading(false);
    setSearchLoading(false);
  }
};

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Helper function to format amount
  const formatAmount = (amount: string, paymentStatus: string): string => {
    const numericAmount = Number(amount || 0);

    return `${currencyFormatter.format(numericAmount)} ${paymentStatus === "completed" ? "Paid" : "Unpaid"
      }`;
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchOrders(searchTerm);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm]);
  // Initial load
  useEffect(() => {
    fetchDashboardStats();
    fetchOrders();
  }, [activeFilter]); // Active filter change par search hoga

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      setSearchLoading(true);
      fetchOrders(searchTerm);
    }
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    fetchOrders("");
  };

  const handleView = (item: Order) => {
    navigate(`/admin/orders/${item.orderId}`);
  };

  const handleInvoice = (item: Order) => {
    Swal.fire({
      title: "Generate Invoice",
      html: `
        <div class="text-left p-2">
          <p class="mb-2"><strong>Order ID:</strong> ${item.orderId}</p>
          <p class="mb-2"><strong>Customer:</strong> ${item.customerInfo}</p>
          <p class="mb-2"><strong>Amount:</strong> ${item.totalAmount}</p>
          <p><strong>Status:</strong> ${item.orderStatus}</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1e3a8a",
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(`${apiClient.defaults.baseURL}ecommerce/orders/${item.orderId}/invoice/`, '_blank');
      }
    });
  };

  const handleRefresh = () => {
    fetchDashboardStats();
    fetchOrders();
    Swal.fire({
      title: "Refreshing...",
      text: "Fetching latest orders",
      icon: "info",
      timer: 1000,
      showConfirmButton: false
    });
  };

  const getStatusColor = (status: string, isText = true) => {
    switch (status) {
      case "Delivered":
        return isText ? "text-green-700" : "bg-green-50 border border-green-200";
      case "Pending":
        return isText ? "text-yellow-600" : "bg-yellow-50 border border-yellow-200";
      case "Confirmed":
        return isText ? "text-blue-700" : "bg-blue-50 border border-blue-200";
      case "Packaging":
        return isText ? "text-purple-700" : "bg-purple-50 border border-purple-200";
      case "Out for Delivery":
        return isText ? "text-indigo-700" : "bg-indigo-50 border border-indigo-200";
      case "Canceled":
        return isText ? "text-red-700" : "bg-red-50 border border-red-200";
      case "Failed to Deliver":
        return isText ? "text-red-600" : "bg-red-50 border border-red-200";
      case "Returned":
        return isText ? "text-orange-700" : "bg-orange-50 border border-orange-200";
      default:
        return isText ? "text-gray-700" : "bg-gray-50 border border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <FaCheckCircle className="text-green-600" />;
      case "Pending": return <FaClock className="text-yellow-600" />;
      case "Confirmed": return <HiClipboardCheck className="text-blue-600" />;
      case "Packaging": return <FaBox className="text-purple-600" />;
      case "Out for Delivery": return <TbTruckDelivery className="text-indigo-600" />;
      case "Canceled": return <MdCancel className="text-red-600" />;
      case "Returned": return <GiReturnArrow className="text-orange-600" />;
      case "Failed to Deliver": return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaFileAlt className="text-gray-600" />;
    }
  };
  const filteredOrders = orders;

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header - More Attractive */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <FaShoppingCart className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                All Orders
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FaChartLine /> Refresh
          </button>
        </div>

        {/* Order Summary Stats - More Attractive */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-4 border border-blue-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{orderStats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaShoppingCart className="text-blue-600" />
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-transparent rounded-full mt-2"></div>
          </div>

          {[
            { label: "Pending", count: orderStats.pending, color: "from-yellow-500 to-amber-500", bg: "bg-yellow-100" },
            { label: "Confirmed", count: orderStats.confirmed, color: "from-blue-500 to-cyan-500", bg: "bg-blue-100" },
            { label: "Packaging", count: orderStats.packaging, color: "from-purple-500 to-pink-500", bg: "bg-purple-100" },
            { label: "Out for Delivery", count: orderStats.outForDelivery, color: "from-indigo-500 to-blue-500", bg: "bg-indigo-100" },
            { label: "Delivered", count: orderStats.delivered, color: "from-green-500 to-emerald-500", bg: "bg-green-100" },
            { label: "Canceled", count: orderStats.canceled, color: "from-red-500 to-rose-500", bg: "bg-red-100" },
            { label: "Returned", count: orderStats.returned, color: "from-orange-500 to-amber-500", bg: "bg-orange-100" },
            { label: "Failed", count: orderStats.failedToDeliver, color: "from-gray-500 to-slate-500", bg: "bg-gray-100" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setActiveFilter(stat.label)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.count}</p>
                </div>
                <div className={`p-2 ${stat.bg} rounded-lg`}>
                  <div className={`text-lg ${getStatusColor(stat.label, true).replace("text-", "")}`}>
                    {getStatusIcon(stat.label)}
                  </div>
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r ${stat.color} rounded-full mt-2`}></div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>

      {/* Order List Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Order List</h2>
            <p className="text-gray-500 text-sm mt-1">Showing {filteredOrders.length} orders</p>
          </div>

          {/* Search Bar - Fixed with Search Button */}
          <div className="relative w-full md:w-96">
            <div className="flex items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                  placeholder="Search orders by ID, customer, store..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchClick();
                  }}
                  disabled={loading}
                  onFocus={(e) => e.target.select()}
                />
                {searchTerm ? (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >

                  </button>
                ) : null}
              </div>
              <button
                onClick={handleSearchClick}
                disabled={loading || searchLoading}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-r-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSearch />
                )}
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Filter Buttons - More Attractive */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveFilter("All Orders")}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeFilter === "All Orders"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FaFilter /> All Orders ({orderStats.total})
          </button>

          {[
            { label: "Pending", count: orderStats.pending },
            { label: "Confirmed", count: orderStats.confirmed },
            { label: "Packaging", count: orderStats.packaging },
            { label: "Out for Delivery", count: orderStats.outForDelivery },
            { label: "Delivered", count: orderStats.delivered },
            { label: "Canceled", count: orderStats.canceled },
            { label: "Returned", count: orderStats.returned },
            { label: "Failed to Deliver", count: orderStats.failedToDeliver },
          ].map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeFilter === filter.label
                ? `${getStatusColor(filter.label, false)} ${getStatusColor(filter.label)} font-semibold border-2`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {getStatusIcon(filter.label)}
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading orders...</p>
            <p className="text-gray-400 text-sm">Please wait while we fetch your data</p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SL</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId + order.sl} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full">
                        {order.sl}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-2">

                        {order.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        {order.orderDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">

                        {order.customerInfo.split('+')[0]}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">

                        {order.customerInfo.includes('+') ? order.customerInfo.split('+')[1] : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">

                        {order.store}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold">
                        <span className="text-gray-900 flex items-center gap-1">

                          {order.totalAmount.split(" ")[0]}
                        </span>
                        <div className={`text-xs font-medium ${order.totalAmount.includes("Paid") ? "text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block mt-1" : "text-red-600 bg-red-50 px-2 py-1 rounded-full inline-block mt-1"}`}>

                          {order.totalAmount.includes("Paid") ? "Paid" : "Unpaid"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus, false)} ${getStatusColor(order.orderStatus)} flex items-center gap-2 w-fit`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleView(order)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110"
                          title="View Order Details"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleInvoice(order)}
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Generate Invoice"
                        >
                          <FaFileInvoice className="text-lg" />
                        </button>
                        <button
                          className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Send Email"
                        >
                          <FaEnvelope className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center items-center gap-4 mt-6">

            <button
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded"
            >
            Prev    
            </button>

            <span>
            Page {page} | Total Orders: {totalOrders}
            </span>

            <button
            onClick={() => changePage(page + 1)}
            className="px-4 py-2 bg-gray-200 rounded"
            >
            Next
            </button>

            </div>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <FaBox className="w-24 h-24 mx-auto" />
            </div>
            <p className="text-gray-600 text-lg font-medium">No orders found</p>
            <p className="text-gray-400 mt-2">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : activeFilter !== "All Orders"
                  ? `No ${activeFilter} orders found`
                  : "No orders available"}
            </p>
            {(searchTerm || activeFilter !== "All Orders") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("All Orders");
                  fetchOrders("");
                }}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add missing icon imports
import { FaCalendarAlt, FaPhoneAlt } from "react-icons/fa";

export default FilteredOrders;

function setTotalOrders(count: any) {
  throw new Error("Function not implemented.");
}
