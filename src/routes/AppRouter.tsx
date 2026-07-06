import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProductCategory from "../pages/product&service/ProductCategory";
import ServiceCategory from "../pages/product&service/ServiceCategory";
import ProductVendor from "../pages/vendor/ProductVendor";
import ServiceVendor from "../pages/vendor/ServiceVendor";
import SubCategory from "../pages/category setup/SubCategory";
import SubSubCategory from "../pages/category setup/SubSubCategory";
import All from "../pages/orders/All";
import Pending from "../pages/orders/Pending";
import Confirmed from "../pages/orders/Confirmed";
import Packaging from "../pages/orders/Packaging";
import OutForDelivery from "../pages/orders/OutForDelivery";
import Delivered from "../pages/orders/Delivered";
import Returned from "../pages/orders/Returned";
import FailedToDeliver from "../pages/orders/FailedToDeliver";
import Cancelled from "../pages/orders/Cancelled";
import ServiceVendorRequests from "../pages/vendor/ServiceVendorRequests";
import ProductVendorRequests from "../pages/vendor/ProductVendorRequests";
import CreateVendor from "../pages/E-Commerce (Multi-Vendor)/Vendor Management/CreateVendor";
import VendorList from "../pages/E-Commerce (Multi-Vendor)/Vendor Management/VendorList";
import VendorApprovalRequests from "../pages/E-Commerce (Multi-Vendor)/Vendor Management/VendorApprovalRequests";
import VendorWalletWithdrawals from "../pages/E-Commerce (Multi-Vendor)/Vendor Management/VendorWalletWithdrawals";
import BrandCreation from "../pages/E-Commerce (Multi-Vendor)/Vendor Management/BrandCreation";
import ProductVerification from "../pages/E-Commerce (Multi-Vendor)/products/ProductVerification";
import CategoryMaster from "../pages/E-Commerce (Multi-Vendor)/products/CategoryMaster";
import CreateCampaign from "../pages/E-Commerce (Multi-Vendor)/Deals & Campaigns/CreateCampaign";
import Deals from "../pages/E-Commerce (Multi-Vendor)/Deals & Campaigns/Deals";
import VendorParticipationRequests from "../pages/E-Commerce (Multi-Vendor)/Deals & Campaigns/VendorParticipationRequests";
import VendorParticipationApproval from "../pages/E-Commerce (Multi-Vendor)/Deals & Campaigns/VendorParticipationApproval"
import AllOrders from "../pages/E-Commerce (Multi-Vendor)/Orders/AllOrders";
import FilteredOrders from "../pages/E-Commerce (Multi-Vendor)/Orders/FilteredOrders";
import OrderDetails from "../pages/E-Commerce (Multi-Vendor)/Orders/OrderDetails";
import OrderReport from "../pages/E-Commerce (Multi-Vendor)/Reports/OrderReport";
import SalesReport from "../pages/E-Commerce (Multi-Vendor)/Reports/SalesReport";
import ShippingConfiguration from "../pages/E-Commerce (Multi-Vendor)/Settings/ShippingConfiguration";
import PaymentGatewaySetup from "../pages/E-Commerce (Multi-Vendor)/Settings/PaymentGatewaySetup";
import ReturnRefundPolicy from "../pages/E-Commerce (Multi-Vendor)/Settings/ReturnRefundPolicy";
import LoyaltyPointsList from "../pages/E-Commerce (Multi-Vendor)/Orders/LoyaltyPointsList";
import LoyaltyPointsTransactions from "../pages/E-Commerce (Multi-Vendor)/Orders/LoyaltyTransactions";
import VendorWithdrawals from "../pages/E-Commerce (Multi-Vendor)/Finance & Withdrawals/VendorWithdrawals";
import TransactionReports from "../pages/E-Commerce (Multi-Vendor)/Finance & Withdrawals/TransactionReports";
import NotificationTemplates from "../pages/System Management/NotificationTemplates";
import AuditLog from "../pages/System Management/Auditlog";
import CreateServiceVendor from "../pages/Service Subscription Platform/Vendors/CreateServiceVendor";
import ServiceVendorList from "../pages/Service Subscription Platform/Vendors/ServiceVendorList";
import VendorSubscriptionRequests from "../pages/Service Subscription Platform/Vendors/VendorSubscriptionRequests";
import ServiceVendorWalletWithdrawals from "../pages/Service Subscription Platform/Vendors/ServiceVendorWalletWithdrawals";
import ServiceCategories from "../pages/Service Subscription Platform/Services/ServiceCategories";
import SubscriptionMaster from "../pages/Service Subscription Platform/Services/SubscriptionMaster";
import ServiceSubcategories from "../pages/Service Subscription Platform/Services/ServiceSubcategories";
import ServiceTags from "../pages/Service Subscription Platform/Services/ServiceTags";
import ServiceList from "../pages/Service Subscription Platform/Services/ServiceList";
import ServiceDetailView from "../pages/Service Subscription Platform/Services/ServiceDetailView";
import FlashDealParticipation from "../pages/Service Subscription Platform/Services/FlashDealParticipation";
import FeaturedServices from "../pages/Service Subscription Platform/Services/FeaturedServices";
import Profile from "../pages/Profile/Profile";
import PlanCreation from "../pages/EXTRAS/PlanCreation";
import PlanRenewalRequests from "../pages/EXTRAS/PlanRenewalRequests";
import PlanExpiryNotifications from "../pages/Service Subscription Platform/Settings/PlanExpiryNotifications";
import CreateAgent from "../pages/MLM (Multi Level Marketing System)/Agent Management/CreateAgent";
import AgentList from "../pages/MLM (Multi Level Marketing System)/Agent Management/AgentList";
import AgentHierarchyTreeView from "../pages/MLM (Multi Level Marketing System)/Agent Management/AgentHierarchyTreeView";
import AgentLevelsConfiguration from "../pages/MLM (Multi Level Marketing System)/Agent Management/AgentLevelsConfiguration";
import CommissionCriteriaSetup from "../pages/MLM (Multi Level Marketing System)/Commission Setup/CommissionCriteriaSetup";
import CommissionDistributionRules from "../pages/MLM (Multi Level Marketing System)/Commission Setup/CommissionDistributionRules";
import CommissionReports from "../pages/MLM (Multi Level Marketing System)/Commission Setup/CommissionReports";
import AgentSalesEntry from "../pages/MLM (Multi Level Marketing System)/Transactions/AgentSalesEntry";
import WithdrawalRequests from "../pages/MLM (Multi Level Marketing System)/Transactions/WithdrawalRequests";
import AgentSalesReport from "../pages/MLM (Multi Level Marketing System)/Reports/AgentSalesReport";
import LevelWiseCommissionReport from "../pages/MLM (Multi Level Marketing System)/Reports/LevelWiseCommissionReport";
import PayoutHistory from "../pages/MLM (Multi Level Marketing System)/Reports/PayoutHistory";
import LevelConfiguration from "../pages/MLM (Multi Level Marketing System)/Settings/LevelConfiguration";
import ReferralCodeSettings from "../pages/MLM (Multi Level Marketing System)/Settings/ReferralCodeSettings";
import SubscriptionReports from "../pages/Service Subscription Platform/Reports/SubscriptionReports";
import InquiryReports from "../pages/Service Subscription Platform/Reports/InquiryReports";
import ServicePerformanceReport from "../pages/Service Subscription Platform/Reports/ServicePerformanceReport";
import VendorEarningsReport from "../pages/Service Subscription Platform/Reports/VendorEarningsReport";
import ActiveCampaignsList from "../pages/Service Subscription Platform/Campaigns/ActiveCampaignsList";
import AccountGroupMaster from "../pages/pos/master/AccountGroupMaster";
import GroupMaster from "../pages/pos/master/GroupMaster";
import UnitMaster from "../pages/pos/master/UnitMaster";
import ItemMaster from "../pages/pos/master/ItemMaster";
import AccountMaster from "../pages/pos/master/AccountMaster";
import BranchMaster from "../pages/pos/master/BranchMaster";
import TaxMaster from "../pages/pos/master/TaxMaster";
import BankMaster from "../pages/pos/master/BankMaster";
import PurchaseEntry from "../pages/pos/transactions/PurchaseEntry";
import PurchaseVerify from "../pages/pos/transactions/PurchaseVerify";
import PurchaseOrder from "../pages/pos/transactions/PurchaseOrder";
import PurchaseReturn from "../pages/pos/transactions/PurchaseReturn";
import SaleEntry from "../pages/pos/transactions/SaleEntry";
import SaleReturn from "../pages/pos/transactions/SaleReturn";
import CashBankTransactions from "../pages/pos/transactions/CashBankTransactions";
import { QuickPayment } from "../pages/pos/transactions/QuickPayment";
import { QuickReceipt } from "../pages/pos/transactions/QuickReceipt";
import { DebitNote } from "../pages/pos/transactions/DebitNote";
import { CreditNote } from "../pages/pos/transactions/CreditNote";
import LedgerReport from "../pages/pos/reports/LedgerReport";
import AdminPropertyDetailPage from "../pages/Service Subscription Platform/Services/AdminPropertyDetailPage";
import AdminPropertyList from "../pages/Service Subscription Platform/Services/PropertyList";
import SuperAdminInquiriesPage from "../pages/Service Subscription Platform/Services/ServiceInquiry";
import AdsManager from "../pages/E-Commerce (Multi-Vendor)/banners/AdsManagenr";
import SliderImage from "../pages/E-Commerce (Multi-Vendor)/banners/slider";
import DealOfDayCampaigns from "../pages/E-Commerce (Multi-Vendor)/Deals & Campaigns/DealofDayCampaigns";
import FlashDealCampaigns from "../pages/E-Commerce (Multi-Vendor)/Deals & Campaigns/FlashDeal";
import FeaturedDealCampaigns from "../pages/E-Commerce (Multi-Vendor)/Deals & Campaigns/FeaturedDeal";
import ProfitDistributionSetup from "../pages/MLM (Multi Level Marketing System)/Profit Distribution/ProfitDistributionSetup";
import MLMLevelSetup from "../pages/MLM (Multi Level Marketing System)/MLM Levels management/mlmLevelSetup";
import AgentApproval from "../pages/MLM (Multi Level Marketing System)/Agent Management/agentApproval";
import AllServicesTable from "../pages/Service Subscription Platform/Services/AllServiceTable";
import GymServiceApprovalList from "../pages/Service Subscription Platform/Services/gym&seloonservicelist";
import GymAdsManager from "../pages/Service Subscription Platform/Services/GymMarketingBanners";
import SaloonAdsManager from "../pages/Service Subscription Platform/Services/SaloonMarketingBanners";
import TravelAgencyServiceAdsManager from "../pages/Service Subscription Platform/Services/TravelAgencyMarketingBanners";
import RealEstateServiceAdsManager from "../pages/Service Subscription Platform/Services/RealEstateMarketingBanners";
import AdminItemVerification from "../pages/pos/master/ItemProductApproval";
import AdminMLMDashboard from "../pages/MLM (Multi Level Marketing System)/Commission Setup/CommissionReports";
import TechIndustryAdsManager from "../pages/Service Subscription Platform/Services/TechIndustryAdsManager";
import ProfessionalAdsManager from "../pages/Service Subscription Platform/Services/ProfessionalMarkeingBanner";
import BannerManager from "../pages/E-Commerce (Multi-Vendor)/banners/BannerManager";
import FinanceAdsManager from "../pages/Service Subscription Platform/Services/FinanceMarketingBanner";
import HealthcareAdsManager from "../pages/Service Subscription Platform/Services/HealthcareMaketingBanner";
import EducationAdsManager from "../pages/Service Subscription Platform/Services/EducationMarketingBanner";
import OrderProfitReport from "../pages/E-Commerce (Multi-Vendor)/Orders/OrderProfitReport";
import RestaurantAdsManager from "../pages/Service Subscription Platform/Services/RestaurantMarketingBanner";
import HotelAdsManager from "../pages/Service Subscription Platform/Services/HotelMarketingBanner";

