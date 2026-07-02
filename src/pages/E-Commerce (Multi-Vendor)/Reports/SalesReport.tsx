import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import { useNavigate } from "react-router-dom";

interface OrderDetail {
  orderId: number;
  orderDate: string;
  productName: string;
  qty: number;
  paymentMode: "UPI" | "COD" | "Card";
  salesValue: number;
  tax: number;
  totalAmount: number;
  status: "Completed" | "Cancelled";
}

interface Vendor {
  id: number;
  vendorId: string;
  vendorName: string;
  contact: string;
  category: string;
  totalOrders: number;
  orders: OrderDetail[];
}

/* --------------------------------------------------------------- */
/*  IMPORTANT:  DataTable must accept an optional onOrderDetail   */
/* --------------------------------------------------------------- */
interface DataTableProps {
  data: Vendor[];
  onView?: (vendor: Vendor) => void;
  onOrderDetail?: (orderId: number) => void;   // <-- NEW
  // …other props you already have
}

const SalesReport = () => {
  const navigate = useNavigate();

  const [vendors] = useState<Vendor[]>([
    {
      id: 1,
      vendorId: "V1001",
      vendorName: "Elite Electronics",
      contact: "+91 98765 43210",
      category: "Electronics",
      totalOrders: 3,
      orders: [
        {
          orderId: 1001,
          orderDate: "2025-10-15",
          productName: "Smartphone X",
          qty: 2,
          paymentMode: "UPI",
          salesValue: 50000,
          tax: 18,
          totalAmount: 50000 * 1.18,
          status: "Completed",
        },
        {
          orderId: 1002,
          orderDate: "2025-10-14",
          productName: "Charger Pro",
          qty: 5,
          paymentMode: "COD",
          salesValue: 2500,
          tax: 12,
          totalAmount: 2500 * 1.12,
          status: "Completed",
        },
      ],
    },
    {
      id: 2,
      vendorId: "V1002",
      vendorName: "TechTrend",
      contact: "+91 87654 32109",
      category: "Electronics",
      totalOrders: 1,
      orders: [
        {
          orderId: 2001,
          orderDate: "2025-10-13",
          productName: "Laptop Y",
          qty: 1,
          paymentMode: "Card",
          salesValue: 75000,
          tax: 18,
          totalAmount: 75000 * 1.18,
          status: "Cancelled",
        },
      ],
    },
  ]);

  /* ---------- Vendor-level view (unchanged) ---------- */
  const handleView = (vendor: Vendor) => {
    const tableRows = vendor.orders
      .map(
        (order) => `
        <tr class="border-b">
          <td class="py-2 px-3 text-left">${order.orderDate}</td>
          <td class="py-2 px-3 text-left">#${order.orderId}</td>
          <td class="py-2 px-3 text-left">${order.productName}</td>
          <td class="py-2 px-3 text-center">${order.qty}</td>
          <td class="py-2 px-3 text-center">${order.paymentMode}</td>
          <td class="py-2 px-3 text-right">₹${order.salesValue.toLocaleString()}</td>
          <td class="py-2 px-3 text-center">${order.tax}%</td>
          <td class="py-2 px-3 text-right font-semibold">₹${order.totalAmount.toFixed(
            2
          )}</td>
          <td class="py-2 px-3 text-center">
            <span class="${
              order.status === "Completed" ? "text-green-700" : "text-red-700"
            } font-medium">
              ${order.status}
            </span>
          </td>
          <td class="py-2 px-3 text-center">
            <button
              onclick="window.__navigateToOrder(${order.orderId})"
              class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 cursor-pointer">
              Order Details
            </button>
            <button
              onclick="alert('Printing Order #${order.orderId}...')"
              class="cursor-pointer ml-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
              Print
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    // expose navigation function to the HTML string
    (window as any).__navigateToOrder = (orderId: number) => {
      Swal.close();
      navigate(`/orderdetails`); 
    };

    Swal.fire({
      title: `<strong>${vendor.vendorName}</strong> - Sales Details`,
      html: `
        <div class="text-left text-sm space-y-3">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <p><strong>Vendor ID:</strong> ${vendor.vendorId}</p>
            <p><strong>Contact:</strong> ${vendor.contact}</p>
            <p><strong>Category:</strong> ${vendor.category}</p>
            <p><strong>Total Orders:</strong> ${vendor.totalOrders}</p>
          </div>
          <hr class="border-gray-300" />
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-2 px-3 text-left">Date</th>
                  <th class="py-2 px-3 text-left">Order ID</th>
                  <th class="py-2 px-3 text-left">Product</th>
                  <th class="py-2 px-3 text-center">Qty</th>
                  <th class="py-2 px-3 text-center">Payment</th>
                  <th class="py-2 px-3 text-right">Sales</th>
                  <th class="py-2 px-3 text-center">Tax</th>
                  <th class="py-2 px-3 text-right">Total</th>
                  <th class="py-2 px-3 text-center">Status</th>
                  <th class="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>
      `,
      width: "900px",
      showConfirmButton: false,
      customClass: { popup: "text-sm" },
      // clean up when modal closes
      willClose: () => delete (window as any).__navigateToOrder,
    });
  };

  /* ---------- Pass navigation to DataTable (optional) ---------- */
  const handleOrderDetail = (orderId: number) => {
    navigate(`/orderdetails/${orderId}`);
  };

  return (
    <div className="">
      <DataTable
        title="Sales Report"
        data={vendors}
        columns={[
          { key: "vendorId", label: "Vendor ID" },
          { key: "vendorName", label: "Vendor Name" },
          { key: "contact", label: "Contact" },
          { key: "category", label: "Category" },
          {
            key: "totalOrders",
            label: "Total Orders",
            render: (item: Vendor) => (
              <span className="font-medium text-blue-700">{item.totalOrders}</span>
            ),
          },
        ]}
        onView={handleView}
        // onOrderDetail={handleOrderDetail} 
      />
    </div>
  );
};

export default SalesReport;