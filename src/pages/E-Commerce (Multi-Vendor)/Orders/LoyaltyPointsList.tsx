import { useState, useEffect } from "react";
import DataTable from "../../../components/common/DataTable";
import { useFormik } from "formik";
import * as Yup from "yup";
import apiClient from "../../../api/apiClient";
import Swal from "sweetalert2";

interface LoyaltyConfig {
  id: number;
  name: string;
  points_type: "percentage" | "fixed" | "tiered";
  earned_on: string;
  percentage_rate: number;
  fixed_points: number;
  min_amount: number;
  max_amount: number | null;
  tier_points: number;
  min_order_amount: number;
  max_points_per_order: number | null;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  priority: number;
  created_at?: string;
}

const LoyaltyConfigSchema = Yup.object().shape({
  name: Yup.string().required("Rule name is required"),
  points_type: Yup.string().required("Points type is required"),
  earned_on: Yup.string().required("Earned on is required"),
  min_order_amount: Yup.number()
    .min(0, "Minimum order amount cannot be negative")
    .required("Minimum order amount is required"),
  priority: Yup.number()
    .min(1, "Priority must be at least 1")
    .required("Priority is required"),
  valid_from: Yup.string().required("Valid from date is required"),
});

const LoyaltyPointsList = () => {
  const [configs, setConfigs] = useState<LoyaltyConfig[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LoyaltyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "active">("list");

  // LOAD LOYALTY CONFIGS
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const res = await apiClient.get("ecommerce/loyalty/config/");
      const list = res.data.data || res.data.results || res.data;
      setConfigs(list);
    } catch (err) {
      console.error("Loyalty config load error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load loyalty configurations",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiry";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format date for input field
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleAdd = () => {
    setEditingConfig(null);
    setModalOpen(true);
  };

  const handleEdit = (item: LoyaltyConfig) => {
    setEditingConfig(item);
    setModalOpen(true);
  };

  const handleView = async (item: LoyaltyConfig) => {
    try {
      const res = await apiClient.get(`ecommerce/loyalty/config/${item.id}/`);
      if (res.data) {
        const config = res.data.data || res.data;
        
        // Calculate points value helper function
        const calculatePointsValue = (config: LoyaltyConfig, orderAmount: number) => {
          let points = 0;
          if (orderAmount < config.min_order_amount) return "0.00";
          
          switch (config.points_type) {
            case "percentage":
              points = Math.round((orderAmount * config.percentage_rate) / 100);
              break;
            case "fixed":
              points = config.fixed_points;
              break;
            case "tiered":
              if (orderAmount >= config.min_amount) {
                if (!config.max_amount || orderAmount <= config.max_amount) {
                  points = config.tier_points;
                }
              }
              break;
          }
          
          if (config.max_points_per_order && points > config.max_points_per_order) {
            points = config.max_points_per_order;
          }
          
          return (points * 0.1).toFixed(2); // 100 points = ₹10
        };
        
        Swal.fire({
          title: `<strong>${config.name}</strong>`,
          html: `
            <div class="space-y-4">
              <!-- Basic Info -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Configuration Details</h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Points Type:</span>
                    <span class="w-1/2 capitalize">${config.points_type}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Earned On:</span>
                    <span class="w-1/2">${config.earned_on.replace("_", " ")}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Min Order:</span>
                    <span class="w-1/2">₹${config.min_order_amount}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Priority:</span>
                    <span class="w-1/2">${config.priority}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Status:</span>
                    <span class="w-1/2 ${config.is_active ? "text-green-600" : "text-red-600"}">
                      ${config.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Points Details -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Points Calculation</h4>
                <div class="space-y-2">
                  ${
                    config.points_type === "percentage"
                      ? `
                        <div class="flex justify-between">
                          <span class="font-semibold text-gray-700">Percentage Rate:</span>
                          <span>${config.percentage_rate}%</span>
                        </div>
                      `
                      : config.points_type === "fixed"
                      ? `
                        <div class="flex justify-between">
                          <span class="font-semibold text-gray-700">Fixed Points:</span>
                          <span>${config.fixed_points} points</span>
                        </div>
                      `
                      : `
                        <div class="flex justify-between">
                          <span class="font-semibold text-gray-700">Tier Points:</span>
                          <span>${config.tier_points} points</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="font-semibold text-gray-700">Amount Range:</span>
                          <span>₹${config.min_amount} - ${config.max_amount ? "₹" + config.max_amount : "No max"}</span>
                        </div>
                      `
                  }
                  ${
                    config.max_points_per_order
                      ? `
                        <div class="flex justify-between">
                          <span class="font-semibold text-gray-700">Max Points/Order:</span>
                          <span>${config.max_points_per_order}</span>
                        </div>
                      `
                      : ""
                  }
                </div>
              </div>

              <!-- Validity -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Validity</h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Valid From:</span>
                    <span class="w-1/2">${formatDate(config.valid_from)}</span>
                  </div>
                  <div class="flex border-b pb-2">
                    <span class="w-1/2 font-semibold text-gray-700">Valid To:</span>
                    <span class="w-1/2">${formatDate(config.valid_to)}</span>
                  </div>
                </div>
              </div>

              <!-- Example Calculation -->
              <div class="border rounded-lg p-3">
                <h4 class="font-semibold text-gray-800 mb-2">Example Calculation</h4>
                <div class="text-sm text-gray-600">
                  For an order of ₹1,000:
                  <ul class="list-disc pl-5 mt-1">
                    ${
                      config.points_type === "percentage"
                        ? `<li>Points earned: ${Math.round((1000 * config.percentage_rate) / 100)}</li>`
                        : config.points_type === "fixed"
                        ? `<li>Points earned: ${config.fixed_points}</li>`
                        : config.min_amount <= 1000
                        ? `<li>Points earned: ${config.tier_points}</li>`
                        : `<li>No points (order below minimum tier)</li>`
                    }
                    <li>Points value: ₹${calculatePointsValue(config, 1000)}</li>
                  </ul>
                </div>
              </div>
            </div>
          `,
          icon: "info",
          confirmButtonText: "Close",
          width: "650px",
          showCloseButton: true,
        });
      }
    } catch (error: any) {
      console.error("Error loading config details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load configuration details",
      });
    }
  };

  const handleDelete = async (item: LoyaltyConfig) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This configuration will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiClient.delete(`ecommerce/loyalty/config/${item.id}/`);
      setConfigs((prev) => prev.filter((c) => c.id !== item.id));

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Configuration deleted successfully!",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete configuration",
      });
    }
  };

  const toggleActiveStatus = async (item: LoyaltyConfig) => {
    try {
      await apiClient.post(`ecommerce/loyalty/config/${item.id}/toggle_active/`);
      
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === item.id ? { ...c, is_active: !c.is_active } : c
        )
      );

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Configuration ${item.is_active ? "deactivated" : "activated"} successfully!`,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status",
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      name: editingConfig?.name || "",
      points_type: editingConfig?.points_type || "percentage",
      earned_on: editingConfig?.earned_on || "all_orders",
      percentage_rate: editingConfig?.percentage_rate || 1.0,
      fixed_points: editingConfig?.fixed_points || 0,
      min_amount: editingConfig?.min_amount || 0,
      max_amount: editingConfig?.max_amount || null,
      tier_points: editingConfig?.tier_points || 0,
      min_order_amount: editingConfig?.min_order_amount || 0,
      max_points_per_order: editingConfig?.max_points_per_order || null,
      valid_from: editingConfig?.valid_from ? formatDateForInput(editingConfig.valid_from) : "",
      valid_to: editingConfig?.valid_to ? formatDateForInput(editingConfig.valid_to) : "",
      is_active: editingConfig?.is_active ?? true,
      priority: editingConfig?.priority || 1,
    },
    enableReinitialize: true,
    validationSchema: LoyaltyConfigSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        const payload = {
          ...values,
          max_amount: values.max_amount || null,
          max_points_per_order: values.max_points_per_order || null,
          valid_to: values.valid_to || null,
        };

        if (editingConfig) {
          const res = await apiClient.put(
            `ecommerce/loyalty/config/${editingConfig.id}/`,
            payload
          );
          const updated = res.data.data || res.data;
          setConfigs((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Configuration updated successfully!",
          });
        } else {
          const res = await apiClient.post("ecommerce/loyalty/config/", payload);
          const created = res.data.data || res.data;
          setConfigs((prev) => [created, ...prev]);
          Swal.fire({
            icon: "success",
            title: "Created",
            text: "Configuration created successfully!",
          });
        }

        setModalOpen(false);
        resetForm();
      } catch (err: any) {
        console.error("Save error:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to save configuration",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Get filtered configs based on active tab
  const filteredConfigs = configs.filter((config) => {
    if (activeTab === "active") return config.is_active;
    return true;
  });

  // Calculate example points for preview
  const calculateExamplePoints = () => {
    const { points_type, percentage_rate, fixed_points, tier_points, min_order_amount, min_amount, max_amount } = formik.values;
    const exampleAmount = 1000;
    
    if (exampleAmount < min_order_amount) return 0;
    
    switch (points_type) {
      case "percentage":
        return Math.round((exampleAmount * percentage_rate) / 100);
      case "fixed":
        return fixed_points;
      case "tiered":
        if (exampleAmount >= min_amount) {
          if (!max_amount || exampleAmount <= max_amount) {
            return tier_points;
          }
        }
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className="">
      {/* Tabs */}
      <div className="flex space-x-4 mb-4 border-b">
        <button
          className={`pb-2 px-1 font-medium ${activeTab === "list" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("list")}
        >
          All Rules ({configs.length})
        </button>
        <button
          className={`pb-2 px-1 font-medium ${activeTab === "active" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("active")}
        >
          Active Rules ({configs.filter(c => c.is_active).length})
        </button>
      </div>

      <DataTable
        title="Loyalty Points Configuration"
        data={filteredConfigs}
        columns={[
          {
            key: "is_active",
            label: "Status",
            render: (item: LoyaltyConfig) => (
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${item.is_active ? "bg-green-500" : "bg-gray-400"}`}
                  title={item.is_active ? "Active" : "Inactive"}
                ></div>
                <span className={`text-sm ${item.is_active ? "text-green-600" : "text-gray-600"}`}>
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ),
          },
          {
            key: "name",
            label: "Rule Name",
            render: (item: LoyaltyConfig) => (
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {item.points_type} • {item.earned_on.replace("_", " ")}
                </div>
              </div>
            ),
          },
          {
            key: "points",
            label: "Points",
            render: (item: LoyaltyConfig) => {
              switch (item.points_type) {
                case "percentage":
                  return (
                    <div>
                      <div className="font-medium">{item.percentage_rate}%</div>
                      <div className="text-xs text-gray-500">of order amount</div>
                    </div>
                  );
                case "fixed":
                  return (
                    <div>
                      <div className="font-medium">{item.fixed_points}</div>
                      <div className="text-xs text-gray-500">points per order</div>
                    </div>
                  );
                case "tiered":
                  return (
                    <div>
                      <div className="font-medium">{item.tier_points}</div>
                      <div className="text-xs text-gray-500">
                        ₹{item.min_amount} - {item.max_amount ? `₹${item.max_amount}` : "No max"}
                      </div>
                    </div>
                  );
                default:
                  return "-";
              }
            },
          },
          {
            key: "min_order_amount",
            label: "Min Order",
            render: (item: LoyaltyConfig) => (
              <div className="font-medium">₹{item.min_order_amount}</div>
            ),
          },
          {
            key: "validity",
            label: "Validity",
            render: (item: LoyaltyConfig) => (
              <div>
                <div className="text-sm">{formatDate(item.valid_from)}</div>
                <div className="text-xs text-gray-500">
                  {item.valid_to ? `to ${formatDate(item.valid_to)}` : "No expiry"}
                </div>
              </div>
            ),
          },
          {
            key: "priority",
            label: "Priority",
            render: (item: LoyaltyConfig) => (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                P{item.priority}
              </span>
            ),
          },
        ]}
        onEdit={handleEdit}
        onView={handleView}
        onAdd={handleAdd}
        onDelete={handleDelete}
        addButtonLabel="Add Rule"
        customActions={[
          {
            label: (item: LoyaltyConfig) => item.is_active ? "Deactivate" : "Activate",
            onClick: toggleActiveStatus,
            className: (item: LoyaltyConfig) => 
              item.is_active 
                ? "text-orange-600 hover:text-orange-800" 
                : "text-green-600 hover:text-green-800",
          },
        ]}
      />

      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingConfig ? "Edit Loyalty Rule" : "Add Loyalty Rule"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* BASIC INFO */}
              <h3 className="block mb-1 font-medium mt-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Standard Points, Festival Bonus"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.name && formik.errors.name
                        ? "customInputError"
                        : formik.values.name
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-sm">{formik.errors.name}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Points Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="points_type"
                    value={formik.values.points_type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.points_type && formik.errors.points_type
                        ? "customSelectError"
                        : formik.values.points_type
                        ? "filled"
                        : ""
                    }`}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="percentage">Percentage of Purchase</option>
                    <option value="fixed">Fixed Points per Order</option>
                    <option value="tiered">Tiered (Price Range Based)</option>
                  </select>
                  {formik.touched.points_type && formik.errors.points_type && (
                    <div className="text-red-500 text-sm">{formik.errors.points_type}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Earned On <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="earned_on"
                    value={formik.values.earned_on}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect w-full ${
                      formik.touched.earned_on && formik.errors.earned_on
                        ? "customSelectError"
                        : formik.values.earned_on
                        ? "filled"
                        : ""
                    }`}
                    required
                  >
                    <option value="">Select When</option>
                    <option value="all_orders">All Orders</option>
                    <option value="above_amount">Orders Above Amount</option>
                    <option value="specific_products">Specific Products</option>
                    <option value="specific_categories">Specific Categories</option>
                  </select>
                  {formik.touched.earned_on && formik.errors.earned_on && (
                    <div className="text-red-500 text-sm">{formik.errors.earned_on}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Priority"
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.priority && formik.errors.priority
                        ? "customInputError"
                        : formik.values.priority
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.priority && formik.errors.priority && (
                    <div className="text-red-500 text-sm">{formik.errors.priority}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Higher priority rules are applied first
                  </div>
                </div>
              </div>

              {/* POINTS CALCULATION */}
              <h3 className="block mb-1 font-medium mt-4">Points Calculation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formik.values.points_type === "percentage" && (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Percentage Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g., 1.0"
                        name="percentage_rate"
                        value={formik.values.percentage_rate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`customInput w-full ${
                          formik.touched.percentage_rate && formik.errors.percentage_rate
                            ? "customInputError"
                            : formik.values.percentage_rate
                            ? "filled"
                            : ""
                        }`}
                        required
                      />
                      <span className="ml-2 text-gray-700">%</span>
                    </div>
                    {formik.touched.percentage_rate && formik.errors.percentage_rate && (
                      <div className="text-red-500 text-sm">{formik.errors.percentage_rate}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      1% = 10 points per ₹1000 order
                    </div>
                  </div>
                )}

                {formik.values.points_type === "fixed" && (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Fixed Points <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 100"
                      name="fixed_points"
                      value={formik.values.fixed_points}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`customInput w-full ${
                        formik.touched.fixed_points && formik.errors.fixed_points
                          ? "customInputError"
                          : formik.values.fixed_points
                          ? "filled"
                          : ""
                      }`}
                      required
                    />
                    {formik.touched.fixed_points && formik.errors.fixed_points && (
                      <div className="text-red-500 text-sm">{formik.errors.fixed_points}</div>
                    )}
                  </div>
                )}

                {formik.values.points_type === "tiered" && (
                  <>
                    <div>
                      <label className="font-semibold text-gray-700">
                        Minimum Amount Per Tier <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-700">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g., 1000"
                          name="min_amount"
                          value={formik.values.min_amount}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`customInput w-full ${
                            formik.touched.min_amount && formik.errors.min_amount
                              ? "customInputError"
                              : formik.values.min_amount
                              ? "filled"
                              : ""
                          }`}
                          required
                        />
                      </div>
                      {formik.touched.min_amount && formik.errors.min_amount && (
                        <div className="text-red-500 text-sm">{formik.errors.min_amount}</div>
                      )}
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700">
                        Maximum Amount
                      </label>
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-700">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Leave empty for no maximum"
                          name="max_amount"
                          value={formik.values.max_amount || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`customInput w-full ${
                            formik.values.max_amount ? "filled" : ""
                          }`}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Leave empty for orders above minimum amount
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700">
                        Tier Points <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g., 50"
                        name="tier_points"
                        value={formik.values.tier_points}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`customInput w-full ${
                          formik.touched.tier_points && formik.errors.tier_points
                            ? "customInputError"
                            : formik.values.tier_points
                            ? "filled"
                            : ""
                        }`}
                        required
                      />
                      {formik.touched.tier_points && formik.errors.tier_points && (
                        <div className="text-red-500 text-sm">{formik.errors.tier_points}</div>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="font-semibold text-gray-700">
                    Minimum Order Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-700">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 500"
                      name="min_order_amount"
                      value={formik.values.min_order_amount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`customInput w-full ${
                        formik.touched.min_order_amount && formik.errors.min_order_amount
                          ? "customInputError"
                          : formik.values.min_order_amount
                          ? "filled"
                          : ""
                      }`}
                      required
                    />
                  </div>
                  {formik.touched.min_order_amount && formik.errors.min_order_amount && (
                    <div className="text-red-500 text-sm">{formik.errors.min_order_amount}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Minimum order amount to earn points
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">
                    Max Points Per Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty for unlimited"
                    name="max_points_per_order"
                    value={formik.values.max_points_per_order || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.values.max_points_per_order ? "filled" : ""
                    }`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Maximum points that can be earned in a single order
                  </div>
                </div>
              </div>

              {/* VALIDITY */}
              <h3 className="block mb-1 font-medium mt-4">Validity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">
                    Valid From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="valid_from"
                    value={formik.values.valid_from}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.touched.valid_from && formik.errors.valid_from
                        ? "customInputError"
                        : formik.values.valid_from
                        ? "filled"
                        : ""
                    }`}
                    required
                  />
                  {formik.touched.valid_from && formik.errors.valid_from && (
                    <div className="text-red-500 text-sm">{formik.errors.valid_from}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Valid To</label>
                  <input
                    type="date"
                    name="valid_to"
                    value={formik.values.valid_to || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${
                      formik.values.valid_to ? "filled" : ""
                    }`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Leave empty for no expiry
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="mt-4">
                <label className="font-semibold text-gray-700 mr-4">Status</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      value="true"
                      checked={formik.values.is_active === true}
                      onChange={() => formik.setFieldValue("is_active", true)}
                      className="mr-2"
                    />
                    <span className="text-green-600">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      value="false"
                      checked={formik.values.is_active === false}
                      onChange={() => formik.setFieldValue("is_active", false)}
                      className="mr-2"
                    />
                    <span className="text-red-600">Inactive</span>
                  </label>
                </div>
              </div>

              {/* PREVIEW */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Points Preview</h4>
                <div className="text-sm text-gray-600">
                  <p>For an order of ₹1,000:</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Points Earned:</span>
                    <span className="font-semibold text-blue-600">
                      {calculateExamplePoints()} points
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Points Value (100 points = ₹10):</span>
                    <span className="font-semibold text-green-600">
                      ₹{(calculateExamplePoints() * 0.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="customBtn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="customBtn"
                  disabled={isLoading}
                >
                  {isLoading
                    ? editingConfig
                      ? "Updating..."
                      : "Adding..."
                    : editingConfig
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPointsList;