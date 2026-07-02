/*  ReferralCodeSettings.tsx  */
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

interface ReferralSetting {
  id: number;                     // required by DataTable<T extends { id: … }>
  codePattern: string;
  prefix: string;
  length: number;
  validityDays: number;
  reusable: boolean;
  maxDownlines: number;
  status: "Active" | "Inactive";
}

const mockSettings: ReferralSetting[] = [
  {
    id: 1,
    codePattern: "MLM-XXXXXX",
    prefix: "MLM",
    length: 6,
    validityDays: 365,
    reusable: true,
    maxDownlines: 50,
    status: "Active",
  },
];

const ReferralCodeSettings = () => {
  const [settings, setSettings] = useState<ReferralSetting[]>(mockSettings);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ReferralSetting | null>(null);

  /* ------------------- Formik ------------------- */
  const formik = useFormik({
    initialValues: {
      prefix: editing?.prefix ?? "",
      length: editing?.length ?? 6,
      validityDays: editing?.validityDays ?? 30,
      reusable: editing?.reusable ?? false,
      maxDownlines: editing?.maxDownlines ?? 10,
      status: editing?.status ?? "Active",
    },
    validationSchema: Yup.object({
      prefix: Yup.string().required("Prefix is required"),
      length: Yup.number()
        .min(4, "Min 4")
        .max(10, "Max 10")
        .required("Length is required"),
      validityDays: Yup.number()
        .min(1, "Min 1 day")
        .required("Validity is required"),
      reusable: Yup.boolean(),
      maxDownlines: Yup.number()
        .min(1, "Min 1")
        .required("Max downlines is required"),
      status: Yup.string().oneOf(["Active", "Inactive"]).required(),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      const newSetting: ReferralSetting = {
        id: editing?.id ?? settings.length + 1,
        codePattern: `${values.prefix}-${"X".repeat(values.length)}`,
        ...values,
      };

      if (editing) {
        setSettings((prev) =>
          prev.map((s) => (s.id === editing.id ? newSetting : s))
        );
        Swal.fire("Updated!", `${newSetting.codePattern} updated.`, "success");
      } else {
        setSettings((prev) => [...prev, newSetting]);
        Swal.fire("Added!", `${newSetting.codePattern} added.`, "success");
      }

      setModalOpen(false);
      formik.resetForm();
    },
  });

  /* ------------------- Handlers ------------------- */
  const handleEdit = (item: ReferralSetting) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = (item: ReferralSetting) => {
    Swal.fire({
      title: "Delete Setting?",
      text: `${item.codePattern} will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then((res) => {
      if (res.isConfirmed) {
        setSettings((prev) => prev.filter((s) => s.id !== item.id));
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  /* ------------------- Render ------------------- */
  return (
    <div>
      {/* ---------- DataTable ---------- */}
      <DataTable<ReferralSetting>
        title="Referral Code Settings"
        data={settings}
        columns={[
          { key: "id", label: "ID" },
          {
            key: "codePattern",
            label: "Code Pattern",
            render: (s) => (
              <span className="font-mono text-sm text-blue-600">
                {s.codePattern}
              </span>
            ),
          },
          { key: "prefix", label: "Prefix" },
          { key: "length", label: "Length" },
          { key: "validityDays", label: "Validity (Days)" },
          {
            key: "reusable",
            label: "Reusable",
            render: (s) => (
              <span className={s.reusable ? "text-green-600" : "text-gray-500"}>
                {s.reusable ? "Yes" : "No"}
              </span>
            ),
          },
          { key: "maxDownlines", label: "Max Downlines" },
          {
            key: "status",
            label: "Status",
            render: (s) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  s.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {s.status}
              </span>
            ),
          },
        ]}
        onAdd={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Setting"
      />

      {/* ---------- Modal (3‑column responsive grid) ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-xl font-bold mb-7">
              {editing ? "Edit Referral Code" : "Add Referral Code Setting"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div>
                <label className="block mb-1 font-medium">Prefix</label>
                <input
                  name="prefix"
                  value={formik.values.prefix}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="MLM"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.prefix && formik.errors.prefix
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.prefix && formik.errors.prefix && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.prefix}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Length</label>
                <input
                  type="number"
                  name="length"
                  value={formik.values.length}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="4"
                  max="10"
                  placeholder="6"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.length && formik.errors.length
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.length && formik.errors.length && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.length}</div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Validity (Days)</label>
                <input
                  type="number"
                  name="validityDays"
                  value={formik.values.validityDays}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="1"
                  placeholder="365"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.validityDays && formik.errors.validityDays
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.validityDays && formik.errors.validityDays && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.validityDays}</div>
                )}
              </div>

              {/* Row 2 */}
              <div>
                <label className="block mb-1 font-medium">Max Downlines</label>
                <input
                  type="number"
                  name="maxDownlines"
                  value={formik.values.maxDownlines}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="1"
                  placeholder="50"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.maxDownlines && formik.errors.maxDownlines
                      ? "customInputError"
                      : "customInput"
                  }`}
                />
                {formik.touched.maxDownlines && formik.errors.maxDownlines && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.maxDownlines}</div>
                )}
              </div>

              <div className="md:col-span-1 flex items-center gap-4">
                <label className="font-medium">Reusable</label>
                <ToggleSwitch
                  checked={formik.values.reusable}
                  onChange={(v) => formik.setFieldValue("reusable", v)}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.status && formik.errors.status
                      ? "customInputError"
                      : "customInput"
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.status}</div>
                )}
              </div>

              {/* Buttons */}
              <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editing ? "Update" : "Add Setting"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              x
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCodeSettings;