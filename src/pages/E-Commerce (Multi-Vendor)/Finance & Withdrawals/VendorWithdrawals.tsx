import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";

interface Withdrawal {
  id: number;
  vendor: string;
  amount: number;
  withdrawalDate: string;
  approvedAmount: number | null;
  paymentStatus: "Pending" | "Approved" | "Rejected" | "Paid";
  referenceNo: string | null;
  remarks: string;
}

const WithdrawalSchema = Yup.object().shape({
  vendor: Yup.string().required("Vendor is required"),
  amount: Yup.number()
    .min(1, "Amount must be at least 1")
    .required("Amount is required"),
  withdrawalDate: Yup.string().required("Request Date is required"),
  paymentStatus: Yup.string().required("Payment Status is required"),
  referenceNo: Yup.string().nullable(),
  remarks: Yup.string(),
});

const VendorWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: 1,
      vendor: "Elite Electronics",
      amount: 50000,
      withdrawalDate: "2025-10-15",
      approvedAmount: null,
      paymentStatus: "Pending",
      referenceNo: null,
      remarks: "Requested for vendor payout",
    },
    {
      id: 2,
      vendor: "TechTrend",
      amount: 30000,
      withdrawalDate: "2025-10-14",
      approvedAmount: 30000,
      paymentStatus: "Paid",
      referenceNo: "REF123456",
      remarks: "Payout completed",
    },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(
    null
  );

  const handleAdd = () => {
    setEditingWithdrawal(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Withdrawal) => {
    setEditingWithdrawal(item);
    setModalOpen(true);
  };

  const handleView = (item: Withdrawal) => {
    Swal.fire({
      title: `Withdrawal Request #${item.id}`,
      html: `
        <p><strong>Vendor:</strong> ${item.vendor}</p>
        <p><strong>Amount:</strong> ₹${item.amount}</p>
        <p><strong>Request Date:</strong> ${item.withdrawalDate}</p>
        <p><strong>Approved Amount:</strong> ${
          item.approvedAmount ? `₹${item.approvedAmount}` : "N/A"
        }</p>
        <p><strong>Payment Status:</strong> ${item.paymentStatus}</p>
        <p><strong>Reference No:</strong> ${item.referenceNo || "N/A"}</p>
        <p><strong>Remarks:</strong> ${item.remarks || "N/A"}</p>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const handleApprove = (item: Withdrawal) => {
    Swal.fire({
      title: "Approve Withdrawal",
      text: `Are you sure you want to approve the withdrawal of ₹${item.amount} for ${item.vendor}?`,
      input: "number",
      inputPlaceholder: "Enter approved amount",
      inputAttributes: { min: "0", step: "1" },
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === item.id
              ? {
                  ...w,
                  paymentStatus: "Approved",
                  approvedAmount: Number(result.value),
                  referenceNo: `REF${Math.floor(
                    100000 + Math.random() * 900000
                  )}`,
                  remarks: w.remarks || "Approved by admin",
                }
              : w
          )
        );
        Swal.fire(
          "Approved!",
          `Withdrawal #${item.id} has been approved.`,
          "success"
        );
      }
    });
  };

  const handleReject = (item: Withdrawal) => {
    Swal.fire({
      title: "Reject Withdrawal",
      text: `Are you sure you want to reject the withdrawal for ${item.vendor}?`,
      input: "text",
      inputPlaceholder: "Enter rejection reason (optional)",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === item.id
              ? {
                  ...w,
                  paymentStatus: "Rejected",
                  remarks: result.value || "Rejected by admin",
                }
              : w
          )
        );
        Swal.fire(
          "Rejected!",
          `Withdrawal #${item.id} has been rejected.`,
          "success"
        );
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      vendor: editingWithdrawal ? editingWithdrawal.vendor : "",
      amount: editingWithdrawal ? editingWithdrawal.amount : 0,
      withdrawalDate: editingWithdrawal ? editingWithdrawal.withdrawalDate : "",
      approvedAmount: editingWithdrawal
        ? editingWithdrawal.approvedAmount
        : null,
      paymentStatus: editingWithdrawal
        ? editingWithdrawal.paymentStatus
        : "Pending",
      referenceNo: editingWithdrawal ? editingWithdrawal.referenceNo : "",
      remarks: editingWithdrawal ? editingWithdrawal.remarks : "",
    },
    enableReinitialize: true,
    validationSchema: WithdrawalSchema,
    onSubmit: (values) => {
      if (editingWithdrawal) {
        setWithdrawals(
          withdrawals.map((w) =>
            w.id === editingWithdrawal.id
              ? {
                  ...w,
                  ...values,
                  paymentStatus: values.paymentStatus as
                    | "Pending"
                    | "Approved"
                    | "Rejected"
                    | "Paid",
                }
              : w
          )
        );
        Swal.fire({
          icon: "success",
          title: "Withdrawal Updated",
          text: `Withdrawal #${editingWithdrawal.id} has been updated!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const newWithdrawal: Withdrawal = {
          id: withdrawals.length + 1,
          ...values,
          approvedAmount: null,
          paymentStatus: values.paymentStatus as
            | "Pending"
            | "Approved"
            | "Rejected"
            | "Paid",
          referenceNo: null,
        };
        setWithdrawals([newWithdrawal, ...withdrawals]);
        Swal.fire({
          icon: "success",
          title: "Withdrawal Added",
          text: `Withdrawal #${newWithdrawal.id} has been added!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setModalOpen(false);
      formik.resetForm();
    },
  });

  return (
    <div className="">
      <DataTable
        title="Vendor Withdrawals"
        data={withdrawals}
        columns={[
          { key: "id", label: "Request ID" },
          { key: "vendor", label: "Vendor" },
          {
            key: "amount",
            label: "Amount",
            render: (item: Withdrawal) => <span>₹{item.amount}</span>,
          },
          { key: "withdrawalDate", label: "Withdrawal Date" },
          {
            key: "approvedAmount",
            label: "Approved Amount",
            render: (item: Withdrawal) => (
              <span>
                {item.approvedAmount ? `₹${item.approvedAmount}` : "N/A"}
              </span>
            ),
          },
          {
            key: "paymentStatus",
            label: "Payment Status",
            render: (item: Withdrawal) => (
              <span
                className={`text-sm font-semibold ${
                  item.paymentStatus === "Paid" ||
                  item.paymentStatus === "Approved"
                    ? "text-green-700"
                    : item.paymentStatus === "Rejected"
                    ? "text-red-700"
                    : "text-yellow-700"
                }`}
              >
                {item.paymentStatus}
              </span>
            ),
          },
          {
            key: "referenceNo",
            label: "Reference No",
            render: (item: Withdrawal) => (
              <span>{item.referenceNo || "N/A"}</span>
            ),
          },
          {
            key: "remarks",
            label: "Remarks",
            render: (item: Withdrawal) => <span>{item.remarks || "N/A"}</span>,
          },
          // {
          //   key: "action",
          //   label: "Action",
          //   render: (item: Withdrawal) => (
          //     <div className="flex gap-2">
          //       <button
          //         onClick={() => handleView(item)}
          //         className="px-2 py-1 bg-blue-500 text-white rounded"
          //       >
          //         View
          //       </button>
          //       <button
          //         onClick={() => handleEdit(item)}
          //         className="px-2 py-1 bg-yellow-500 text-white rounded"
          //       >
          //         Edit
          //       </button>
          //       {item.paymentStatus === "Pending" && (
          //         <>
          //           <button
          //             onClick={() => handleApprove(item)}
          //             className="px-2 py-1 bg-green-500 text-white rounded"
          //           >
          //             Approve
          //           </button>
          //           <button
          //             onClick={() => handleReject(item)}
          //             className="px-2 py-1 bg-red-500 text-white rounded"
          //           >
          //             Reject
          //           </button>
          //         </>
          //       )}
          //     </div>
          //   ),
          // },
        ]}
        // onEdit={handleEdit}
        // onApprove={handleApprove}
        // onView={handleView}
        // onReject={handleReject}
        onAdd={handleAdd}
        addButtonLabel="Add Withdrawal"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingWithdrawal ? "Edit Withdrawal" : "Add Withdrawal"}
            </h2>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="font-semibold text-gray-700">Vendor</label>
                <input
                  type="text"
                  placeholder="Vendor"
                  name="vendor"
                  value={formik.values.vendor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.vendor && formik.errors.vendor
                      ? "customInputError"
                      : formik.values.vendor
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.vendor && formik.errors.vendor && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.vendor}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Amount</label>
                <input
                  type="number"
                  placeholder="Amount"
                  name="amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.amount && formik.errors.amount
                      ? "customInputError"
                      : formik.values.amount > 0
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.amount && formik.errors.amount && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.amount}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Withdrawal Date
                </label>
                <input
                  type="date"
                  name="withdrawalDate"
                  value={formik.values.withdrawalDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.withdrawalDate && formik.errors.withdrawalDate
                      ? "customInputError"
                      : formik.values.withdrawalDate
                      ? "filled"
                      : ""
                  }`}
                  required
                />
                {formik.touched.withdrawalDate && formik.errors.withdrawalDate && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.withdrawalDate}
                  </div>
                )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Approved Amount
                </label>
                <input
                  type="number"
                  placeholder="Approved Amount"
                  name="approvedAmount"
                  value={formik.values.approvedAmount || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.touched.approvedAmount &&
                    formik.errors.approvedAmount
                      ? "customInputError"
                      : formik.values.approvedAmount
                      ? "filled"
                      : ""
                  }`}
                />
                {formik.touched.approvedAmount &&
                  formik.errors.approvedAmount && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.approvedAmount}
                    </div>
                  )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formik.values.paymentStatus}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) {
                      e.currentTarget.classList.add("filled");
                    } else {
                      e.currentTarget.classList.remove("filled");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full ${
                    formik.touched.paymentStatus && formik.errors.paymentStatus
                      ? "customSelectError"
                      : formik.values.paymentStatus
                      ? "filled"
                      : ""
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Paid">Paid</option>
                </select>
                {formik.touched.paymentStatus &&
                  formik.errors.paymentStatus && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.paymentStatus}
                    </div>
                  )}
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Reference No
                </label>
                <input
                  type="text"
                  placeholder="Reference No"
                  name="referenceNo"
                  value={formik.values.referenceNo || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.values.referenceNo ? "filled" : ""
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">Remarks</label>
                <textarea
                  placeholder="Remarks"
                  name="remarks"
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${
                    formik.values.remarks ? "filled" : ""
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="customBtn"
                >
                  Cancel
                </button>
                <button type="submit" className="customBtn">
                  {editingWithdrawal ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorWithdrawals;
