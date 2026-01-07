from __future__ import annotations

from contextlib import contextmanager


class SimpleCircuitBreaker:
    @contextmanager
    def calling(self):
        yield


circuit_breaker = SimpleCircuitBreaker()
