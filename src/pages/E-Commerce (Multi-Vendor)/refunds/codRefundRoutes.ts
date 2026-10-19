// pages/admin/refunds/codRefundRoutes.ts
// Adjust these paths to match your router.
export const COD_ROUTES = {
  list: "/admin/cod-refunds",
  form: "/admin/cod-refunds/new",
  accounts: "/admin/refund-bank-accounts",
  ledger: (id: number | string) => `/admin/refund-bank-accounts/${id}/ledger`,
};