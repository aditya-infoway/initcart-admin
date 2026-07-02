import { useState, useEffect } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import DataTable from "../../../components/common/DataTable";
import axiosInstance from "../../../api/axiosInstance";
import { FaEye} from "react-icons/fa"

interface Category {
  id: number;
  name: string;
  product_count: number;
}

interface Vendor {
  id: number;
  business_name: string;
  email: string;
  phone: string;
  products_count: number;
  category_names: string[];
  has_participated_today: boolean;
  is_selected: boolean;
}

interface Campaign {
  id: number;
  campaignName: string;
  campaign_name?: string;
  campaign_type: "Flash" | "Deal of the Day" | "Featured";
  categories: number[];
  startDatetime: string;
  endDatetime: string;
  description: string;
  status: "Active" | "Inactive" | "Draft" | "Expired";
  max_products_per_vendor?: number;
  maxProductsPerVendor: number;
  minimum_discount: number;
  minimum_product_limit: number;
  selected_vendors?: number[];
  selected_vendors_details?: Array<{
    id: number;
    business_name: string;
    email: string;
    phone: string;
  }>;

  // For backward compatibility
  category?: number;
  categoryName?: string;
  startDate?: string;
  endDate?: string;
}

const CampaignSchema = Yup.object().shape({
  campaignName: Yup.string().required("Campaign Name is required"),
  campaign_type: Yup.string().required("Campaign Type is required"),
  categories: Yup.array()
    .of(Yup.number())
    .min(1, "Select at least 1 category")
    .required("Category is required"),
  startDatetime: Yup.string().required("Start Date & Time is required"),
  endDatetime: Yup.string()
    .required("End Date & Time is required")
    .test("is-after-start", "End Date must be after Start Date", function (value) {
      return !this.parent.startDatetime || new Date(value) > new Date(this.parent.startDatetime);
    }),
  maxProductsPerVendor: Yup.number()
    .min(1, "Minimum 1 product")
    .max(20, "Maximum 20 products")
    .required("Max products per vendor is required"),
  minimum_discount: Yup.number()
    .min(0, "Minimum discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .test("discount-validation", "Discount requirements", function (value) {
      const campaignType = this.parent.campaign_type;
      if (campaignType === "Featured") {
        return true; // Featured deals don't require discount
      }
      return value !== undefined && value !== null && value >= 0;
    }),
  minimum_product_limit: Yup.number()
    .min(1, "Minimum 1 product per vendor")
    .max(20, "Maximum 20 products per vendor")
    .required("Minimum product limit is required"),
  status: Yup.string().required("Status is required"),
});

