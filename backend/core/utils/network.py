import ipaddress
from django.conf import settings


def get_client_ip(request) -> str:
    """
    Extract client IP address securely.
    
    Arbitrary HTTP_X_FORWARDED_FOR headers are NOT trusted by default to prevent
    header spoofing / throttling bypass.
    
    X-Forwarded-For is only parsed when:
    1. USE_X_FORWARDED_FOR is explicitly enabled in settings,
    2. NUM_PROXIES > 0 is configured, AND
    3. The direct connecting address (REMOTE_ADDR) is in TRUSTED_PROXY_IPS.
    
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

    if use_xff and num_proxies > 0 and remote_addr in trusted_proxies:
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
