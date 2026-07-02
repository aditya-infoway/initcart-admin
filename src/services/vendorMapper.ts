export const mapFormValuesToBackend = (values: any) => {
  const fd = new FormData();

  fd.append("business_name", values.businessName);
  fd.append("owner_name", values.ownerName);
  fd.append("gst_no", values.gstNo || "");
  fd.append("pan_no", values.panNo || "");
  fd.append("email", values.email);
  fd.append("phone", values.mobile);
  fd.append("address", values.businessAddress || "");

  // bank fields: account_number & ifsc_code expected by backend
  fd.append("bank_name", values.bankName || "");
  fd.append("account_number", values.bankAccountNo || values.bankAccountNo || "");
  fd.append("ifsc_code", values.ifsc || "");
  fd.append("upi_id", values.upiId || "");

  // payment preference (if backend expects different key adjust)
  fd.append("payment_settlement_preference", values.paymentSettlementPreference || "");

  // status mapping: frontend uses "Active"/"Inactive"/"Pending Verification"
  const statusMap: Record<string, string> = {
    "Active": "active",
    "Inactive": "inactive",
    "Pending Verification": "pending",
  };
  fd.append("status", statusMap[values.status] || (values.status || "pending").toLowerCase());

  // files (backend field names)
  if (values.businessRegistrationImage) fd.append("licence_file", values.businessRegistrationImage);
  if (values.gstCertificate) fd.append("gst_certificate", values.gstCertificate);
  if (values.panCard) fd.append("id_proof", values.panCard);
  if (values.identityProof) fd.append("id_proof", values.identityProof); // same field if you used panCard/identityProof
  if (values.cancelledCheque) fd.append("cancelled_cheque", values.cancelledCheque); // if model supports
  if (values.logo) fd.append("logo", values.logo);
  if (values.banner) fd.append("banner", values.banner);

  return fd;
};
