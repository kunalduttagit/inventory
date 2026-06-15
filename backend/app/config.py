from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://root:root@localhost:5432/inventory"
    cors_origins: str = "*"
    low_stock_threshold: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
