from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Customer, Order, Product
from ..schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    low_stock = (
        db.query(Product)
        .filter(Product.quantity < settings.low_stock_threshold)
        .order_by(Product.quantity.asc())
        .all()
    )
    return DashboardStats(
        total_products=db.query(Product).count(),
        total_customers=db.query(Customer).count(),
        total_orders=db.query(Order).count(),
        low_stock_count=len(low_stock),
        low_stock_products=low_stock,
    )
