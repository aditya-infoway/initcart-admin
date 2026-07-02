import { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable";
import apiClient from "../../../api/apiClient";
import Swal from "sweetalert2";

interface LoyaltyTransaction {
  id: number;
  customer: {
    id: number;
    username: string;
    email: string;
  };
  points: number;
  transaction_type: "earned" | "used" | "bonus" | "expired" | "adjusted";
  config: {
    id: number;
    name: string;
  } | null;
  order_id: number | null;
  order_number: string | null;
  description: string;
  balance_after: number;
  created_at: string;
}

interface CsvRow {
  Date: string;
  Time: string;
  Customer: string;
  Email: string;
  Type: "earned" | "used" | "bonus" | "expired" | "adjusted";
  Points: number;
  'Order Number': string;
  Description: string;
  'Balance After': number;
}

const LoyaltyPointsTransactions = () => {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    transaction_type: "",
    customer_id: "",
  });
  const [stats, setStats] = useState({
    total_earned: 0,
    total_used: 0,
    net_points: 0,
  });

  // LOAD TRANSACTIONS
  useEffect(() => {
    loadTransactions();
    loadStats();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("ecommerce/loyalty/transactions/");
      const list = res.data.data || res.data.results || res.data;
      setTransactions(list);
    } catch (err) {
      console.error("Transactions load error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load transactions",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await apiClient.get("ecommerce/loyalty/config/summary/");
      if (res.data && res.data.success) {
        setStats({
          total_earned: res.data.data?.points?.total_earned || 0,
          total_used: res.data.data?.points?.total_used || 0,
          net_points: res.data.data?.points?.active_points || 0,
        });
      }
    } catch (err) {
      console.error("Stats load error:", err);
    }
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle manual adjustment
  const handleManualAdjustment = async () => {
    const result = await Swal.fire({
      title: "Manual Points Adjustment",
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
            <input type="number" id="customer-id" class="swal2-input" placeholder="Enter Customer ID" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input type="number" id="points" class="swal2-input" placeholder="Positive to add, negative to deduct" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea id="reason" class="swal2-textarea" placeholder="Reason for adjustment" required></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Adjust",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const customerIdInput = document.getElementById("customer-id") as HTMLInputElement;
        const pointsInput = document.getElementById("points") as HTMLInputElement;
        const reasonInput = document.getElementById("reason") as HTMLTextAreaElement;

        if (!customerIdInput || !pointsInput || !reasonInput) {
          Swal.showValidationMessage("Form elements not found");
          return null;
        }

        const customerId = customerIdInput.value;
        const points = pointsInput.value;
        const reason = reasonInput.value;

        if (!customerId || !points || !reason) {
          Swal.showValidationMessage("Please fill all fields");
          return null;
        }

        return { 
          customerId: parseInt(customerId), 
          points: parseInt(points), 
          reason 
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    const { customerId, points, reason } = result.value;

    try {
      // Fixed: Sending proper payload
      await apiClient.post("ecommerce/loyalty/transactions/adjust_points/", {
        customer_id: customerId,
        points: points,
        reason: reason
      });
      
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Points adjusted successfully",
      });

      // Reload transactions
      loadTransactions();
      loadStats();
    } catch (err: any) {
      console.error("Adjustment error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to adjust points",
      });
    }
  };

  // Handle view customer report
  const handleViewCustomerReport = async (customerId: number) => {
    try {
      const res = await apiClient.get(`ecommerce/loyalty/transactions/customer_report/?customer_id=${customerId}`);
      const data = res.data.data;
      
      if (data) {
        Swal.fire({
          title: `<strong>${data.customer.username}'s Points Report</strong>`,
          html: `
            <div class="space-y-4">
              <!-- Customer Info -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Customer Information</h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Username:</span>
                    <span class="w-1/2">${data.customer.username}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Email:</span>
                    <span class="w-1/2">${data.customer.email}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Current Balance:</span>
                    <span class="w-1/2 font-bold text-blue-600">${data.points_summary.current_balance}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Points Value:</span>
                    <span class="w-1/2 text-green-600">₹${data.points_summary.monetary_value}</span>
                  </div>
                </div>
              </div>

              <!-- Points Summary -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Points Summary</h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Total Earned:</span>
                    <span class="w-1/2 text-green-600">${data.points_summary.total_earned}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Total Used:</span>
                    <span class="w-1/2 text-orange-600">${data.points_summary.total_used}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Net Points:</span>
                    <span class="w-1/2 font-bold">${data.points_summary.current_balance}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Total Value:</span>
                    <span class="w-1/2 font-bold text-green-600">₹${data.points_summary.monetary_value}</span>
                  </div>
                </div>
              </div>
            </div>
          `,
          icon: "info",
          confirmButtonText: "Close",
          width: "650px",
          showCloseButton: true,
        });
      }
    } catch (err: any) {
      console.error("Customer report error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load customer report",
      });
    }
  };

  // Get transaction type color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "earned":
      case "bonus":
        return "text-green-600";
      case "used":
        return "text-orange-600";
      case "expired":
        return "text-red-600";
      case "adjusted":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Get transaction type label
  const getTransactionTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get sign for points
  const getPointsSign = (type: string) => {
    if (type === "earned" || type === "bonus") return "+";
    if (type === "used" || type === "expired") return "-";
    return "";
  };

  // Apply filters
  const applyFilters = () => {
    return transactions.filter((transaction) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          transaction.customer.username.toLowerCase().includes(searchLower) ||
          transaction.customer.email.toLowerCase().includes(searchLower) ||
          (transaction.order_number && transaction.order_number.toLowerCase().includes(searchLower)) ||
          transaction.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.transaction_type && transaction.transaction_type !== filters.transaction_type) {
        return false;
      }

      if (filters.customer_id && transaction.customer.id.toString() !== filters.customer_id) {
        return false;
      }

      return true;
    });
  };

  const filteredTransactions = applyFilters();

  // Export CSV function
  const exportToCSV = () => {
    const csvData: CsvRow[] = filteredTransactions.map(t => ({
      Date: new Date(t.created_at).toLocaleDateString(),
      Time: new Date(t.created_at).toLocaleTimeString(),
      Customer: t.customer.username,
      Email: t.customer.email,
      Type: t.transaction_type,
      Points: t.points,
      'Order Number': t.order_number || '-',
      Description: t.description,
      'Balance After': t.balance_after,
    }));

    const csvHeaders = Object.keys(csvData[0] || {}) as (keyof CsvRow)[];
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => csvHeaders.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loyalty-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Points Earned</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.total_earned.toLocaleString()}
              </p>
            </div>
            <div className="text-green-500 text-2xl">↑</div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Points Used</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.total_used.toLocaleString()}
              </p>
            </div>
            <div className="text-orange-500 text-2xl">↓</div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Points Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.net_points.toLocaleString()}
              </p>
            </div>
            <div className="text-blue-500 text-2xl">₹{(stats.net_points * 0.1).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search customer, order, description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="customInput w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              value={filters.transaction_type}
              onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
              className="customSelect w-full"
            >
              <option value="">All Types</option>
              <option value="earned">Earned</option>
              <option value="used">Used</option>
              <option value="bonus">Bonus</option>
              <option value="expired">Expired</option>
              <option value="adjusted">Adjusted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer ID
            </label>
            <input
              type="number"
              placeholder="Customer ID"
              value={filters.customer_id}
              onChange={(e) => setFilters({ ...filters, customer_id: e.target.value })}
              className="customInput w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: "", transaction_type: "", customer_id: "" })}
              className="customBtn w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Loyalty Points Transactions</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleManualAdjustment}
            className="customBtn bg-blue-600 text-white hover:bg-blue-700"
          >
            Manual Adjustment
          </button>
          <button
            onClick={exportToCSV}
            className="customBtn bg-green-600 text-white hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <DataTable
        title=""
        data={filteredTransactions}
        loading={loading}
        columns={[
          {
            key: "created_at",
            label: "Date & Time",
            render: (item: LoyaltyTransaction) => (
              <div>
                <div className="font-medium">
                  {new Date(item.created_at).toLocaleDateString("en-IN")}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ),
          },
          {
            key: "customer",
            label: "Customer",
            render: (item: LoyaltyTransaction) => (
              <div>
                <div className="font-medium">{item.customer.username}</div>
                <div className="text-xs text-gray-500">{item.customer.email}</div>
                <div className="text-xs text-blue-600">ID: {item.customer.id}</div>
              </div>
            ),
          },
          {
            key: "transaction_type",
            label: "Type",
            render: (item: LoyaltyTransaction) => (
              <span className={`font-medium ${getTransactionTypeColor(item.transaction_type)}`}>
                {getTransactionTypeLabel(item.transaction_type)}
              </span>
            ),
          },
          {
            key: "points",
            label: "Points",
            render: (item: LoyaltyTransaction) => (
              <div className={`font-bold ${getTransactionTypeColor(item.transaction_type)}`}>
                {getPointsSign(item.transaction_type)}
                {item.points}
              </div>
            ),
          },
          {
            key: "order_number",
            label: "Order",
            render: (item: LoyaltyTransaction) => (
              item.order_number ? (
                <div>
                  <div className="font-medium">{item.order_number}</div>
                  <div className="text-xs text-gray-500">
                    Order ID: {item.order_id}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )
            ),
          },
          {
            key: "description",
            label: "Description",
            render: (item: LoyaltyTransaction) => (
              <div className="max-w-xs truncate" title={item.description}>
                {item.description}
              </div>
            ),
          },
          {
            key: "balance_after",
            label: "Balance",
            render: (item: LoyaltyTransaction) => (
              <div className="font-bold text-blue-600">{item.balance_after}</div>
            ),
          },
          {
            key: "config",
            label: "Rule",
            render: (item: LoyaltyTransaction) => (
              item.config ? (
                <div className="text-sm">
                  <div className="font-medium">{item.config.name}</div>
                  <div className="text-xs text-gray-500">Rule ID: {item.config.id}</div>
                </div>
              ) : (
                <span className="text-gray-400">Manual</span>
              )
            ),
          },
        ]}
        onView={(item: LoyaltyTransaction) => {
          Swal.fire({
            title: `<strong>Transaction Details</strong>`,
            html: `
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                  <div><strong>Transaction ID:</strong> ${item.id}</div>
                  <div><strong>Type:</strong> <span class="${getTransactionTypeColor(item.transaction_type)}">${getTransactionTypeLabel(item.transaction_type)}</span></div>
                  <div><strong>Date:</strong> ${formatDateTime(item.created_at)}</div>
                  <div><strong>Points:</strong> <span class="${getTransactionTypeColor(item.transaction_type)} font-bold">${getPointsSign(item.transaction_type)}${item.points}</span></div>
                </div>
                
                <div class="border-t pt-3">
                  <h4 class="font-semibold text-gray-800 mb-1">Customer</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <div><strong>Name:</strong> ${item.customer.username}</div>
                    <div><strong>Email:</strong> ${item.customer.email}</div>
                    <div><strong>Customer ID:</strong> ${item.customer.id}</div>
                    <div><strong>Balance After:</strong> <span class="font-bold text-blue-600">${item.balance_after}</span></div>
                  </div>
                </div>
                
                ${
                  item.order_number
                    ? `
                      <div class="border-t pt-3">
                        <h4 class="font-semibold text-gray-800 mb-1">Order Details</h4>
                        <div class="grid grid-cols-2 gap-2">
                          <div><strong>Order Number:</strong> ${item.order_number}</div>
                          <div><strong>Order ID:</strong> ${item.order_id}</div>
                        </div>
                      </div>
                    `
                    : ""
                }
                
                ${
                  item.config
                    ? `
                      <div class="border-t pt-3">
                        <h4 class="font-semibold text-gray-800 mb-1">Rule Applied</h4>
                        <div class="grid grid-cols-2 gap-2">
                          <div><strong>Rule Name:</strong> ${item.config.name}</div>
                          <div><strong>Rule ID:</strong> ${item.config.id}</div>
                        </div>
                      </div>
                    `
                    : ""
                }
                
                <div class="border-t pt-3">
                  <h4 class="font-semibold text-gray-800 mb-1">Description</h4>
                  <p class="text-gray-700">${item.description}</p>
                </div>
              </div>
            `,
            icon: "info",
            confirmButtonText: "Close",
            width: "600px",
            showCloseButton: true,
          });
        }}
        customActions={[
          {
            label: "Customer Report",
            onClick: (item: LoyaltyTransaction) => handleViewCustomerReport(item.customer.id),
            className: "text-blue-600 hover:text-blue-800",
          },
        ]}
      />

      {/* Summary at bottom */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-lg font-bold">{filteredTransactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Earned Transactions</p>
            <p className="text-lg font-bold text-green-600">
              {filteredTransactions.filter(t => t.transaction_type === "earned" || t.transaction_type === "bonus").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Used Transactions</p>
            <p className="text-lg font-bold text-orange-600">
              {filteredTransactions.filter(t => t.transaction_type === "used" || t.transaction_type === "expired").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Points in View</p>
            <p className="text-lg font-bold">
              {filteredTransactions.reduce((sum, t) => {
                if (t.transaction_type === "earned" || t.transaction_type === "bonus") return sum + t.points;
                if (t.transaction_type === "used" || t.transaction_type === "expired") return sum - t.points;
                return sum;
              }, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPointsTransactions;