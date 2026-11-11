import re
from typing import Iterable, Optional

SITE_NAME = "DREAM CAR HOUSE"
DEFAULT_TITLE_MAX_LEN = 60

_SITE_SUFFIX_RE = re.compile(
    r"\s*\|\s*(?:dream\s*car\s*house|dream\s*car\s*ho|dream\s*car|dream|dre|dr|d)\s*$",
    re.IGNORECASE,
)
_DUP_KM_RE = re.compile(r"(km)(?:\s*\1)+", re.IGNORECASE)
_PURE_INT_RE = re.compile(r"^\d+(?:,\d+)*$")
_BROKEN_UNIT_CC_RE = re.compile(r"[^\d\s]\s*cc\b", re.IGNORECASE)
_BROKEN_TRUNCATED_SUFFIX_RE = re.compile(
    r"\|\s*(?:dream(?:\s+car(?:\s+ho(?:use)?)?)?|dre|dr|d)\s*$",
    re.IGNORECASE,
)


def clean_text(value: Optional[object]) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def join_parts(parts: Iterable[Optional[object]], sep: str = " ") -> str:
    cleaned = [clean_text(p) for p in parts]
    return sep.join(p for p in cleaned if p)


def format_engine_capacity(value: Optional[object]) -> str:
    cleaned = clean_text(value)
    if not cleaned:
        return ""
    # Only append "cc" when the stored value is purely numeric (e.g. "2900" -> "2900 cc")
    if _PURE_INT_RE.fullmatch(cleaned):
        digits = cleaned.replace(",", "")
        return f"{digits} cc"
    return cleaned


def format_mileage(value: Optional[object]) -> str:
    cleaned = clean_text(value)
    if not cleaned:
        return ""
    cleaned = _DUP_KM_RE.sub(r"\1", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if _PURE_INT_RE.fullmatch(cleaned):
        digits = int(cleaned.replace(",", ""))
        return f"{digits:,} km"
    # Fix unspaced "5000km" -> "5000 km" while keeping formatted strings intact
    m = re.fullmatch(r"([\d,]+)\s*(km)", cleaned, re.IGNORECASE)
    if m:
        return f"{m.group(1)} km"
    return cleaned


def format_fuel_type(value: Optional[object]) -> str:
    cleaned = clean_text(value)
    if not cleaned:
        return ""
    upper = cleaned.upper()
    mapping = {
        "PETROL": "Petrol",
        "DIESEL": "Diesel",
        "OCTANE": "Octane",
        "ELECTRIC": "Electric",
        "HYBRID": "Hybrid",
        "PETROL+HYBRID": "Petrol Hybrid",
        "DIESEL+HYBRID": "Diesel Hybrid",
        "OCTANE+HYBRID": "Octane Hybrid",
        "CNG+HYBRID": "CNG Hybrid",
        "LPG+HYBRID": "LPG Hybrid",
        "PETROL+PLUG-IN HYBRID": "Petrol Plug-in Hybrid",
        "DIESEL+PLUG-IN HYBRID": "Diesel Plug-in Hybrid",
        "OCTANE+PLUG-IN HYBRID": "Octane Plug-in Hybrid",
        "CNG": "CNG",
        "LPG": "LPG",
    }
    if upper in mapping:
        return mapping[upper]
    return cleaned.title() if cleaned.isupper() else cleaned


def get_vehicle_display_name(brand_name: str, model_name: str, name: str) -> str:
    brand = clean_text(brand_name)
    model = clean_text(model_name)
    raw_name = clean_text(name)

    if raw_name:
        if brand and not raw_name.lower().startswith(brand.lower()):
            return f"{brand} {raw_name}"
        return raw_name
    return join_parts([brand, model])


def get_vehicle_short_name(brand_name: str, model_name: str, name: str) -> str:
    brand = clean_text(brand_name)
    model = clean_text(model_name)
    if brand and model:
        if model.lower().startswith(brand.lower()):
            return model
        return f"{brand} {model}"
    return get_vehicle_display_name(brand, model, name)


def format_title_with_site(raw_title: Optional[object], site_name: str = SITE_NAME) -> str:
    cleaned = clean_text(raw_title)
    site = clean_text(site_name) or SITE_NAME
    if not cleaned:
        return site
    # Strip any existing or truncated Dream Car House suffixes repeatedly so site name appears once
    prev = None
    while prev != cleaned:
        prev = cleaned
        cleaned = _SITE_SUFFIX_RE.sub("", cleaned).strip(" |-")
    if not cleaned:
        return site
    return f"{cleaned} | {site}"


def _truncate_word_boundary(text: str, max_len: int) -> str:
    if len(text) <= max_len:
        return text
    cut = text[:max_len].rstrip()
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0].rstrip(" ,-/|")
    return cut


