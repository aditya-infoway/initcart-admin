import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import { useNavigate } from "react-router-dom";

interface Order {
  id: number;
  date: string;
  customer: string;
  vendor: string;
  amount: number;
  discount: number; // in %
  tax: number; // in %
  offerType: string; // e.g., "Flash Sale", "Bundle Offer", "None"
  paymentType: "Credit Card" | "Debit Card" | "UPI" | "COD";
  paymentStatus: "Paid" | "Pending" | "Failed";
  deliveryStatus: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  trackingId: string;
}

const AllOrders = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      date: "2025-10-15",
      customer: "John Doe",
      vendor: "Elite Electronics",
      amount: 25000,
      discount: 15,
      tax: 18,
      offerType: "Flash Sale",
      paymentType: "UPI",
      paymentStatus: "Paid",
      deliveryStatus: "Shipped",
      trackingId: "TRACK123",
    },
    {
      id: 2,
      date: "2025-10-16",
      customer: "Jane Smith",
      vendor: "Fashion Hub",
      amount: 5000,
      discount: 0,
      tax: 12,
      offerType: "None",
      paymentType: "COD",
      paymentStatus: "Pending",
      deliveryStatus: "Pending",
      trackingId: "TRACK456",
    },
  ]);
  const navigate = useNavigate();

  const handleView = (item: Order) => {
    navigate("/orderdetails");
  };

  const handleInvoice = (item: Order) => {
    Swal.fire({
      title: "Generate Invoice",
      text: `Generating invoice for Order #${item.id}. This is a placeholder action.`,
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  const handleRefund = (item: Order) => {
    Swal.fire({
      title: "Initiate Refund",
      text: `Are you sure you want to initiate a refund for Order #${item.id}?`,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, refund it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setOrders(
          orders.map((o) =>
            o.id === item.id ? { ...o, deliveryStatus: "Cancelled" } : o
          )
        );
        Swal.fire(
          "Refund Initiated!",
          `Refund for Order #${item.id} has been initiated.`,
          "success"
        );
      }
    });
  };

  const handleCancel = (item: Order) => {
    Swal.fire({
      title: "Cancel Order",
      text: `Are you sure you want to cancel Order #${item.id}?`,
      input: "text",
      inputPlaceholder: "Enter cancellation reason (optional)",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setOrders(
          orders.map((o) =>
            o.id === item.id ? { ...o, deliveryStatus: "Cancelled" } : o
          )
        );
        Swal.fire("Cancelled!", `Order #${item.id} has been cancelled.`, "success");
      }
    });
  };

  return (
    <div className="">
      <DataTable
        title="All Orders"
        data={orders}
        columns={[
          {
            key: "action",
            label: "Action",
            render: (item: Order) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => handleInvoice(item)}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Invoice
                </button>
                {item.deliveryStatus !== "Cancelled" && (
                  <button
                    onClick={() => handleRefund(item)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                  >
                    Refund
                  </button>
                )}
                {item.deliveryStatus !== "Cancelled" &&
                  item.deliveryStatus !== "Delivered" && (
                  <button
                    onClick={() => handleCancel(item)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ),
          },
          { key: "id", label: "Order ID" },
          { key: "date", label: "Date" },
          { key: "customer", label: "Customer" },
          { key: "vendor", label: "Vendor" },
          {
            key: "amount",
            label: "Amount",
            render: (item: Order) => {
              const discounted = item.amount * (1 - item.discount / 100);
              const finalAmount = discounted * (1 + item.tax / 100);
              return (
                <div className="text-sm">
                  <div>Base: <strong>₹{item.amount}</strong></div>
                  {item.discount > 0 && (
                    <div className="text-green-600">-{item.discount}%</div>
                  )}
                  {item.tax > 0 && (
                    <div className="text-blue-600">+{item.tax}% tax</div>
                  )}
                  <div className="font-bold text-blue-700">
                    Final: ₹{finalAmount.toFixed(2)}
                  </div>
                </div>
              );
            },
          },
          {
            key: "discount",
            label: "Discount (%)",
            render: (item: Order) => (
              <span className={item.discount > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                {item.discount > 0 ? `${item.discount}%` : "-"}
              </span>
            ),
          },
          {
            key: "tax",
            label: "Tax (%)",
            render: (item: Order) => (
              <span className="text-blue-600 font-medium">
                {item.tax}%
              </span>
            ),
          },
          {
            key: "offerType",
            label: "Offer Type",
            render: (item: Order) => (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.offerType === "None"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {item.offerType}
              </span>
            ),
          },
          { key: "paymentType", label: "Payment Type" },
          {
            key: "paymentStatus",
            label: "Payment Status",
            render: (item: Order) => (
              <span
                className={`text-sm font-semibold ${
                  item.paymentStatus === "Paid"
                    ? "text-green-700"
                    : item.paymentStatus === "Pending"
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {item.paymentStatus}
              </span>
            ),
          },
          {
            key: "deliveryStatus",
            label: "Delivery Status",
            render: (item: Order) => (
              <span
                className={`text-sm font-semibold ${
                  item.deliveryStatus === "Delivered"
                    ? "text-green-700"
                    : item.deliveryStatus === "Cancelled"
                    ? "text-red-700"
                    : "text-yellow-700"
                }`}
              >
                {item.deliveryStatus}
              </span>
            ),
          },
          { key: "trackingId", label: "Tracking ID" },
        ]}
      />
    </div>
  );
};

export default AllOrders;