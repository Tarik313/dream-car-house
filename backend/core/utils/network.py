import ipaddress
from django.conf import settings


def _is_trusted_proxy(ip_str: str, trusted_list) -> bool:
    if not ip_str:
        return False
    if ip_str in trusted_list or "*" in trusted_list:
        return True
    try:
        ip_obj = ipaddress.ip_address(ip_str)
        for entry in trusted_list:
            try:
                if "/" in entry and ip_obj in ipaddress.ip_network(entry, strict=False):
                    return True
            except ValueError:
                continue
    except ValueError:
        return False
    return False


def get_client_ip(request) -> str:
    """
    Extract client IP address securely.
    
    Arbitrary HTTP_X_FORWARDED_FOR headers are NOT trusted by default to prevent
    header spoofing / throttling bypass.
    
    X-Forwarded-For is only parsed when:
    1. USE_X_FORWARDED_FOR is explicitly enabled in settings,
    2. NUM_PROXIES > 0 is configured, AND
    3. The direct connecting address (REMOTE_ADDR) is in TRUSTED_PROXY_IPS (supports exact IPs or CIDR networks).
    
    When trusted, it takes the rightmost untrusted hop (addrs[-min(NUM_PROXIES, len(addrs))]).
    Otherwise, REMOTE_ADDR is strictly returned.
    """
    remote_addr = (request.META.get("REMOTE_ADDR") or "").strip()
    
    use_xff = getattr(settings, "USE_X_FORWARDED_FOR", False)
    num_proxies = getattr(settings, "NUM_PROXIES", 0)
    trusted_proxies = getattr(
        settings,
        "TRUSTED_PROXY_IPS",
        {"127.0.0.1", "::1", "localhost"}
    )

    if use_xff and num_proxies > 0 and _is_trusted_proxy(remote_addr, trusted_proxies):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            addrs = [ip.strip() for ip in xff.split(",") if ip.strip()]
            if addrs:
                # Take the client IP preceding the trusted proxy chain
                candidate = addrs[-min(num_proxies, len(addrs))]
                try:
                    ipaddress.ip_address(candidate)
                    return candidate
                except ValueError:
                    pass

    if remote_addr:
        try:
            ipaddress.ip_address(remote_addr)
            return remote_addr
        except ValueError:
            pass

    return "127.0.0.1"
