import React, { useState } from "react";
import type {
  FilterOption,
  FilterState,
} from "../../components/common/FilterOrder";
import FilterOrder from "../../components/common/FilterOrder";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";

const orderTypes: FilterOption[] = [
  { label: "In House Order", value: "inHouseOrder" },
  { label: "Vendor Order", value: "vendorOrder" },
  { label: "POS Order", value: "posorder" },
];

const stores: FilterOption[] = [
  { label: "All shop", value: "all" },
  { label: "Shop 1", value: "shop1" },
  { label: "Shop 2", value: "shop2" },
];

const customers: FilterOption[] = [
  { label: "All customer", value: "all" },
  { label: "John Doe", value: "john" },
  { label: "Jane Smith", value: "jane" },
];

interface Order {
  id: number;
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  store: string;
  totalAmount: string;
  paymentStatus: "Paid" | "Unpaid";
  paymentMethod: "Cash On Delivery" | "Stripe";
}

const Confirmed = () => {
  const handleApply = (filters: FilterState) => {
    console.log("Applied Filters:", filters);
  };

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      orderId: "100199",
      orderDate: "07 Oct 2025, 02:39 AM",
      customerName: "MD Rakib Hasan",
      customerPhone: "+12345656787",
      store: "6valley CMS",
      totalAmount: "$2,875.00",
      paymentStatus: "Unpaid",
      paymentMethod: "Cash On Delivery",
    },
    {
      id: 2,
      orderId: "100198",
      orderDate: "07 Oct 2025, 02:23 AM",
      customerName: "Rakibul Hasan",
      customerPhone: "+11234567890",
      store: "6valley CMS",
      totalAmount: "$2,944.00",
      paymentStatus: "Paid",
      paymentMethod: "Stripe",
    },
    {
      id: 3,
      orderId: "100195",
      orderDate: "22 Sep 2025, 07:30 PM",
      customerName: "Robert Downey",
      customerPhone: "+15551112222",
      store: "Bicycle Shop",
      totalAmount: "$223.00",
      paymentStatus: "Unpaid",
      paymentMethod: "Cash On Delivery",
    },
  ]);

  const handleView = (order: Order) => {
    Swal.fire({
      title: `Order #${order.orderId}`,
      html: `
        <b>Customer:</b> ${order.customerName}<br/>
        <b>Phone:</b> ${order.customerPhone}<br/>
        <b>Store:</b> ${order.store}<br/>
        <b>Total:</b> ${order.totalAmount}<br/>
        <b>Status:</b> ${order.paymentMethod}<br/>
      `,
      icon: "info",
    });
  };

  const handleDownload = (order: Order) => {
    Swal.fire({
      icon: "success",
      title: `Invoice Downloaded!`,
      text: `Invoice for order #${order.orderId} downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <>
      <div className="mb-5">
        <FilterOrder
          title="Filter Orders"
          orderTypes={orderTypes}
          stores={stores}
          customers={customers}
          onApply={handleApply}
        />
      </div>

      <DataTable
        title="Confirmed Orders"
        data={orders}
        columns={[
          { key: "orderId", label: "Order Id" },
          { key: "orderDate", label: "Order Date" },
          { key: "customerName", label: "Customer info" },
          { key: "store", label: "Store" },
          {
            key: "totalAmount",
            label: "Total Amount",
            render: (item) => {
              return (
                <div className="flex flex-col">
                  <span className="text-gray-800 font-semibold">
                    ₹{item.totalAmount}
                  </span>
                  <span className="text-sm">
                    <span
                      className={`font-medium ${
                        item.paymentStatus == "Paid"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {item.paymentStatus == "Paid" ? "Paid" : `Unpaid`}
                    </span>
                  </span>
                </div>
              );
            },
          },
          {
            key: "paymentMethod",
            label: "Payment Method",
          },
        ]}
      />
    </>
  );
};

export default Confirmed;
