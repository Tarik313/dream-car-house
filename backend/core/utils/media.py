import os
from django.conf import settings
from django.core.exceptions import ValidationError


ALLOWED_FAVICON_EXTENSIONS = (".ico", ".png", ".svg", ".webp", ".jpg", ".jpeg")


def normalize_media_fields(ret: dict, field_names: tuple[str, ...]) -> dict:
    """Normalize listed media fields in a serialized dict with build_media_url."""
    for field_name in field_names:
        if ret.get(field_name):
            ret[field_name] = build_media_url(ret[field_name])
    return ret


def validate_icon_file(uploaded_file, max_bytes: int = 5 * 1024 * 1024):
    """Validate uploaded browser tab icon (SVG via strict sanitizer; raster via Pillow)."""
    if not uploaded_file:
        return uploaded_file

    file_size = getattr(uploaded_file, "size", None)
    if file_size is not None and file_size > max_bytes:
        max_mb = max_bytes // (1024 * 1024)
        raise ValidationError(f"Favicon file exceeds {max_mb}MB limit.")

    name_lower = str(getattr(uploaded_file, "name", "") or "").lower()
    if not name_lower.endswith(ALLOWED_FAVICON_EXTENSIONS):
        raise ValidationError(
            "Unsupported icon format. Upload an .ico, .png, .svg, .webp, or .jpg file."
        )

    if hasattr(uploaded_file, "seek"):
        uploaded_file.seek(0)

    if name_lower.endswith(".svg"):
        try:
            content = uploaded_file.read()
            if hasattr(uploaded_file, "seek"):
                uploaded_file.seek(0)
            from core.utils.svg_sanitizer import validate_and_sanitize_svg
            from rest_framework.exceptions import ValidationError as DrfValidationError
            validate_and_sanitize_svg(content)
        except ValidationError:
            raise
        except DrfValidationError as exc:
            detail = exc.detail
            msg = detail[0] if isinstance(detail, (list, tuple)) and detail else str(detail)
            raise ValidationError(str(msg))
        except Exception as exc:
            raise ValidationError(f"Unable to validate SVG favicon: {str(exc)}")
        return uploaded_file

    try:
        from PIL import Image
        with Image.open(uploaded_file) as img:
            img.verify()
    except Exception:
        raise ValidationError("Invalid or corrupted raster image file for favicon.")
    finally:
        if hasattr(uploaded_file, "seek"):
            uploaded_file.seek(0)

    return uploaded_file


def build_media_url(url_or_path: str) -> str:
    """
    Builds a public-safe media URL for API serialization.
    
    If PUBLIC_BASE_URL is configured (e.g., 'https://dreamcarhouse.com'),
    the returned URL will be absolute: 'https://dreamcarhouse.com/media/...'.
    
    If PUBLIC_BASE_URL is not set, a relative URL is returned: '/media/...'.
    
    This strictly prevents leaking internal Docker hostnames
    (e.g., 'http://backend:8000/media/...') to browser clients when Next.js SSR
    calls Django internally.
    """
    if not url_or_path:
        return ""
    
    str_val = str(url_or_path).strip()
    if not str_val:
        return ""
    
    # If already an external absolute URL (e.g. cloud storage or CDN), return as-is
    if str_val.startswith("http://") or str_val.startswith("https://"):
        # If it contains an internal container host, strip the internal origin
        for internal in ("http://backend:8000", "http://127.0.0.1:8000", "http://localhost:8000"):
            if str_val.startswith(internal):
                str_val = str_val[len(internal):]
                break
        else:
            return str_val
    
    # Ensure leading slash
    path = str_val if str_val.startswith("/") else f"/{str_val}"
    
    public_base = ""
    if settings.configured:
        public_base = getattr(settings, "PUBLIC_BASE_URL", "")
    if not public_base:
        public_base = os.environ.get("PUBLIC_BASE_URL", "") or os.environ.get("NEXT_PUBLIC_BASE_URL", "")
    if public_base:
        return f"{public_base.rstrip('/')}{path}"
    return path
