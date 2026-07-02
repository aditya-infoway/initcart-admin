
import React, { useState } from "react";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import DataTable from "../../components/common/DataTable";

interface Vendor {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  gst: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: "Pending" | "Approved" | "Rejected";
  service_type:
    | "Gym"
    | "Salon"
    | "Travel Agency"
    | "Finance"
    | "Tech Industry"
    | "Hotel & Restaurant"
    | "Healthcare"
    | "Education"
    | "Professional"
    | "Work Place";
  
  // Gym Specific
  genderCategory?: string;
  timeSlots?: string;
  membershipDuration?: string;
  membershipPrice?: number;
  trainerAvailable?: boolean;

  // Salon Specific
  salonType?: string;
  serviceList?: string[];
  homeServiceAvailable?: boolean;

  // Travel Agency Specific
  serviceType?: string;
  destinationRoute?: string;
  packagePrice?: number;
  durationDays?: number;

  // Finance Specific
  loanCategory?: string;
  interestRate?: number;
  tenureMonths?: number;
  minimumSalaryRequirement?: number;

  // Tech Industry Specific
  companyType?: string;
  techStackServices?: string;
  projectDuration?: number;

  // Hotel & Restaurant Specific
  menuUpload?: string;
  cuisineType?: string;
  tableBookingAvailable?: boolean;
  homeDelivery?: boolean;

  // Healthcare Specific
  healthcareCategory?: string;
  typeSpeciality?: string;
  doctorAvailability?: boolean;
  emergencyServices?: boolean;

  // Education Specific
  educationType?: string;
  subjectsCourses?: string;
  modeOfClass?: string;

  // Professional Specific
  professionType?: string;
  experienceYears?: number;
  consultationFees?: number;

  // Work Place Specific
  workspaceType?: string;
  seatingCapacity?: number;
  amenities?: string[];
}

