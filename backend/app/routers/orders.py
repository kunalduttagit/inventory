from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Customer, Order, OrderItem, Product
from ..schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


def _load_order(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )


@router.get("", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
        .all()
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    product_ids = [item.product_id for item in payload.items]
    if len(set(product_ids)) != len(product_ids):
        raise HTTPException(status_code=400, detail="Each product may appear at most once per order")

    # Row-lock the involved products so concurrent orders can't oversell stock.
    products = (
        db.query(Product)
        .filter(Product.id.in_(product_ids))
        .with_for_update()
        .all()
    )
    by_id = {p.id: p for p in products}

    missing = [pid for pid in product_ids if pid not in by_id]
    if missing:
        raise HTTPException(status_code=404, detail=f"Product(s) not found: {missing}")

    total = Decimal("0.00")
    for item in payload.items:
        product = by_id[item.product_id]
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product.name}': "
                    f"requested {item.quantity}, available {product.quantity}"
                ),
            )
        total += Decimal(product.price) * item.quantity

    order = Order(customer_id=payload.customer_id, total_amount=total, status="confirmed")
    db.add(order)
    db.flush()

    for item in payload.items:
        product = by_id[item.product_id]
        product.quantity -= item.quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
        )

    db.commit()
    return _load_order(db, order.id)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock for each line item so cancelling never leaves inventory negative.
    for item in order.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .with_for_update()
            .first()
        )
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
