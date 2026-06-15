from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=64)
    price: Decimal = Field(ge=0)
    quantity: int = Field(ge=0)
    description: Optional[str] = Field(default=None, max_length=1000)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=64)
    price: Optional[Decimal] = Field(default=None, ge=0)
    quantity: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = Field(default=None, max_length=1000)


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=32)


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemIn] = Field(min_length=1)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product: Optional[ProductOut] = None

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemOut]
    customer: Optional[CustomerOut] = None

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    low_stock_products: List[ProductOut]