const ServiceVendorRequests = () => {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 1,
      name: "FitLife Gym",
      owner: "Alice Smith",
      email: "alice@fitlife.com",
      phone: "+91 98765 43211",
      gst: "22ABCDE1234F1Z6",
      address: "123 Fitness Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      status: "Pending",
      service_type: "Gym",
      genderCategory: "Unisex",
      timeSlots: "6 AM–8 AM, 7 PM–9 PM",
      membershipDuration: "Monthly",
      membershipPrice: 2000,
      trainerAvailable: true,
    },
    {
      id: 2,
      name: "Elite Salon",
      owner: "Bob Johnson",
      email: "bob@elitesalon.com",
      phone: "+91 98765 43212",
      gst: "22ABCDE1234F1Z7",
      address: "456 Beauty Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      status: "Pending",
      service_type: "Salon",
      salonType: "Women",
      serviceList: ["Haircut", "Spa"],
      homeServiceAvailable: true,
    },
    {
      id: 3,
      name: "Global Finance",
      owner: "Carol White",
      email: "carol@globalfinance.com",
      phone: "+91 98765 43213",
      gst: "22ABCDE1234F1Z8",
      address: "789 Money Lane",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      status: "Pending",
      service_type: "Finance",
      loanCategory: "Personal",
      interestRate: 10,
      tenureMonths: 60,
      minimumSalaryRequirement: 25000,
    },
    {
      id: 4,
      name: "Tech Innovate",
      owner: "David Brown",
      email: "david@techinnovate.com",
      phone: "+91 98765 43214",
      gst: "22ABCDE1234F1Z9",
      address: "101 Tech Park",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      status: "Pending",
      service_type: "Tech Industry",
      companyType: "Service",
      techStackServices: "Web Development, Cloud Services",
      projectDuration: 6,
    },
    {
      id: 5,
      name: "Tasty Bites",
      owner: "Emma Wilson",
      email: "emma@tastybites.com",
      phone: "+91 98765 43215",
      gst: "22ABCDE1234F2Z0",
      address: "202 Food Street",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      status: "Pending",
      service_type: "Hotel & Restaurant",
      menuUpload: "menu.pdf",
      cuisineType: "Indian",
      tableBookingAvailable: true,
      homeDelivery: true,
    },
    {
      id: 6,
      name: "City Workspace",
      owner: "Frank Miller",
      email: "frank@cityworkspace.com",
      phone: "+91 98765 43216",
      gst: "22ABCDE1234F2Z1",
      address: "303 Office Lane",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      status: "Pending",
      service_type: "Work Place",
      workspaceType: "Co-Working",
      seatingCapacity: 50,
      amenities: ["Wi-Fi", "AC", "Conference Room"],
    },
  ]);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleApprove = (vendor: Vendor) => {
    Swal.fire({
      title: "Approve Vendor?",
      text: `Are you sure you want to approve "${vendor.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === vendor.id ? { ...v, status: "Approved" } : v
          )
        );
        setModalOpen(false)
        Swal.fire("Approved!", "The vendor has been approved.", "success");
      }
    });
  };

  const handleReject = (vendor: Vendor) => {
    Swal.fire({
      title: "Reject Vendor?",
      text: `Are you sure you want to reject "${vendor.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === vendor.id ? { ...v, status: "Rejected" } : v
          )
        );
        setModalOpen(false)

        Swal.fire("Rejected!", "The vendor has been rejected.", "success");
      }
    });
  };

  const renderServiceSpecificFields = (vendor: Vendor) => {
    switch (vendor.service_type) {
      case "Gym":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Gender Category</label>
              <input
                type="text"
                value={vendor.genderCategory || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Time Slots</label>
              <input
                type="text"
                value={vendor.timeSlots || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Membership Duration</label>
              <input
                type="text"
                value={vendor.membershipDuration || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Membership Price</label>
              <input
                type="number"
                value={vendor.membershipPrice || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  checked={vendor.trainerAvailable || false}
                  className="w-5 h-5 accent-blue-600"
                  disabled
                />
                <span>Trainer Available</span>
              </label>
            </div>
          </>
        );
      case "Salon":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Salon Type</label>
              <input
                type="text"
                value={vendor.salonType || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Service List</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Haircut", "Spa", "Facial", "Manicure", "Pedicure"].map((service) => (
                  <label
                    key={service}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      vendor.serviceList?.includes(service)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={service}
                      checked={vendor.serviceList?.includes(service) || false}
                      className="w-5 h-5 accent-blue-600"
                      disabled
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  checked={vendor.homeServiceAvailable || false}
                  className="w-5 h-5 accent-blue-600"
                  disabled
                />
                <span>Home Service Available</span>
              </label>
            </div>
          </>
        );
      case "Travel Agency":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Service Type</label>
              <input
                type="text"
                value={vendor.serviceType || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Destination/Route</label>
              <input
                type="text"
                value={vendor.destinationRoute || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Package Price</label>
              <input
                type="number"
                value={vendor.packagePrice || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Duration (Days)</label>
              <input
                type="number"
                value={vendor.durationDays || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
          </>
        );
      case "Finance":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Loan Category</label>
              <input
                type="text"
                value={vendor.loanCategory || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Interest Rate (%)</label>
              <input
                type="number"
                value={vendor.interestRate || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Tenure (Months)</label>
              <input
                type="number"
                value={vendor.tenureMonths || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Minimum Salary Requirement</label>
              <input
                type="number"
                value={vendor.minimumSalaryRequirement || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
          </>
        );
      case "Tech Industry":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Company Type</label>
              <input
                type="text"
                value={vendor.companyType || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Tech Stack/Services</label>
              <textarea
                value={vendor.techStackServices || ""}
                className="customInput bg-gray-100"
                disabled
                rows={4}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Project Duration (Months)</label>
              <input
                type="number"
                value={vendor.projectDuration || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
          </>
        );
      case "Hotel & Restaurant":
        return (
          <>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Menu Upload</label>
              <input
                type="text"
                value={vendor.menuUpload || "None"}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Cuisine Type</label>
              <input
                type="text"
                value={vendor.cuisineType || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  checked={vendor.tableBookingAvailable || false}
                  className="w-5 h-5 accent-blue-600"
                  disabled
                />
                <span>Table Booking Available</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  checked={vendor.homeDelivery || false}
                  className="w-5 h-5 accent-blue-600"
                  disabled
                />
                <span>Home Delivery</span>
              </label>
            </div>
          </>
        );
      case "Healthcare":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Healthcare Category</label>
              <input
                type="text"
                value={vendor.healthcareCategory || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Type/Speciality</label>
              <input
                type="text"
                value={vendor.typeSpeciality || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  checked={vendor.doctorAvailability || false}
                  className="w-5 h-5 accent-blue-600"
                  disabled
                />
                <span>Doctor Availability</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  checked={vendor.emergencyServices || false}
                  className="w-5 h-5 accent-blue-600"
                  disabled
                />
                <span>Emergency Services</span>
              </label>
            </div>
          </>
        );
      case "Education":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Education Type</label>
              <input
                type="text"
                value={vendor.educationType || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Subjects/Courses</label>
              <textarea
                value={vendor.subjectsCourses || ""}
                className="customInput bg-gray-100"
                disabled
                rows={4}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Mode of Class</label>
              <input
                type="text"
                value={vendor.modeOfClass || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
          </>
        );
      case "Professional":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Profession Type</label>
              <input
                type="text"
                value={vendor.professionType || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Experience (Years)</label>
              <input
                type="number"
                value={vendor.experienceYears || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Consultation Fees</label>
              <input
                type="number"
                value={vendor.consultationFees || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
          </>
        );
      case "Work Place":
        return (
          <>
            <div>
              <label className="block mb-1 font-medium">Workspace Type</label>
              <input
                type="text"
                value={vendor.workspaceType || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Seating Capacity</label>
              <input
                type="number"
                value={vendor.seatingCapacity || ""}
                className="customInput bg-gray-100"
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Wi-Fi", "AC", "Conference Room", "Cafeteria"].map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      vendor.amenities?.includes(amenity)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={vendor.amenities?.includes(amenity) || false}
                      className="w-5 h-5 accent-blue-600"
                      disabled
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 min-h-screen">
      <DataTable
        title="Service Vendor Requests"
        data={vendors}
        columns={[
          { key: "name", label: "Vendor Name" },
          { key: "service_type", label: "Service Type" },
          { key: "city", label: "City" },
          {
            key: "status",
            label: "Status",
            render: (item: Vendor) => (
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  item.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : item.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
        ]}
        onView={(vendor: Vendor) => {
          setSelectedVendor(vendor);
          setModalOpen(true);
        }}
        onApprove={(vendor: Vendor) => vendor.status === "Pending" && handleApprove(vendor)}
        onReject={(vendor: Vendor) => vendor.status === "Pending" && handleReject(vendor)}
        // addButtonLabel={null} // No add button for Super Admin
      />

      {/* MODAL */}
      {modalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[85vh]">
            <h2 className="text-xl font-bold mb-6">Vendor Request Details</h2>

            <div className="flex flex-col gap-6">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Vendor Name</label>
                  <input
                    type="text"
                    value={selectedVendor.name}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Owner</label>
                  <input
                    type="text"
                    value={selectedVendor.owner}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    value={selectedVendor.email}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Phone</label>
                  <input
                    type="text"
                    value={selectedVendor.phone}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">GST</label>
                  <input
                    type="text"
                    value={selectedVendor.gst}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Address</label>
                  <input
                    type="text"
                    value={selectedVendor.address}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">City</label>
                  <input
                    type="text"
                    value={selectedVendor.city}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">State</label>
                  <input
                    type="text"
                    value={selectedVendor.state}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Pincode</label>
                  <input
                    type="text"
                    value={selectedVendor.pincode}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
              </div>

              {/* Service-Specific Fields */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  {selectedVendor.service_type} Specific Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderServiceSpecificFields(selectedVendor)}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                {selectedVendor.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedVendor)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedVendor)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceVendorRequests;
