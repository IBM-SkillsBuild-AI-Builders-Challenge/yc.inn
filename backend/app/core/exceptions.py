from fastapi import Request
from fastapi.responses import JSONResponse
from loguru import logger


class PipelineError(Exception):
    """Base pipeline exception."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class GraphValidationError(PipelineError):
    """Raised when graph validation fails."""

    def __init__(self, message: str = "Invalid graph structure"):
        super().__init__(message, status_code=422)


class MalformedPipelineError(PipelineError):
    """Raised when pipeline data is malformed."""

    def __init__(self, message: str = "Malformed pipeline data"):
        super().__init__(message, status_code=422)


async def pipeline_exception_handler(request: Request, exc: PipelineError) -> JSONResponse:
    logger.error(f"Pipeline error: {exc.message}")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})
