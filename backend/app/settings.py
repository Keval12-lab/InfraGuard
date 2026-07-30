import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    app_name: str
    cors_origins: list[str]

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv()
        origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        return cls(
            app_name=os.getenv("APP_NAME", "InfraGuard"),
            cors_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
        )