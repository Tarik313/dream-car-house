import os
import requests
from io import BytesIO
from PIL import Image
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from apps.inventory.models import Inventory, InventoryImage, Brand, BodyStyle, ModelGeneration
from apps.home.models import ShowroomBranch
from base.models import BaseModel

RAW_VEHICLES = [
    {
        "id": 1,
        "name": "Mercedes-Benz G 580",
        "brand": "Mercedes-Benz",
        "model": "G 580",
        "body_style": "SUV",
        "year": 2025,
        "car_type": "BRAND_NEW",
        "fuel_type": "ELECTRIC",
        "engine_capacity": "116 kWh EQ Technology",
        "mileage": "0 km",
        "price": "35000000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "kakrail",
        "registration_number": "DHAKA-METRO-GA-11-2025",
        "image": "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=80", "caption": "Obsidian Black Front 3/4 Stance & Illuminated Grille", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80", "caption": "Iconic Boxy Aerodynamic Profile & EQ Emblems", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "caption": "Cockpit & MBUX Panoramic Displays", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80", "caption": "Handcrafted Luxury Nappa Leather Cabin", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80", "caption": "AMG Multi-Spoke Forged Alloys & Calipers", "tag": "WHEELS" },
            { "url": "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=80", "caption": "Rear Vault Silhouette & Spare Wheel Carrier", "tag": "REAR" },
        ],
        "description": "<p>Brand new Mercedes-Benz G 580 with EQ Technology. Unparalleled electric torque with four individual motors, iconic G-Class off-road boxy silhouette, and bespoke handcrafted luxury interior.</p>",
        "slug": "mercedes-benz-g-580-2025-black",
        "drivetrain": "4-Motor Electric AWD with Torque Vectoring",
        "is_featured": True,
    },
    {
        "id": 2,
        "name": "Land Cruiser 250",
        "brand": "Toyota",
        "model": "Land Cruiser 250",
        "body_style": "SUV",
        "year": 2024,
        "car_type": "PRE_OWNED",
        "fuel_type": "HYBRID",
        "engine_capacity": "2400 cc Turbo Hybrid",
        "mileage": "5,000 km",
        "price": "28500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "gulshan",
        "registration_number": "DHAKA-METRO-GHA-12-3456",
        "image": "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80", "caption": "Front 3/4 Heritage Grille with Rigid LED Headlamps", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80", "caption": "Full-Time 4WD Stance & Rigid Off-Road Chassis", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80", "caption": "Digital Cockpit & Terrain Select Console", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80", "caption": "Executive Leather Seating & Panoramic Sunroof", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", "caption": "Sculpted Rear Tailgate & Integrated Hitch", "tag": "REAR" },
        ],
        "description": "<p>Toyota Land Cruiser 250 2024. Next-generation luxury 4WD with modern off-road engineering, retro-modern aesthetic, and premium cabin refinement.</p>",
        "slug": "toyota-land-cruiser-250-2024-black-5000km",
        "drivetrain": "Full-Time 4WD with Torsen Center Differential",
        "is_featured": True,
    },
    {
        "id": 3,
        "name": "BMW X7 xDrive40i M-Sport",
        "brand": "BMW",
        "model": "X7",
        "body_style": "SUV",
        "year": 2022,
        "car_type": "PRE_OWNED",
        "fuel_type": "OCTANE",
        "engine_capacity": "3000 cc TwinPower Turbo",
        "mileage": "8,000 km",
        "price": "24000000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "kakrail",
        "registration_number": "DHAKA-METRO-GHA-14-9988",
        "image": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80", "caption": "Tanzanite Blue M-Sport Front Facia & Illuminated Grille", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80", "caption": "Executive 3-Row 7-Seater Grand Touring Profile", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "caption": "BMW Curved Display & Live Cockpit Pro", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80", "caption": "Sky Lounge Panoramic Glass Roof & Ambient Light", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", "caption": "Rear Aerodynamic M Diffuser & Quad Exhaust", "tag": "REAR" },
        ],
        "description": "<p>BMW X7 xDrive40i M-Sport in Tanzanite Blue. 7-seater executive luxury, Sky Lounge panoramic roof, Harman Kardon surround audio, and two-axle air suspension.</p>",
        "slug": "bmw-x7-2022-blue-8000km",
        "drivetrain": "xDrive Intelligent All-Wheel Drive",
        "is_featured": True,
    },
    {
        "id": 4,
        "name": "Lexus LX 600 Ultra Luxury",
        "brand": "Lexus",
        "model": "LX 600",
        "body_style": "SUV",
        "year": 2023,
        "car_type": "BRAND_NEW",
        "fuel_type": "OCTANE",
        "engine_capacity": "3500 cc Twin Turbo V6",
        "mileage": "0 km",
        "price": "38000000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "gulshan",
        "registration_number": "DHAKA-METRO-GA-15-7766",
        "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", "caption": "Pearl White Spindle Grille & Triple-Beam LED Headlights", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", "caption": "Flagship Luxury Ultra-High Presence Stance", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80", "caption": "Dual Screen Cockpit with Mark Levinson 25-Speaker Audio", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80", "caption": "Independent Rear VIP Ottoman 48-Degree Reclining Seats", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=80", "caption": "Rear Full-Width LED Blade Lightbar & AHC Suspension", "tag": "REAR" },
        ],
        "description": "<p>Lexus LX 600 Ultra Luxury in Pearl White. The pinnacle of Japanese craftsmanship with independent rear ottoman reclining seats, hydraulic height control, and Mark Levinson sound.</p>",
        "slug": "lexus-lx-600-2023-white-00km",
        "drivetrain": "Full-Time 4WD with Multi-Terrain Select & AHC",
        "is_featured": True,
    },
    {
        "id": 5,
        "name": "Mercedes-Benz S 560e Long Wheelbase",
        "brand": "Mercedes-Benz",
        "model": "S-Class",
        "body_style": "Sedan",
        "year": 2019,
        "car_type": "PRE_OWNED",
        "fuel_type": "HYBRID",
        "engine_capacity": "3000 cc Plug-in Hybrid",
        "mileage": "11,000 km",
        "price": "21000000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "kakrail",
        "registration_number": "DHAKA-METRO-GHA-16-5544",
        "image": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80", "caption": "Obsidian Black Executive Stance & Multibeam LED Grille", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", "caption": "Long Wheelbase Profile & Chrome Executive Trim", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "caption": "Widescreen Digital Cockpit & Handcrafted Steering Wheel", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80", "caption": "First-Class Rear Lounge with Hot-Stone Massage Seats", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", "caption": "Starlight Crystal Taillamps & Integrated Dual Exhaust", "tag": "REAR" },
        ],
        "description": "<p>Mercedes-Benz S 560e Long Wheelbase. Masterclass executive sedan with hot-stone massage seats, Burmester surround sound, and serene plug-in hybrid electric drive.</p>",
        "slug": "mercedes-benz-s-560e-2019-black-11000km",
        "drivetrain": "Rear-Wheel Drive with AIRMATIC Air Suspension",
        "is_featured": True,
    },
    {
        "id": 6,
        "name": "Nissan Patrol Y62 (NISMO Kitted)",
        "brand": "Nissan",
        "model": "Patrol",
        "body_style": "SUV",
        "year": 2013,
        "car_type": "PRE_OWNED",
        "fuel_type": "OCTANE",
        "engine_capacity": "5600 cc V8 Naturally Aspirated",
        "mileage": "62,000 km",
        "price": "14500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "gulshan",
        "registration_number": "DHAKA-METRO-GHA-17-3322",
        "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80", "caption": "Full NISMO Aerodynamic Front Fascia & Red Pinstripe", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", "caption": "Aggressive V8 SUV Road Presence & Side Aerodynamics", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80", "caption": "Hydraulic Body Motion Control & Wood-Trim Cockpit", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80", "caption": "Bose 13-Speaker Acoustic Cabin & Premium Leather", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=80", "caption": "NISMO Sport Rear Diffuser & Quad Exhaust Tips", "tag": "REAR" },
        ],
        "description": "<p>Nissan Patrol Y62 with full authentic NISMO aero bodykit. 5.6L naturally aspirated V8 powerhouse, Hydraulic Body Motion Control (HBMC), and legendary prestige.</p>",
        "slug": "nissan-patrol-2013-black-62000km",
        "drivetrain": "All-Mode 4x4 with Hydraulic Body Motion Control",
        "is_featured": True,
    },
    {
        "id": 7,
        "name": "Land Cruiser VX-V8",
        "brand": "Toyota",
        "model": "Land Cruiser",
        "body_style": "SUV",
        "year": 2015,
        "car_type": "PRE_OWNED",
        "fuel_type": "OCTANE",
        "engine_capacity": "4600 cc V8 Dual VVT-i",
        "mileage": "74,000 km",
        "price": "16500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "kakrail",
        "registration_number": "DHAKA-METRO-GHA-18-1122",
        "image": "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80", "caption": "Timeless 200-Series V8 Front Grille & Fog Lamps", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80", "caption": "Iconic Heavy-Duty Luxury SUV Stance & High Profile", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80", "caption": "Toyota Multi-Terrain Select & Crawl Control Console", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80", "caption": "7-Seater Premium Leather Interior with Center Coolbox", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", "caption": "Split-Fold Power Tailgate & Signature Badging", "tag": "REAR" },
        ],
        "description": "<p>Toyota Land Cruiser VX V8 in Black. Impeccable condition, authentic service records, crawl control, and timeless prestige on Bangladesh roads.</p>",
        "slug": "toyota-land-cruiser-vx-v8-2015-black-74000km",
        "drivetrain": "Full-Time 4WD with Kinetic Dynamic Suspension (KDSS)",
        "is_featured": True,
    },
    {
        "id": 8,
        "name": "BMW 745Le xDrive Executive Lounge",
        "brand": "BMW",
        "model": "7 Series",
        "body_style": "Sedan",
        "year": 2019,
        "car_type": "PRE_OWNED",
        "fuel_type": "HYBRID",
        "engine_capacity": "3000 cc Plug-in Hybrid",
        "mileage": "9,000 km",
        "price": "22500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "gulshan",
        "registration_number": "DHAKA-METRO-GHA-19-4455",
        "image": "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80", "caption": "Glacier Silver Metallic Finish with BMW Laserlight", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", "caption": "Carbon Core Architecture & Long Executive Silhouette", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "caption": "BMW Gesture Control & Live Cockpit Professional", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80", "caption": "Executive Lounge Rear Seating with Touch Command Tablet", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", "caption": "Sleek 3D LED Rear Lightbar & Dual Chrome Tailpipes", "tag": "REAR" },
        ],
        "description": "<p>BMW 745Le plug-in hybrid in Silver. Executive lounge seating, Bowers & Wilkins Diamond surround sound, BMW laser headlights, and carbon core chassis.</p>",
        "slug": "bmw-745le-2019-silver-9000",
        "drivetrain": "xDrive Intelligent All-Wheel Drive with 2-Axle Air Suspension",
        "is_featured": True,
    },
    {
        "id": 9,
        "name": "Volvo XC90 T5 Inscription",
        "brand": "Volvo",
        "model": "XC 90",
        "body_style": "SUV",
        "year": 2019,
        "car_type": "PRE_OWNED",
        "fuel_type": "OCTANE",
        "engine_capacity": "2000 cc Turbocharged",
        "mileage": "32,000 km",
        "price": "13500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "kakrail",
        "registration_number": "DHAKA-METRO-GHA-20-8899",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", "caption": "Crystal White Inscription with Thor's Hammer LED", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", "caption": "Scandinavian Minimalist Silhouette & Satin Chrome Accents", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80", "caption": "Orrefors Crystal Gearshift & CleanZone Sensus Touchscreen", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80", "caption": "Bowers & Wilkins High-Fidelity Audio & 7 Ergonomic Seats", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", "caption": "Scandinavian Tailgate & Dual Inscription Pipes", "tag": "REAR" },
        ],
        "description": "<p>Volvo XC90 T5 Inscription in White. Scandinavian luxury, 7-passenger capability, genuine Orrefors Swedish crystal gearshift, and world-class safety engineering.</p>",
        "slug": "volvo-xc-90-2019-white-32000km",
        "drivetrain": "All-Wheel Drive with Instant Traction",
        "is_featured": True,
    },
    {
        "id": 10,
        "name": "Lexus RX 500h Turbo F-Sport",
        "brand": "Lexus",
        "model": "RX 500h",
        "body_style": "SUV",
        "year": 2023,
        "car_type": "PRE_OWNED",
        "fuel_type": "HYBRID",
        "engine_capacity": "2400 cc Turbo Hybrid",
        "mileage": "22,000 km",
        "price": "23500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "gulshan",
        "registration_number": "DHAKA-METRO-GHA-21-6677",
        "image": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80", "caption": "Copper Crest F-Sport Mesh Grille & Aerodynamic Lips", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", "caption": "Dynamic Coupe-SUV Profile with DIRECT4 Badge", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "caption": "Tazuna Concept Cockpit & Head-Up Display", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80", "caption": "Sport Bolstered Dark Rose Leather Seats", "tag": "INTERIOR" },
            { "url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80", "caption": "21-inch Matte Black F-Sport Wheels & 6-Piston Brakes", "tag": "WHEELS" },
        ],
        "description": "<p>Lexus RX 500h Turbo F-Sport Performance in Copper Crest. Dynamic rear wheel steering, DIRECT4 all-wheel drive, and Mark Levinson premium sound.</p>",
        "slug": "lexus-rx-500h-2023-copper-22000km",
        "drivetrain": "DIRECT4 All-Wheel Drive with Dynamic Rear Steering (DRS)",
        "is_featured": True,
    },
    {
        "id": 11,
        "name": "Toyota Land Cruiser 300 GR Sport",
        "brand": "Toyota",
        "model": "Land Cruiser 300",
        "body_style": "SUV",
        "year": 2024,
        "car_type": "BRAND_NEW",
        "fuel_type": "OCTANE",
        "engine_capacity": "3500 cc Twin Turbo V6",
        "mileage": "0 km",
        "price": "34500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "kakrail",
        "registration_number": "DHAKA-METRO-GA-22-3344",
        "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80", "caption": "Gazoo Racing Heritage Front Stance in Pearl White", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80", "caption": "E-KDSS Electronic Kinetic Dynamic Suspension Stance", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "caption": "GR Sport Driver Cockpit with Fingerprint Authentication", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80", "caption": "Black & Dark Red Bi-Tone Leather Seating Suite", "tag": "INTERIOR" },
        ],
        "description": "<p>Toyota Land Cruiser 300 GR Sport in Pearl White. Gazoo Racing electronic kinetic dynamic suspension (E-KDSS), front and rear differential locks, and flagship luxury performance.</p>",
        "slug": "toyota-land-cruiser-300-gr-sport-2024",
        "drivetrain": "Full-Time 4WD with Electronic Kinetic Dynamic Suspension (E-KDSS)",
        "is_featured": True,
    },
    {
        "id": 12,
        "name": "Porsche Macan GTS",
        "brand": "Porsche",
        "model": "Macan GTS",
        "body_style": "SUV",
        "year": 2024,
        "car_type": "BRAND_NEW",
        "fuel_type": "OCTANE",
        "engine_capacity": "2900 cc Twin Turbo V6",
        "mileage": "0 km",
        "price": "29500000.00",
        "is_call_for_price": True,
        "registered": "Available",
        "branch_id": "gulshan",
        "registration_number": "DHAKA-METRO-GA-23-1122",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        "images": [
            { "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", "caption": "Miami Blue GTS Front Stance & Tinted LED Headlights", "tag": "EXTERIOR" },
            { "url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80", "caption": "Low-Slung Track Profile & GTS Sport Air Suspension", "tag": "PROFILE" },
            { "url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "caption": "Porsche Sport Chrono Dial & Alcantara Steering Wheel", "tag": "COCKPIT" },
            { "url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80", "caption": "21-inch RS Spyder Design Satin Black Wheels", "tag": "WHEELS" },
            { "url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80", "caption": "GTS Carmine Red Contrast-Stitched Interior Package", "tag": "INTERIOR" },
        ],
        "description": "<p>Porsche Macan GTS in Miami Blue. 434 hp twin-turbo V6, 7-speed PDK transmission, Sport Chrono package, GTS sport air suspension, and handcrafted interior.</p>",
        "slug": "porsche-macan-gts-2024-miami-blue",
        "drivetrain": "Porsche Traction Management (PTM) Active AWD",
        "is_featured": True,
    },
]

