export function maskEmiratesId(eid: string) {
  const parts = eid.split("-");
  if (parts.length >= 4) {
    return `784-****-*******-${parts[3]?.slice(-1) ?? "*"}`;
  }
  return "784-****-*******-*";
}

export function isEidExpired(expiry: string) {
  return new Date(expiry) < new Date();
}
