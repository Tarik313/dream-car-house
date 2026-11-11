// Formats a number as "BDT 1,45,00,000" using the South Asian lakh/crore
// digit grouping (same convention as CarsClient.tsx / CarDetailClient.tsx).
export function formatBDT(amount: number): string {
  if (!Number.isFinite(amount)) return "BDT —";
  const numStr = Math.round(amount).toString();
  const lastThree = numStr.slice(-3);
  const otherNumbers = numStr.slice(0, -3);
  const formattedInteger = otherNumbers
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
  return `BDT ${formattedInteger}`;
}

export function parseVehiclePriceNumber(
  price?: string | number | null,
  isCallForPrice?: boolean
): number | null {
  if (isCallForPrice || price === null || price === undefined) return null;
  if (typeof price === "number") {
    return Number.isFinite(price) && price > 0 ? price : null;
  }
  const s = String(price).trim();
  const lower = s.toLowerCase();
  if (
    !s ||
    lower.includes("call") ||
    lower.includes("upon request") ||
    lower === "sold" ||
    lower === "pre-order" ||
    s === "0"
  ) {
    return null;
  }
  const clean = s.replace(/[^0-9.]/g, "");
  const val = parseFloat(clean);
  return Number.isFinite(val) && val > 0 ? val : null;
}

export function formatVehiclePrice(
  price?: string | number | null,
  isCallForPrice?: boolean,
  callForPriceLabel = "Call for Price"
): string {
  if (isCallForPrice || price === null || price === undefined) {
    return callForPriceLabel;
  }
  const s = String(price).trim();
  const lower = s.toLowerCase();
  if (!s || lower.includes("call") || lower.includes("upon request") || s === "0") {
    return callForPriceLabel;
  }
  if (lower === "sold") return "Sold";
  if (lower === "pre-order") return "Pre-Order";

  const num = parseVehiclePriceNumber(price, isCallForPrice);
  if (num !== null) {
    return formatBDT(num);
  }
  return s.toUpperCase().startsWith("BDT") ? s : `BDT ${s}`;
}
