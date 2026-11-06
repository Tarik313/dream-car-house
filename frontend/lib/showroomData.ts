// Dream Car House - Authentic Showroom & Vehicle Data
// Fully typed local data module for build-time static export

export interface ShowroomBranch {
  id: string;
  name: string;
  short_name: string;
  tag: string;
  address: string;
  phone: string;
  hotline: string;
  email: string;
  hours: string;
  map_link: string;
  embed_map: string;
}

export const SHOWROOM_BRANCHES: Record<string, ShowroomBranch> = {
  kakrail: {
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
    embed_map:
      "https://maps.google.com/maps?width=600&height=400&hl=en&q=18%20Shaheed%20Captain%20Mansur%20Ali%20Soroni%20Kakrail%20Dhaka&t=&z=15&ie=UTF8&iwloc=B&output=embed",
  },
  gulshan: {
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
    embed_map:
      "https://maps.google.com/maps?width=600&height=400&hl=en&q=House%2007%20Road%20127%20Gulshan%20Avenue%20Dhaka&t=&z=15&ie=UTF8&iwloc=B&output=embed",
  },
};

export const SHOWROOM = {
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
      phone: "01615-121312",
    },
    {
      id: "gulshan",
      name: "Gulshan Branch",
      address: "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
      phone: "01615-121312",
    },
  ],
};

export interface VehicleImage {
  url: string;
  caption: string;
  tag?: string;
}

export interface Vehicle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  car_type: "BRAND_NEW" | "PRE_OWNED";
  fuel_type: string;
  engine_capacity: string;
  mileage: string;
  price: string;
  raw_price?: string | null;
  is_call_for_price?: boolean;
  registered: string;
  branch_id: string;
  branch_name: string;
  branch_address: string;
  branch?: {
    id?: number;
    branch_id?: string;
    name?: string;
    short_name?: string;
    tag?: string;
    address?: string;
    phone?: string;
    hotline?: string;
    email?: string;
    hours?: string;
    map_link?: string;
    embed_map?: string;
  } | null;
  image: string;
  images: VehicleImage[];
  description: string;
  slug: string;
  drivetrain?: string;
  registration_number?: string;
  is_featured?: boolean;
  transmission?: string;
  color?: string;
  wheel_base?: string;
  condition?: string;
  body_style?: string;
  youtube?: string;
  slightly_negotiable?: string;
  h1_title?: string;
  target_keyword?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  featured_image_alt?: string;
  indexing?: string;
  schema_data?: Record<string, unknown>;
  previous_slug?: string;
  status?: string;
}

