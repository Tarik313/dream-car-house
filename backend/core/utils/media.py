import os
from django.conf import settings


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
