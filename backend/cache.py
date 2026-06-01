from cachetools import TTLCache
import hashlib
import json

# Cache for up to 1000 items, expires after 1 hour (3600 seconds)
ai_cache = TTLCache(maxsize=1000, ttl=3600)

def generate_cache_key(prefix: str, **kwargs):
    """Generate a unique SHA-256 hash key based on the input payload."""
    payload = json.dumps(kwargs, sort_keys=True)
    return f"{prefix}_{hashlib.sha256(payload.encode()).hexdigest()}"

def get_from_cache(key: str):
    return ai_cache.get(key)

def set_in_cache(key: str, value):
    ai_cache[key] = value
