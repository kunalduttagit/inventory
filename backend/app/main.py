import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from .config import settings
from .database import Base, engine
from .routers import customers, dashboard, orders, products


def _init_db(retries: int = 20, delay: float = 1.5) -> None:
    """Wait for Postgres to be reachable, then create tables."""
    last_err: Exception | None = None
    for _ in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError as e:
            last_err = e
            time.sleep(delay)
    raise RuntimeError(f"Database unreachable after {retries} attempts: {last_err}")


app = FastAPI(title="Inventory & Order Management", version="1.0.0")

origins = ["*"] if settings.cors_origins.strip() == "*" else [
    o.strip() for o in settings.cors_origins.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    _init_db()


app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"service": "inventory-api", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
