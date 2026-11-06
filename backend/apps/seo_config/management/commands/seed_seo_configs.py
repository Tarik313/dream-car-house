from django.core.management.base import BaseCommand
from apps.seo_config.models import SEOConfig, CategoryPageSEO


class Command(BaseCommand):
    help = "Seeds default SEO configurations for standard pages and category listing pages."

    def handle(self, *args, **options):
        # 1. Page SEO Configs
        pages = [
            {
                "page": SEOConfig.PageChoices.HOME,
                "meta_title": "The Pinnacle of Luxury Automobiles | DREAM CAR HOUSE",
                "meta_description": "Explore luxury cars in Bangladesh with DREAM CAR HOUSE. Browse our exclusive range of brand new, reconditioned, and pre-owned premium vehicles in Kakrail and Gulshan, Dhaka.",
                "meta_keywords": "luxury cars bangladesh, dream car house, mercedes-benz dhaka, bmw bangladesh, porsche dhaka",
                "target_keyword": "luxury cars bangladesh",
                "canonical_url": "https://dreamcarhouse.com",
                "og_title": "The Pinnacle of Luxury Automobiles | DREAM CAR HOUSE",
                "og_description": "Experience dedicated automotive advisory across our Kakrail and Gulshan showrooms.",
                "og_type": SEOConfig.OGTypeChoices.WEBSITE,
                "og_site_name": "DREAM CAR HOUSE",
                "twitter_card": SEOConfig.TwitterCardChoices.SUMMARY_LARGE,
                "twitter_title": "The Pinnacle of Luxury Automobiles | DREAM CAR HOUSE",
                "twitter_description": "Experience dedicated automotive advisory across our Kakrail and Gulshan showrooms.",
                "robots": SEOConfig.RobotsChoices.INDEX_FOLLOW,
                "visibility": SEOConfig.VisibilityChoices.PUBLISHED,
            },
            {
                "page": SEOConfig.PageChoices.GALLERY,
                "meta_title": "Showroom Media Gallery & Atelier Chronicles | DREAM CAR HOUSE",
                "meta_description": "Explore high-definition photography and cinema spotlights of exotic, flagship, and rare luxury vehicles at DREAM CAR HOUSE Kakrail and Gulshan showrooms.",
                "meta_keywords": "luxury car gallery, showroom photography dhaka, exotic cars bangladesh",
                "target_keyword": "luxury car gallery dhaka",
                "canonical_url": "https://dreamcarhouse.com/gallery/",
                "og_title": "Showroom Media Gallery & Atelier Chronicles | DREAM CAR HOUSE",
                "og_description": "High-definition photography and cinema spotlights of exotic and rare luxury vehicles.",
                "og_type": SEOConfig.OGTypeChoices.WEBSITE,
                "og_site_name": "DREAM CAR HOUSE",
                "twitter_card": SEOConfig.TwitterCardChoices.SUMMARY_LARGE,
                "twitter_title": "Showroom Media Gallery & Atelier Chronicles | DREAM CAR HOUSE",
                "twitter_description": "High-definition photography and cinema spotlights of exotic and rare luxury vehicles.",
                "robots": SEOConfig.RobotsChoices.INDEX_FOLLOW,
                "visibility": SEOConfig.VisibilityChoices.PUBLISHED,
            },
            {
                "page": SEOConfig.PageChoices.ABOUT,
                "meta_title": "About Our Heritage & Showrooms | DREAM CAR HOUSE",
                "meta_description": "Discover DREAM CAR HOUSE, Bangladesh's foremost destination for curated luxury automobiles, bespoke imports, and premier automotive client concierge.",
                "meta_keywords": "about dream car house, luxury car dealer dhaka, premium automotive showroom",
                "target_keyword": "about dream car house",
                "canonical_url": "https://dreamcarhouse.com/about/",
                "og_title": "About Our Heritage & Showrooms | DREAM CAR HOUSE",
                "og_description": "Bangladesh's foremost destination for curated luxury automobiles and bespoke client concierge.",
                "og_type": SEOConfig.OGTypeChoices.WEBSITE,
                "og_site_name": "DREAM CAR HOUSE",
                "twitter_card": SEOConfig.TwitterCardChoices.SUMMARY_LARGE,
                "twitter_title": "About Our Heritage & Showrooms | DREAM CAR HOUSE",
                "twitter_description": "Bangladesh's foremost destination for curated luxury automobiles.",
                "robots": SEOConfig.RobotsChoices.INDEX_FOLLOW,
                "visibility": SEOConfig.VisibilityChoices.PUBLISHED,
            },
            {
                "page": SEOConfig.PageChoices.SELL,
                "meta_title": "Sell or Consign Your Luxury Automobile | DREAM CAR HOUSE",
                "meta_description": "Sell or trade-in your luxury vehicle with DREAM CAR HOUSE. Receive transparent valuation, immediate liquidity, and confidential white-glove service.",
                "meta_keywords": "sell luxury car dhaka, car trade-in bangladesh, consign exotic car",
                "target_keyword": "sell luxury car bangladesh",
                "canonical_url": "https://dreamcarhouse.com/sell/",
                "og_title": "Sell or Consign Your Luxury Automobile | DREAM CAR HOUSE",
                "og_description": "Transparent valuation, immediate liquidity, and confidential white-glove service.",
                "og_type": SEOConfig.OGTypeChoices.WEBSITE,
                "og_site_name": "DREAM CAR HOUSE",
                "twitter_card": SEOConfig.TwitterCardChoices.SUMMARY_LARGE,
                "twitter_title": "Sell or Consign Your Luxury Automobile | DREAM CAR HOUSE",
                "twitter_description": "Transparent valuation and confidential service.",
                "robots": SEOConfig.RobotsChoices.INDEX_FOLLOW,
                "visibility": SEOConfig.VisibilityChoices.PUBLISHED,
            },
            {
                "page": SEOConfig.PageChoices.BYD,
                "meta_title": "BYD Electric Vehicles & Luxury Innovation | DREAM CAR HOUSE",
                "meta_description": "Explore the revolutionary BYD electric vehicle lineup with DREAM CAR HOUSE. Advanced Blade Battery technology, luxury electric sedans and SUVs.",
                "meta_keywords": "byd bangladesh, byd electric cars dhaka, byd seal, byd atto 3",
                "target_keyword": "byd cars bangladesh",
                "canonical_url": "https://dreamcarhouse.com/byd-cars/",
                "og_title": "BYD Electric Vehicles & Luxury Innovation | DREAM CAR HOUSE",
                "og_description": "Advanced Blade Battery technology, luxury electric sedans and SUVs.",
                "og_type": SEOConfig.OGTypeChoices.WEBSITE,
                "og_site_name": "DREAM CAR HOUSE",
                "twitter_card": SEOConfig.TwitterCardChoices.SUMMARY_LARGE,
                "twitter_title": "BYD Electric Vehicles & Luxury Innovation | DREAM CAR HOUSE",
                "twitter_description": "Advanced Blade Battery technology, luxury electric sedans and SUVs.",
                "robots": SEOConfig.RobotsChoices.INDEX_FOLLOW,
                "visibility": SEOConfig.VisibilityChoices.PUBLISHED,
            },
            {
                "page": SEOConfig.PageChoices.CONTACT,
                "meta_title": "Contact Our VIP Concierge & Showrooms | DREAM CAR HOUSE",
                "meta_description": "Contact DREAM CAR HOUSE Kakrail and Gulshan showrooms. Reserve private consultations, request vehicle valuations, or connect with our VIP automotive desk.",
                "meta_keywords": "contact dream car house, kakrail showroom phone, gulshan branch address",
                "target_keyword": "contact dream car house",
                "canonical_url": "https://dreamcarhouse.com/contact/",
                "og_title": "Contact Our VIP Concierge & Showrooms | DREAM CAR HOUSE",
                "og_description": "Reserve private consultations or connect with our VIP automotive desk.",
                "og_type": SEOConfig.OGTypeChoices.WEBSITE,
                "og_site_name": "DREAM CAR HOUSE",
                "twitter_card": SEOConfig.TwitterCardChoices.SUMMARY_LARGE,
                "twitter_title": "Contact Our VIP Concierge & Showrooms | DREAM CAR HOUSE",
                "twitter_description": "Reserve private consultations or connect with our VIP automotive desk.",
                "robots": SEOConfig.RobotsChoices.INDEX_FOLLOW,
                "visibility": SEOConfig.VisibilityChoices.PUBLISHED,
            },
        ]

        for p_data in pages:
            page_slug = p_data["page"]
            obj, created = SEOConfig.objects.update_or_create(
                page=page_slug,
                defaults=p_data
            )
            action = "Created" if created else "Updated"
            self.stdout.write(f"  {action} SEOConfig for page '{page_slug}'")

        # 2. Category Page SEO Configs
        categories = [
            {
                "page": CategoryPageSEO.PageChoices.ALL_CARS,
                "category_name": "All Luxury Vehicles",
                "meta_title": "Luxury Cars & Exotic Inventory | DREAM CAR HOUSE",
                "meta_description": "Browse our full collection of certified luxury vehicles. Filter by brand, body style, price, and showroom branch across Kakrail and Gulshan.",
                "target_keyword": "luxury cars for sale bangladesh",
                "canonical_url": "https://dreamcarhouse.com/cars/",
                "h1_title": "Our Prestigious Automotive Collection",
                "robots": CategoryPageSEO.RobotsChoices.INDEX_FOLLOW,
                "visibility": CategoryPageSEO.VisibilityChoices.PUBLISHED,
            },
            {
                "page": CategoryPageSEO.PageChoices.BRAND_NEW,
                "category_name": "Brand New & Direct Imports",
                "meta_title": "Brand New Luxury Cars in Bangladesh | DREAM CAR HOUSE",
                "meta_description": "Explore factory-fresh and brand new luxury car allocations from Mercedes-Benz, BMW, Lexus, Porsche, and Range Rover with full official warranty support.",
                "target_keyword": "brand new luxury cars bangladesh",
                "canonical_url": "https://dreamcarhouse.com/cars/brand-new/",
                "h1_title": "Factory-Fresh Brand New & Official Imports",
                "robots": CategoryPageSEO.RobotsChoices.INDEX_FOLLOW,
                "visibility": CategoryPageSEO.VisibilityChoices.PUBLISHED,
            },
            {
                "page": CategoryPageSEO.PageChoices.PRE_OWNED,
                "category_name": "Certified Pre-Owned Selection",
                "meta_title": "Certified Pre-Owned Luxury Cars in Dhaka | DREAM CAR HOUSE",
                "meta_description": "Curated selection of verified pre-owned luxury vehicles with 150-point inspection, complete auction grade provenance, and immaculate condition.",
                "target_keyword": "certified pre-owned luxury cars dhaka",
                "canonical_url": "https://dreamcarhouse.com/cars/pre-owned/",
                "h1_title": "Certified Pre-Owned & Inspected Luxury Automobiles",
                "robots": CategoryPageSEO.RobotsChoices.INDEX_FOLLOW,
                "visibility": CategoryPageSEO.VisibilityChoices.PUBLISHED,
            },
        ]

        for c_data in categories:
            cat_slug = c_data["page"]
            obj, created = CategoryPageSEO.objects.update_or_create(
                page=cat_slug,
                defaults=c_data
            )
            action = "Created" if created else "Updated"
            self.stdout.write(f"  {action} CategoryPageSEO for category '{cat_slug}'")

        self.stdout.write(self.style.SUCCESS("Successfully seeded SEO configurations!"))