const AppRouter = () => (
  <BrowserRouter basename="/superadmin">
    <Routes>
      {/* Public */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>
      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

          {/*ads marketing */}
         <Route path="/SliderImage" element={<SliderImage />} />
        <Route path="/Ads" element={<AdsManager />} />
        <Route path="/BannerManager" element={<BannerManager/>}/>

        <Route path="/productvendor" element={<CreateVendor />} />
        <Route path="/productvendor-list" element={<VendorList />} />
        <Route
          path="/productvendor-requests"
          element={<VendorApprovalRequests />}
        />
        <Route
          path="/productvendor-walletwithdrawals"
          element={<VendorWalletWithdrawals />}
        />
        <Route
          path="/productvendor-brandcreation"
          element={<BrandCreation />}
        />

        <Route path="/productverification" element={<ProductVerification />} />
        <Route path="/createcategroy" element={<CategoryMaster />} />
        <Route path="/subcategory" element={<SubCategory />} />
        <Route path="/subsubcategory" element={<SubSubCategory />} />

        <Route path="/createcampaign" element={<CreateCampaign />} />
        <Route path="/dealoftheday" element={<DealOfDayCampaigns/>}/>
        <Route path="/flashdeal" element={<FlashDealCampaigns/>}/>
        <Route path="featuredDeal" element={<FeaturedDealCampaigns/>}/>
        {/* <Route path="/deals" element={<Deals />} /> */}
        {/* <Route
          path="/vendorparticipationrequest"
          element={<VendorParticipationRequests />}
        />
        <Route
          path="/vendorparticipationapproval"
          element={<VendorParticipationRequests />}
        /> */}
        <Route path="/admin/campaigns/participations" element={<VendorParticipationRequests />} />
        <Route path="/admin/campaigns/participations/:participationId" element={<VendorParticipationApproval />} />

        <Route path="/loyaltyConfig" element={<LoyaltyPointsList />} />
        <Route path="/loyaltyTransaction" element={<LoyaltyPointsTransactions />} />
        <Route path="/allorders" element={<AllOrders />} />
        <Route path="/filteredorders" element={<FilteredOrders />} />
        <Route path="/orderProfitReport" element={<OrderProfitReport/>}/>
        <Route path="/admin/orders/:orderId" element={<OrderDetails />} />

        <Route path="/orderreport" element={<OrderReport />} />
        <Route path="/salesreport" element={<SalesReport />} />

        <Route
          path="/shippingconfiguration"
          element={<ShippingConfiguration />}
        />
        <Route path="/paymentgatewaysetup" element={<PaymentGatewaySetup />} />
        <Route path="/returnandrefundpolicy" element={<ReturnRefundPolicy />} />

        <Route path="/vendorwithdrawals" element={<VendorWithdrawals />} />
        <Route path="/transactionreports" element={<TransactionReports />} />

        <Route
          path="/notificationtemplates"
          element={<NotificationTemplates />}
        />
        <Route path="/auditlog" element={<AuditLog />} />

        <Route path="/createservicevendor" element={<CreateServiceVendor />} />
        <Route path="/servicevendorlist" element={<ServiceVendorList />} />

        <Route
          path="/vendorsubscriptionplans"
          element={<VendorSubscriptionRequests />}
        />
        <Route
          path="/servicevendor-walletwithdrawals"
          element={<ServiceVendorWalletWithdrawals />}
        />

        <Route path="/servicecategories" element={<ServiceCategories />} />
        <Route
          path="/servicesubcategories"
          element={<ServiceSubcategories />}
        />
                {/* services route */}
        <Route path="/allserviclist" element={<AllServicesTable />} />
        <Route path="/gym&otherservice" element={<GymServiceApprovalList />} />
        <Route path="/gymmarketingbanners" element={<GymAdsManager />} />
        <Route path="/professionalmarketingbanners" element={<ProfessionalAdsManager/>}/>
        <Route path="/saloonmarketingbanners" element={<SaloonAdsManager />} />
        <Route path="/techmarketingbanners" element={<TechIndustryAdsManager />} />
        <Route path="/travelagencymarketingbanners" element={<TravelAgencyServiceAdsManager />} />
        <Route path="/realestatemarketingbanners" element={<RealEstateServiceAdsManager />} />
        <Route path="/HealthcareAds" element={<HealthcareAdsManager/>}/>
        <Route path="/HotelAds" element={<HotelAdsManager/>}/>
        <Route path="/EducationAds" element={<EducationAdsManager/>}/>
        <Route path="/admin/subscriptions" element={<SubscriptionMaster />} />
        <Route
          path="/admin/subscriptions"
          element={<SubscriptionMaster />}
        />
        <Route path="/servicetags" element={<ServiceTags />} />
        <Route path="/serviceinquiry" element={<SuperAdminInquiriesPage />} />

        <Route path="/servicelist" element={<ServiceList />} />
        <Route path="/servicedetailsview" element={<ServiceDetailView />} />
        <Route
          path="/flashdealparticipation"
          element={<FlashDealParticipation />}
        />
        <Route path="/featuredservices" element={<FeaturedServices />} />

        <Route path="/campaign/createcampaign" element={<CreateCampaign />} />
        <Route path="/campaign/vendorparticipationapproval" element={<VendorApprovalRequests />} />
        <Route path="/campaign/activecampaignslist" element={<ActiveCampaignsList />} />

        <Route path="/reports/subscriptionreport" element={<SubscriptionReports />} />
        <Route path="/reports/inquiryreport" element={<InquiryReports />} />
        <Route path="/reports/serviceperformancereport" element={<ServicePerformanceReport />} />
        <Route path="/reports/vendorearningreport" element={<VendorEarningsReport />} />

        <Route path="/plancreation" element={<PlanCreation />} />
        <Route path="/planrenewalrequests" element={<PlanRenewalRequests />} />
        <Route
          path="/planexpirynotifications"
          element={<PlanExpiryNotifications />}
        />

        <Route path="/createagent" element={<CreateAgent />} />
        <Route path="/agentlist" element={<AgentList />} />
        <Route
          path="/agenthierarchytreeview"
          element={<AgentHierarchyTreeView />}
        />
        <Route
          path="/agentlevelsconfiguration"
          element={<AgentLevelsConfiguration />}
        />
        <Route path="/agentApproval" element={<AgentApproval/>}/>
        <Route path="/profitDistribution" element={<ProfitDistributionSetup/>}/>
        <Route path="/mlmLevelSetup" element={<MLMLevelSetup/>} />

        <Route
          path="/commission/criteria"
          element={<CommissionCriteriaSetup />}
        />
        <Route
          path="/commission/rules"
          element={<CommissionDistributionRules />}
        />
        <Route path="/commission/reports" element={<CommissionReports />} />

        <Route path="/transactions/sales-entry" element={<AgentSalesEntry />} />

        <Route path="/transactions/payouts" element={<AdminMLMDashboard />} />
        <Route
          path="/transactions/withdrawals"
          element={<WithdrawalRequests />}
        />

        <Route path="/reports/agent-sales" element={<AgentSalesReport />} />
        <Route path="/reports/level-commission" element={<LevelWiseCommissionReport />} />
        <Route path="/reports/payout-history" element={<PayoutHistory />} />
        <Route path="/settings/levels" element={<LevelConfiguration />} />
        <Route path="/settings/referral" element={<ReferralCodeSettings />} />

        <Route path="/accountgroupmaster" element={<AccountGroupMaster />} />
        <Route path="/groupmaster" element={<GroupMaster />} />
        <Route path="/unitmaster" element={<UnitMaster />} />
        <Route path="/itemmaster" element={<ItemMaster />} />
        <Route path="/accountmaster" element={<AccountMaster />} />
        <Route path="/branchmaster" element={<BranchMaster />} />
        <Route path="/taxmaster" element={<TaxMaster />} />
        <Route path="/bankmaster" element={<BankMaster />} />
        <Route path="/itemProductApproval" element={<AdminItemVerification/>}/>

        <Route path="/purchaseentry" element={<PurchaseEntry />} />
        <Route path="/purchaseverify" element={<PurchaseVerify />} />
        <Route path="/purchaseorder" element={<PurchaseOrder />} />
        <Route path="/purchasereturn" element={<PurchaseReturn />} />
        <Route path="/saleentry" element={<SaleEntry />} />
        <Route path="/salereturn" element={<SaleReturn />} />
        <Route path="/quickpayment" element={<QuickPayment />} />
        <Route path="/quickreceipt" element={<QuickReceipt />} />
        <Route path="/debitnote" element={<DebitNote />} />
        <Route path="/creditnote" element={<CreditNote />} />
        <Route path="/cashbanktransactions" element={<CashBankTransactions />} />
        <Route path="/properties" element={<AdminPropertyList />} />
        <Route path="/properties/pending" element={<AdminPropertyList />} />
        <Route path="/properties/:id" element={<AdminPropertyDetailPage />} />
        <Route path="/financeAds" element={<FinanceAdsManager />} />
        <Route path="/restaurantAds" element={<RestaurantAdsManager/>}/>

        <Route path="/ledgerreport" element={<LedgerReport />} />


        {/* <Route path="/servicevendor-walletwithdrawals" element={<ServiceVendorWalletWithdrawals />} /> */}

        {/* <Route path="/productcategory" element={<ProductCategory />} />
        <Route path="/servicecategory" element={<ServiceCategory />} />
        <Route path="/servicevendor" element={<ServiceVendor />} />
        <Route path="/servicevendorrequests" element={<ServiceVendorRequests />} />
        <Route path="/productvendorrequests" element={<ProductVendorRequests />} />
        <Route path="/subcategory" element={<SubCategory />} />
        <Route path="/subsubcategory" element={<SubSubCategory />} />
        <Route path="/allorders" element={<All />} />
        <Route path="/pendingorders" element={<Pending />} />
        <Route path="/confirmedorders" element={<Confirmed />} />
        <Route path="/packagingorders" element={<Packaging />} />
        <Route path="/outfordeliveryorders" element={<OutForDelivery />} />
        <Route path="/deliveredorders" element={<Delivered />} />
        <Route path="/returnedorders" element={<Returned />} />
        <Route path="/failedtodeliverorders" element={<FailedToDeliver />} />
        <Route path="/cancelledorders" element={<Cancelled />} /> */}

        {/* Add more protected routes */}
      </Route>

      {/* <Route path="*" element={<NotFound />} /> <==== ADD LATER */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
