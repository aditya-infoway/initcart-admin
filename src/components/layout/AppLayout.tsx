import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaHeart } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../utils/reuseable";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { MdDashboard, MdNotificationsActive, MdOutlineAdsClick } from "react-icons/md";

import { FaBoxOpen, FaChevronDown, FaShoppingCart, FaGlobe } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BiSolidCategory } from "react-icons/bi";
import {
  MdAddCircle,
  MdSettings,
  MdPayment,
  MdAnalytics,
  MdStore,
  MdOutlineReport,
  MdOutlineAccountBalanceWallet,
  MdOutlineCategory,
  MdOutlineLocalOffer,
  MdOutlineLocalShipping,
  MdOutlineBackup,
  MdOutlinePeopleAlt,
  MdOutlineAttachMoney,
  MdIntegrationInstructions,
  MdOutlineDataUsage,
} from "react-icons/md";
import {
  FaCogs,
  FaExchangeAlt,
  FaClipboardList,
  FaBoxes,
  FaChartPie,
  FaWarehouse,
  FaStoreAlt,
  FaUserShield,
} from "react-icons/fa";
import {
  BsCartCheck,
  BsGraphUp,
  BsCurrencyExchange,
  BsBank2,
} from "react-icons/bs";
import { AiOutlineShoppingCart, AiOutlineSetting } from "react-icons/ai";
import {
  RiGroupLine,
  RiUserSettingsLine,
  RiFundsBoxLine,
} from "react-icons/ri";
import { TbReportAnalytics, TbHierarchy2, TbReceipt2 } from "react-icons/tb";
import { GiTakeMyMoney, GiShop, GiSettingsKnobs } from "react-icons/gi";

interface SubSubMenu {
  name: string;
  to: string;
}

interface SubMenu {
  name: string;
  to?: string;
  submenu?: SubSubMenu[];
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  to?: string;
  submenu?: SubMenu[];
}

interface MenuCategory {
  category?: string;
  items: MenuItem[];
}

