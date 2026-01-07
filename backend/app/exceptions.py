class CentryTestException(Exception):
    """Simple sentinel exception used for Sentry test endpoint."""
    pass


class DatabaseConnectionException(Exception):
    """Raised when database connection fails."""
    pass