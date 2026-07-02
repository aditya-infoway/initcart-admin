// src/pages/subscription/SubscriptionMaster.tsx
import React, { useEffect, useState } from "react";
import DataTable from "../../../components/common/DataTable";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import apiClient from "../../../api/apiClient";

// Static service types
const SERVICE_TYPES = [
  { value: "salon", label: "Salon" },
  { value: "gym", label: "Gym" },
  { value: "real_estate", label: "Real Estate" },
  { value: "travel_agency", label: "Travel Agency" },
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech Industry" },
  { value: "hotel", label: "Hotel" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "professional", label: "Professiona" },
  { value: "restaurant", label: "Restaurant" }
];

// Static subscription types
const SUBSCRIPTION_TYPES = [
  { value: "1 Month", label: "1 Month" },
  { value: "3 Months", label: "3 Months" },
  { value: "6 Months", label: "6 Months" },
  { value: "1 year", label: "1 Year" },
];

interface SubscriptionItem {
  id: number;
  service_type: string;
  subscription_type: string;
  amount: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface FormValues {
  service_type: string;
  subscription_type: string;
  amount: string;
  description: string;
  is_active: boolean;
}

const SubscriptionSchema = Yup.object().shape({
  service_type: Yup.string().required("Service type is required"),
  subscription_type: Yup.string().required("Subscription type is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .min(0, "Amount must be at least 0"),
  description: Yup.string().required("Description is required"),
  is_active: Yup.boolean().required("Status is required")
});

const SubscriptionMaster: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [serverErrors, setServerErrors] = useState<any>(null);

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    setIsLoadingList(true);
    try {
      const res = await apiClient.get("/ecommerce/subscriptions/");
      
      let list: any[] = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res.data && typeof res.data === 'object') {
        list = [res.data];
      }

      const formattedList = list.map((item: any) => {
        // Convert amount to number properly
        let amountNumber = 0;
        
        if (item.amount !== null && item.amount !== undefined) {
          if (typeof item.amount === 'number') {
            amountNumber = item.amount;
          } else if (typeof item.amount === 'string') {
            amountNumber = parseFloat(item.amount);
          } else {
            amountNumber = parseFloat(String(item.amount));
          }
        }
        
        // Handle NaN
        if (isNaN(amountNumber)) {
          amountNumber = 0;
        }

        return {
          id: item.id || 0,
          service_type: item.service_type || "",
          subscription_type: item.subscription_type || "",
          amount: amountNumber,
          description: item.description || "",
          is_active: item.is_active !== undefined ? 
                     (typeof item.is_active === 'boolean' ? item.is_active : 
                      item.is_active === 'true' || item.is_active === 1 || item.is_active === '1') : 
                     true,
          created_at: item.created_at || new Date().toISOString()
        };
      });

      setSubscriptions(formattedList);
    } catch (err: any) {
      console.error("Fetch subscriptions error:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to load subscriptions",
        icon: "error",
        background: "#1f2937",
        color: "#f9fafb"
      });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const resetModalState = () => {
    setServerErrors(null);
    setEditingSubscription(null);
  };

  const handleAdd = () => {
    resetModalState();
    setModalOpen(true);
  };

  const handleEdit = (item: SubscriptionItem) => {
    resetModalState();
    setEditingSubscription(item);
    setModalOpen(true);
  };