def is_malformed_auto_seo_title(title: Optional[object]) -> bool:
    t = clean_text(title)
    if not t:
        return True
    if "for Sale | D" in t and not t.lower().endswith("| dream car house"):
        return True
    if _BROKEN_TRUNCATED_SUFFIX_RE.search(t) and not t.lower().endswith("| dream car house"):
        return True
    if _BROKEN_UNIT_CC_RE.search(t) and "for sale" in t.lower():
        return True
    return False


def is_malformed_auto_seo_description(desc: Optional[object]) -> bool:
    d = clean_text(desc)
    if not d:
        return True
    raw = str(desc or "")
    if re.search(r"kmkm\b", raw, re.IGNORECASE):
        return True
    if "hybrid hybrid" in d.lower():
        return True
    if re.search(r"\bin\s{2,}for\b", raw, re.IGNORECASE):
        return True
    if re.search(r"\bin\s+for\b", d, re.IGNORECASE):
        return True
    if re.search(r"\bin\s*$", d, re.IGNORECASE):
        return True
    return False


def is_malformed_auto_alt(alt: Optional[object]) -> bool:
    a = clean_text(alt)
    if not a:
        return True
    if re.search(r"\bin\s*$", a, re.IGNORECASE):
        return True
    return False


def build_car_meta_title(
    *,
    year: Optional[int] = None,
    brand_name: str = "",
    model_name: str = "",
    name: str = "",
    engine_capacity: str = "",
    body_style: str = "",
    site_name: str = SITE_NAME,
    max_len: int = DEFAULT_TITLE_MAX_LEN,
) -> str:
    site = clean_text(site_name) or SITE_NAME
    suffix = f" | {site}"
    max_base_len = max(12, max_len - len(suffix))

    year_str = str(year) if year else ""
    display_name = get_vehicle_display_name(brand_name, model_name, name)
    short_name = get_vehicle_short_name(brand_name, model_name, name)
    eng = format_engine_capacity(engine_capacity)
    body = clean_text(body_style)

    headline_full = join_parts([year_str, display_name])
    headline_short = join_parts([year_str, short_name])

    candidates = [
        join_parts([headline_full, eng, body]),
        join_parts([headline_full, eng]),
        join_parts([headline_full, body]),
        headline_full,
        join_parts([headline_short, eng, body]),
        join_parts([headline_short, body]),
        headline_short,
        display_name,
        short_name,
    ]

    for cand in candidates:
        if cand and len(cand) <= max_base_len:
            return f"{cand}{suffix}"

    base = _truncate_word_boundary(headline_short or headline_full or site, max_base_len)
    return f"{base}{suffix}"


def _format_location(branch_name: Optional[object]) -> str:
    loc = clean_text(branch_name)
    if not loc:
        return ""
    if "dhaka" in loc.lower():
        return loc
    return f"{loc}, Dhaka"


