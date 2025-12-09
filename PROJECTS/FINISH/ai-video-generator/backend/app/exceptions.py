"""Custom exceptions for the application."""

from typing import Any, Optional


class VideoGeneratorException(Exception):
    """Base exception for video generator application."""

    def __init__(
        self,
        message: str,
        error_code: str,
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ResourceNotFoundException(VideoGeneratorException):
    """Exception raised when a resource is not found."""

    def __init__(self, resource_type: str, resource_id: str, details: Optional[dict] = None):
        super().__init__(
            message=f"{resource_type} with id '{resource_id}' not found",
            error_code="RESOURCE_NOT_FOUND",
            status_code=404,
            details=details or {"resource_type": resource_type, "resource_id": resource_id},
        )


class ResourceConflictException(VideoGeneratorException):
    """Exception raised when a resource conflict occurs."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="RESOURCE_CONFLICT",
            status_code=409,
            details=details,
        )


class ValidationException(VideoGeneratorException):
    """Exception raised for validation errors."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=400,
            details=details,
        )


class ScriptParsingException(VideoGeneratorException):
    """Exception raised when script parsing fails."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="SCRIPT_PARSING_ERROR",
            status_code=422,
            details=details,
        )


class ImageGenerationException(VideoGeneratorException):
    """Exception raised when image generation fails."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="IMAGE_GENERATION_ERROR",
            status_code=500,
            details=details,
        )


class VideoAssemblyException(VideoGeneratorException):
    """Exception raised when video assembly fails."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="VIDEO_ASSEMBLY_ERROR",
            status_code=500,
            details=details,
        )


class StorageException(VideoGeneratorException):
    """Exception raised for storage-related errors."""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="STORAGE_ERROR",
            status_code=500,
            details=details,
        )


class AuthenticationException(VideoGeneratorException):
    """Exception raised for authentication errors."""

    def __init__(self, message: str = "Authentication required", details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=401,
            details=details,
        )


class AuthorizationException(VideoGeneratorException):
    """Exception raised for authorization errors."""

    def __init__(self, message: str = "Insufficient permissions", details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            status_code=403,
            details=details,
        )


class RateLimitException(VideoGeneratorException):
    """Exception raised when rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded", details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details=details,
        )
