import re
from urllib.parse import urlsplit
from rest_framework.exceptions import ValidationError

_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")


def validate_destination_url(value: str) -> str:
    """
    Parse and validate destination URLs.
    
    Rejects:
    - Dangerous schemes (javascript:, data:, vbscript:, file:, etc.)
    - Protocol-relative URLs (//example.com, /\\example.com, \\\\example.com)
    - Malformed destinations containing control characters or unparseable components
    - Insecure plain HTTP external links (requires HTTPS)
    
    Preserves:
    - Authorized internal paths (e.g. '/inventory?brand=BMW')
    - Authorized HTTPS links (e.g. 'https://example.com/models')
    """
    if not value:
        return ""
    
    val = value.strip()
    if not val:
        return ""

    # Check for unprintable/control characters or newlines
    if _CONTROL_CHARS.search(val):
        raise ValidationError("Destination URL contains invalid control characters.")

    # Reject protocol-relative URLs and backslash tricks
    if val.startswith(("//", "/\\", "\\\\", "\\")):
        raise ValidationError("Protocol-relative URLs ('//') and backslash prefixes are not allowed.")

    try:
        parsed = urlsplit(val)
    except Exception as e:
        raise ValidationError(f"Malformed destination URL: {str(e)}")

    scheme = parsed.scheme.lower() if parsed.scheme else ""

    # Dangerous pseudo-schemes
    if scheme in ("javascript", "data", "vbscript", "file", "about", "blob"):
        raise ValidationError(f"Destination URL cannot use dangerous scheme '{scheme}:'.")

    # If scheme is present, must be strictly https
    if scheme:
        if scheme != "https":
            raise ValidationError("External destination URLs must use secure HTTPS ('https://').")
        if not parsed.netloc:
            raise ValidationError("HTTPS destination URL is missing a valid domain / host.")
        # Netloc must not contain invalid characters
        if any(c in parsed.netloc for c in (" ", "\t", "\r", "\n", "\\")):
            raise ValidationError("HTTPS destination URL contains an invalid hostname.")
        return val

    # Relative internal path
    if not val.startswith("/"):
        raise ValidationError("Internal destination path must start with '/' (e.g. '/inventory?brand=BMW').")

    # In an internal path, netloc must be empty
    if parsed.netloc:
        raise ValidationError("Malformed internal path with unexpected network location.")

    # Guard against relative scheme bypass like '/javascript:alert(1)' or 'path:segment'
    first_segment = val.split("/", 2)[1] if "/" in val else ""
    if ":" in first_segment:
        raise ValidationError("Internal destination path cannot contain scheme-like segments.")

    return val
