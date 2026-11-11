import logging
import os
from typing import Iterable, Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def trigger_next_revalidation(
    *,
    paths: Optional[Iterable[str]] = None,
    tags: Optional[Iterable[str]] = None,
    timeout: float = 1.5,
) -> bool:
    """
    Notify the Next.js frontend /api/revalidate endpoint to purge cached pages/tags.
    Fails softly so backend saves/admin edits never crash if frontend is offline.
    """
    if os.environ.get("SKIP_REVALIDATE", "").strip().lower() in ("1", "true", "yes"):
        return False

    secret = getattr(settings, "REVALIDATE_SECRET", "") or os.environ.get("REVALIDATE_SECRET", "")
    if not secret:
        return False

    url = (
        getattr(settings, "NEXT_REVALIDATE_URL", "")
        or os.environ.get("NEXT_REVALIDATE_URL", "")
        or "http://frontend:3000/api/revalidate/"
    )
    if url.endswith("/api/revalidate"):
        url = f"{url}/"

    clean_paths = list(dict.fromkeys(p for p in (paths or []) if p))
    clean_tags = list(dict.fromkeys(t for t in (tags or []) if t))
    if not clean_paths and not clean_tags:
        return False

    params: list[tuple[str, str]] = [("secret", secret)]
    for path in clean_paths:
        params.append(("path", path))
    for tag in clean_tags:
        params.append(("tag", tag))

    try:
        res = requests.get(url, params=params, timeout=timeout)
        return res.ok
    except Exception as exc:
        logger.debug("Next.js revalidation ping skipped/failed (%s): %s", url, exc)
        return False