// Menu items remain the same as provided
export const menuItems: MenuCategory[] = [
  // {
  //   category: "Dashboard",
  //   items: [
  //     {
  //       title: "Overview",
  //       icon: <MdDashboard size={20} />,
  //       submenu: [
  //         { name: "Sales", to: "/" },
  //         { name: "Purchases", to: "#" },
  //         { name: "Stock", to: "#" },
  //         { name: "Agents", to: "#" },
  //         { name: "Vendors", to: "#" },
  //         { name: "Services", to: "#" },
  //       ],
  //     },
  //     {
  //       title: "Notifications & Alerts",
  //       icon: <MdNotificationsActive size={20} />,
  //       to: "#",
  //       submenu: [],
  //     },
  //     {
  //       title: "Quick Create",
  //       icon: <MdAddCircle size={20} />,
  //       submenu: [
  //         { name: "Item", to: "#" },
  //         { name: "Agent", to: "#" },
  //         { name: "Vendor", to: "#" },
  //         { name: "Agents", to: "#" },
  //         { name: "Product Vendors", to: "#" },
  //         { name: "Service Vendor", to: "#" },
  //       ],
  //     },
  //   ],
  // },
  {
    category: "",
    items: [
      {
        title: "Dashboard",
        icon: <MdDashboard size={20} />,
        to: "/",
        submenu: [],
      },
    ],
  },
    {
    category: "Web Site",
    items: [
      {
        title: "Web Site",
        icon: <FaGlobe size={20} />,
        submenu: [
          { name: "Slider Image", to: "/SliderImage" },
          { name: "Ads Manager", to: "/Ads" },
          { name: "Mobile Banner", to: "/BannerManager" },
        ],
      },
    ],
  },
  {
    category: "E-Commerce (Multi-Vendor)",
    items: [
      {
        title: "Vendors Management",
        icon: <FaStoreAlt size={20} />,
        submenu: [
          { name: "Create Vendor", to: "/productvendor" },
          { name: "Vendor List", to: "/productvendor-list" },
          { name: "Vendor Approval Requests", to: "/productvendor-requests" },
          {
            name: "Vendor Wallet & Withdrawal Requests",
            to: "/productvendor-walletwithdrawals",
          },
          { name: "Brand creation", to: "/productvendor-brandcreation" },
        ],
      },
      {
        title: "Loyalty Points",
        icon: <FaHeart size={20} />,
        submenu: [
          {
            name: "Loyalty Points create",
            to: "/loyaltyConfig",
          },
          {
            name: "Loyalty Points Transaction",
            to: "/loyaltyTransaction",
          },
        ]
      },
      {
        title: "Products",
        icon: <FaBoxes size={20} />,
        submenu: [
          {
            name: "Product List verification for every vendor",
            to: "/productverification",
          },
          {
            name: "Category Master",
            to: "/createcategroy",
            submenu: [
              { name: "Category", to: "/createcategroy" },
              { name: "Sub Category", to: "/subcategory" },
              { name: "Sub Sub Category", to: "/subsubcategory" },
            ],
          },
          // { name: "Stock Management", to: "#" },
        ],
      },
      {
        title: "Deals & Campaigns",
        icon: <MdOutlineLocalOffer size={20} />,
        submenu: [
          { name: "Create Campaign", to: "/createcampaign" },
          {name: "Deal of The Day", to:"/dealoftheday"},
          {name: "Flash Deal", to:"/flashdeal"},
          {name: "featured deal", to: "/featuredDeal"},
          
          // { name: "Deal of the Day / Featured Deals", to: "/deals" },
          // { name: "Featured Deals", to: "#" },
        ],
      },
      {
        title: "Orders",
        icon: <BsCartCheck size={20} />,
        submenu: [
          { name: "All Orders", to: "/filteredorders" },
          { name: "Order Profit Report", to: "/orderProfitReport" },

        ],
      },
      {
        title: "Reports",
        icon: <TbReportAnalytics size={20} />,
        submenu: [
          { name: "Sales Report", to: "/salesreport" },
          // { name: "Order Report", to: "/orderreport" },
          // { name: "Vendor Performance Report", to: "#" },
        ],
      },
      {
        title: "Settings",
        icon: <AiOutlineSetting size={20} />,
        submenu: [
          { name: "Shipping Configuration", to: "/shippingconfiguration" },
          { name: "Payment Gateway Setup", to: "/paymentgatewaysetup" },
          { name: "Return & Refund Policy", to: "/returnandrefundpolicy" },
        ],
      },
      {
        title: "Finance & Withdrawals",
        icon: <MdOutlineAttachMoney size={20} />,
        submenu: [
          { name: "Vendor Withdrawals", to: "/vendorwithdrawals" },
          { name: "Transaction Reports", to: "/transactionreports" },
        ],
      },
    ],
  },
  {
    category: "Service Subscription Platform",
    items: [
      {
        title: "Vendors",
        icon: <RiUserSettingsLine size={20} />,
        submenu: [
          { name: "Create Service Vendor (Admin)", to: "/createservicevendor" },
          { name: "Service Vendor List", to: "/servicevendorlist" },
          { name: "Create Subscription ", to: "/admin/subscriptions" },
          {
            name: "Vendor Wallet & Withdrawals",
            to: "/servicevendor-walletwithdrawals",
          },
        ],
      },
      {
        title: "Services",
        icon: <MdOutlineCategory size={20} />,
        submenu: [
          {
            name: "Manage Services",
            submenu: [
              { name: "Service Categories", to: "/servicecategories" },
              { name: "Service Sub Categories", to: "/servicesubcategories" },
              { name: "Service Tags", to: "/servicetags" },
              { name: "Service Approval Requests", to: "/properties" }
            ],
          },
          { name: "Service Inquiries", to: "/serviceinquiry" },
          { name: "Service List", to: "/servicelist" },
          { name: "Flash Deal Participation", to: "/flashdealparticipation" },
          { name: "Featured Services", to: "/featuredservices" },
        ],
      },
      {
        title: "Service Approval List",
        icon: <MdOutlineLocalOffer size={20} />,
        to: "/allserviclist",
        submenu: [],
      },
      {
        title: "Marketing Banners",
        icon: <MdOutlineAdsClick size={20} />,
        submenu: [
          { name: "Gym Marketing Banners", to: "/gymmarketingbanners" },
          { name: "Saloon Marketing Banners", to: "/saloonmarketingbanners" },
          { name: "Travel Agency Marketing Banners", to: "/travelagencymarketingbanners" },
          { name: "Real Estate Marketing Banners", to: "/realestatemarketingbanners" },
          {name: "Tech Industry Marketing Banners" , to:"/techmarketingbanners"},
          {name: "Professional Marketing Banners" , to:"/professionalmarketingbanners"},
          {name: "Finance Marketing Banners" , to:"/financeAds"},
          {name: "Healthcare Marketing Banners", to: "/HealthcareAds"},
          {name: "Education Marketing Banners", to: "/EducationAds"},
          {name: "Restaurant Marketing Banners", to: "/restaurantAds"},
          {name: "Hotel Marketing Banners", to: "/HotelAds"},
        ],  
      },
      {
        title: "Campaigns",
        icon: <MdOutlineLocalOffer size={20} />,
        submenu: [
          { name: "Create Campaign", to: "/campaign/createcampaign" },
          { name: "Vendor Participation Approval", to: "/campaign/vendorparticipationapproval" },
          { name: "Active Campaigns List", to: "/campaign/activecampaignslist" },
        ],
      },
      {
        title: "Reports",
        icon: <TbReportAnalytics size={20} />,
        submenu: [
          { name: "Subscription Reports", to: "/reports/subscriptionreport" },
          { name: "Inquiry Reports", to: "/reports/inquiryreport" },
          { name: "Service Performance Report", to: "/reports/serviceperformancereport" },
          { name: "Vendor Earnings Report", to: "/reports/vendorearningreport" },
        ],
      },
      {
        title: "Settings",
        icon: <AiOutlineSetting size={20} />,
        submenu: [
          { name: "Subscription Plan Setup", to: "/plancreation" },
          { name: "Service Plan Renewal Requests", to: "/planrenewalrequests" },
          { name: "Service Plan Expiry Notifications", to: "/planexpirynotifications" },
        ],
      },
    ],
  },
  {
    category: "MLM (Multi-Level Marketing)",
    items: [
      {
        title: "Agents Management",
        icon: <RiGroupLine size={20} />,
        submenu: [
          { name: "Create Agent", to: "/createagent" },
          { name: "Agent List", to: "/agentlist" },
          { name: "Agent Hierarchy Tree View", to: "/agenthierarchytreeview" },
          { name: "Agent Approval", to: "/agentApproval" },

        ],
      },
      {
        title: "Commission",
        icon: <MdOutlineAttachMoney size={20} />,
        submenu: [
          { name: "Commission Criteria Setup", to: "/commission/criteria" },
          { name: "Commission Distribution Rules", to: "/commission/rules" },
          { name: "Commission Reports", to: "/commission/reports" },
        ],
      },
      {
        title: "Profit Distribution",
        icon: <MdOutlineAttachMoney size={20} />,
        to: "/profitDistribution",
        submenu: [],
      },
      {
        title: "MLM Levels",
        icon: <MdOutlineAttachMoney size={20} />,
        to: "/mlmLevelSetup",
        submenu: [],
      },
      {
        title: "Transactions",
        icon: <FaExchangeAlt size={20} />,
        submenu: [
          { name: "Agent Sales Entry", to: "/transactions/sales-entry" },
          { name: "Agent Sale Verification", to: "/transactions/verification" },
          { name: "Commission Payouts", to: "/transactions/payouts" },
          { name: "Withdrawal Requests", to: "/transactions/withdrawals" },
          // {
          //   name: "Withdrawal Requests ",
          //   submenu: [
          //     { name: "Approve", to: "#" },
          //     { name: "Reject", to: "#" },
          //   ],
          // },
        ],
      },
      {
        title: "Reports",
        icon: <TbReportAnalytics size={20} />,
        submenu: [
          { name: "Agent Sales Report", to: "/reports/agent-sales" },
          { name: "Level-wise Commission Report", to: "/reports/level-commission" },
          // { name: "Agent Hierarchy Tree View", to: "" },
          {
            name: "Payout History",
            to: "/reports/payout-history",
          },
        ],
      },
      {
        title: "Settings",
        icon: <AiOutlineSetting size={20} />,
        submenu: [
          { name: "Level Configuration", to: "/settings/levels" },
          { name: "Referral Code Settings", to: "/settings/referral" },
        ],
      },
    ],
  },
  {
    category: "POS (Point of Sale)",
    items: [
      {
        title: "Master",
        icon: <FaCogs size={20} />,
        submenu: [
          { name: "Account Group Master", to: "/accountgroupmaster" },
          { name: "Group Master", to: "/groupmaster" },
          { name: "Unit Master", to: "/unitmaster" },
          { name: "Item Master", to: "/itemmaster" },
          { name: "Accounts master", to: "/accountmaster" },
          { name: "Branch Master", to: "/branchmaster" },
          { name: "Tax Master", to: "/taxmaster" },
          { name: "Bank Master", to: "/bankmaster" },
        ],
      },
            {
        title: "Branch",
        icon: <BsFillPersonLinesFill size={20} />,
        submenu: [
          { name: "Item Varification", to: "/itemProductApproval" },
        ],
      },
      {
        title: "Transactions",
        icon: <FaExchangeAlt size={20} />,
        submenu: [
          { name: "Purchase Entry", to: "/purchaseentry" },
          { name: "Purchase Verify", to: "/purchaseverify" },
          { name: "Purchase Order", to: "/purchaseorder" },
          { name: "Purchase Return", to: "/purchasereturn" },
          { name: "Sale Entry", to: "/saleentry" },
          { name: "Sale Return", to: "/salereturn" },
          { name: "Quick Payment", to: "/quickpayment" },
          { name: "Quick Receipt", to: "/quickreceipt" },
          { name: "Debit Note", to: "/debitnote" },
          { name: "Credit Note", to: "/creditnote" },
          { name: "Cash Band Transactions", to: "/cashbanktransactions" },
          // { name: "Order Generate (Purchase Order)", to: "#" },
          // { name: "Purchase Return", to: "#" },
          // { name: "Sale Entry", to: "#" },
          // { name: "Sale Return", to: "#" },
          // { name: "Quick Payment", to: "#" },
          // { name: "Debit Note", to: "#" },
          // { name: "Quick Receipt", to: "#" },
          // { name: "Credit Note", to: "#" },
          // { name: "Cash & Bank Transactions", to: "#" },
          // { name: "Branch Stock Transfer", to: "#" },
        ],
      },
      {
        title: "Reports",
        icon: <TbReportAnalytics size={20} />,
        submenu: [
          {
            name: "Stock Reports",
            submenu: [
              { name: "Outstanding", to: "#" },
              { name: "Ledger", to: "/ledgerreport" },
              { name: "Sale Register", to: "#" },
              { name: "Purchase Register", to: "#" },
              { name: "Sale Return Register", to: "#" },
              { name: "Purchase Return Register", to: "#" },
              { name: "Debit Note Register", to: "#" },
              { name: "Credit Note Register", to: "#" },
              { name: "Quick Payment Register", to: "#" },
              { name: "Quick Receipt Register", to: "#" },
            ],
          },
          {
            name: "Financial Reports",
            submenu: [
              { name: "Day Book", to: "#" },
              { name: "Cash Book", to: "#" },
              { name: "Balance Sheet", to: "#" },
              { name: "Profit & Loss Statement", to: "#" },
              { name: "Trading Account", to: "#" },
            ],
          },
        ],
      },
      {
        title: "Analytics",
        icon: <BsGraphUp size={20} />,
        submenu: [
          { name: "Sales Summary", to: "#" },
          { name: "Purchase Summary", to: "#" },
          { name: "Branch-wise Stock Chart", to: "#" },
        ],
      },
      {
        title: "Settings",
        icon: <AiOutlineSetting size={20} />,
        submenu: [
          { name: "Tax Configuration", to: "#" },
          { name: "Currency Settings", to: "#" },
          { name: "Payment Methods", to: "#" },
          { name: "POS Terminals", to: "#" },
        ],
      },
    ],
  },

  {
    category: "Finance & Withdrawals",
    items: [
      {
        title: "All Withdrawal Requests",
        icon: <GiTakeMyMoney size={20} />,
        submenu: [
          { name: "Agents", to: "#" },
          { name: "Product Vendors", to: "#" },
          { name: "Service Vendors", to: "#" },
        ],
      },
      {
        title: "Approve / Reject / Partial Approvals",
        icon: <MdOutlineAccountBalanceWallet size={20} />,
        to: "#",
        submenu: [],
      },
      {
        title: "Payment History",
        icon: <BsBank2 size={20} />,
        submenu: [
          { name: "Create Flash Deal", to: "#" },
          { name: "Manage Flash Deals", to: "#" },
          { name: "Vendor Participation Requests", to: "#" },
        ],
      },
      {
        title: "Transaction Reports ",
        icon: <TbReportAnalytics size={20} />,
        submenu: [
          { name: "Product", to: "#" },
          { name: "POS", to: "#" },
          { name: "Agent", to: "#" },
          { name: "Refund", to: "#" },
        ],
      },
    ],
  },

  {
    category: "System Management",
    items: [
      {
        title: "User Roles & Permissions",
        icon: <FaUserShield size={20} />,
        to: "#",
        submenu: [],
      },
      {
        title: "Audit Log",
        icon: <FaClipboardList size={20} />,
        to: "/auditlog",
        submenu: [],
      },
      {
        title: "Notification Templates",
        icon: <MdNotificationsActive size={20} />,
        to: "/notificationtemplates",
        submenu: [
          // { name: "Email", to: "#" },
          // { name: "SMS", to: "#" },
        ],
      },
      {
        title: "Data Backup & Restore",
        icon: <MdOutlineBackup size={20} />,
        submenu: [],
      },
      {
        title: "Integration Settings ",
        icon: <MdIntegrationInstructions size={20} />,
        submenu: [
          { name: "Printer", to: "#" },
          { name: "Scanner", to: "#" },
          { name: "Accounting Export", to: "#" },
        ],
      },
      {
        title: "Import / Export Data",
        icon: <MdOutlineDataUsage size={20} />,
        submenu: [],
      },
    ],
  },

  {
    category: "Reports & Analytics",
    items: [
      {
        title: "Global Sales Report",
        icon: <TbReportAnalytics size={20} />,
        submenu: [],
      },
      {
        title: "Profitability Analysis",
        icon: <FaChartPie size={20} />,
        to: "#",
        submenu: [],
      },
      {
        title: "Inventory Valuation",
        icon: <FaWarehouse size={20} />,
        to: "#",
        submenu: [],
      },
      {
        title: "Agent vs Vendor Sales Comparison",
        icon: <BsCurrencyExchange size={20} />,
        to: "#",
        submenu: [],
      },
      {
        title: "Service Inquiry Trends",
        icon: <MdOutlineReport size={20} />,
        to: "#",
        submenu: [],
      },
    ],
  },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [isIconOnly, setIsIconOnly] = useState(false); // Toggle between full and icon-only sidebar
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  // Detect screen size and set initial states
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Open by default on desktop, closed on mobile
      setIsIconOnly(false); // Reset icon-only mode on resize
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update active menu based on current route
  useEffect(() => {
    const path = location.pathname;
    for (const category of menuItems) {
      for (const item of category.items) {
        if (item.to && item.to === path) {
          setActiveMenu(item.title);
          return;
        }
        if (item.submenu && item.submenu.length > 0) {
          const matchedSub = item.submenu.find((s) => s.to === path);
          if (matchedSub) {
            setActiveMenu(matchedSub.name);
            return;
          }
        }
      }
    }
  }, [location.pathname]);

  const handleMenuClick = (title: string, path: string) => {
    setActiveMenu(title);
    navigate(path);
    if (isMobile) setSidebarOpen(false); // Close sidebar on mobile after click
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleIconOnly = () => {
    setIsIconOnly((prev) => !prev);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen overflow-y-hidden">
      {/* Sidebar */}
      <Sidebar
        menuItems={menuItems}
        sidebarOpen={sidebarOpen}
        isIconOnly={isIconOnly}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        toggleIconOnly={toggleIconOnly}
        handleMenuClick={handleMenuClick}
        activeMenu={activeMenu}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen overflow-y-hidden transition-all duration-300 
         ${isMobile && sidebarOpen ? "opacity-50" : ""}`}
      >
        {/* Header */}
        <div className="flex justify-between lg:justify-end items-center px-4 py-1 bg-white shadow">
          <button onClick={toggleSidebar} className="lg:hidden">
            <FaBars size={24} />
          </button>
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setOpen((prev) => !prev)}
            >
              <img
                src={toAbsoluteUrl("media/icons/profile.jpg")}
                height={40}
                width={40}
                alt="Profile"
                className="rounded-full hover:ring-gray-300 transition-all duration-200"
              />
            </div>
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 flex-1 ${isIconOnly ? "lg:ms-20" : "lg:ms-64"}  `}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
