export type PriceMode = 'PREORDER' | 'INSTANT' | 'CUSTOM';

export interface Product {
  id: number;
  ma_san_pham: string;
  ten_san_pham: string;
  gia_chinh: number;     // Giá đặt trước 3 ngày
  gia_dat_ngay: number;  // Giá đặt ngay
  discount_percent?: number | null;
  image_primary_url?: string | null;
}

export interface OrderItemPayload {
  product_id?: number | null;
  qty: number;
  price_mode: PriceMode;
  price_snapshot: number; // giá chốt
  // custom:
  is_custom?: boolean;
  custom_sku?: string;
  custom_name?: string;
  custom_desc?: string;
  custom_image_url?: string;
}