export const VEHICLE_DATA: Vehicle[] = [
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
    image: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1600&q=85", caption: "Obsidian Black Front 3/4 Stance & Illuminated Grille", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85", caption: "Iconic Boxy Aerodynamic Profile & EQ Emblems", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Cockpit & MBUX Panoramic Displays", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Handcrafted Luxury Nappa Leather Cabin", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "AMG Multi-Spoke Forged Alloys & Calipers", tag: "WHEELS" },
      { url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85", caption: "Rear Vault Silhouette & Spare Wheel Carrier", tag: "REAR" },
    ],
    description: "Brand new Mercedes-Benz G 580 with EQ Technology. Unparalleled electric torque with four individual motors, iconic G-Class off-road boxy silhouette, and bespoke handcrafted luxury interior.",
    slug: "mercedes-benz-g-580-2025-black",
    drivetrain: "4-Motor Electric AWD with Torque Vectoring",
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
    image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1600&q=85", caption: "Front 3/4 Heritage Grille with Rigid LED Headlamps", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85", caption: "Full-Time 4WD Stance & Rigid Off-Road Chassis", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", caption: "Digital Cockpit & Terrain Select Console", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Executive Leather Seating & Panoramic Sunroof", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Sculpted Rear Tailgate & Integrated Hitch", tag: "REAR" },
    ],
    description: "Toyota Land Cruiser 250 2024. Next-generation luxury 4WD with modern off-road engineering, retro-modern aesthetic, and premium cabin refinement.",
    slug: "toyota-land-cruiser-250-2024-black-5000km",
    drivetrain: "Full-Time 4WD with Torsen Center Differential",
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
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85", caption: "Tanzanite Blue M-Sport Front Facia & Illuminated Grille", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85", caption: "Executive 3-Row 7-Seater Grand Touring Profile", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "BMW Curved Display & Live Cockpit Pro", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Sky Lounge Panoramic Glass Roof & Ambient Light", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", caption: "Rear Aerodynamic M Diffuser & Quad Exhaust", tag: "REAR" },
    ],
    description: "BMW X7 xDrive40i M-Sport in Tanzanite Blue. 7-seater executive luxury, Sky Lounge panoramic roof, Harman Kardon surround audio, and two-axle air suspension.",
    slug: "bmw-x7-2022-blue-8000km",
    drivetrain: "xDrive Intelligent All-Wheel Drive",
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
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Pearl White Spindle Grille & Triple-Beam LED Headlights", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", caption: "Flagship Luxury Ultra-High Presence Stance", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", caption: "Dual Screen Cockpit with Mark Levinson 25-Speaker Audio", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Independent Rear VIP Ottoman 48-Degree Reclining Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85", caption: "Rear Full-Width LED Blade Lightbar & AHC Suspension", tag: "REAR" },
    ],
    description: "Lexus LX 600 Ultra Luxury in Pearl White. The pinnacle of Japanese craftsmanship with independent rear ottoman reclining seats, hydraulic height control, and Mark Levinson sound.",
    slug: "lexus-lx-600-2023-white-00km",
    drivetrain: "Full-Time 4WD with Multi-Terrain Select & AHC",
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
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "Obsidian Black Executive Stance & Multibeam LED Grille", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", caption: "Long Wheelbase Profile & Chrome Executive Trim", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Widescreen Digital Cockpit & Handcrafted Steering Wheel", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "First-Class Rear Lounge with Hot-Stone Massage Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", caption: "Starlight Crystal Taillamps & Integrated Dual Exhaust", tag: "REAR" },
    ],
    description: "Mercedes-Benz S 560e Long Wheelbase. Masterclass executive sedan with hot-stone massage seats, Burmester surround sound, and serene plug-in hybrid electric drive.",
    slug: "mercedes-benz-s-560e-2019-black-11000km",
    drivetrain: "Rear-Wheel Drive with AIRMATIC Air Suspension",
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
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85", caption: "Full NISMO Aerodynamic Front Fascia & Red Pinstripe", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Aggressive V8 SUV Road Presence & Side Aerodynamics", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", caption: "Hydraulic Body Motion Control & Wood-Trim Cockpit", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Bose 13-Speaker Acoustic Cabin & Premium Leather", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85", caption: "NISMO Sport Rear Diffuser & Quad Exhaust Tips", tag: "REAR" },
    ],
    description: "Nissan Patrol Y62 with full authentic NISMO aero bodykit. 5.6L naturally aspirated V8 powerhouse, Hydraulic Body Motion Control (HBMC), and legendary prestige.",
    slug: "nissan-patrol-2013-black-62000km",
    drivetrain: "All-Mode 4x4 with Hydraulic Body Motion Control",
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
    image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1600&q=85", caption: "Timeless 200-Series V8 Front Grille & Fog Lamps", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85", caption: "Iconic Heavy-Duty Luxury SUV Stance & High Profile", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", caption: "Toyota Multi-Terrain Select & Crawl Control Console", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "7-Seater Premium Leather Interior with Center Coolbox", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Split-Fold Power Tailgate & Signature Badging", tag: "REAR" },
    ],
    description: "Toyota Land Cruiser VX V8 in Black. Impeccable condition, authentic service records, crawl control, and timeless prestige on Bangladesh roads.",
    slug: "toyota-land-cruiser-vx-v8-2015-black-74000km",
    drivetrain: "Full-Time 4WD with Kinetic Dynamic Suspension (KDSS)",
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
    image: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85", caption: "Glacier Silver Metallic Finish with BMW Laserlight", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", caption: "Carbon Core Architecture & Long Executive Silhouette", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "BMW Gesture Control & Live Cockpit Professional", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Executive Lounge Rear Seating with Touch Command Tablet", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", caption: "Sleek 3D LED Rear Lightbar & Dual Chrome Tailpipes", tag: "REAR" },
    ],
    description: "BMW 745Le plug-in hybrid in Silver. Executive lounge seating, Bowers & Wilkins Diamond surround sound, BMW laser headlights, and carbon core chassis.",
    slug: "bmw-745le-2019-silver-9000",
    drivetrain: "xDrive Intelligent All-Wheel Drive with 2-Axle Air Suspension",
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
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", caption: "Crystal White Inscription with Thor's Hammer LED", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", caption: "Scandinavian Minimalist Silhouette & Satin Chrome Accents", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=85", caption: "Orrefors Crystal Gearshift & CleanZone Sensus Touchscreen", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Bowers & Wilkins High-Fidelity Audio & 7 Ergonomic Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", caption: "Scandinavian Tailgate & Dual Inscription Pipes", tag: "REAR" },
    ],
    description: "Volvo XC90 T5 Inscription in White. Scandinavian luxury, 7-passenger capability, genuine Orrefors Swedish crystal gearshift, and world-class safety engineering.",
    slug: "volvo-xc-90-2019-white-32000km",
    drivetrain: "All-Wheel Drive with Instant Traction",
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
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "Copper Crest F-Sport Mesh Grille & Aerodynamic Lips", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85", caption: "Dynamic Coupe-SUV Profile with DIRECT4 Badge", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Tazuna Concept Cockpit & Head-Up Display", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "Sport Bolstered Dark Rose Leather Seats", tag: "INTERIOR" },
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "21-inch Matte Black F-Sport Wheels & 6-Piston Brakes", tag: "WHEELS" },
    ],
    description: "Lexus RX 500h Turbo F-Sport Performance in Copper Crest. Dynamic rear wheel steering, DIRECT4 all-wheel drive, and Mark Levinson premium sound.",
    slug: "lexus-rx-500h-2023-copper-22000km",
    drivetrain: "DIRECT4 All-Wheel Drive with Dynamic Rear Steering (DRS)",
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
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", caption: "Gazoo Racing Heritage Front Stance in Pearl White", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85", caption: "E-KDSS Electronic Kinetic Dynamic Suspension Stance", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "GR Sport Driver Cockpit with Fingerprint Authentication", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", caption: "Black & Dark Red Bi-Tone Leather Seating Suite", tag: "INTERIOR" },
    ],
    description: "Toyota Land Cruiser 300 GR Sport in Pearl White. Gazoo Racing electronic kinetic dynamic suspension (E-KDSS), front and rear differential locks, and flagship luxury performance.",
    slug: "toyota-land-cruiser-300-gr-sport-2024",
    drivetrain: "Full-Time 4WD with Electronic Kinetic Dynamic Suspension (E-KDSS)",
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
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", caption: "Miami Blue GTS Front Stance & Tinted LED Headlights", tag: "EXTERIOR" },
      { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80", caption: "Low-Slung Track Profile & GTS Sport Air Suspension", tag: "PROFILE" },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", caption: "Porsche Sport Chrono Dial & Alcantara Steering Wheel", tag: "COCKPIT" },
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", caption: "21-inch RS Spyder Design Satin Black Wheels", tag: "WHEELS" },
      { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", caption: "GTS Carmine Red Contrast-Stitched Interior Package", tag: "INTERIOR" },
    ],
    description: "Porsche Macan GTS in Miami Blue. 434 hp twin-turbo V6, 7-speed PDK transmission, Sport Chrono package, GTS sport air suspension, and handcrafted interior.",
    slug: "porsche-macan-gts-2024-miami-blue",
    drivetrain: "Porsche Traction Management (PTM) Active AWD",
  },
];

