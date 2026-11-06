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
