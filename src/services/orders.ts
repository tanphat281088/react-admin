import api from './api';

export async function addCatalogLine(orderId: number, payload: {
  product_id: number;
  qty: number;
  price_mode: 'PREORDER' | 'INSTANT' | 'CUSTOM';
  price_snapshot?: number; // bắt buộc nếu CUSTOM
}) {
  const { data } = await api.post(`/quan-ly-ban-hang/${orderId}/items/catalog`, payload);
  return data?.data;
}

export async function addCustomLine(orderId: number, payload: {
  custom_name: string;
  qty: number;
  price_snapshot: number;
  custom_image_url?: string;
  custom_desc?: string;
}) {
  const { data } = await api.post(`/quan-ly-ban-hang/${orderId}/items/custom`, payload);
  return data?.data;
}

export async function applyPricePlan(orderId: number, plan: 'PREORDER' | 'INSTANT') {
  const { data } = await api.post(`/quan-ly-ban-hang/${orderId}/apply-price-plan`, { plan });
  return data?.data;
}
