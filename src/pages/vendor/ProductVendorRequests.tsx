import React, { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface Vendor {
  id: number;
  businessName: string;
  ownerName: string;
  businessType: "Manufacturer" | "Wholesaler" | "Retailer";
  businessCategory: "Fashion" | "Grocery" | "Electronic";
  gstNo: string;
  email: string;
  mobile: string;
  alternateNumber?: string;
  businessAddress: string;
  locationLink?: string;
  bankAccountHolderName: string;
  bankAccountNo: string;
  ifsc: string;
  bankName: string;
  upiId?: string;
  paymentSettlementPreference: "Weekly" | "Bi-Weekly" | "Monthly";
  status: "Active" | "Inactive";
}

interface Product {
  id: number;
  vendor: Vendor;
  vendorType: "Retailer" | "Wholesaler";
  productName: string;
  sku: string;
  category: string;
  subcategory: string;
  subSubCategory: string;
  brand: string;
  productType: "Simple" | "Variant";
  keywords: string;
  shortDescription: string;
  fullDescription: string;
  productVideoUrl?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: number;
  sellingPrice: number;
  wholesalePrice?: number;
  discountType: "Flat" | "Percentage";
  discountValue: number;
  tax: string;
  stockQuantity: number;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  barcode?: string;
  unit: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  mainImage?: string | File; // Updated to allow string for mock URLs
  additionalImages?: (string | File)[];
  thumbnailImage?: string | File;
  productView360?: string | File;
  warehouseLocation: string;
  stockAvailability: "In Stock" | "Out of Stock";
  lowStockAlertQuantity: number;
  productCondition: "New" | "Refurbished" | "Used";
  freeShipping: boolean;
  shippingCharge?: number;
  minimumOrderValueForFreeShipping?: number;
  returnPolicy?: "7 Days" | "15 Days" | "Non-returnable";
  codAvailable?: boolean;
  estimatedDeliveryTime: string;
  variants?: Array<{
    attribute: string;
    value: string;
    sku: string;
    price: number;
    stock: number;
  }>;
  categoryAttributes?: Record<string, string>;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: "Pending" | "Approved" | "Rejected" | "Draft";
}

const ProductVendorRequests = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      vendor: {
        id: 1,
        businessName: "Trendy Apparel Co.",
        ownerName: "John Doe",
        businessType: "Retailer",
        businessCategory: "Fashion",
        gstNo: "27AAFCB1234H1Z5",
        email: "john@trendyapparel.com",
        mobile: "9876543210",
        alternateNumber: "9123456789",
        businessAddress: "123 Fashion Street, Delhi",
        locationLink: "https://maps.google.com/?q=delhi",
        bankAccountHolderName: "John Doe",
        bankAccountNo: "123456789012",
        ifsc: "SBIN0001234",
        bankName: "State Bank of India",
        upiId: "john@upi",
        paymentSettlementPreference: "Weekly",
        status: "Active",
      },
      vendorType: "Retailer",
      productName: "Men's Cotton Shirt",
      sku: "SKU-R1234",
      category: "Apparel",
      subcategory: "Shirts",
      subSubCategory: "Formal Shirts",
      brand: "Peter England",
      productType: "Simple",
      keywords: "shirt, cotton, men",
      shortDescription: "Soft cotton fabric shirt",
      fullDescription: "100% cotton, full-sleeve shirt for men.",
      productVideoUrl: "https://youtu.be/demo",
      manufacturingDate: "2025-10-01",
      expiryDate: "",
      mrp: 999,
      sellingPrice: 799,
      discountType: "Percentage",
      discountValue: 10,
      tax: "12%",
      stockQuantity: 100,
      maximumOrderQuantity: 5,
      barcode: "https://via.placeholder.com/150?text=Barcode",
      mainImage: "https://via.placeholder.com/300?text=Main+Image",
      additionalImages: [
        "https://via.placeholder.com/150?text=Additional+1",
        "https://via.placeholder.com/150?text=Additional+2",
      ],
      thumbnailImage: "https://via.placeholder.com/100?text=Thumbnail",
      productView360: "https://via.placeholder.com/200?text=360+View",
      unit: "pcs",
      weight: 0.5,
      dimensions: { length: 30, width: 20, height: 5 },
      warehouseLocation: "Delhi",
      stockAvailability: "In Stock",
      lowStockAlertQuantity: 5,
      productCondition: "New",
      freeShipping: true,
      shippingCharge: 50,
      returnPolicy: "7 Days",
      codAvailable: true,
      estimatedDeliveryTime: "3-7 Days",
      variants: [],
      categoryAttributes: { fabricType: "Cotton", size: "L", color: "Blue" },
      metaTitle: "Buy Men's Cotton Shirt Online",
      metaDescription: "Premium cotton shirt for men available online.",
      metaKeywords: "shirt, men, cotton, online",
      status: "Pending",
    },
    {
      id: 2,
      vendor: {
        id: 2,
        businessName: "TechTrend Innovations",
        ownerName: "Jane Smith",
        businessType: "Wholesaler",
        businessCategory: "Electronic",
        gstNo: "29AAFCB5678H1Z3",
        email: "jane@techtrend.com",
        mobile: "9988776655",
        alternateNumber: "",
        businessAddress: "456 Tech Park, Mumbai",
        locationLink: "https://maps.google.com/?q=mumbai",
        bankAccountHolderName: "Jane Smith",
        bankAccountNo: "987654321098",
        ifsc: "HDFC0005678",
        bankName: "HDFC Bank",
        upiId: "jane@upi",
        paymentSettlementPreference: "Monthly",
        status: "Active",
      },
      vendorType: "Wholesaler",
      productName: "LED Smart TV",
      sku: "SKU-W5678",
      category: "Electronics",
      subcategory: "Televisions",
      subSubCategory: "Smart TVs",
      brand: "Samsung",
      productType: "Variant",
      keywords: "tv, smart tv, led",
      shortDescription: "43-inch LED Smart TV",
      fullDescription:
        "High-definition LED Smart TV with streaming capabilities.",
      productVideoUrl: "",
      manufacturingDate: "2025-09-01",
      expiryDate: "",
      sellingPrice: 35000,
      wholesalePrice: 30000,
      discountType: "Flat",
      discountValue: 2000,
      tax: "18%",
      stockQuantity: 50,
      minimumOrderQuantity: 10,
      barcode: "",
      mainImage: "https://via.placeholder.com/300?text=TV+Main+Image",
      additionalImages: ["https://via.placeholder.com/150?text=TV+Additional"],
      thumbnailImage: "https://via.placeholder.com/100?text=TV+Thumbnail",
      productView360: "",
      unit: "pcs",
      weight: 8,
      dimensions: { length: 100, width: 60, height: 10 },
      warehouseLocation: "Mumbai",
      stockAvailability: "In Stock",
      lowStockAlertQuantity: 10,
      productCondition: "New",
      freeShipping: false,
      minimumOrderValueForFreeShipping: 50000,
      estimatedDeliveryTime: "5-10 Days",
      variants: [
        {
          attribute: "Size",
          value: "43 inch",
          sku: "VAR-43IN",
          price: 35000,
          stock: 30,
        },
        {
          attribute: "Size",
          value: "55 inch",
          sku: "VAR-55IN",
          price: 55000,
          stock: 20,
        },
      ],
      categoryAttributes: {
        modelNumber: "SM43X",
        power: "120W",
        warranty: "1 Year",
      },
      metaTitle: "Samsung LED Smart TV",
      metaDescription: "Buy high-definition LED Smart TV online.",
      metaKeywords: "smart tv, led, samsung",
      status: "Pending",
    },
    {
      id: 3,
      vendor: {
        id: 3,
        businessName: "SportyFeet Outfitters",
        ownerName: "Alice Johnson",
        businessType: "Retailer",
        businessCategory: "Fashion",
        gstNo: "33AAFCB9012H1Z7",
        email: "alice@sportyfeet.com",
        mobile: "9765432109",
        alternateNumber: "9012345678",
        businessAddress: "789 Sports Avenue, Bangalore",
        locationLink: "https://maps.google.com/?q=bangalore",
        bankAccountHolderName: "Alice Johnson",
        bankAccountNo: "456789123456",
        ifsc: "ICIC0007890",
        bankName: "ICICI Bank",
        upiId: "alice@upi",
        paymentSettlementPreference: "Bi-Weekly",
        status: "Active",
      },
      vendorType: "Retailer",
      productName: "Running Shoes",
      sku: "SKU-R9012",
      category: "Footwear",
      subcategory: "Sports Shoes",
      subSubCategory: "Running",
      brand: "Nike",
      productType: "Simple",
      keywords: "shoes, running, nike",
      shortDescription: "Comfortable running shoes",
      fullDescription: "Lightweight running shoes with cushioning.",
      productVideoUrl: "",
      manufacturingDate: "",
      expiryDate: "",
      mrp: 4999,
      sellingPrice: 3999,
      discountType: "Percentage",
      discountValue: 20,
      tax: "12%",
      stockQuantity: 200,
      maximumOrderQuantity: 3,
      barcode: "https://via.placeholder.com/150?text=Shoes+Barcode",
      mainImage: "https://via.placeholder.com/300?text=Shoes+Main+Image",
      additionalImages: [],
      thumbnailImage: "https://via.placeholder.com/100?text=Shoes+Thumbnail",
      productView360: "",
      unit: "pcs",
      weight: 0.8,
      dimensions: { length: 30, width: 15, height: 10 },
      warehouseLocation: "Bangalore",
      stockAvailability: "In Stock",
      lowStockAlertQuantity: 20,
      productCondition: "New",
      freeShipping: true,
      shippingCharge: 0,
      returnPolicy: "15 Days",
      codAvailable: true,
      estimatedDeliveryTime: "2-5 Days",
      variants: [],
      categoryAttributes: {
        material: "Synthetic",
        size: "8",
        closureType: "Lace-up",
      },
      metaTitle: "Nike Running Shoes Online",
      metaDescription: "Comfortable running shoes for all terrains.",
      metaKeywords: "running shoes, nike, sports",
      status: "Pending",
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleApprove = (product: Product) => {
    Swal.fire({
      title: "Approve Product?",
      text: `Are you sure you want to approve "${product.productName}" from ${product.vendor.businessName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: "Approved" } : p
          )
        );
        setModalOpen(false);
        Swal.fire("Approved!", "The product has been approved.", "success");
      }
    });
  };

  const handleReject = (product: Product) => {
    Swal.fire({
      title: "Reject Product?",
      text: `Are you sure you want to reject "${product.productName}" from ${product.vendor.businessName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: "Rejected" } : p
          )
        );
        setModalOpen(false);
        Swal.fire("Rejected!", "The product has been rejected.", "success");
      }
    });
  };

  const categoryAttributeFields: Record<
    string,
    Array<{ name: string; type: "text" | "dropdown"; options?: string[] }>
  > = {
    Electronics: [
      { name: "modelNumber", type: "text" },
      { name: "power", type: "text" },
      {
        name: "warranty",
        type: "dropdown",
        options: ["1 Year", "2 Years", "None"],
      },
    ],
    Apparel: [
      {
        name: "fabricType",
        type: "dropdown",
        options: ["Cotton", "Polyester", "Silk"],
      },
      { name: "size", type: "dropdown", options: ["S", "M", "L", "XL"] },
      { name: "color", type: "text" },
      {
        name: "fitType",
        type: "dropdown",
        options: ["Regular", "Slim", "Loose"],
      },
    ],
    Grocery: [
      { name: "weight", type: "text" },
      {
        name: "packagingType",
        type: "dropdown",
        options: ["Packet", "Box", "Bottle"],
      },
      { name: "shelfLife", type: "text" },
    ],
    Footwear: [
      {
        name: "material",
        type: "dropdown",
        options: ["Leather", "Canvas", "Synthetic"],
      },
      { name: "size", type: "dropdown", options: ["6", "7", "8", "9", "10"] },
      {
        name: "closureType",
        type: "dropdown",
        options: ["Lace-up", "Slip-on", "Velcro"],
      },
    ],
    Accessories: [
      {
        name: "material",
        type: "dropdown",
        options: ["Metal", "Leather", "Plastic"],
      },
      { name: "gender", type: "dropdown", options: ["Men", "Women", "Unisex"] },
      { name: "style", type: "text" },
    ],
    Furniture: [
      {
        name: "material",
        type: "dropdown",
        options: ["Wood", "Metal", "Plastic"],
      },
      { name: "dimensions", type: "text" },
      { name: "assemblyRequired", type: "dropdown", options: ["Yes", "No"] },
    ],
  };

  const renderCategoryAttributes = (product: Product) => {
    if (
      !product.category ||
      !product.categoryAttributes ||
      !categoryAttributeFields[product.category]
    ) {
      return null;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryAttributeFields[product.category].map((field) => (
          <div key={field.name}>
            <label className="block mb-1 font-medium">
              {field.name
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            <input
              type="text"
              value={product.categoryAttributes![field.name] || ""}
              className="customInput bg-gray-100"
              disabled
            />
          </div>
        ))}
      </div>
    );
  };

  const renderVariants = (product: Product) => {
    if (
      product.productType !== "Variant" ||
      !product.variants ||
      product.variants.length === 0
    ) {
      return null;
    }
    return (
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold mb-3">Variants</h3>
        <div className="grid grid-cols-1 gap-4">
          {product.variants.map((variant, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h4 className="font-medium mb-2">Variant {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Attribute</label>
                  <input
                    type="text"
                    value={variant.attribute}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Value</label>
                  <input
                    type="text"
                    value={variant.value}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">SKU</label>
                  <input
                    type="text"
                    value={variant.sku}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Price</label>
                  <input
                    type="number"
                    value={variant.price}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Stock</label>
                  <input
                    type="number"
                    value={variant.stock}
                    className="customInput bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImages = (product: Product) => {
    const getImageSrc = (image: string | File | undefined) => {
      if (!image) return null;
      return typeof image === "string" ? image : URL.createObjectURL(image);
    };

    return (
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold mb-3">Images</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.mainImage && (
            <div>
              <label className="block mb-1 font-medium">Main Image</label>
              <img
                src={getImageSrc(product.mainImage)!}
                alt="Main Image"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
          {product.thumbnailImage && (
            <div>
              <label className="block mb-1 font-medium">Thumbnail Image</label>
              <img
                src={getImageSrc(product.thumbnailImage)!}
                alt="Thumbnail Image"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
          {product.productView360 && (
            <div>
              <label className="block mb-1 font-medium">360 View Image</label>
              <img
                src={getImageSrc(product.productView360)!}
                alt="360 View"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">
                Additional Images
              </label>
              <div className="flex flex-wrap gap-4">
                {product.additionalImages.map((image, index) => (
                  <img
                    key={index}
                    src={getImageSrc(image)!}
                    alt={`Additional Image ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 min-h-screen">
      <DataTable
        title="Product Vendor Requests"
        data={products}
        columns={[
          {
            key: "productName",
            label: "Product Name",
            render: (item) => (
              <div className="flex flex-col">
                <div className="text-[16px]">{item.productName}</div>
                <div className="font-bold text-[16px]">SKU: {item.sku}</div>
              </div>
            ),
          },
          {
            key: "vendorName",
            label: "Vendor Name",
            render: (item: Product) => item.vendor.businessName,
          },
          { key: "vendorType", label: "Vendor Type" },
          { key: "category", label: "Category" },
          { key: "brand", label: "Brand" },
          { key: "sellingPrice", label: "Selling Price" },
          {
            key: "status",
            label: "Status",
            render: (item: Product) => (
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  item.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : item.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : item.status === "Draft"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
        ]}
        onView={(product: Product) => {
          setSelectedProduct(product);
          setModalOpen(true);
        }}
        onApprove={(product: Product) =>
          product.status === "Pending" && handleApprove(product)
        }
        onReject={(product: Product) =>
          product.status === "Pending" && handleReject(product)
        }
      />

      {/* MODAL */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[85vh]">
            <h2 className="text-xl font-bold mb-6">Product Request Details</h2>

            <div className="flex flex-col gap-6">
              {/* Vendor Information */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  Vendor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.businessName}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Owner Name</label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.ownerName}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Business Type
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.businessType}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Business Category
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.businessCategory}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">GST Number</label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.gstNo}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.email}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Mobile</label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.mobile}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Alternate Number
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.alternateNumber || ""}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.businessAddress}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                      Location Link
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.locationLink || ""}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Bank Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.bankAccountHolderName}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.bankAccountNo}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">IFSC Code</label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.ifsc}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Bank Name</label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.bankName}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">UPI ID</label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.upiId || ""}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Payment Settlement Preference
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.paymentSettlementPreference}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Vendor Status
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendor.status}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  Product Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.productName}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Vendor Type
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.vendorType}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">SKU</label>
                    <input
                      type="text"
                      value={selectedProduct.sku}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <input
                      type="text"
                      value={selectedProduct.category}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.subcategory}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Sub Sub Category
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.subSubCategory}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Brand</label>
                    <input
                      type="text"
                      value={selectedProduct.brand}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Product Type
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.productType}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Keywords</label>
                    <input
                      type="text"
                      value={selectedProduct.keywords}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                      Short Description
                    </label>
                    <textarea
                      value={selectedProduct.shortDescription}
                      className="customInput bg-gray-100"
                      disabled
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                      Full Description
                    </label>
                    <textarea
                      value={selectedProduct.fullDescription}
                      className="customInput bg-gray-100"
                      disabled
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Product Video URL
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.productVideoUrl || ""}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Manufacturing Date
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.manufacturingDate || ""}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.expiryDate || ""}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  {selectedProduct.vendorType === "Retailer" && (
                    <div>
                      <label className="block mb-1 font-medium">MRP</label>
                      <input
                        type="number"
                        value={selectedProduct.mrp || ""}
                        className="customInput bg-gray-100"
                        disabled
                      />
                    </div>
                  )}
                  <div>
                    <label className="block mb-1 font-medium">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.sellingPrice}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  {selectedProduct.vendorType === "Wholesaler" && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Wholesale Price
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.wholesalePrice || ""}
                        className="customInput bg-gray-100"
                        disabled
                      />
                    </div>
                  )}
                  <div>
                    <label className="block mb-1 font-medium">
                      Discount Type
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.discountType}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.discountValue}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Tax (GST %)
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.tax}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.stockQuantity}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  {selectedProduct.vendorType === "Wholesaler" && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Minimum Order Quantity
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.minimumOrderQuantity || ""}
                        className="customInput bg-gray-100"
                        disabled
                      />
                    </div>
                  )}
                  {selectedProduct.vendorType === "Retailer" && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Maximum Order Quantity
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.maximumOrderQuantity || ""}
                        className="customInput bg-gray-100"
                        disabled
                      />
                    </div>
                  )}
                  <div>
                    <label className="block mb-1 font-medium">Barcode</label>
                    <input
                      type="text"
                      value={selectedProduct.barcode || ""}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Unit</label>
                    <input
                      type="text"
                      value={selectedProduct.unit}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.weight}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                      Dimensions (cm)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={selectedProduct.dimensions.length}
                        className="customInput bg-gray-100 w-1/3"
                        disabled
                        placeholder="Length"
                      />
                      <input
                        type="number"
                        value={selectedProduct.dimensions.width}
                        className="customInput bg-gray-100 w-1/3"
                        disabled
                        placeholder="Width"
                      />
                      <input
                        type="number"
                        value={selectedProduct.dimensions.height}
                        className="customInput bg-gray-100 w-1/3"
                        disabled
                        placeholder="Height"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Warehouse Location
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.warehouseLocation}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Stock Availability
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.stockAvailability}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Low Stock Alert Quantity
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.lowStockAlertQuantity}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Product Condition
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.productCondition}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Free Shipping
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.freeShipping ? "Yes" : "No"}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  {selectedProduct.vendorType === "Retailer" &&
                    !selectedProduct.freeShipping && (
                      <div>
                        <label className="block mb-1 font-medium">
                          Shipping Charge
                        </label>
                        <input
                          type="number"
                          value={selectedProduct.shippingCharge || ""}
                          className="customInput bg-gray-100"
                          disabled
                        />
                      </div>
                    )}
                  {selectedProduct.vendorType === "Wholesaler" && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Minimum Order Value for Free Shipping
                      </label>
                      <input
                        type="number"
                        value={
                          selectedProduct.minimumOrderValueForFreeShipping || ""
                        }
                        className="customInput bg-gray-100"
                        disabled
                      />
                    </div>
                  )}
                  {selectedProduct.vendorType === "Retailer" && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Return Policy
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.returnPolicy || ""}
                        className="customInput bg-gray-100"
                        disabled
                      />
                    </div>
                  )}
                  {selectedProduct.vendorType === "Retailer" && (
                    <div>
                      <label className="block mb-1 font-medium">
                        COD Available
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.codAvailable ? "Yes" : "No"}
                        className="customInput bg-gray-100"
                        disabled
                      />
                    </div>
                  )}
                  <div>
                    <label className="block mb-1 font-medium">
                      Estimated Delivery Time
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.estimatedDeliveryTime}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Meta Title</label>
                    <input
                      type="text"
                      value={selectedProduct.metaTitle}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                      Meta Description
                    </label>
                    <textarea
                      value={selectedProduct.metaDescription}
                      className="customInput bg-gray-100"
                      disabled
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.metaKeywords}
                      className="customInput bg-gray-100"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              {renderImages(selectedProduct)}

              {/* Category Attributes */}
              {selectedProduct.category && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {selectedProduct.category} Attributes
                  </h3>
                  {renderCategoryAttributes(selectedProduct)}
                </div>
              )}

              {/* Variants */}
              {renderVariants(selectedProduct)}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                {selectedProduct.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedProduct)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedProduct)}
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

export default ProductVendorRequests;