const CreateCampaign = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState<boolean>(false);
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false);
  const [showVendorSelection, setShowVendorSelection] = useState<boolean>(false);
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [currentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<boolean>(false);

  // 🔴 NEW: State for View Selected Vendors Modal
  const [showViewVendorsModal, setShowViewVendorsModal] = useState<boolean>(false);
  const [viewVendorsList, setViewVendorsList] = useState<any[]>([]);
  const [viewCampaignName, setViewCampaignName] = useState<string>("");

  // Track original selected vendors when editing
  const [originalSelectedVendors, setOriginalSelectedVendors] = useState<number[]>([]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get('ecommerce/public/categories/');
      setCategories(response.data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      Swal.fire("Error", "Failed to load categories", "error");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchVendorsForCampaign = async (campaignId?: number, date?: string) => {
    try {
      setLoadingVendors(true);

      let url = 'ecommerce/admin/campaigns/vendors/available/';
      if (campaignId) {
        url = `ecommerce/admin/campaigns/${campaignId}/vendors/available/`;
      }

      if (date) {
        url += `${url.includes('?') ? '&' : '?'}date=${date}`;
      }

      console.log("🔍 Fetching vendors from:", url);

      const response = await axiosInstance.get(url);
      console.log("📊 Vendors API response:", response.data);

      if (response.data && Array.isArray(response.data.vendors)) {
        const vendorsData = response.data.vendors;
        setVendors(vendorsData);

        // 🔴 FIX: Always preserve the existing selected vendors from editingCampaign
        if (editingCampaign && editingCampaign.selected_vendors) {
          // Use the selected vendors from the campaign being edited
          const existingSelectedVendors = editingCampaign.selected_vendors;
          setSelectedVendors(existingSelectedVendors);
          setOriginalSelectedVendors(existingSelectedVendors);
          console.log("✅ Using existing selected vendors from campaign:", existingSelectedVendors);
        } else {
          // For new campaign or when no editing campaign, use is_selected from API
          const alreadySelectedVendors = vendorsData
            .filter((vendor: any) => vendor.is_selected)
            .map((vendor: any) => vendor.id);

          if (campaignId) {
            setSelectedVendors(alreadySelectedVendors);
            setOriginalSelectedVendors(alreadySelectedVendors);
          } else {
            setSelectedVendors([]);
            setOriginalSelectedVendors([]);
          }
        }
      } else {
        console.warn("⚠️ No vendors array in response:", response.data);
        setVendors([]);
        setSelectedVendors([]);
        setOriginalSelectedVendors([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching vendors:", error);
      Swal.fire("Error", "Failed to load vendors", "error");
      setVendors([]);
      setSelectedVendors([]);
      setOriginalSelectedVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await axiosInstance.get('/ecommerce/admin/campaigns/');

      if (response.data && Array.isArray(response.data)) {
        const campaignsData = response.data.map((campaign: any) => {
          let categoriesArray: number[] = [];
          if (Array.isArray(campaign.categories)) {
            categoriesArray = campaign.categories;
          } else if (campaign.category) {
            categoriesArray = [campaign.category];
          }

          return {
            id: campaign.id,
            campaignName: campaign.campaign_name || campaign.campaignName,
            campaign_name: campaign.campaign_name || campaign.campaignName,
            campaign_type: campaign.campaign_type || campaign.type,
            categories: categoriesArray,
            startDatetime: campaign.start_datetime || campaign.start_date || "",
            endDatetime: campaign.end_datetime || campaign.end_date || "",
            description: campaign.description || "",
            status: campaign.status || "Draft",
            max_products_per_vendor: campaign.max_products_per_vendor || 10,
            maxProductsPerVendor: campaign.max_products_per_vendor || 10,
            minimum_discount: campaign.minimum_discount || 0,
            minimum_product_limit: campaign.minimum_product_limit || 1,
            selected_vendors: campaign.selected_vendors || [],
            selected_vendors_details: campaign.selected_vendors_details || [],
            category: campaign.categories?.[0] || categoriesArray[0],
            categoryName: campaign.categories_details?.[0]?.name,
          };
        });

        setCampaigns(campaignsData);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      Swal.fire("Error", "Failed to load campaigns", "error");
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCampaigns();
  }, []);

  const handleAdd = () => {
    setEditingCampaign(null);
    setSelectedVendors([]);
    setOriginalSelectedVendors([]);
    setModalOpen(true);
  };

  const handleEdit = (item: Campaign) => {
    setEditingCampaign(item);

    const selectedVendorIds = item.selected_vendors || [];
    setSelectedVendors(selectedVendorIds);
    setOriginalSelectedVendors(selectedVendorIds); // Store original vendors

    console.log("✏️ Editing campaign:", item.campaignName);
    console.log("✏️ Selected vendors from campaign:", selectedVendorIds);

    setModalOpen(true);
  };

  const handleDelete = async (item: Campaign) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.campaignName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`ecommerce/admin/campaigns/${item.id}/`);

          setCampaigns(campaigns.filter((c) => c.id !== item.id));
          Swal.fire("Deleted!", `"${item.campaignName}" has been deleted.`, "success");
        } catch (error: any) {
          console.error("Error deleting campaign:", error);
          Swal.fire("Error", "Failed to delete campaign", "error");
        }
      }
    });
  };

  const handleVendorSelection = async (campaignId?: number) => {
    console.log("🔄 Handling vendor selection for campaign:", campaignId);
    await fetchVendorsForCampaign(campaignId, currentDate);
    setShowVendorSelection(true);
  };

  const saveVendorSelection = async (campaignId: number) => {
    try {
      // Don't send empty array - preserve existing vendors
      const vendorsToSave = selectedVendors;

      console.log("💾 Saving vendors:", vendorsToSave);
      console.log("📊 Original vendors:", originalSelectedVendors);

      const response = await axiosInstance.post(
        `ecommerce/admin/campaigns/${campaignId}/vendors/selection/`,
        {
          vendor_ids: vendorsToSave,
          action: "replace" // This will replace with current selection
        }
      );

      Swal.fire({
        icon: "success",
        title: "Vendors Updated",
        text: response.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh campaigns to show updated vendor list
      await fetchCampaigns();

      // Update original selected vendors
      setOriginalSelectedVendors(vendorsToSave);
      setShowVendorSelection(false);
    } catch (error: any) {
      console.error("Error saving vendor selection:", error);
      Swal.fire("Error", error.response?.data?.error || "Failed to save vendor selection", "error");
    }
  };

  // 🔴 NEW: Handle View Vendors
  const handleViewVendors = (item: Campaign) => {
    setViewCampaignName(item.campaignName || item.campaign_name || "");
    setViewVendorsList(item.selected_vendors_details || []);
    setShowViewVendorsModal(true);
  };

  const formik = useFormik({
    initialValues: {
      campaignName: editingCampaign ? editingCampaign.campaignName : "",
      campaign_type: editingCampaign ? editingCampaign.campaign_type : "Flash",
      categories: editingCampaign ? editingCampaign.categories : [],
      startDatetime: editingCampaign ? editingCampaign.startDatetime : "",
      endDatetime: editingCampaign ? editingCampaign.endDatetime : "",
      description: editingCampaign ? editingCampaign.description : "",
      maxProductsPerVendor: editingCampaign ? editingCampaign.maxProductsPerVendor : 10,
      minimum_discount: editingCampaign ? editingCampaign.minimum_discount : 0,
      minimum_product_limit: editingCampaign ? editingCampaign.minimum_product_limit : 1,
      status: editingCampaign ? editingCampaign.status : "Active",
      selected_vendors: editingCampaign ? editingCampaign.selected_vendors || [] : [],
    },

    enableReinitialize: true,
    validationSchema: CampaignSchema,
    onSubmit: async (values) => {
      try {
        console.log("Submitting campaign:", values);
        console.log("Selected vendors:", selectedVendors);

        // Prepare data for API
        const campaignData = {
          campaign_name: values.campaignName,
          campaign_type: values.campaign_type,
          categories: values.categories,
          start_datetime: values.startDatetime,
          end_datetime: values.endDatetime,
          description: values.description,
          max_products_per_vendor: values.maxProductsPerVendor,
          minimum_discount: values.campaign_type === "Featured" ? 0 : values.minimum_discount,
          minimum_product_limit: values.minimum_product_limit,
          status: values.status === "Active" ? "Active" : "Draft",
          selected_vendors: selectedVendors, // Always send current selected vendors
        };

        console.log("Campaign data to send:", campaignData);

        let response;
        if (editingCampaign) {
          // Update existing campaign
          response = await axiosInstance.put(
            `ecommerce/admin/campaigns/${editingCampaign.id}/`,
            campaignData
          );
        } else {
          // Create new campaign
          response = await axiosInstance.post(
            'ecommerce/admin/campaigns/',
            campaignData
          );
        }

        if (response.data) {
          const newCampaign: Campaign = {
            id: response.data.id || campaigns.length + 1,
            campaignName: response.data.campaign_name || values.campaignName,
            campaign_name: response.data.campaign_name || values.campaignName,
            campaign_type: response.data.campaign_type || values.campaign_type,
            categories: Array.isArray(response.data.categories)
              ? response.data.categories
              : values.categories,
            startDatetime: response.data.start_datetime || values.startDatetime,
            endDatetime: response.data.end_datetime || values.endDatetime,
            description: response.data.description || values.description,
            status: response.data.status || "Draft",
            maxProductsPerVendor: response.data.max_products_per_vendor || values.maxProductsPerVendor,
            max_products_per_vendor: response.data.max_products_per_vendor || values.maxProductsPerVendor,
            minimum_discount: response.data.minimum_discount || values.minimum_discount,
            minimum_product_limit: response.data.minimum_product_limit || values.minimum_product_limit,
            selected_vendors: response.data.selected_vendors || selectedVendors,
            selected_vendors_details: response.data.selected_vendors_details || [],
            category: response.data.categories?.[0] || values.categories[0],
            categoryName: categories.find(cat => cat.id === (response.data.categories?.[0] || values.categories[0]))?.name,
          };

          if (editingCampaign) {
            setCampaigns(campaigns.map(c =>
              c.id === editingCampaign.id ? newCampaign : c
            ));
            Swal.fire({
              icon: "success",
              title: "Campaign Updated",
              text: `"${values.campaignName}" has been updated!`,
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            setCampaigns([newCampaign, ...campaigns]);
            Swal.fire({
              icon: "success",
              title: "Campaign Added",
              text: `"${values.campaignName}" has been added!`,
              timer: 2000,
              showConfirmButton: false,
            });
          }
        }

        setModalOpen(false);
        formik.resetForm();
        setSelectedVendors([]);
        setOriginalSelectedVendors([]);

      } catch (error: any) {
        console.error("Error saving campaign:", error);

        let errorMessage = "Failed to save campaign";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response?.data) {
          if (typeof error.response.data === 'object') {
            const errors = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('\n');
            errorMessage = errors;
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    },
  });

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || `Category #${categoryId}`;
  };

  const formatDate = (datetime: string) => {
    if (!datetime) return "N/A";
    try {
      const date = new Date(datetime);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return datetime;
    }
  };

  // Improved vendor selection without duplicates
  const handleVendorSelect = (vendorId: number, isSelected: boolean) => {
    setSelectedVendors(prev => {
      if (isSelected) {
        // Add vendor if not already selected
        if (!prev.includes(vendorId)) {
          return [...prev, vendorId];
        }
        return prev;
      } else {
        // Remove vendor
        return prev.filter(id => id !== vendorId);
      }
    });
  };

  const toggleSelectAllVendors = () => {
    if (selectedVendors.length === vendors.length && vendors.length > 0) {
      setSelectedVendors([]);
    } else {
      const availableVendorIds = vendors
        .filter(v => !v.has_participated_today) // Don't select blocked vendors
        .map(v => v.id);
      setSelectedVendors(availableVendorIds);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const currentCategories = formik.values.categories;
    if (currentCategories.includes(categoryId)) {
      formik.setFieldValue('categories', currentCategories.filter(id => id !== categoryId));
    } else {
      formik.setFieldValue('categories', [...currentCategories, categoryId]);
    }
  };

  const selectAllCategories = () => {
    const allCategoryIds = categories.map(cat => cat.id);
    formik.setFieldValue('categories', allCategoryIds);
  };

  const clearAllCategories = () => {
    formik.setFieldValue('categories', []);
  };

  return (
    <div className="">
      <DataTable
        title="Create Campaign"
        data={campaigns}
        columns={[
          { key: "id", label: "Campaign ID", },
          {
            key: "campaignName",
            label: "Campaign Name",
            render: (item: Campaign) => (
              <span className="whitespace-nowrap font-medium">
                {item.campaignName}
              </span>
            )
          },
          {
            key: "campaign_type",
            label: "Type",
            render: (item: Campaign) => (
              <span className={`px-2 py-1 whitespace-nowrap rounded text-xs  font-semibold ${item.campaign_type === 'Flash' ? 'bg-purple-100 text-purple-800' :
                item.campaign_type === 'Deal of the Day' ? 'bg-orange-100 text-orange-800' :
                  'bg-pink-100 text-pink-800'
                }`}>
                {item.campaign_type}
              </span>
            )
          },
          {
            key: "categories",
            label: "Categories",
            render: (item: Campaign) => (
              <div className="flex flex-wrap gap-1">
                {item.categories.map(catId => (
                  <span
                    key={catId}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
            ),
          },
          {
            key: "duration_start",
            label: "Start date",
            render: (item: Campaign) => (
              <div className="text-sm">
                {formatDate(item.startDatetime)}</div>
            ),
          },
          {
            key: "duratio_end",
            label: "End date ",
            render: (item: Campaign) => (
              <div className="text-sm">
                <div>{formatDate(item.endDatetime)}</div>
              </div>
            ),
          },

          {
            key: "requirements_max",
            label: "Max vendors",
            render: (item: Campaign) => (
              <div>{item.maxProductsPerVendor}</div>
            ),
          },
          {
            key: "requirements",
            label: "Min Discount",
            render: (item: Campaign) => (
              <div>{item.minimum_discount}%</div>
            )
          },
          {
            key: "requirements_prod",
            label: "Min Products",
            render: (item: Campaign) => (
              <div>{item.minimum_product_limit}</div>
            )
          },
          {
            key: "description",
            label: "Description",
            render: (item: Campaign) => (
              <span className="truncate max-w-xs block">{item.description || "-"}</span>
            )
          },
          {
            key: "status",
            label: "Status",
            render: (item: Campaign) => (
              <span className={`text-sm font-semibold ${item.status === "Active" ? "text-green-700" : "text-red-700"}`}>
                {item.status}
              </span>
            ),
          },
{
  key: "vendorSelection",
  label: "Vendor Selection",
  render: (item) => (
    <button
      onClick={() => handleViewVendors(item)}
      className="text-blue-600 hover:text-blue-800 transition-all"
      title="View Vendors"
    >
      <FaEye size={22} />
    </button>
  ),
},
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Campaign"
        loading={loadingCampaigns}
      />

      {/* Main Campaign Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingCampaign ? "Edit Campaign" : "Add Campaign"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Campaign Name */}
              <div>
                <label className="font-semibold text-gray-700">Campaign Name *</label>
                <input
                  type="text"
                  placeholder="Campaign Name"
                  name="campaignName"
                  value={formik.values.campaignName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput w-full ${formik.touched.campaignName && formik.errors.campaignName
                    ? "customInputError"
                    : formik.values.campaignName
                      ? "filled"
                      : ""
                    }`}
                  required
                />
                {formik.touched.campaignName && formik.errors.campaignName && (
                  <div className="text-red-500 text-sm">{formik.errors.campaignName}</div>
                )}
              </div>

              {/* Campaign Type */}
              <div>
                <label className="font-semibold text-gray-700">Campaign Type *</label>
                <select
                  name="campaign_type"
                  value={formik.values.campaign_type}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) {
                      e.currentTarget.classList.add("filled");
                    } else {
                      e.currentTarget.classList.remove("filled");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full ${formik.touched.campaign_type && formik.errors.campaign_type
                    ? "customSelectError"
                    : formik.values.campaign_type
                      ? "filled"
                      : ""
                    }`}
                >
                  <option value="">Select Type</option>
                  <option value="Flash">Flash Deal</option>
                  <option value="Deal of the Day">Deal of the Day</option>
                  <option value="Featured">Featured Products</option>
                </select>
                {formik.touched.campaign_type && formik.errors.campaign_type && (
                  <div className="text-red-500 text-sm">{formik.errors.campaign_type}</div>
                )}
              </div>

              {/* Categories - Collapsible Multi-Select Dropdown */}
              <div>
                <label className="font-semibold text-gray-700">Categories *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className={`customInput w-full text-left flex justify-between items-center ${formik.touched.categories && formik.errors.categories
                      ? "customInputError"
                      : formik.values.categories.length > 0
                        ? "filled"
                        : ""
                      }`}
                  >
                    <span>
                      {formik.values.categories.length === 0
                        ? "Select Categories"
                        : `${formik.values.categories.length} categories selected`}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-700">
                          {formik.values.categories.length} selected
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllCategories}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={clearAllCategories}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {loadingCategories ? (
                        <div className="p-4 text-center text-gray-500">Loading categories...</div>
                      ) : (
                        <div className="p-2">
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
                              onClick={() => toggleCategory(cat.id)}
                            >
                              <input
                                type="checkbox"
                                id={`cat-${cat.id}`}
                                checked={formik.values.categories.includes(cat.id)}
                                onChange={() => { }}
                                className="w-4 h-4"
                              />
                              <label htmlFor={`cat-${cat.id}`} className="flex-1 cursor-pointer text-sm">
                                {cat.name} 
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {formik.touched.categories && formik.errors.categories && (
                  <div className="text-red-500 text-sm">{formik.errors.categories}</div>
                )}

                {/* Selected Categories Display */}
                {formik.values.categories.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-1">Selected categories:</div>
                    <div className="flex flex-wrap gap-1">
                      {formik.values.categories.map(catId => {
                        const category = categories.find(c => c.id === catId);
                        return category ? (
                          <span
                            key={catId}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded inline-flex items-center gap-1"
                          >
                            {category.name}
                            <button
                              type="button"
                              onClick={() => toggleCategory(catId)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startDatetime"
                    value={formik.values.startDatetime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.startDatetime && formik.errors.startDatetime
                      ? "customInputError"
                      : formik.values.startDatetime
                        ? "filled"
                        : ""
                      }`}
                    required
                  />
                  {formik.touched.startDatetime && formik.errors.startDatetime && (
                    <div className="text-red-500 text-sm">{formik.errors.startDatetime}</div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="endDatetime"
                    value={formik.values.endDatetime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.endDatetime && formik.errors.endDatetime
                      ? "customInputError"
                      : formik.values.endDatetime
                        ? "filled"
                        : ""
                      }`}
                    required
                  />
                  {formik.touched.endDatetime && formik.errors.endDatetime && (
                    <div className="text-red-500 text-sm">{formik.errors.endDatetime}</div>
                  )}
                </div>
              </div>

              {/* Campaign Specific Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Minimum Product Limit */}
                <div>
                  <label className="font-semibold text-gray-700">Minimum Products per Vendor *</label>
                  <input
                    type="number"
                    name="minimum_product_limit"
                    min="1"
                    max="20"
                    value={formik.values.minimum_product_limit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.minimum_product_limit && formik.errors.minimum_product_limit
                      ? "customInputError"
                      : formik.values.minimum_product_limit
                        ? "filled"
                        : ""
                      }`}
                    required
                  />
                  {formik.touched.minimum_product_limit && formik.errors.minimum_product_limit && (
                    <div className="text-red-500 text-sm">{formik.errors.minimum_product_limit}</div>
                  )}
                </div>

                {/* Minimum Discount (Not for Featured) */}
                <div>
                  <label className="font-semibold text-gray-700">
                    Minimum Discount (%)
                    {formik.values.campaign_type !== "Featured" && " *"}
                  </label>
                  <input
                    type="number"
                    name="minimum_discount"
                    min="0"
                    max="100"
                    value={formik.values.minimum_discount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput w-full ${formik.touched.minimum_discount && formik.errors.minimum_discount
                      ? "customInputError"
                      : formik.values.minimum_discount
                        ? "filled"
                        : ""
                      }`}
                    required={formik.values.campaign_type !== "Featured"}
                    disabled={formik.values.campaign_type === "Featured"}
                  />
                  {formik.touched.minimum_discount && formik.errors.minimum_discount && (
                    <div className="text-red-500 text-sm">{formik.errors.minimum_discount}</div>
                  )}
                  {formik.values.campaign_type === "Featured" && (
                    <div className="text-sm text-gray-500 mt-1">
                      Featured deals don't require minimum discount
                    </div>
                  )}
                </div>
              </div>

              {/* Max Products per Vendor */}
              <div>
                <label className="font-semibold text-gray-700">Max Products per Vendor *</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="maxProductsPerVendor"
                    min="1"
                    max="20"
                    step="1"
                    value={formik.values.maxProductsPerVendor}
                    onChange={formik.handleChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-16 text-center font-semibold text-lg">
                    {formik.values.maxProductsPerVendor}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Vendors can add maximum {formik.values.maxProductsPerVendor} products
                </div>
                {formik.touched.maxProductsPerVendor && formik.errors.maxProductsPerVendor && (
                  <div className="text-red-500 text-sm">{formik.errors.maxProductsPerVendor}</div>
                )}
              </div>

              {/* Vendor Selection Button */}
              <div>
                <label className="font-semibold text-gray-700">Vendor Selection</label>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleVendorSelection(editingCampaign?.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {selectedVendors.length > 0
                      ? `Manage Selected Vendors (${selectedVendors.length})`
                      : "Select Vendors"}
                  </button>
                  {selectedVendors.length > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      {selectedVendors.length} vendor(s) selected
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-gray-700">Description</label>
                <textarea
                  placeholder="Description (optional)"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className={`customInput w-full ${formik.values.description ? "filled" : ""}`}
                />
              </div>

              {/* Status */}
              <div>
                <label className="font-semibold text-gray-700">Status *</label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (e.target.value) {
                      e.currentTarget.classList.add("filled");
                    } else {
                      e.currentTarget.classList.remove("filled");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`customSelect w-full ${formik.touched.status && formik.errors.status
                    ? "customSelectError"
                    : formik.values.status
                      ? "filled"
                      : ""
                    }`}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm">{formik.errors.status}</div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    formik.resetForm();
                    setSelectedVendors([]);
                    setOriginalSelectedVendors([]);
                    setCategoryDropdownOpen(false);
                  }}
                  className="customBtn"
                >
                  Cancel
                </button>
                <button type="submit" className="customBtn">
                  {editingCampaign ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
              onClick={() => {
                setModalOpen(false);
                formik.resetForm();
                setSelectedVendors([]);
                setOriginalSelectedVendors([]);
                setCategoryDropdownOpen(false);
              }}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Vendor Selection Modal */}
      {showVendorSelection && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">
              Select Vendors for Campaign
              {editingCampaign && ` - ${editingCampaign.campaignName}`}
            </h2>

            {/* Vendor Selection Info */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <strong>Important:</strong> Once you send a participation request to a vendor today,
                  they won't appear in the dropdown for today. They can receive another request tomorrow.
                </div>
              </div>
            </div>

            {loadingVendors ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading vendors...</p>
              </div>
            ) : (
              <>
                {/* Select All and Stats */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVendors.length === vendors.filter(v => !v.has_participated_today).length && vendors.filter(v => !v.has_participated_today).length > 0}
                        onChange={toggleSelectAllVendors}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Select All Available</span>
                    </label>
                    <span className="text-sm text-gray-600">
                      ({selectedVendors.length} of {vendors.filter(v => !v.has_participated_today).length} available selected)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Date: {currentDate}
                  </div>
                </div>

                {/* Vendors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                  {vendors.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="mt-2 font-medium">No vendors available for selection today</p>
                      <p className="text-sm mt-1">
                        All vendors have already been selected or participated in campaigns today.
                      </p>
                    </div>
                  ) : (
                    vendors.map((vendor) => {
                      const isSelected = selectedVendors.includes(vendor.id);
                      const isBlocked = vendor.has_participated_today;

                      return (
                        <div
                          key={vendor.id}
                          className={`border rounded-lg p-4 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' :
                            isBlocked ? 'border-gray-300 bg-gray-100 opacity-60' :
                              'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            } ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => {
                            if (!isBlocked) {
                              handleVendorSelect(vendor.id, !isSelected);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!isBlocked) {
                                  handleVendorSelect(vendor.id, e.target.checked);
                                }
                              }}
                              disabled={isBlocked}
                              className={`w-4 h-4 mt-1 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className={`font-semibold ${isBlocked ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {vendor.business_name}
                                  {isSelected && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                      Selected
                                    </span>
                                  )}
                                </h3>
                                {isBlocked && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Blocked Today
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                {vendor.email}
                              </p>
                              <p className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                                {vendor.phone}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-1">
                                <span className={`px-2 py-1 text-xs rounded ${isBlocked ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                  {vendor.products_count} products
                                </span>

                                {isBlocked && (
                                  <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded">
                                    Already used today
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVendorSelection(false);
                      // Restore original selection if cancelled
                      setSelectedVendors(originalSelectedVendors);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingCampaign) {
                        saveVendorSelection(editingCampaign.id);
                      } else {
                        // For new campaign, just close modal
                        setShowVendorSelection(false);
                      }
                    }}
                    disabled={selectedVendors.length === 0 && editingCampaign ? false : selectedVendors.length === 0}
                    className={`px-4 py-2 rounded ${selectedVendors.length > 0 || !editingCampaign
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {editingCampaign ? 'Save Selection' : 'Confirm Selection'}
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => {
                setShowVendorSelection(false);
                // Restore original selection if cancelled
                setSelectedVendors(originalSelectedVendors);
              }}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* 🔴 NEW: View Selected Vendors Modal */}
      {showViewVendorsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0000007d] px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Selected Vendors - {viewCampaignName}
            </h2>

            {viewVendorsList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No vendors selected for this campaign</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewVendorsList.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {vendor.business_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {vendor.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {vendor.phone}
                        </p>
                      </div>

                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Selected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewVendorsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>

            <button
              onClick={() => setShowViewVendorsModal(false)}
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

export default CreateCampaign;