export interface GalleryPhoto {
  id: number;
  title: string;
  category: "sedans" | "supercars" | "suvs" | "cockpit";
  categoryLabel: string;
  image: string;
  desc: string;
}

export const GALLERY_DATA: GalleryPhoto[] = [
  {
    id: 1,
    title: "Mercedes-Maybach S 680 Bi-Turbo V12",
    category: "sedans",
    categoryLabel: "Flagship V12",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
    desc: "Obsidian Black over Silk Nappa. First-class rear executive suite with active road noise cancellation and champagne flutes.",
  },
  {
    id: 2,
    title: "Rolls-Royce Ghost Extended",
    category: "sedans",
    categoryLabel: "Bespoke Sanctuary",
    image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=80",
    desc: "Goodwood handcrafted. Silver Dawn dual coachline stance with Spirit of Ecstasy, bespoke Starlight headliner, and effortless doors.",
  },
  {
    id: 3,
    title: "Porsche 911 GT3 Track Benchmark",
    category: "supercars",
    categoryLabel: "Stuttgart Benchmark",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
    desc: "Carrara White Metallic with center-lock satin black forged wheels. 4.0L naturally aspirated flat-6 tuned for track and alpine grand touring.",
  },
  {
    id: 4,
    title: "Range Rover SV Autobiography LWB",
    category: "suvs",
    categoryLabel: "British Flagship SUV",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    desc: "Santorini Black over Ebony leather. Long wheelbase executive seating with 24-way heated hot-stone massage chairs.",
  },
  {
    id: 5,
    title: "Maybach First-Class Executive Lounge",
    category: "cockpit",
    categoryLabel: "Artisan Cockpit",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    desc: "Diamond-quilted exclusive Nappa hide, Burmester 4D high-end sound, and dual 11.6-inch rear touchscreen displays.",
  },
  {
    id: 6,
    title: "Toyota Land Cruiser 250 Series",
    category: "suvs",
    categoryLabel: "Off-Road Heritage",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85",
    desc: "Brand new 250 series in Obsidian Black. Modern boxy proportions, multi-terrain monitor, and authentic 4WD pedigree.",
  },
  {
    id: 7,
    title: "Lexus LX 600 VIP 4-Seater",
    category: "suvs",
    categoryLabel: "Flagship Luxury SUV",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85",
    desc: "Pearl White with Mark Levinson 25-speaker audio and independent Ottoman rear seats with 48-degree recline.",
  },
  {
    id: 8,
    title: "Mercedes-Benz G 580 Electric EQ",
    category: "suvs",
    categoryLabel: "Electric G-Wagon",
    image: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1600&q=85",
    desc: "Individual wheel electric torque vectoring and iconic squared-off G-Class silhouette inducted into our Dhaka showroom.",
  },
  {
    id: 9,
    title: "BMW 745Le xDrive Executive Lounge",
    category: "sedans",
    categoryLabel: "Executive Hybrid",
    image: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85",
    desc: "Donington Grey with Bowers & Wilkins Diamond Surround audio, Sky Lounge LED panoramic roof, and rear console tablet.",
  },
  {
    id: 10,
    title: "Porsche Panamera Turbo Executive",
    category: "sedans",
    categoryLabel: "Grand Tourer Sedan",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    desc: "Jet Black Metallic with extended executive wheelbase, active four-way rear spoiler, and 550 hp twin-turbo V8 performance.",
  },
  {
    id: 11,
    title: "BMW X7 xDrive40i M-Sport 7-Seater",
    category: "suvs",
    categoryLabel: "Luxury Family 7-Seater",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85",
    desc: "Tanzanite Blue Metallic, M-Aerodynamics pack, 22-inch bi-color wheels, and executive 3-row comfort seating.",
  },
  {
    id: 12,
    title: "Audi R8 V10 Performance Coupe",
    category: "supercars",
    categoryLabel: "Supercar Track Pace",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80",
    desc: "Daytona Grey with bronze forged wheels. 5.2L naturally aspirated V10 pushing 612 hp with quattro all-wheel drive dynamics.",
  },
  {
    id: 13,
    title: "Starlight Roof & Handcrafted Cockpit",
    category: "cockpit",
    categoryLabel: "Interior Artistry",
    image: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80",
    desc: "Individual optical fibers woven into pure leather headliner for an ethereal starlight ambiance under Dhaka skies.",
  },
  {
    id: 14,
    title: "Toyota Land Cruiser 300 GR Sport",
    category: "suvs",
    categoryLabel: "Gazoo Racing Edition",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    desc: "3.5L Twin-Turbo V6 with electronic Kinetic Dynamic Suspension System (e-KDSS) tuned by Toyota Gazoo Racing.",
  },
  {
    id: 15,
    title: "Mercedes-Benz S 560e Long Wheelbase",
    category: "sedans",
    categoryLabel: "Flagship Prestige",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
    desc: "Long wheelbase executive edition with hot-stone massage programs, Burmester acoustics, and airmatic suspension.",
  },
  {
    id: 16,
    title: "Nissan Patrol Y62 NISMO Kitted V8",
    category: "suvs",
    categoryLabel: "Desert Legend V8",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85",
    desc: "5.6L V8 powerplant equipped with factory NISMO aero bodywork, quad exhaust tips, and Bilstein racing damping.",
  },
  {
    id: 17,
    title: "VIP Executive Reclining Suite",
    category: "cockpit",
    categoryLabel: "Bespoke Comfort",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    desc: "Twin executive rear consoles featuring powered ottomans, wireless charging trays, and acoustic double glazing.",
  },
  {
    id: 18,
    title: "Ferrari F8 Tributo Berlinetta",
    category: "supercars",
    categoryLabel: "Pure Exotic Performance",
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1200&q=80",
    desc: "Rosso Corsa over Nero leather. Mid-engine 710 hp twin-turbo V8 with carbon-fiber aerodynamics and switchable race drive modes.",
  },
  {
    id: 19,
    title: "Mercedes-AMG GT R Bi-Turbo Coupe",
    category: "supercars",
    categoryLabel: "AMG Track Beast",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
    desc: "Magno Selenite Grey finish with yellow ceramic composite calipers, carbon active aero pack, and handcrafted 4.0L Bi-Turbo V8.",
  },
];

