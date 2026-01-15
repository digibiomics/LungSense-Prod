from __future__ import annotations
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from datetime import datetime, timedelta, timezone

MAX_REQUESTS = 10000
TIME_WINDOW = 60  # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    """High-throughput in-memory rate limiting based on IP + time window"""
    _request_log: dict[str, list[datetime]] = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        now = datetime.now(timezone.utc)
        window_start = now - timedelta(seconds=TIME_WINDOW)

        # Initialize if IP not seen before
        if client_ip not in self._request_log:
            self._request_log[client_ip] = []

        # Remove outdated timestamps outside the time window
        self._request_log[client_ip] = [
            ts for ts in self._request_log[client_ip] if ts > window_start
        ]

        # Check current count
        if len(self._request_log[client_ip]) >= MAX_REQUESTS:
            retry_in = int((self._request_log[client_ip][0] - window_start).total_seconds())
            detail = {
                "error": "Too Many Requests",
                "message": f"Rate limit exceeded. Try again in {retry_in} seconds."
            }
            return JSONResponse(status_code=429, content=detail)

        # Log the new request timestamp
        self._request_log[client_ip].append(now)

        response = await call_next(request)
        return response