def fetch_image_content(url: str, fallback_color: str = "navy") -> ContentFile:
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200 and len(res.content) > 1000:
            return ContentFile(res.content)
    except Exception:
        pass
    # Generate fallback image
    buf = BytesIO()
    img = Image.new("RGB", (800, 500), color=fallback_color)
    img.save(buf, "JPEG")
    return ContentFile(buf.getvalue())

class Command(BaseCommand):
    help = "Seed 12 authentic showroom vehicles into the database with branches, specs, and gallery photos"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding authentic showroom vehicles into SQLite...")

        # 1. Showroom branches
        kakrail_branch = ShowroomBranch.objects.filter(branch_id="kakrail").first()
        if not kakrail_branch:
            kakrail_branch = ShowroomBranch.objects.create(
                branch_id="kakrail",
                name="Kakrail Branch & Showroom",
                short_name="Kakrail Branch",
                tag="Main Flagship Showroom",
                address="18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
                phone="01615-121312",
                hotline="+880 1615-121312",
                status="PUBLISHED"
            )

        gulshan_branch = ShowroomBranch.objects.filter(branch_id="gulshan").first()
        if not gulshan_branch:
            gulshan_branch = ShowroomBranch.objects.create(
                branch_id="gulshan",
                name="Gulshan Branch & Showroom",
                short_name="Gulshan Branch",
                tag="Gulshan Avenue Showroom",
                address="House #07, Road #127, Gulshan Avenue, Dhaka-1212",
                phone="01615-121312",
                hotline="+880 1615-121312",
                status="PUBLISHED"
            )

        for item in RAW_VEHICLES:
            brand_obj, _ = Brand.objects.get_or_create(
                name=item["brand"],
                defaults={"status": BaseModel.StatusChoices.PUBLISHED}
            )

            body_style_obj, _ = BodyStyle.objects.get_or_create(
                body=item["body_style"],
                defaults={"status": BaseModel.StatusChoices.PUBLISHED}
            )

            model_obj, _ = ModelGeneration.objects.get_or_create(
                brand=brand_obj,
                model=item["model"],
                defaults={"status": BaseModel.StatusChoices.PUBLISHED}
            )

            branch_obj = gulshan_branch if item["branch_id"] == "gulshan" else kakrail_branch

            # Check if car already exists by slug
            car = Inventory.objects.filter(slug=item["slug"]).first()
            if not car:
                car = Inventory(
                    slug=item["slug"],
                    name=item["name"],
                    brand=brand_obj,
                    model=model_obj,
                    body_style=body_style_obj,
                    branch=branch_obj,
                    year=item["year"],
                    car_type=item["car_type"],
                    fuel_type=item["fuel_type"],
                    engine_capacity=item["engine_capacity"],
                    mileage=item["mileage"],
                    price=item["price"],
                    is_call_for_price=item["is_call_for_price"],
                    registered=item["registered"],
                    registration_number=item["registration_number"],
                    description=item["description"],
                    drive_type=item["drivetrain"],
                    is_featured=item["is_featured"],
                    status=BaseModel.StatusChoices.PUBLISHED,
                )
                img_content = fetch_image_content(item["image"], fallback_color="navy")
                car.feature_image.save(f"{item['slug']}_feature.jpg", img_content, save=False)
                car.save()
                self.stdout.write(self.style.SUCCESS(f"Created vehicle: {car.name} ({car.slug})"))
            else:
                car.name = item["name"]
                car.brand = brand_obj
                car.model = model_obj
                car.body_style = body_style_obj
                car.branch = branch_obj
                car.year = item["year"]
                car.car_type = item["car_type"]
                car.fuel_type = item["fuel_type"]
                car.engine_capacity = item["engine_capacity"]
                car.mileage = item["mileage"]
                car.price = item["price"]
                car.is_call_for_price = item["is_call_for_price"]
                car.registered = item["registered"]
                car.registration_number = item["registration_number"]
                car.description = item["description"]
                car.drive_type = item["drivetrain"]
                car.is_featured = item["is_featured"]
                car.status = BaseModel.StatusChoices.PUBLISHED
                if not car.feature_image:
                    img_content = fetch_image_content(item["image"], fallback_color="navy")
                    car.feature_image.save(f"{item['slug']}_feature.jpg", img_content, save=False)
                car.save()
                self.stdout.write(self.style.SUCCESS(f"Updated vehicle: {car.name} ({car.slug})"))

            # Seed gallery images
            if car.inventory_images.count() == 0 and "images" in item:
                for idx, g_item in enumerate(item["images"]):
                    g_content = fetch_image_content(g_item["url"], fallback_color="darkblue")
                    g_img = InventoryImage(
                        inventory=car,
                        order=idx + 1,
                        caption=g_item.get("caption", ""),
                        alt_text=g_item.get("caption", ""),
                        tag=g_item.get("tag", "EXTERIOR"),
                    )
                    g_img.image.save(f"{car.slug}_gallery_{idx+1}.jpg", g_content, save=True)

        self.stdout.write(self.style.SUCCESS("All 12 authentic showroom vehicles successfully seeded!"))
