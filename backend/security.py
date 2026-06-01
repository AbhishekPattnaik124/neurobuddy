from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

# Global rate limiter using in-memory storage (can be swapped for Redis backend in production)
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

def get_real_ip(request: Request):
    """Utility to get real IP if behind a proxy like Nginx"""
    return request.client.host
