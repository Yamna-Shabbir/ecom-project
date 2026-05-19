/** Format amounts in Pakistani Rupees (PKR). */
export function formatPKR(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "Rs. 0";
  const rounded = Math.round(n);
  return `Rs. ${rounded.toLocaleString("en-PK")}`;
}

export const CURRENCY_LABEL = "PKR";
