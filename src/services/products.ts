import api from './api';
import type { Product } from '../types/models';

export async function searchProducts(params: {
  keyword?: string;
  danh_muc_id?: number;
  page?: number;
  per_page?: number;
}) {
  const { data } = await api.get('/san-pham/search-popup', { params });
  // API bọc trong { success, data: { data, meta } }
  const payload = data?.data ?? {};
  return {
    items: (payload.data || []) as Product[],
    meta: payload.meta ?? { total: 0, per_page: 20, current: 1, last_page: 1 },
  };
}
