import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCarSeo,
  buildCleanPageMetadata,
  formatEngineCapacity,
  formatMileage,
  formatTitleWithSite,
  getDefaultOgImage,
  normalizeCanonicalUrl,
  resolvePublicUrl,
  type CarSeoInput,
} from "../seo.ts";

const REAL_SETTINGS = {
  id: 1,
  name: "DREAM CAR HOUSE",
  logo: "/media/site/dch.jpeg",
  logo_light: "/media/site/dch-removebg-preview_tsHan84.png",
  website: "https://dreamcarhouse.com",
};

// All 12 real cars from clean_data.json (including broken legacy SEO strings to prove repair/cleanup)
const REAL_12_CARS: CarSeoInput[] = [
  {
    id: 1,
    slug: "mercedes-benz-g-580-2025-black",
    name: "Mercedes-Benz G 580",
    brand: "Mercedes-Benz",
    model: "G 580",
    year: 2025,
    body_style: "SUV",
    engine_capacity: "116 kWh",
    fuel_type: "ELECTRIC",
    color: "",
    mileage: "0 km",
    raw_price: "35000000.00",
    price: "Call for Price",
    is_call_for_price: true,
    branch_name: "Kakrail Branch",
    image: "/media/inventory/g580_feature.jpg",
    meta_title: "2025 Mercedes-Benz G 580 116 kWh EQ Technologycc SUV for Sale | Dre",
    meta_description:
      "Discover this 2025 Mercedes-Benz G 580 in  for Sale. 116 kWhcc Electric SUV. 0 kmkm driven. Available at Kakrail Branch on Dream Car House.",
  },
  {
    id: 2,
    slug: "toyota-land-cruiser-250-2024-black-5000km",
    name: "Land Cruiser 250",
    brand: "Toyota",
    model: "Land Cruiser 250",
    year: 2024,
    body_style: "SUV",
    engine_capacity: "2400 cc Turbo Hybrid",
    fuel_type: "HYBRID",
    color: "",
    mileage: "5,000 km",
    raw_price: "28500000.00",
    is_call_for_price: true,
    branch_name: "Gulshan Branch",
    image: "/media/inventory/lc250_feature.jpg",
  },
  {
    id: 3,
    slug: "bmw-x7-2022-blue-8000km",
    name: "BMW X7 xDrive40i M-Sport",
    brand: "BMW",
    model: "X7",
    year: 2022,
    body_style: "SUV",
    engine_capacity: "3000 cc TwinPower Turbo",
    fuel_type: "OCTANE",
    color: "",
    mileage: "8,000 km",
    raw_price: "24000000.00",
    is_call_for_price: true,
    branch_name: "Kakrail Branch",
    image: "/media/inventory/x7_feature.jpg",
  },
  {
    id: 4,
    slug: "lexus-lx-600-2023-white-00km",
    name: "Lexus LX 600 Ultra Luxury",
    brand: "Lexus",
    model: "LX 600",
    year: 2023,
    body_style: "SUV",
    engine_capacity: "3500 cc",
    fuel_type: "OCTANE",
    color: "",
    mileage: "0 km",
    raw_price: "38000000.00",
    is_call_for_price: true,
    branch_name: "Gulshan Branch",
    image: "/media/inventory/lx600_feature.jpg",
  },
  {
    id: 5,
    slug: "mercedes-benz-s-560e-2019-black-11000km",
    name: "Mercedes-Benz S 560e Long Wheelbase",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2019,
    body_style: "Sedan",
    engine_capacity: "3000 cc Plug-in Hybrid",
    fuel_type: "HYBRID",
    color: "",
    mileage: "11,000 km",
    raw_price: "21000000.00",
    is_call_for_price: true,
    branch_name: "Kakrail Branch",
    image: "/media/inventory/s560e_feature.jpg",
  },
  {
    id: 6,
    slug: "nissan-patrol-2013-black-62000km",
    name: "Nissan Patrol Y62 (NISMO Kitted)",
    brand: "Nissan",
    model: "Patrol",
    year: 2013,
    body_style: "SUV",
    engine_capacity: "5600 cc V8 Naturally Aspirated",
    fuel_type: "OCTANE",
    color: "",
    mileage: "62,000 km",
    raw_price: "14500000.00",
    is_call_for_price: true,
    branch_name: "Gulshan Branch",
    image: "/media/inventory/patrol_feature.jpg",
  },
  {
    id: 7,
    slug: "toyota-land-cruiser-vx-v8-2015-black-74000km",
    name: "Land Cruiser VX-V8",
    brand: "Toyota",
    model: "Land Cruiser",
    year: 2015,
    body_style: "SUV",
    engine_capacity: "4600 cc V8 Dual VVT-i",
    fuel_type: "OCTANE",
    color: "",
    mileage: "74,000 km",
    raw_price: "16500000.00",
    is_call_for_price: true,
    branch_name: "Kakrail Branch",
    image: "/media/inventory/vxv8_feature.jpg",
  },
  {
    id: 8,
    slug: "bmw-745le-2019-silver-9000",
    name: "BMW 745Le xDrive Executive Lounge",
    brand: "BMW",
    model: "7 Series",
    year: 2019,
    body_style: "Sedan",
    engine_capacity: "3000 cc Plug-in Hybrid",
    fuel_type: "HYBRID",
    color: "",
    mileage: "9,000 km",
    raw_price: "22500000.00",
    is_call_for_price: true,
    branch_name: "Gulshan Branch",
    image: "/media/inventory/745le_feature.jpg",
  },
  {
    id: 9,
    slug: "volvo-xc-90-2019-white-32000km",
    name: "Volvo XC90 T5 Inscription",
    brand: "Volvo",
    model: "XC 90",
    year: 2019,
    body_style: "SUV",
    engine_capacity: "2000 cc Turbocharged",
    fuel_type: "OCTANE",
    color: "",
    mileage: "32,000 km",
    raw_price: "13500000.00",
    is_call_for_price: true,
    branch_name: "Kakrail Branch",
    image: "/media/inventory/xc90_feature.jpg",
  },
  {
    id: 10,
    slug: "lexus-rx-500h-2023-copper-22000km",
    name: "Lexus RX 500h Turbo F-Sport",
    brand: "Lexus",
    model: "RX 500h",
    year: 2023,
    body_style: "SUV",
    engine_capacity: "2400 cc Turbo Hybrid",
    fuel_type: "HYBRID",
    color: "",
    mileage: "22,000 km",
    raw_price: "23500000.00",
    is_call_for_price: true,
    branch_name: "Gulshan Branch",
    image: "/media/inventory/rx500h_feature.jpg",
  },
  {
    id: 11,
    slug: "toyota-land-cruiser-300-gr-sport-2024",
    name: "Toyota Land Cruiser 300 GR Sport",
    brand: "Toyota",
    model: "Land Cruiser 300",
    year: 2024,
    body_style: "SUV",
    engine_capacity: "3500 cc Twin Turbo V6",
    fuel_type: "OCTANE",
    color: "",
    mileage: "0 km",
    raw_price: "34500000.00",
    is_call_for_price: true,
    branch_name: "Kakrail Branch",
    image: "/media/inventory/lc300_feature.jpg",
  },
  {
    id: 12,
    slug: "porsche-macan-gts-2024-miami-blue",
    name: "Porsche Macan GTS",
    brand: "Porsche",
    model: "MACAN GTS",
    year: 2024,
    body_style: "SUV",
    engine_capacity: "2900 cc",
    fuel_type: "OCTANE",
    color: "",
    mileage: "0 km",
    raw_price: "29500000.00",
    is_call_for_price: true,
    branch_name: "Gulshan Branch",
    image: "/media/inventory/macan_feature.jpg",
  },
];

