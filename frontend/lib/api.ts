const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail: string = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.detail === 'string') detail = body.detail;
      else if (Array.isArray(body?.detail)) detail = body.detail.map((d: { msg?: string }) => d.msg || '').join(', ');
      else detail = JSON.stringify(body);
    } catch {
      /* response body is not JSON */
    }
    throw new Error(detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const fetcher = <T>(path: string) => api<T>(path);

export type Product = {
  id: number;
  name: string;
  sku: string;
  price: string;
  quantity: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
};

export type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  product: Product | null;
};

export type Order = {
  id: number;
  customer_id: number;
  total_amount: string;
  status: string;
  created_at: string;
  items: OrderItem[];
  customer: Customer | null;
};

export type DashboardStats = {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_count: number;
  low_stock_products: Product[];
};
