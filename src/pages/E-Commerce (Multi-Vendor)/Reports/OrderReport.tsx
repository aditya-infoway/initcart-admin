import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";

interface Order {
  id: number;
  vendor: string;
  customer: string;
  totalAmount: number;
  date: string;
  paymentMode: "Credit Card" | "Debit Card" | "UPI" | "COD";
  deliveryStatus: "Pending" | "Shipped" | "Delivered" | "Cancelled";
}

const OrderReport = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      vendor: "Elite Electronics",
      customer: "John Doe",
      totalAmount: 29500,
      date: "2025-10-15",
      paymentMode: "UPI",
      deliveryStatus: "Shipped",
    },
    {
      id: 2,
      vendor: "TechTrend",
      customer: "Jane Smith",
      totalAmount: 88500,
      date: "2025-10-14",
      paymentMode: "COD",
      deliveryStatus: "Cancelled",
    },
  ]);

  const handleView = (item: Order) => {
    Swal.fire({
      title: `Order #${item.id}`,
      html: `
        <p><strong>Vendor:</strong> ${item.vendor}</p>
        <p><strong>Customer:</strong> ${item.customer}</p>
        <p><strong>Total Amount:</strong> ₹${item.totalAmount}</p>
        <p><strong>Date:</strong> ${item.date}</p>
        <p><strong>Payment Mode:</strong> ${item.paymentMode}</p>
        <p><strong>Delivery Status:</strong> ${item.deliveryStatus}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  return (
    <div className="">
      <DataTable
        title="Order Report"
        data={orders}
        columns={[
          { key: "id", label: "Order ID" },
          { key: "vendor", label: "Vendor" },
          { key: "customer", label: "Customer" },
          { key: "totalAmount", label: "Total Amount", render: (item: Order) => <span>₹{item.totalAmount}</span> },
          { key: "date", label: "Date" },
          { key: "paymentMode", label: "Payment Mode" },
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
         
        ]}
        onView={handleView}
      />
    </div>
  );
};

export default OrderReport;