test("builds clean SEO metadata for all 12 real cars without unit or whitespace bugs", () => {
  const prevBase = process.env.PUBLIC_BASE_URL;
  process.env.PUBLIC_BASE_URL = "https://dreamcarhouse.com";
  try {
    console.log("\n=== GENERATED SEO FOR ALL 12 CARS ===");
    for (const car of REAL_12_CARS) {
      const built = buildCarSeo(car, { settings: REAL_SETTINGS });

      console.log(
        `[${car.id}] ${car.slug}\n  TITLE (${built.title.length}): ${built.title}\n  DESC: ${built.description}`
      );

      assert.ok(
        built.title.length <= 60,
        `Title too long (${built.title.length}) for ${car.slug}: ${built.title}`
      );
      assert.equal(
        built.title.split("DREAM CAR HOUSE").length - 1,
        1,
        `Site name must appear once in title for ${car.slug}: ${built.title}`
      );
      assert.ok(!built.title.includes("  "), `Double space in title: ${built.title}`);
      assert.ok(!/cc\b/i.test(built.title) || /\d+\s*cc\b/i.test(built.title));
      assert.ok(!/kWh\s*cc/i.test(built.title), `Unexpected cc on kWh in ${built.title}`);

      assert.ok(!built.description.includes("  "), `Double space in desc: ${built.description}`);
      assert.ok(!/kmkm/i.test(built.description), `Duplicated km in desc: ${built.description}`);
      assert.ok(!/hybrid\s+hybrid/i.test(built.description), `Repeated Hybrid in desc: ${built.description}`);
      assert.ok(!/\bin\s+for\b/i.test(built.description), `Broken 'in for' in desc: ${built.description}`);
      assert.ok(!/\bin\s+available/i.test(built.description));
      assert.equal(built.ogTitle, built.title);
      assert.equal(built.ogDescription, built.description);
      assert.equal(built.jsonLdDescription, built.description);
      assert.equal(built.canonicalUrl, `https://dreamcarhouse.com/cars/${car.slug}/`);
      assert.equal(built.ogUrl, built.canonicalUrl);
      assert.ok(built.ogImage.startsWith("https://dreamcarhouse.com/"));
      assert.ok(!built.imageAlt.endsWith(" in") && !built.imageAlt.includes(" in -"));
    }
    console.log("=====================================\n");
  } finally {
    if (prevBase === undefined) {
      delete process.env.PUBLIC_BASE_URL;
    } else {
      process.env.PUBLIC_BASE_URL = prevBase;
    }
  }
});