export const VIDEO_CONFIGS = {
  reel: {
    pill: "FLAGSHIP CINEMATIC REEL",
    title: "Rolls-Royce Cullinan vs Mercedes-Maybach GLS 600",
    sub: "The apex of bespoke automotive luxury and road presence • Kakrail & Gulshan, Dhaka",
    embed: "https://www.youtube.com/embed/9WPmzHuaCo4?autoplay=1&mute=0&rel=0&modestbranding=1",
  },
  tour: {
    pill: "CINEMATIC SHOWROOM TOUR",
    title: "DREAM CAR HOUSE Flagship Showroom Walkthrough",
    sub: "Step inside Dhaka's most prestigious luxury automotive destination • Kakrail & Gulshan, Dhaka",
    embed: "https://www.youtube.com/embed/rOmWSknq9g0?autoplay=1&mute=0&rel=0&modestbranding=1",
  },
};

export interface BrandMarque {
  name: string;
  filterBrand: string;
  svg: string;
}

export interface RunwayBatch {
  id: string;
  name: string;
  badge: string;
  brands: BrandMarque[];
}

export const RUNWAY_BATCHES: RunwayBatch[] = [
  {
    id: "flagship",
    name: "Flagship Luxury",
    badge: "BATCH 01 / 03",
    brands: [
      {
        name: "MERCEDES",
        filterBrand: "Mercedes-Benz",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/><line x1="24" y1="2" x2="24" y2="24" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="24" x2="5" y2="35" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="24" x2="43" y2="35" stroke="currentColor" stroke-width="2.2"/><path d="M24 2 L22 24 L24 21 L26 24 Z" fill="currentColor"/><path d="M5 35 L24 24 L22 26 L8 38 Z" fill="currentColor"/><path d="M43 35 L24 24 L26 26 L40 38 Z" fill="currentColor"/></svg>`,
      },
      {
        name: "BMW",
        filterBrand: "BMW",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M24 9 A15 15 0 0 1 39 24 L24 24 Z" fill="#0066b1"/><path d="M9 24 A15 15 0 0 1 24 9 L24 24 Z" fill="#ffffff"/><path d="M24 24 L39 24 A15 15 0 0 1 24 39 Z" fill="#ffffff"/><path d="M24 24 L9 24 A15 15 0 0 0 24 39 Z" fill="#0066b1"/></svg>`,
      },
      {
        name: "LEXUS",
        filterBrand: "Lexus",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><ellipse cx="24" cy="24" rx="22" ry="16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 17 L22 17 L22 31 L34 31" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 17 L32 23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
      },
      {
        name: "TOYOTA",
        filterBrand: "Toyota",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><ellipse cx="24" cy="24" rx="22" ry="15" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="20" rx="14" ry="7" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="24" rx="6" ry="14" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`,
      },
      {
        name: "AUDI",
        filterBrand: "Audi",
        svg: `<svg viewBox="0 0 68 32" class="brand-svg-wide"><circle cx="14" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="27" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="41" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="54" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`,
      },
      {
        name: "PORSCHE",
        filterBrand: "Porsche",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 8 L36 8 L33 34 L24 42 L15 34 Z" fill="none" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" stroke-width="1.5"/><line x1="13" y1="22" x2="35" y2="22" stroke="currentColor" stroke-width="1.5"/><rect x="20" y="14" width="8" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`,
      },
      {
        name: "LAND ROVER",
        filterBrand: "Land Rover",
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><ellipse cx="27" cy="16" rx="25" ry="14" fill="none" stroke="#22c55e" stroke-width="2.2"/><text x="27" y="19" text-anchor="middle" fill="#4ade80" font-size="8.5" font-family="sans-serif" font-weight="800" letter-spacing="1">LAND ROVER</text></svg>`,
      },
      {
        name: "BYD",
        filterBrand: "BYD",
        svg: `<svg viewBox="0 0 52 32" class="brand-svg-wide"><rect x="3" y="6" width="46" height="20" rx="10" fill="none" stroke="currentColor" stroke-width="2.2"/><text x="26" y="20" text-anchor="middle" fill="currentColor" font-size="11" font-family="sans-serif" font-weight="900" letter-spacing="2">BYD</text></svg>`,
      },
    ],
  },
  {
    id: "exotics",
    name: "Supercar & Exotics",
    badge: "BATCH 02 / 03",
    brands: [
      {
        name: "ROLLS-ROYCE",
        filterBrand: "Rolls-Royce",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><rect x="10" y="6" width="28" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><text x="20" y="24" fill="currentColor" font-size="14" font-weight="900" font-family="serif">R</text><text x="27" y="32" fill="currentColor" font-size="14" font-weight="900" font-family="serif">R</text></svg>`,
      },
      {
        name: "BENTLEY",
        filterBrand: "Bentley",
        svg: `<svg viewBox="0 0 60 32" class="brand-svg-wide"><path d="M4 20 C14 10 24 10 30 16 C36 10 46 10 56 20 C46 22 36 18 30 18 C24 18 14 22 4 20 Z" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="30" cy="17" rx="8" ry="7" fill="none" stroke="currentColor" stroke-width="2"/><text x="30" y="21" text-anchor="middle" fill="currentColor" font-size="11" font-weight="900" font-family="sans-serif">B</text></svg>`,
      },
      {
        name: "FERRARI",
        filterBrand: "Ferrari",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 6 L36 6 L33 36 L24 44 L15 36 Z" fill="#ffd700" stroke="#ffd700" stroke-width="1.5"/><path d="M22 13 C23 11 25 11 26 13 C26 15 24 16 26 19 C28 20 30 19 31 22 C31 24 29 25 27 25 C28 27 29 29 28 31 C26 31 25 29 24 27 C23 29 22 31 20 31 C20 28 21 26 22 24 C20 23 19 21 21 19 C22 17 21 15 22 13 Z" fill="#111111"/><rect x="15" y="7" width="6" height="3" fill="#22c55e"/><rect x="21" y="7" width="6" height="3" fill="#ffffff"/><rect x="27" y="7" width="6" height="3" fill="#ef4444"/></svg>`,
      },
      {
        name: "LAMBORGHINI",
        filterBrand: "Lamborghini",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><polygon points="24,5 40,11 36,41 24,46 12,41 8,11" fill="none" stroke="#d97706" stroke-width="2.2"/><path d="M18 20 C20 18 22 19 24 21 C26 19 28 18 30 20 C28 23 29 26 27 29 C25 28 23 28 21 29 C19 26 20 23 18 20 Z" fill="#f59e0b"/><polygon points="24,20 21,24 27,24" fill="#d97706"/></svg>`,
      },
      {
        name: "ASTON MARTIN",
        filterBrand: "Aston Martin",
        svg: `<svg viewBox="0 0 64 32" class="brand-svg-wide"><path d="M4 17 C16 9 26 10 32 15 C38 10 48 9 60 17 C50 20 38 18 32 18 C26 18 14 20 4 17 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="15" x2="24" y2="17" stroke="currentColor" stroke-width="1.2"/><line x1="52" y1="15" x2="40" y2="17" stroke="currentColor" stroke-width="1.2"/><rect x="20" y="14" width="24" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><text x="32" y="18.5" text-anchor="middle" fill="currentColor" font-size="5" font-family="sans-serif" font-weight="800" letter-spacing="0.5">ASTON MARTIN</text></svg>`,
      },
      {
        name: "MASERATI",
        filterBrand: "Maserati",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M24 6 L26 18 L34 11 L32 24 L27 26 L27 34 L29 36 L24 40 L19 36 L21 34 L21 26 L16 24 L14 11 L22 18 Z" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round"/><ellipse cx="24" cy="24" rx="20" ry="19" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.6"/></svg>`,
      },
      {
        name: "MCLAREN",
        filterBrand: "McLaren",
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><path d="M12 21 C22 13 36 12 44 19 C38 15 26 15 12 21 Z" fill="#ef4444"/><text x="27" y="27" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" font-weight="900" letter-spacing="1.5">MCLAREN</text></svg>`,
      },
      {
        name: "JAGUAR",
        filterBrand: "Jaguar",
        svg: `<svg viewBox="0 0 60 32" class="brand-svg-wide"><path d="M10 22 C14 18 20 16 28 17 C34 15 42 12 50 14 C48 16 44 17 40 18 C46 19 50 20 48 23 C42 22 36 21 30 22 C24 23 18 25 10 22 Z" fill="currentColor"/><text x="30" y="29" text-anchor="middle" fill="currentColor" font-size="7" font-family="sans-serif" font-weight="900" letter-spacing="2">JAGUAR</text></svg>`,
      },
    ],
  },
  {
    id: "hypercars",
    name: "Hypercars & Bespoke",
    badge: "BATCH 03 / 03",
    brands: [
      {
        name: "BUGATTI",
        filterBrand: "Bugatti",
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><ellipse cx="27" cy="16" rx="25" ry="14" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/><ellipse cx="27" cy="16" rx="23" ry="12" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="2,2"/><text x="27" y="20" text-anchor="middle" fill="#ffffff" font-size="9" font-family="sans-serif" font-weight="900" letter-spacing="1">BUGATTI</text></svg>`,
      },
      {
        name: "KOENIGSEGG",
        filterBrand: "Koenigsegg",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><polygon points="24,6 40,12 37,38 24,44 11,38 8,12" fill="none" stroke="#fbbf24" stroke-width="2"/><polygon points="24,12 32,18 24,24 16,18" fill="#3b82f6" opacity="0.8"/><polygon points="24,24 32,30 24,36 16,30" fill="#fbbf24" opacity="0.8"/><circle cx="24" cy="24" r="3" fill="#ffffff"/></svg>`,
      },
      {
        name: "MAYBACH",
        filterBrand: "Mercedes-Benz",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 12 L36 12 L24 40 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 20 L20 32 L24 23 L28 32 L32 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 16 L22 28 L24 22 L26 28 L30 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
      },
      {
        name: "CADILLAC",
        filterBrand: "Cadillac",
        svg: `<svg viewBox="0 0 54 32" class="brand-svg-wide"><polygon points="27,6 45,13 41,27 27,30 13,27 9,13" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="18" x2="42" y2="18" stroke="currentColor" stroke-width="1.2"/><rect x="22" y="11" width="10" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="27" cy="17" r="2" fill="currentColor"/></svg>`,
      },
      {
        name: "ALFA ROMEO",
        filterBrand: "Alfa Romeo",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="#dc2626" stroke-width="2.2"/><circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" stroke-width="1.2"/><path d="M14 24 L24 24" stroke="#dc2626" stroke-width="3"/><path d="M24 14 L24 34" stroke="#dc2626" stroke-width="3"/><path d="M24 18 C28 18 31 20 31 24 C31 28 28 30 24 30" fill="none" stroke="#22c55e" stroke-width="2"/></svg>`,
      },
      {
        name: "VOLVO",
        filterBrand: "Volvo",
        svg: `<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="33" y1="15" x2="42" y2="6" stroke="currentColor" stroke-width="3"/><polygon points="42,6 36,6 42,12" fill="currentColor"/><rect x="8" y="21" width="32" height="6" fill="#0f172a" stroke="currentColor" stroke-width="1.2"/><text x="24" y="26" text-anchor="middle" fill="currentColor" font-size="5" font-family="sans-serif" font-weight="900" letter-spacing="1">VOLVO</text></svg>`,
      },
      {
        name: "GENESIS",
        filterBrand: "Genesis",
        svg: `<svg viewBox="0 0 64 32" class="brand-svg-wide"><path d="M6 18 C18 12 26 12 32 17 C38 12 46 12 58 18 C50 20 40 18 32 19 C24 18 14 20 6 18 Z" fill="none" stroke="currentColor" stroke-width="1.8"/><polygon points="32,15 37,20 32,24 27,20" fill="currentColor"/><text x="32" y="29" text-anchor="middle" fill="currentColor" font-size="6" font-family="sans-serif" font-weight="800" letter-spacing="2">GENESIS</text></svg>`,
      },
      {
        name: "RANGE ROVER",
        filterBrand: "Land Rover",
        svg: `<svg viewBox="0 0 56 32" class="brand-svg-wide"><rect x="3" y="6" width="50" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="28" y="19" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" font-weight="800" letter-spacing="1.5">RANGE ROVER</text></svg>`,
      },
    ],
  },
];

export const ALL_RUNWAY_BRANDS: BrandMarque[] = RUNWAY_BATCHES.flatMap((b) => b.brands);

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return VEHICLE_DATA.find((car) => car.slug === slug);
}

export function getVehicleById(id: number): Vehicle | undefined {
  return VEHICLE_DATA.find((car) => car.id === id);
}

export function getRelatedVehicles(currentId: number, brand: string, limit = 4): Vehicle[] {
  const sameBrand = VEHICLE_DATA.filter((car) => car.id !== currentId && car.brand === brand);
  if (sameBrand.length >= limit) return sameBrand.slice(0, limit);
  const others = VEHICLE_DATA.filter((car) => car.id !== currentId && car.brand !== brand);
  return [...sameBrand, ...others].slice(0, limit);
}
