import { FilterData } from "@/app/cars/_components/types";

const EMPTY_FILTERS: FilterData = {
  brands: [],
  models: [],
  bodyStyles: [],
  byd_models: [],
  colors: [],
  byd_colors: [],
  byd_body_styles: [],
};

export async function fetchInventoryFilters(): Promise<FilterData> {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) return EMPTY_FILTERS;

  try {
    const res = await fetch(`${base}/api/v1/inventory/filters/`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) return EMPTY_FILTERS;

    const json = await res.json();
    const data = json?.success ? json.data : (json?.data ?? json ?? {});

    return {
      brands: Array.isArray(data.brands) ? data.brands : [],
      models: Array.isArray(data.models) ? data.models : [],
      bodyStyles: Array.isArray(data.bodyStyles) ? data.bodyStyles : [],
      byd_models: Array.isArray(data.byd_models) ? data.byd_models : [],
      colors: Array.isArray(data.colors) ? data.colors : [],
      byd_colors: Array.isArray(data.byd_colors) ? data.byd_colors : [],
      byd_body_styles: Array.isArray(data.byd_body_styles) ? data.byd_body_styles : [],
    };
  } catch {
    return EMPTY_FILTERS;
  }
}

export async function fetchInventoryFiltersByBrand(
  brand: string
): Promise<FilterData> {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) return EMPTY_FILTERS;

  try {
    const url = new URL(`${base}/api/v1/inventory/filters/`);
    url.searchParams.set('brand', brand);

    const res = await fetch(url.toString(), {
      next: { revalidate: 0 },
    });

    if (!res.ok) return EMPTY_FILTERS;

    const json = await res.json();
    const data = json?.success ? json.data : (json?.data ?? json ?? {});

    return {
      brands: Array.isArray(data.brands) ? data.brands : [],
      models: Array.isArray(data.models) ? data.models : [],
      bodyStyles: Array.isArray(data.bodyStyles) ? data.bodyStyles : [],
      byd_models: Array.isArray(data.byd_models) ? data.byd_models : [],
      colors: Array.isArray(data.colors) ? data.colors : [],
      byd_colors: Array.isArray(data.byd_colors) ? data.byd_colors : [],
      byd_body_styles: Array.isArray(data.byd_body_styles) ? data.byd_body_styles : [],
    };
  } catch {
    return EMPTY_FILTERS;
  }
}