  const handleDelete = (item: SubscriptionItem) => {
    Swal.fire({
      title: "Delete Subscription",
      text: `Are you sure you want to delete ${item.service_type} - ${item.subscription_type} subscription?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#1f2937",
      color: "#f9fafb"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/ecommerce/subscriptions/${item.id}/`);
          setSubscriptions(prev => prev.filter(s => s.id !== item.id));
          Swal.fire({
            title: "Deleted!",
            text: "Subscription has been deleted.",
            icon: "success",
            background: "#1f2937",
            color: "#f9fafb"
          });
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire({
            title: "Error",
            text: "Failed to delete subscription",
            icon: "error",
            background: "#1f2937",
            color: "#f9fafb"
          });
        }
      }
    });
  };

  const handleToggleStatus = async (item: SubscriptionItem) => {
    try {
      const updatedStatus = !item.is_active;
      await apiClient.patch(`/ecommerce/subscriptions/${item.id}/`, {
        is_active: updatedStatus
      });

      setSubscriptions(prev => prev.map(s =>
        s.id === item.id ? { ...s, is_active: updatedStatus } : s
      ));

      Swal.fire({
        title: "Status Updated",
        text: `Subscription is now ${updatedStatus ? "active" : "inactive"}`,
        icon: "success",
        background: "#1f2937",
        color: "#f9fafb"
      });
    } catch (err) {
      console.error("Toggle status error:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to update status",
        icon: "error",
        background: "#1f2937",
        color: "#f9fafb"
      });
    }
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      service_type: editingSubscription?.service_type || "",
      subscription_type: editingSubscription?.subscription_type || "",
      amount: editingSubscription?.amount ? editingSubscription.amount.toString() : "",
      description: editingSubscription?.description || "",
      is_active: editingSubscription?.is_active !== undefined ? editingSubscription.is_active : true
    },
    enableReinitialize: true,
    validationSchema: SubscriptionSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setServerErrors(null);

      try {
        // Parse amount properly
        const amountNumber = parseFloat(values.amount);
        
        // Validate amount
        if (isNaN(amountNumber) || amountNumber < 0) {
          throw new Error("Invalid amount value");
        }
        
        const subscriptionData = {
          service_type: values.service_type,
          subscription_type: values.subscription_type,
          amount: amountNumber, // Send as number
          description: values.description,
          is_active: values.is_active
        };

        if (editingSubscription) {
          // Update
          const res = await apiClient.put(`/ecommerce/subscriptions/${editingSubscription.id}/`, subscriptionData);
          const updatedAmount = typeof res.data.amount === 'number' ? 
                               res.data.amount : 
                               parseFloat(res.data.amount);

          setSubscriptions(prev => prev.map(s =>
            s.id === editingSubscription.id ? {
              ...s,
              service_type: res.data.service_type || values.service_type,
              subscription_type: res.data.subscription_type || values.subscription_type,
              amount: updatedAmount,
              description: res.data.description || values.description,
              is_active: res.data.is_active !== undefined ? res.data.is_active : values.is_active
            } : s
          ));

          Swal.fire({
            title: "Updated!",
            text: "Subscription updated successfully",
            icon: "success",
            background: "#1f2937",
            color: "#f9fafb"
          });
        } else {
          // Create
          const res = await apiClient.post("/ecommerce/subscriptions/", subscriptionData);
          const createdAmount = typeof res.data.amount === 'number' ? 
                               res.data.amount : 
                               parseFloat(res.data.amount);

          setSubscriptions(prev => [{
            id: res.data.id,
            service_type: res.data.service_type || values.service_type,
            subscription_type: res.data.subscription_type || values.subscription_type,
            amount: createdAmount,
            description: res.data.description || values.description,
            is_active: res.data.is_active !== undefined ? res.data.is_active : values.is_active,
            created_at: res.data.created_at || new Date().toISOString()
          }, ...prev]);

          Swal.fire({
            title: "Added!",
            text: "Subscription added successfully",
            icon: "success",
            background: "#1f2937",
            color: "#f9fafb"
          });
        }

        setModalOpen(false);
        resetModalState();
        formik.resetForm();
      } catch (err: any) {
        console.error("Save error:", err);
        
        if (err.response?.data) {
          setServerErrors(err.response.data);
        }

        Swal.fire({
          title: "Error",
          text: err.response?.data?.detail || err.message || "An error occurred while saving",
          icon: "error",
          background: "#1f2937",
          color: "#f9fafb"
        });
      } finally {
        setIsLoading(false);
      }
    }
  });

  const getServiceLabel = (value: string) => {
    const service = SERVICE_TYPES.find(s => s.value === value);
    return service ? service.label : value;
  };

  const getSubscriptionLabel = (value: string) => {
    const subscription = SUBSCRIPTION_TYPES.find(s => s.value === value);
    return subscription ? subscription.label : value;
  };

  // Calculate average amount
  const calculateAverageAmount = () => {
    if (subscriptions.length === 0) return "0.00";

    const total = subscriptions.reduce((sum, item) => {
      return sum + item.amount;
    }, 0);

    const avg = total / subscriptions.length;
    return avg.toFixed(2);
  };

  // Table columns
  const columns = [
    { 
      key: "id", 
      label: "ID",
      render: (item: SubscriptionItem) => (
        <span className="text-sm text-gray-500">{item.id}</span>
      )
    },
    {
      key: "service_type",
      label: "Service Type",
      render: (item: SubscriptionItem) => (
        <span className="font-medium text-gray-800">
          {getServiceLabel(item.service_type)}
        </span>
      )
    },
    {
      key: "subscription_type",
      label: "Subscription Type",
      render: (item: SubscriptionItem) => (
        <span className="font-medium text-gray-800">
          {getSubscriptionLabel(item.subscription_type)}
        </span>
      )
    },
    {
      key: "amount",
      label: "Amount",
      render: (item: SubscriptionItem) => (
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-indigo-600">₹</span>
          <span className="text-lg font-bold text-gray-900">
            {item.amount.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (item: SubscriptionItem) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate" title={item.description || ""}>
            {item.description || "No description"}
          </p>
        </div>
      )
    },
    {
      key: "is_active",
      label: "Status",
      render: (item: SubscriptionItem) => (
        <div className="flex items-center">
          <button
            onClick={() => handleToggleStatus(item)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              item.is_active ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                item.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`ml-2 text-sm font-semibold ${
            item.is_active ? 'text-green-700' : 'text-red-700'
          }`}>
            {item.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Create and manage subscription plans for different service types</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{subscriptions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Plans</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {subscriptions.filter(s => s.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Service Types</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {new Set(subscriptions.map(s => s.service_type)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Amount</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                ₹{calculateAverageAmount()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <DataTable
          title="Subscription Plans"
          data={subscriptions}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          addButtonLabel="Add New Subscription"
          loading={isLoadingList} 
        />
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingSubscription ? "Edit Subscription Plan" : "Add New Subscription Plan"}
                  </h2>
                  <p className="text-indigo-100 mt-1">
                    {editingSubscription ? "Update subscription details" : "Create a new subscription plan for vendors"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    resetModalState();
                    formik.resetForm();
                  }}
                  className="text-white hover:text-indigo-200 transition-colors text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="service_type"
                      value={formik.values.service_type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        formik.touched.service_type && formik.errors.service_type
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <option value="">Select Service Type</option>
                      {SERVICE_TYPES.map(service => (
                        <option key={service.value} value={service.value}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {formik.touched.service_type && formik.errors.service_type && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.service_type}</p>
                  )}
                </div>

                {/* Subscription Type and Amount in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subscription Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subscription Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="subscription_type"
                        value={formik.values.subscription_type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          formik.touched.subscription_type && formik.errors.subscription_type
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <option value="">Select Duration</option>
                        {SUBSCRIPTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {formik.touched.subscription_type && formik.errors.subscription_type && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.subscription_type}</p>
                    )}
                  </div>

                  {/* Amount - FIXED VERSION (Only this changed) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="text" // Changed to text for better control
                        name="amount"
                        value={formik.values.amount}
                        onChange={(e) => {
                          // Allow only numbers and one decimal point
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = value.split('.');
                          if (parts.length > 2) return;
                          formik.setFieldValue('amount', value);
                        }}
                        onBlur={(e) => {
                          // Format to 2 decimal places on blur
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            formik.setFieldValue('amount', value.toFixed(2));
                          }
                          formik.handleBlur(e);
                        }}
                        placeholder="0.00"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          formik.touched.amount && formik.errors.amount
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                    </div>
                    {formik.touched.amount && formik.errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.amount}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={4}
                    placeholder="Describe the subscription plan features, benefits, and terms..."
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                      formik.touched.description && formik.errors.description
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <p className="text-sm text-gray-500">
                      {formik.values.is_active
                        ? "This subscription plan will be available to vendors"
                        : "This subscription plan will be hidden from vendors"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => formik.setFieldValue('is_active', !formik.values.is_active)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formik.values.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        formik.values.is_active ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Server Errors */}
                {serverErrors && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Validation Errors</h4>
                    <ul className="text-sm text-red-600 list-disc pl-4">
                      {Object.entries(serverErrors).map(([key, value]) => (
                        <li key={key}>{`${key}: ${JSON.stringify(value)}`}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      resetModalState();
                      formik.resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {editingSubscription ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        {editingSubscription ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Update Subscription
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Subscription
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionMaster;