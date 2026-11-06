// ================= DREAM CAR HOUSE - Showroom Branches Directory =================
// Authentic branch information from official dreamcarhouse.com
const SHOWROOM_BRANCHES = {
  "kakrail": {
    id: "kakrail",
    name: "Kakrail Branch & Showroom",
    short_name: "Kakrail Branch",
    tag: "Main Flagship Showroom",
    address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
    phone: "01615-121312",
    hotline: "+880 1615-121312",
    email: "dreamcarhouse101@gmail.com",
    hours: "Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)",
    map_link: "https://maps.google.com/?q=18+Shaheed+Captain+Mansur+Ali+Soroni+Kakrail+Dhaka",
    embed_map: "https://maps.google.com/maps?width=600&height=400&hl=en&q=18%20Shaheed%20Captain%20Mansur%20Ali%20Soroni%20Kakrail%20Dhaka&t=&z=15&ie=UTF8&iwloc=B&output=embed"
  },
  "gulshan": {
    id: "gulshan",
    name: "Gulshan Branch & Showroom",
    short_name: "Gulshan Branch",
    tag: "Gulshan Avenue Showroom",
    address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
    phone: "01615-121312",
    hotline: "+880 1615-121312",
    email: "dreamcarhouse101@gmail.com",
    hours: "Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)",
    map_link: "https://maps.google.com/?q=House+07+Road+127+Gulshan+Avenue+Dhaka",
    embed_map: "https://maps.google.com/maps?width=600&height=400&hl=en&q=House%2007%20Road%20127%20Gulshan%20Avenue%20Dhaka&t=&z=15&ie=UTF8&iwloc=B&output=embed"
  }
};

function getCarBranch(car) {
  if (!car) return SHOWROOM_BRANCHES["kakrail"];
  if (car.branch_id && SHOWROOM_BRANCHES[car.branch_id]) {
    return SHOWROOM_BRANCHES[car.branch_id];
  }
  return SHOWROOM_BRANCHES["kakrail"];
}

// ================= DREAM CAR HOUSE - Authentic Luxury Vehicle Inventory =================
const VEHICLE_DATA = [
  {
    id: 1,
    name: "Mercedes-Benz G 580",
    brand: "Mercedes-Benz",
    model: "G 580",
    year: 2025,
    car_type: "BRAND_NEW",
    fuel_type: "Electric",
    engine_capacity: "116 kWh EQ Technology",
    mileage: "Brand New (00 km)",
    price: "Call for Price",
    registered: "Available",
    branch_id: "kakrail",
    branch_name: "Kakrail Branch & Showroom",
    branch_address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
    image: "https://www.begautos.com/media/temp/298_CAR_WEB-2026-10-04-11-15-48_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/298_CAR_WEB-2026-10-04-11-15-48_optimized.webp", caption: "Front 3/4 Exterior Stance", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Cockpit & MBUX Panoramic Displays", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Handcrafted Luxury Nappa Leather Cabin", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "AMG Multi-Spoke Forged Alloys & Calipers", tag: "WHEELS" },
      { url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85", caption: "Rear Vault Silhouette & Spare Wheel Carrier", tag: "REAR" }
    ],
    description: "Brand new Mercedes-Benz G 580 with EQ Technology. Unparalleled electric torque with four individual motors, iconic G-Class off-road boxy silhouette, and bespoke atelier luxury interior.",
    slug: "mercedes-benz-g-580-2025-black"
  },
  {
    id: 2,
    name: "Land Cruiser 250",
    brand: "Toyota",
    model: "Land Cruiser 250",
    year: 2024,
    car_type: "PRE_OWNED",
    fuel_type: "Hybrid",
    engine_capacity: "2400 cc Turbo Hybrid",
    mileage: "5,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "gulshan",
    branch_name: "Gulshan Branch & Showroom",
    branch_address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
    image: "https://www.begautos.com/media/temp/304_CAR_WEB-2026-10-06-15-28-59_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/304_CAR_WEB-2026-10-06-15-28-59_optimized.webp", caption: "Exterior Front 3/4 Iconic Square Headlamps", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Full-Time 4WD Stance & Rigid Chassis", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Digital Cockpit & Terrain Select Console", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Executive Leather Seating & Sunroof", tag: "INTERIOR" }
    ],
    description: "Toyota Land Cruiser 250 2024. Next-generation luxury 4WD with modern off-road engineering, retro-modern aesthetic, and premium cabin refinement.",
    slug: "toyota-land-cruiser-250-2024-black-5000km"
  },
  {
    id: 3,
    name: "BMW X7 xDrive40i M-Sport",
    brand: "BMW",
    model: "X7",
    year: 2022,
    car_type: "PRE_OWNED",
    fuel_type: "Octane",
    engine_capacity: "3000 cc TwinPower Turbo",
    mileage: "8,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "kakrail",
    branch_name: "Kakrail Branch & Showroom",
    branch_address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
    image: "https://www.begautos.com/media/temp/257_78-2026-07-07-19-33-44_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/257_78-2026-07-07-19-33-44_optimized.webp", caption: "Tanzanite Blue M-Sport Front Facia", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "BMW Curved Display & Live Cockpit Pro", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Sky Lounge Panoramic Glass Roof & Ambient Light", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", caption: "Rear Aerodynamic M Diffuser & Dual Exhaust", tag: "REAR" }
    ],
    description: "BMW X7 xDrive40i M-Sport in Tanzanite Blue. 7-seater executive luxury, Sky Lounge panoramic roof, Harman Kardon surround audio, and two-axle air suspension.",
    slug: "bmw-x7-2022-blue-8000km"
  },
  {
    id: 4,
    name: "Lexus LX 600 Ultra Luxury",
    brand: "Lexus",
    model: "LX 600",
    year: 2023,
    car_type: "BRAND_NEW",
    fuel_type: "Octane",
    engine_capacity: "3500 cc Twin Turbo V6",
    mileage: "Brand New (00 km)",
    price: "Call for Price",
    registered: "Available",
    branch_id: "gulshan",
    branch_name: "Gulshan Branch & Showroom",
    branch_address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
    image: "https://www.begautos.com/media/temp/31_DSC_3754-2026-02-18-12-48-57_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/31_DSC_3754-2026-02-18-12-48-57_optimized.webp", caption: "Pearl White Spindle Grille & Triple-Beam LED", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Dual Screen Cockpit with Mark Levinson 25-Speaker Audio", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Independent Rear VIP Ottoman Reclining Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Rear Lightbar & Active Height Control Suspension", tag: "REAR" }
    ],
    description: "Lexus LX 600 Ultra Luxury in Pearl White. The pinnacle of Japanese craftsmanship with independent rear ottoman reclining seats, hydraulic height control, and Mark Levinson sound.",
    slug: "lexus-lx-600-2023-white-00km"
  },
  {
    id: 5,
    name: "Mercedes-Benz S 560e Long Wheelbase",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2019,
    car_type: "PRE_OWNED",
    fuel_type: "Hybrid",
    engine_capacity: "3000 cc Plug-in Hybrid",
    mileage: "11,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "kakrail",
    branch_name: "Kakrail Branch & Showroom",
    branch_address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
    image: "https://www.begautos.com/media/temp/91_20-2026-07-06-12-49-04_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/91_20-2026-07-06-12-49-04_optimized.webp", caption: "Obsidian Black Executive Stance & Multibeam LED", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Widescreen Digital Cockpit & Artisan Steering Wheel", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "First-Class Rear Lounge with Hot-Stone Massage Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85", caption: "Long Wheelbase Profile & Chrome Exterior Accents", tag: "PROFILE" }
    ],
    description: "Mercedes-Benz S 560e Long Wheelbase. Masterclass executive sedan with hot-stone massage seats, Burmester surround sound, and serene plug-in hybrid electric drive.",
    slug: "mercedes-benz-s-560e-2019-black-11000km"
  },
  {
    id: 6,
    name: "Nissan Patrol Y62 (NISMO Kitted)",
    brand: "Nissan",
    model: "Patrol",
    year: 2013,
    car_type: "PRE_OWNED",
    fuel_type: "Octane",
    engine_capacity: "5600 cc V8 Naturally Aspirated",
    mileage: "62,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "gulshan",
    branch_name: "Gulshan Branch & Showroom",
    branch_address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
    image: "https://www.begautos.com/media/temp/252_CAR_WEB-2026-06-27-16-20-48_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/252_CAR_WEB-2026-06-27-16-20-48_optimized.webp", caption: "Full NISMO Aerodynamic Front Fascia & Red Pinstripe", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Aggressive V8 SUV Road Presence & Side Skirts", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Hydraulic Body Motion Control & Wood-Trim Cockpit", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Bose 13-Speaker Acoustic Cabin & Premium Leather", tag: "INTERIOR" }
    ],
    description: "Nissan Patrol Y62 with full authentic NISMO aero bodykit. 5.6L naturally aspirated V8 powerhouse, Hydraulic Body Motion Control (HBMC), and legendary prestige.",
    slug: "nissan-patrol-2013-black-62000km"
  },
  {
    id: 7,
    name: "Land Cruiser VX-V8",
    brand: "Toyota",
    model: "Land Cruiser",
    year: 2015,
    car_type: "PRE_OWNED",
    fuel_type: "Octane",
    engine_capacity: "4600 cc V8 Dual VVT-i",
    mileage: "74,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "kakrail",
    branch_name: "Kakrail Branch & Showroom",
    branch_address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
    image: "https://www.begautos.com/media/temp/179_CAR_WEB-2026-09-07-12-19-31_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/179_CAR_WEB-2026-09-07-12-19-31_optimized.webp", caption: "Timeless 200-Series V8 Front Grille & Fog Lamps", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Iconic Heavy-Duty Luxury SUV Stance", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Toyota Multi-Terrain Select & Crawl Control Console", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "7-Seater Leather Interior with Coolbox", tag: "INTERIOR" }
    ],
    description: "Toyota Land Cruiser VX V8 in Black. Impeccable condition, authentic service records, crawl control, and timeless prestige on Bangladesh roads.",
    slug: "toyota-land-cruiser-vx-v8-2015-black-74000km"
  },
  {
    id: 8,
    name: "BMW 745Le xDrive Executive Lounge",
    brand: "BMW",
    model: "7 Series",
    year: 2019,
    car_type: "PRE_OWNED",
    fuel_type: "Hybrid",
    engine_capacity: "3000 cc Plug-in Hybrid",
    mileage: "9,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "gulshan",
    branch_name: "Gulshan Branch & Showroom",
    branch_address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
    image: "https://www.begautos.com/media/temp/291_CAR_WEB-2026-09-23-13-44-24_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/291_CAR_WEB-2026-09-23-13-44-24_optimized.webp", caption: "Glacier Silver Metallic Finish with BMW Laserlight", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "BMW Gesture Control & Live Cockpit Professional", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Executive Lounge Rear Seating with Touch Command Tablet", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85", caption: "Sleek 3D LED Rear Lightbar & Dual Chrome Tailpipes", tag: "REAR" }
    ],
    description: "BMW 745Le plug-in hybrid in Silver. Executive lounge seating, Bowers & Wilkins Diamond surround sound, BMW laser headlights, and carbon core chassis.",
    slug: "bmw-745le-2019-silver-9000"
  },
  {
    id: 9,
    name: "Volvo XC90 T5 Inscription",
    brand: "Volvo",
    model: "XC 90",
    year: 2019,
    car_type: "PRE_OWNED",
    fuel_type: "Octane",
    engine_capacity: "2000 cc Turbocharged",
    mileage: "32,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "kakrail",
    branch_name: "Kakrail Branch & Showroom",
    branch_address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
    image: "https://www.begautos.com/media/temp/184_DSC_5513-2026-03-04-12-32-46_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/184_DSC_5513-2026-03-04-12-32-46_optimized.webp", caption: "Crystal White Inscription with Thor's Hammer LED", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Orrefors Crystal Gearshift & CleanZone Sensus Touchscreen", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Bowers & Wilkins High-Fidelity Audio & 7 Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", caption: "Scandinavian Tailgate & Dual Inscription Pipes", tag: "REAR" }
    ],
    description: "Volvo XC90 T5 Inscription in White. Scandinavian luxury, 7-passenger capability, genuine Orrefors Swedish crystal gearshift, and world-class safety engineering.",
    slug: "volvo-xc-90-2019-white-32000km"
  },
  {
    id: 10,
    name: "Lexus RX 500h Turbo F-Sport",
    brand: "Lexus",
    model: "RX 500h",
    year: 2023,
    car_type: "PRE_OWNED",
    fuel_type: "Hybrid",
    engine_capacity: "2400 cc Turbo Hybrid",
    mileage: "22,000 km",
    price: "Call for Price",
    registered: "Available",
    branch_id: "gulshan",
    branch_name: "Gulshan Branch & Showroom",
    branch_address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
    image: "https://www.begautos.com/media/temp/225_DSC_3912-2026-06-13-14-12-29_optimized.webp",
    images: [
      { url: "https://www.begautos.com/media/temp/225_DSC_3912-2026-06-13-14-12-29_optimized.webp", caption: "Copper Crest F-Sport Mesh Grille & Aerodynamic Lips", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Tazuna Concept Cockpit & Head-Up Display", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Sport Bolstered Dark Rose Leather Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "21-inch Matte Black F-Sport Wheels & 6-Piston Brakes", tag: "WHEELS" }
    ],
    description: "Lexus RX 500h Turbo F-Sport Performance in Copper Crest. Dynamic rear wheel steering, DIRECT4 all-wheel drive, and Mark Levinson premium sound.",
    slug: "lexus-rx-500h-2023-copper-22000km"
  },
  {
    id: 11,
    name: "Toyota Land Cruiser 300 GR Sport",
    brand: "Toyota",
    model: "Land Cruiser 300",
    year: 2024,
    car_type: "BRAND_NEW",
    fuel_type: "Octane",
    engine_capacity: "3500 cc Twin Turbo V6",
    mileage: "Brand New (00 km)",
    price: "Call for Price",
    registered: "Available",
    branch_id: "kakrail",
    branch_name: "Kakrail Branch & Showroom",
    branch_address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2560&q=95",
    images: [
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2560&q=95", caption: "Gazoo Racing Heritage Front Stance in Pearl White", tag: "EXTERIOR" },
      { url: "https://www.begautos.com/media/temp/304_CAR_WEB-2026-10-06-15-28-59_optimized.webp", caption: "E-KDSS Electronic Kinetic Dynamic Suspension Stance", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "GR Sport Driver Cockpit with Fingerprint Authentication", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Black & Dark Red Bi-Tone Leather Seating Suite", tag: "INTERIOR" }
    ],
    description: "Toyota Land Cruiser 300 GR Sport in Pearl White. Gazoo Racing electronic kinetic dynamic suspension (E-KDSS), front and rear differential locks, and flagship luxury performance.",
    slug: "toyota-land-cruiser-300-gr-sport-2024"
  },
  {
    id: 12,
    name: "Porsche Macan GTS",
    brand: "Porsche",
    model: "Macan GTS",
    year: 2024,
    car_type: "BRAND_NEW",
    fuel_type: "Octane",
    engine_capacity: "2900 cc Twin Turbo V6",
    mileage: "Brand New (00 km)",
    price: "Call for Price",
    registered: "Available",
    branch_id: "gulshan",
    branch_name: "Gulshan Branch & Showroom",
    branch_address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2560&q=95",
    images: [
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2560&q=95", caption: "Miami Blue GTS Front Stance & Tinted LED Headlights", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2560&q=95", caption: "Low-Slung Track Profile & GTS Sport Air Suspension", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Porsche Sport Chrono Dial & Alcantara Steering Wheel", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "21-inch RS Spyder Design Satin Black Wheels", tag: "WHEELS" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "GTS Carmine Red Contrast-Stitched Interior Package", tag: "INTERIOR" }
    ],
    description: "Porsche Macan GTS in Miami Blue. 434 hp twin-turbo V6, 7-speed PDK transmission, Sport Chrono package, GTS sport air suspension, and handcrafted interior.",
    slug: "porsche-macan-gts-2024-miami-blue"
  }
];

// ================= DREAM CAR HOUSE - Corporate Identity & Official Hotline =================
// Verified from live official website: dreamcarhouse.com
const SHOWROOM = {
  name: "DREAM CAR HOUSE",
  hotline: "01615-121312",
  phone: "+880 1615-121312",
  whatsapp: "+8801615121312",
  email: "dreamcarhouse101@gmail.com",
  website: "https://dreamcarhouse.com",
  address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka - 1000",
  branches: [
    {
      id: "kakrail",
      name: "Kakrail Branch (Main)",
      address: "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
      phone: "01615-121312"
    },
    {
      id: "gulshan",
      name: "Gulshan Branch",
      address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
      phone: "01615-121312"
    }
  ]
};
