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

/**
 * Formats a mileage value cleanly into compact notation matching Beg Autos standard:
 * e.g. 17000 or "17,000 km" -> "17k"
 * e.g. 0 or "0 km" -> "0 km"
 * e.g. "16000km" -> "16k"
 * e.g. "17k" -> "17k"
 */
export function formatCompactMileage(
  mileage?: string | number | null,
  isBrandNew?: boolean
): string {
  if (mileage === null || mileage === undefined) {
    return isBrandNew ? "0 km" : "—";
  }
  const str = String(mileage).trim();
  if (!str) {
    return isBrandNew ? "0 km" : "—";
  }
  if (/^\d+(\.\d+)?\s*k(\s*km)?$/i.test(str)) {
    const numPart = str.match(/\d+(\.\d+)?/)?.[0] || "";
    return `${numPart}k`;
  }
  const digits = str.replace(/,/g, "").match(/\d+/)?.[0];
  if (digits) {
    const num = parseInt(digits, 10);
    if (num === 0) return "0 km";
    if (num >= 1000) {
      const k = num / 1000;
      return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return `${num} km`;
  }
  return str;
}

/**
 * Formats an engine displacement cleanly:
 * e.g. "3000 cc" -> "3,000 cc"
 * e.g. "116 kWh" -> "116 kWh"
 */
export function formatEngineDisplay(
  engine?: string | null,
  isElectric?: boolean
): string {
  if (!engine || !engine.trim()) {
    return isElectric ? "Electric" : "—";
  }
  const str = engine.trim();
  const ccMatch = str.match(/^(\d{4,})\s*cc$/i);
  if (ccMatch) {
    const num = parseInt(ccMatch[1], 10);
    return `${num.toLocaleString()} cc`;
  }
  return str.replace(/\b(\d{4,})\s*cc\b/gi, (_, n) => `${parseInt(n, 10).toLocaleString()} cc`);
}

/**
 * Formats fuel type cleanly into Title Case:
 * e.g. "OCTANE" -> "Octane"
 * e.g. "PETROL" -> "Petrol"
 * e.g. "HYBRID" -> "Hybrid"
 */
export function formatFuelDisplay(fuel?: string | null): string {
  if (!fuel || !fuel.trim()) return "Octane";
  const str = fuel.trim();
  const map: Record<string, string> = {
    OCTANE: "Octane",
    PETROL: "Petrol",
    HYBRID: "Hybrid",
    ELECTRIC: "Electric",
    DIESEL: "Diesel",
    CNG: "CNG",
    LPG: "LPG",
    "OCTANE+HYBRID": "Octane Hybrid",
    "PETROL+HYBRID": "Petrol Hybrid",
    "DIESEL+HYBRID": "Diesel Hybrid",
    "OCTANE+PLUG-IN HYBRID": "Octane Plug-in Hybrid",
    "PETROL+PLUG-IN HYBRID": "Petrol Plug-in Hybrid",
  };
  const upper = str.toUpperCase();
  if (map[upper]) return map[upper];
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
