/*  CommissionDistributionRules.tsx  */
import { useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import ToggleSwitch from "../../../components/common/ToggleSwitch";

/* -------------------------------------------------
   1. Exact shape of the form
   ------------------------------------------------- */
interface CommissionRule {
  uplineDistribution: number[];               // 12 levels
  directSaleCommission: number;
  indirectSaleCommission: number;
  cappingLimit: number;
  autoUpgrade: boolean;
  commissionRelease: "Manual" | "Auto";
  payoutMode: "Wallet" | "Bank Transfer";
}

/* -------------------------------------------------
   2. Initial data
   ------------------------------------------------- */
const initialRules: CommissionRule = {
  uplineDistribution: [
    2, 1.5, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
  ],
  directSaleCommission: 2,
  indirectSaleCommission: 1,
  cappingLimit: 50000,
  autoUpgrade: true,
  commissionRelease: "Manual",
  payoutMode: "Wallet",
};

/* -------------------------------------------------
   3. Component
   ------------------------------------------------- */
const CommissionDistributionRules = () => {
  const [isLoading, setIsLoading] = useState(false);

  /* ----- Formik with explicit generic ----- */
  const formik = useFormik<CommissionRule>({
    initialValues: initialRules,

    /* ----- Yup schema (typed) ----- */
    validationSchema: Yup.object({
      uplineDistribution: Yup.array()
        .of(
          Yup.number()
            .min(0, "Commission cannot be negative")
            .required("Required")
        )
        .length(12, "Must provide commissions for all 12 levels"),
      directSaleCommission: Yup.number()
        .min(0, "Commission cannot be negative")
        .required("Direct Sale Commission is required"),
      indirectSaleCommission: Yup.number()
        .min(0, "Commission cannot be negative")
        .required("Indirect Sale Commission is required"),
      cappingLimit: Yup.number()
        .min(0, "Capping Limit cannot be negative")
        .required("Capping Limit is required"),
      autoUpgrade: Yup.boolean().required(),
      commissionRelease: Yup.string().required(),
      payoutMode: Yup.string().required(),
    }),

    onSubmit: (values) => {
      setIsLoading(true);
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Rules Updated",
          text: "Commission distribution rules saved successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsLoading(false);
      }, 1000);
    },
  });

  /* -------------------------------------------------
     Helper to safely read touched / errors for the array
     ------------------------------------------------- */
  const getArrayTouched = (idx: number) => {
    const touchedArray = formik.touched.uplineDistribution;
    // Check if the entire array field is touched
    return touchedArray === true;
  };

  const getArrayError = (idx: number) => {
    const errorArray = formik.errors.uplineDistribution;
    if (Array.isArray(errorArray)) {
      return errorArray[idx];
    }
    return errorArray as string | undefined;
  };
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        Commission Distribution Rules
      </h2>

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 p-6">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {/* ---------- Upline Distribution (12 levels) ---------- */}
          <div className="mb-2">
            <label className="block mb-1 font-medium">
              Upline Commission Distribution (%)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="mb-2">
                  <label className="block mb-1 text-sm text-gray-600">
                    Level {i + 1}
                  </label>
                  <input
                    type="number"
                    name={`uplineDistribution[${i}]`}
                    value={formik.values.uplineDistribution[i]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={`Level ${i + 1} %`}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getArrayTouched(i) && getArrayError(i)
                        ? "customInputError"
                        : "customInput"
                      }`}
                  />
                  {getArrayTouched(i) && getArrayError(i) && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {getArrayError(i)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Direct Sale Commission ---------- */}
          <div className="mb-2">
            <label className="block mb-1 font-medium">
              Direct Sale Commission (%)
            </label>
            <input
              type="number"
              name="directSaleCommission"
              value={formik.values.directSaleCommission}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Direct Sale Commission"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formik.touched.directSaleCommission &&
                  formik.errors.directSaleCommission
                  ? "customInputError"
                  : "customInput"
                }`}
            />
            {formik.touched.directSaleCommission &&
              formik.errors.directSaleCommission && (
                <div className="text-red-500 text-sm mt-1 ms-2">
                  {formik.errors.directSaleCommission}
                </div>
              )}
          </div>

          {/* ---------- Indirect Sale Commission ---------- */}
          <div className="mb-2">
            <label className="block mb-1 font-medium">
              Indirect Sale Commission (%)
            </label>
            <input
              type="number"
              name="indirectSaleCommission"
              value={formik.values.indirectSaleCommission}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Indirect Sale Commission"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formik.touched.indirectSaleCommission &&
                  formik.errors.indirectSaleCommission
                  ? "customInputError"
                  : "customInput"
                }`}
            />
            {formik.touched.indirectSaleCommission &&
              formik.errors.indirectSaleCommission && (
                <div className="text-red-500 text-sm mt-1 ms-2">
                  {formik.errors.indirectSaleCommission}
                </div>
              )}
          </div>

          {/* ---------- Capping Limit ---------- */}
          <div className="mb-2">
            <label className="block mb-1 font-medium">
              Capping Limit (₹)
            </label>
            <input
              type="number"
              name="cappingLimit"
              value={formik.values.cappingLimit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Capping Limit"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formik.touched.cappingLimit && formik.errors.cappingLimit
                  ? "customInputError"
                  : "customInput"
                }`}
            />
            {formik.touched.cappingLimit && formik.errors.cappingLimit && (
              <div className="text-red-500 text-sm mt-1 ms-2">
                {formik.errors.cappingLimit}
              </div>
            )}
          </div>

          {/* ---------- Auto Upgrade ---------- */}
          <div className="mb-2">
            <label className="block mb-1 font-medium">Auto Upgrade</label>
            <div className="flex items-center gap-2">
              <ToggleSwitch
                checked={formik.values.autoUpgrade}
                onChange={(val) => formik.setFieldValue("autoUpgrade", val)}
              />
              <span>{formik.values.autoUpgrade ? "Yes" : "No"}</span>
            </div>
          </div>

          {/* ---------- Commission Release ---------- */}
          <div className="mb-2">
            <label className="block mb-1 font-medium">
              Commission Release
            </label>
            <select
              name="commissionRelease"
              value={formik.values.commissionRelease}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`customSelect w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formik.touched.commissionRelease && formik.errors.commissionRelease
                  ? "paymentSelectError"
                  : formik.values.commissionRelease
                    ? "filled"
                    : ""
                }`}
            >
              <option value="">Select</option>
              <option value="Manual">Manual</option>
              <option value="Auto">Auto</option>
            </select>
            {formik.touched.commissionRelease &&
              formik.errors.commissionRelease && (
                <div className="text-red-500 text-sm mt-1 ms-2">
                  {formik.errors.commissionRelease}
                </div>
              )}
          </div>

          {/* ---------- Payout Mode ---------- */}
          <div className="mb-2">
            <label className="block mb-1 font-medium">Payout Mode</label>
            <select
              name="payoutMode"
              value={formik.values.payoutMode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`customSelect w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formik.touched.payoutMode && formik.errors.payoutMode
                  ? "paymentSelectError"
                  : formik.values.payoutMode
                    ? "filled"
                    : ""
                }`}
            >
              <option value="">Select</option>
              <option value="Wallet">Wallet</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            {formik.touched.payoutMode && formik.errors.payoutMode && (
              <div className="text-red-500 text-sm mt-1 ms-2">
                {formik.errors.payoutMode}
              </div>
            )}
          </div>

          {/* ---------- Submit ---------- */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? "Processing…" : "Save Rules"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionDistributionRules;