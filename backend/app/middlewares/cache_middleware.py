from __future__ import annotations
import re

from fastapi import Request
from starlette.concurrency import iterate_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse, Response


from app.config.base import settings  # intact ✔
from app.wrappers.cache_wrappers import CacheWrapper  # correct import ✔


class CacheMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, cached_endpoints: list[str]):
        super().__init__(app)
        self.cached_endpoints = cached_endpoints

    def matches_any_path(self, path: str) -> bool:
        return any(ep in path for ep in self.cached_endpoints)

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        method = request.method
        cache_control = request.headers.get("Cache-Control")
        auth = request.headers.get("Authorization")
        token = auth.split(" ")[1] if auth and " " in auth else "public"

        key = f"{path}_{token}"
        matches = self.matches_any_path(path)

        # Skip caching for non-GET
        if method != "GET":
            if matches:
                await CacheWrapper.invalidate_cache(key)
            return await call_next(request)

        # Try cache
        stored, expire = await CacheWrapper.retrieve_cache(key)
        if stored and cache_control != "no-cache":
            return StreamingResponse(
                iter([stored]),
                media_type="application/json",
                headers={"Cache-Control": f"max-age={expire}"}
            )

        # Process API
        response = await call_next(request)
        body_chunks = [chunk async for chunk in response.body_iterator]
        response.body_iterator = iterate_in_threadpool(iter(body_chunks))

        # Store cache if 200 OK
        if response.status_code == 200:
            if cache_control == "no-store":
                return response

            age = re.search(r"max-age=(\d+)", cache_control or "")
            if age:
                await CacheWrapper.create_cache(body_chunks[0].decode(), key, int(age.group(1)))

            elif matches:
                await CacheWrapper.create_cache(body_chunks[0].decode(), key, settings.CACHE_MAX_AGE)

        return response
