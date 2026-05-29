from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Pipeline Builder API"
    app_version: str = "1.0.0"
    app_debug: bool = True
    api_prefix: str = "/api/v1"
    log_level: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
