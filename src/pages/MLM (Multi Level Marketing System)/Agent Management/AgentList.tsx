import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

interface Agent {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  level: string;
  joiningDate: string;
  panAadhaar: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  commission: number;
  status: "Active" | "Inactive" | "Suspended";
}

const agentData: Agent[] = [
  {
    id: "AGT-001",
    fullName: "Rohit Sharma",
    email: "rohit@gmail.com",
    phone: "9876543210",
    password: "******",
    level: "Starter",
    joiningDate: "2025-10-15",
    panAadhaar: "ABCDE1234F",
    address: "Delhi, India",
    bankName: "ICICI Bank",
    accountNumber: "123456789012",
    ifscCode: "ICIC000123",
    upiId: "rohit@icici",
    commission: 2,
    status: "Active",
  },
];

const levelOptions = [
  { value: "Starter", label: "Starter" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
];

const AgentList = () => {
  const [agents, setAgents] = useState<Agent[]>(agentData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: editingAgent?.fullName || "",
      email: editingAgent?.email || "",
      phone: editingAgent?.phone || "",
      password: editingAgent?.password || "",
      level: editingAgent?.level || "",
      joiningDate: editingAgent?.joiningDate || "",
      panAadhaar: editingAgent?.panAadhaar || "",
      address: editingAgent?.address || "",
      bankName: editingAgent?.bankName || "",
      accountNumber: editingAgent?.accountNumber || "",
      ifscCode: editingAgent?.ifscCode || "",
      upiId: editingAgent?.upiId || "",
      commission: editingAgent?.commission || 0,
      status: editingAgent?.status === "Active" || true,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
        .required("Phone is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      level: Yup.string().required("Level is required"),
      joiningDate: Yup.string().required("Joining Date is required"),
      panAadhaar: Yup.string().required("PAN/Aadhaar is required"),
      address: Yup.string().required("Address is required"),
      bankName: Yup.string().required("Bank Name is required"),
      accountNumber: Yup.string().required("Account Number is required"),
      ifscCode: Yup.string().required("IFSC Code is required"),
      upiId: Yup.string().required("UPI ID is required"),
      commission: Yup.number()
        .min(0, "Commission cannot be negative")
        .required("Commission is required"),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      setIsLoading(true);
      if (editingAgent) {
        setAgents(
          agents.map((agent) =>
            agent.id === editingAgent.id
              ? {
                  ...agent,
                  ...values,
                  status: values.status ? "Active" : "Inactive",
                }
              : agent
          )
        );
        Swal.fire({
          icon: "success",
          title: "Agent Updated",
          text: `${values.fullName} has been updated successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newAgent: Agent = {
          id: `AGT-${(agents.length + 1).toString().padStart(3, "0")}`,
          ...values,
          status: values.status ? "Active" : "Inactive",
        };
        setAgents([newAgent, ...agents]);
        Swal.fire({
          icon: "success",
          title: "Agent Added",
          text: `${values.fullName} has been added successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setModalOpen(true);
  };

    const handleView = (agent: Agent) => {
    // setEditingAgent(agent);
    // setModalOpen(true);
    console.log("Logging handle view");
    
  };


  const handleDelete = (agent: Agent) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${agent.fullName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setAgents(agents.filter((a) => a.id !== agent.id));
        Swal.fire("Deleted!", `${agent.fullName} has been deleted.`, "success");
      }
    });
  };

  return (
    <div>
      <DataTable
        data={agents}
        columns={[
          { key: "id", label: "Agent ID" },
          { key: "fullName", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "level", label: "Level" },
          { key: "joiningDate", label: "Joining Date" },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : item.status === "Inactive"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status}
              </span>
            ),
          },
        ]}
        // onAdd={() => {
        //   setEditingAgent(null);
        //   setModalOpen(true);
        // }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        // addButtonLabel="Add Agent"
        title="Agents List"
      />

      {/* Modal - Same Design as AgentLevelsConfiguration */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-7">
              {editingAgent ? "Edit Agent" : "Add Agent"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div>
                <label className="block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Full Name"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.fullName && formik.errors.fullName
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.fullName}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Email"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.email && formik.errors.email
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.email}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Phone"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.phone && formik.errors.phone
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.phone}</div>
                )}
              </div>

              {/* Row 2 */}
              <div>
                <label className="block mb-1 font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Password"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.password && formik.errors.password
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.password}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Level</label>
                <select
                  name="level"
                  value={formik.values.level}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.level && formik.errors.level
                      ? "paymentSelectError"
                      : formik.values.level
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select Level</option>
                  {levelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {formik.touched.level && formik.errors.level && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.level}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formik.values.joiningDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.joiningDate && formik.errors.joiningDate
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.joiningDate && formik.errors.joiningDate && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.joiningDate}</div>
                )}
              </div>

              {/* Row 3 */}
              <div>
                <label className="block mb-1 font-medium">PAN/Aadhaar</label>
                <input
                  type="text"
                  name="panAadhaar"
                  value={formik.values.panAadhaar}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter PAN/Aadhaar"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.panAadhaar && formik.errors.panAadhaar
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.panAadhaar && formik.errors.panAadhaar && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.panAadhaar}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formik.values.bankName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Bank Name"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.bankName && formik.errors.bankName
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.bankName && formik.errors.bankName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.bankName}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formik.values.accountNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Account Number"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.accountNumber && formik.errors.accountNumber
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.accountNumber && formik.errors.accountNumber && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.accountNumber}</div>
                )}
              </div>

              {/* Row 4 */}
              <div>
                <label className="block mb-1 font-medium">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formik.values.ifscCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter IFSC Code"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.ifscCode && formik.errors.ifscCode
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.ifscCode && formik.errors.ifscCode && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.ifscCode}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  value={formik.values.upiId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter UPI ID"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.upiId && formik.errors.upiId
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.upiId && formik.errors.upiId && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.upiId}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Commission %</label>
                <input
                  type="number"
                  name="commission"
                  value={formik.values.commission}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Commission %"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.commission && formik.errors.commission
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.commission && formik.errors.commission && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.commission}</div>
                )}
              </div>

              {/* Full Row Fields */}
              <div className="md:col-span-3">
                <label className="block mb-1 font-medium">Address</label>
                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Address"
                  rows={3}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.address && formik.errors.address
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.address && formik.errors.address && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.address}</div>
                )}
              </div>

              <div className="md:col-span-3 flex items-center gap-2">
                <label className="font-medium">Status</label>
                <ToggleSwitch
                  checked={formik.values.status}
                  onChange={(val) => formik.setFieldValue("status", val)}
                />
                <span>{formik.values.status ? "Active" : "Inactive"}</span>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer hover:bg-gray-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : editingAgent ? "Update" : "Add"}
                </button>
              </div>
            </form>

            <button
              disabled={isLoading}
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;