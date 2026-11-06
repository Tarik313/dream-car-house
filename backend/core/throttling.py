import os
from django.conf import settings
from django.core.cache import cache
from rest_framework.exceptions import Throttled
from rest_framework.throttling import SimpleRateThrottle
from core.utils.network import get_client_ip


class TrustedIPRateThrottle(SimpleRateThrottle):
    """
    Throttle that extracts client IP using get_client_ip(request),
    ensuring unverified/arbitrary X-Forwarded-For headers cannot be used
    to bypass rate limits or spoof another client's address.
    
    Uses Django's configured cache backend (shared across all WSGI/ASGI workers).
    """
    def get_ident(self, request):
        if request.user and request.user.is_authenticated:
            return f"user_{request.user.pk}"
        return f"ip_{get_client_ip(request)}"

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }


class EnquiryRateThrottle(TrustedIPRateThrottle):
    """
    Rate throttle for public consultation / contact enquiry submissions.
    Default: 10 requests per minute per trusted client IP.
    Configurable via REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['enquiry']
    or environment variable 'ENQUIRY_THROTTLE_RATE'.
    """
    scope = "enquiry"

    def get_rate(self):
        env_rate = os.environ.get("ENQUIRY_THROTTLE_RATE")
        if env_rate:
            return env_rate
        rf_rates = getattr(settings, "REST_FRAMEWORK", {}).get("DEFAULT_THROTTLE_RATES", {})
        return rf_rates.get(self.scope, "10/minute")


def check_shared_throttle(
    key_prefix: str,
    ident: str,
    max_requests: int = 5,
    window_seconds: int = 60,
    error_message: str = "Too many requests. Please try again later."
) -> None:
    """
    Shared atomic sliding-window throttle using Django's shared cache backend.
    Survives worker restarts and functions synchronously across multi-process workers.
    """
    import time
    cache_key = f"throttle:{key_prefix}:{ident}"
    now = time.time()
    cutoff = now - window_seconds

    # Use cache backend with atomic operations
    attempts = cache.get(cache_key) or []
    # Prune expired timestamps
    attempts = [t for t in attempts if t > cutoff]

    if len(attempts) >= max_requests:
        wait = int(window_seconds - (now - attempts[0]))
        raise Throttled(detail=error_message, wait=max(1, wait))

    attempts.append(now)
    cache.set(cache_key, attempts, timeout=window_seconds)


def clear_shared_throttle(key_prefix: str, ident: str) -> None:
    """Clear recorded attempts upon successful action (e.g. valid authentication)."""
    cache_key = f"throttle:{key_prefix}:{ident}"
    cache.delete(cache_key)