def build_car_meta_description(
    *,
    year: Optional[int] = None,
    brand_name: str = "",
    model_name: str = "",
    name: str = "",
    color: str = "",
    engine_capacity: str = "",
    fuel_type: str = "",
    body_style: str = "",
    mileage: str = "",
    price: Optional[object] = None,
    is_call_for_price: bool = False,
    branch_name: str = "",
    site_name: str = SITE_NAME,
) -> str:
    site = clean_text(site_name) or SITE_NAME
    year_str = str(year) if year else ""
    display_name = get_vehicle_display_name(brand_name, model_name, name) or "Luxury Vehicle"
    subject = join_parts([year_str, display_name])

    color_clean = clean_text(color)
    if color_clean:
        subject = f"{subject} in {color_clean}"

    eng = format_engine_capacity(engine_capacity)
    fuel = format_fuel_type(fuel_type)
    include_fuel = bool(fuel) and fuel.lower() not in eng.lower()

    specs = join_parts([
        eng,
        fuel if include_fuel else "",
        clean_text(body_style),
    ])

    lead = join_parts([subject, specs])

    price_phrase = ""
    if price and not is_call_for_price:
        try:
            numeric_price = int(float(str(price).replace(",", "")))
            if numeric_price > 0:
                price_phrase = f"for BDT {numeric_price:,}"
        except (ValueError, TypeError):
            price_phrase = f"for BDT {clean_text(price)}"

    lead_sentence = f"Discover this {join_parts([lead, price_phrase])}."

    sentences = [lead_sentence]

    mileage_label = format_mileage(mileage)
    if mileage_label:
        sentences.append(f"{mileage_label} driven.")

    location_label = _format_location(branch_name)
    if location_label:
        sentences.append(f"Available at {location_label} on {site}.")
    else:
        sentences.append(f"View full specifications on {site}.")

    return re.sub(r"\s+", " ", " ".join(sentences)).strip()[:500]


def build_featured_image_alt(
    *,
    year: Optional[int] = None,
    brand_name: str = "",
    model_name: str = "",
    name: str = "",
    color: str = "",
    site_name: str = SITE_NAME,
) -> str:
    year_str = str(year) if year else ""
    display_name = get_vehicle_display_name(brand_name, model_name, name) or "Luxury Vehicle"
    color_clean = clean_text(color)
    alt = join_parts([
        year_str,
        display_name,
        f"in {color_clean}" if color_clean else "",
        f"- {clean_text(site_name) or SITE_NAME}",
    ])
    return alt[:200]


def build_car_seo_for_instance(obj) -> dict[str, str]:
    brand_name = obj.brand.name if getattr(obj, "brand_id", None) and getattr(obj, "brand", None) else ""
    model_name = getattr(obj, "model_name", "") or (
        obj.model.model if getattr(obj, "model_id", None) and getattr(obj, "model", None) else ""
    )
    body_style = obj.body_style.body if getattr(obj, "body_style_id", None) and getattr(obj, "body_style", None) else ""
    branch_name = obj.branch.short_name if getattr(obj, "branch_id", None) and getattr(obj, "branch", None) else ""
    if not branch_name and getattr(obj, "branch_id", None) and getattr(obj, "branch", None):
        branch_name = obj.branch.name

    return {
        "meta_title": build_car_meta_title(
            year=getattr(obj, "year", None),
            brand_name=brand_name,
            model_name=model_name,
            name=getattr(obj, "name", "") or "",
            engine_capacity=getattr(obj, "engine_capacity", "") or "",
            body_style=body_style,
        ),
        "meta_description": build_car_meta_description(
            year=getattr(obj, "year", None),
            brand_name=brand_name,
            model_name=model_name,
            name=getattr(obj, "name", "") or "",
            color=getattr(obj, "color", "") or "",
            engine_capacity=getattr(obj, "engine_capacity", "") or "",
            fuel_type=getattr(obj, "fuel_type", "") or "",
            body_style=body_style,
            mileage=getattr(obj, "mileage", "") or "",
            price=getattr(obj, "price", None),
            is_call_for_price=bool(getattr(obj, "is_call_for_price", False)),
            branch_name=branch_name or "",
        ),
        "featured_image_alt": build_featured_image_alt(
            year=getattr(obj, "year", None),
            brand_name=brand_name,
            model_name=model_name,
            name=getattr(obj, "name", "") or "",
            color=getattr(obj, "color", "") or "",
        ),
    }