test("unit formatters handle numeric-only cc, kWh, kmkm, and missing optionals", () => {
  assert.equal(formatEngineCapacity("2900"), "2900 cc");
  assert.equal(formatEngineCapacity("116 kWh EQ Technology"), "116 kWh EQ Technology");
  assert.equal(formatEngineCapacity("3000 cc TwinPower Turbo"), "3000 cc TwinPower Turbo");

  assert.equal(formatMileage("0 kmkm"), "0 km");
  assert.equal(formatMileage("5000km"), "5000 km");
  assert.equal(formatMileage("8000"), "8,000 km");
  assert.equal(formatMileage(""), "");

  assert.equal(
    formatTitleWithSite("About Us | DREAM CAR HOUSE | DREAM CAR HOUSE"),
    "About Us | DREAM CAR HOUSE"
  );
  assert.equal(
    formatTitleWithSite("Porsche Macan | Dream"),
    "Porsche Macan | DREAM CAR HOUSE"
  );
});

test("handles empty color, empty branch, non-call price, and default og:image fallback", () => {
  const built = buildCarSeo(
    {
      slug: "test-custom-car",
      name: "Test Vehicle",
      brand: "Lexus",
      model: "RX",
      year: 2024,
      color: "",
      branch_name: "",
      mileage: "",
      price: "25000000",
      is_call_for_price: false,
      image: "",
    },
    { settings: REAL_SETTINGS, baseUrl: "https://dreamcarhouse.com" }
  );

  assert.ok(!built.description.includes(" in "));
  assert.ok(built.description.includes("for BDT 25,000,000."));
  assert.ok(!built.description.includes("Available at"));
  assert.equal(built.ogImage, "https://dreamcarhouse.com/media/site/dch.jpeg");
  assert.equal(
    getDefaultOgImage(REAL_SETTINGS, "https://dreamcarhouse.com"),
    "https://dreamcarhouse.com/media/site/dch.jpeg"
  );
});

test("normalizes canonical URLs and internal media hosts consistently", () => {
  assert.equal(normalizeCanonicalUrl("/"), "https://dreamcarhouse.com/");
  assert.equal(normalizeCanonicalUrl("https://dreamcarhouse.com"), "https://dreamcarhouse.com/");
  assert.equal(
    normalizeCanonicalUrl("https://www.dreamcarhouse.com/cars/brand-new"),
    "https://dreamcarhouse.com/cars/brand-new/"
  );
  assert.equal(
    resolvePublicUrl("http://backend:8000/media/site/dch.jpeg", "https://dreamcarhouse.com"),
    "https://dreamcarhouse.com/media/site/dch.jpeg"
  );

  const meta = buildCleanPageMetadata({
    title: "Luxury Cars Inventory | DREAM CAR HOUSE",
    description: "Browse curated inventory.",
    path: "/cars",
    settings: REAL_SETTINGS,
  });
  assert.equal(meta.title, "Luxury Cars Inventory | DREAM CAR HOUSE");
  assert.equal(meta.alternates?.canonical, "https://dreamcarhouse.com/cars/");
  assert.equal(meta.openGraph?.url, "https://dreamcarhouse.com/cars/");
});
