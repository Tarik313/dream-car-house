import html
import re
import xml.etree.ElementTree as ET
from rest_framework.exceptions import ValidationError

# Strict allowlist of structural and graphical SVG elements needed for logos and vectors
ALLOWED_SVG_TAGS = {
    "svg",
    "g",
    "path",
    "polygon",
    "polyline",
    "rect",
    "circle",
    "ellipse",
    "line",
    "text",
    "tspan",
    "defs",
    "clippath",
    "mask",
    "lineargradient",
    "radialgradient",
    "stop",
    "pattern",
    "symbol",
    "use",
    "title",
    "desc",
    "style",
}

# Dangerous elements that must never appear in SVG uploads
DANGEROUS_SVG_TAGS = {
    "foreignobject",
    "script",
    "iframe",
    "embed",
    "object",
    "applet",
    "audio",
    "video",
    "animate",
    "animatetransform",
    "animatemotion",
    "set",
    "handler",
    "listener",
    "discard",
}

_URL_PATTERN = re.compile(r"url\s*\(\s*['\"]?([^'\")]+)['\"]?\s*\)", re.IGNORECASE)


def validate_and_sanitize_svg(content_bytes: bytes) -> bytes:
    """
    Parse and validate SVG vector content with strict parsed allowlist.
    Rejects:
    - DTD / DOCTYPE / XML entity declarations (XXE, entity expansion bombs)
    - Active content elements (<script>, <foreignObject>, <animate>, etc.)
    - Inline event handlers (onload, onclick, on*)
    - External references (http://, https://, //, data:, javascript: in href/src/use)
    - Dangerous CSS (@import, expression, external url())
    - Malformed XML
    
    Preserves:
    - Approved vector graphics, path definitions, gradient fills, and viewBox styling.
    """
    if not content_bytes:
        raise ValidationError("SVG content is empty.")

    try:
        raw_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            raw_text = content_bytes.decode("utf-16")
        except UnicodeDecodeError:
            raise ValidationError("SVG file contains invalid text encoding; must be UTF-8 or UTF-16.")

    # 1. Reject DOCTYPE / ENTITY declarations (XXE and billion-laughs prevention)
    upper_text = raw_text.upper()
    if "<!DOCTYPE" in upper_text or "<!ENTITY" in upper_text:
        raise ValidationError("SVG contains disallowed DOCTYPE or entity declarations (XXE protection).")
    if "<?XML-STYLESHEET" in upper_text or "<?IMPORT" in upper_text:
        raise ValidationError("SVG contains disallowed external stylesheet processing instructions.")

    # 2. Parse XML DOM
    try:
        parser = ET.XMLParser()
        root = ET.fromstring(content_bytes, parser=parser)
    except Exception as parse_err:
        raise ValidationError(f"Invalid or unparseable SVG XML: {str(parse_err)}")

    # Helper to strip namespace: '{http://www.w3.org/2000/svg}svg' -> 'svg'
    def _local_tag(tag: str) -> str:
        if "}" in tag:
            return tag.split("}", 1)[1].lower()
        return tag.lower()

    # 3. Verify root element is <svg>
    if _local_tag(root.tag) != "svg":
        raise ValidationError("Root element of SVG file must be <svg>.")

    # 4. Walk all elements in the parsed DOM
    for elem in root.iter():
        tag = _local_tag(elem.tag)
        if tag in DANGEROUS_SVG_TAGS or tag not in ALLOWED_SVG_TAGS:
            raise ValidationError(f"SVG contains disallowed element: <{tag}>.")

        # Validate attributes on this element
        for attr_raw, attr_val in list(elem.attrib.items()):
            attr_name = _local_tag(attr_raw).lower()
            val_clean = html.unescape(str(attr_val)).strip()
            val_lower = re.sub(r"[\s\x00-\x1f]", "", val_clean).lower()

            # Disallow any event handlers: on* (onload, onclick, onmouseover, etc.)
            if attr_name.startswith("on"):
                raise ValidationError(f"SVG contains disallowed inline event handler: '{attr_name}'.")

            if attr_name == "xml:base":
                raise ValidationError("SVG contains disallowed 'xml:base' attribute.")

            # Validate href, xlink:href, src
            if attr_name in ("href", "xlink:href", "src"):
                if val_lower.startswith(("javascript:", "vbscript:", "data:")):
                    raise ValidationError(f"SVG contains disallowed URI scheme in '{attr_name}'.")
                
                # In vector graphics, <use> and gradients only reference internal fragments: #id
                if tag in ("use", "lineargradient", "radialgradient", "clippath", "mask", "pattern"):
                    if not val_clean.startswith("#"):
                        raise ValidationError(f"SVG <{tag}> may only reference internal element IDs ('#id'); external references are rejected.")
                elif val_lower.startswith(("http://", "https://", "//")):
                    raise ValidationError(f"SVG contains disallowed external reference: '{val_clean}'.")

            # Check for active script protocols in any attribute value
            if "javascript:" in val_lower or "vbscript:" in val_lower:
                raise ValidationError(f"SVG contains active script protocol in attribute '{attr_name}'.")

            # Style attribute validation
            if attr_name == "style":
                _validate_css_content(val_clean)

        # If <style> tag, validate the inner CSS content
        if tag == "style":
            css_text = elem.text or ""
            _validate_css_content(css_text)

    # Return normalized valid bytes
    return content_bytes


def _validate_css_content(css: str) -> None:
    """Validate CSS rules within SVG style elements or attributes."""
    if not css:
        return
    css_lower = html.unescape(css).lower()
    
    if "@import" in css_lower:
        raise ValidationError("SVG style contains disallowed '@import' rule.")
    if "expression(" in css_lower or "-moz-binding" in css_lower or "behavior:" in css_lower:
        raise ValidationError("SVG style contains disallowed dynamic CSS expressions.")
    
    # Check url(...) references in CSS
    for match in _URL_PATTERN.finditer(css_lower):
        target = match.group(1).strip()
        cleaned_target = re.sub(r"[\s\x00-\x1f]", "", target)
        if cleaned_target.startswith(("javascript:", "vbscript:", "data:")):
            raise ValidationError("SVG style contains disallowed URI in url().")
        if cleaned_target.startswith(("http://", "https://", "//")):
            raise ValidationError("SVG style contains disallowed external reference in url().")
        # Allow internal fragment references like url(#gradientId)
        if not cleaned_target.startswith("#"):
            raise ValidationError(f"SVG style url() may only reference internal fragments ('#id'); got '{target}'.")
