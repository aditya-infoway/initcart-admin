import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";

interface Inquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  serviceName: string;
  vendor: string;
  date: string;
  message: string;
  status: "New" | "In Progress" | "Closed";
  assignedTo: string;
}

const CustomerInquiryList = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: "INQ-001",
      customerName: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      serviceName: "Strength Training",
      vendor: "FitPro Gym",
      date: "2025-10-10",
      message: "Interested in personal training sessions",
      status: "New",
      assignedTo: "Admin1",
    },
    {
      id: "INQ-002",
      customerName: "Jane Smith",
      email: "jane@example.com",
      phone: "9123456789",
      serviceName: "Men's Haircut",
      vendor: "Elegant Salon",
      date: "2025-10-12",
      message: "Booking for haircut",
      status: "In Progress",
      assignedTo: "Admin2",
    },
  ]);

  const handleView = (item: Inquiry) => {
    Swal.fire({
      title: "Inquiry Details",
      html: `
        <p><strong>Customer:</strong> ${item.customerName}</p>
        <p><strong>Email:</strong> ${item.email}</p>
        <p><strong>Phone:</strong> ${item.phone}</p>
        <p><strong>Service:</strong> ${item.serviceName}</p>
        <p><strong>Vendor:</strong> ${item.vendor}</p>
        <p><strong>Message:</strong> ${item.message}</p>
      `,
      icon: "info",
    });
  };

  const handleFollowUp = (item: Inquiry) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Mark "${item.serviceName}" inquiry as In Progress?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, follow up!",
    }).then((result) => {
      if (result.isConfirmed) {
        setInquiries(
          inquiries.map((i) => (i.id === item.id ? { ...i, status: "In Progress" } : i))
        );
        Swal.fire("Updated!", `Inquiry marked as In Progress.`, "success");
      }
    });
  };

  const handleClose = (item: Inquiry) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Close "${item.serviceName}" inquiry?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, close it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setInquiries(
          inquiries.map((i) => (i.id === item.id ? { ...i, status: "Closed" } : i))
        );
        Swal.fire("Closed!", `Inquiry closed.`, "success");
      }
    });
  };

  return (
    <div className="p-4">
      <DataTable
        title="Customer Inquiries"
        data={inquiries}
        columns={[
          { key: "id", label: "Inquiry ID" },
          { key: "customerName", label: "Customer Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "serviceName", label: "Service Name" },
          { key: "vendor", label: "Vendor" },
          { key: "date", label: "Date" },
          { key: "message", label: "Message" },
          {
            key: "status",
            label: "Status",
            render: (item: Inquiry) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "New"
                    ? "text-blue-700"
                    : item.status === "In Progress"
                    ? "text-yellow-700"
                    : "text-green-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
          { key: "assignedTo", label: "Assigned To" },
          {
            key: "action",
            label: "Action",
            render: (item: Inquiry) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  View
                </button>
                {item.status !== "In Progress" && item.status !== "Closed" && (
                  <button
                    onClick={() => handleFollowUp(item)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Follow Up
                  </button>
                )}
                {item.status !== "Closed" && (
                  <button
                    onClick={() => handleClose(item)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Close
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default CustomerInquiryList;