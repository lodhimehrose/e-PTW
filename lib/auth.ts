export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.toLowerCase() ?? "";
}

export function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  return email.toLowerCase() === getAdminEmail();
}
