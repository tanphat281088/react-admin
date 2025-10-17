import { Modal, Tabs, Input, Table, Button, Form, Space } from 'antd';
import { useEffect, useState } from 'react';
import { searchProducts } from '../../services/products';
import { addCatalogLine, addCustomLine } from '../../services/orders';
import ImageWithFallback from '../common/ImageWithFallback';
import PriceModeToggle from '../common/PriceModeToggle';
import MoneyInput from '../common/MoneyInput';
import type { Product, PriceMode } from '../../types/models';

export default function ProductPicker({
  open, onClose, orderId, defaultQty = 1, onAdded, onPick,
}: {
  open: boolean;
  onClose: () => void;
  orderId: number;                 // nếu 0/undefined => LOCAL MODE
  defaultQty?: number;
  onAdded?: () => void;            // dùng cho SERVER MODE: gọi xong API thì reload bên ngoài
  onPick?: (line: any) => void;    // dùng cho LOCAL MODE: trả 1 object để add vào Form.List
}) {
  const [tab, setTab] = useState('catalog');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [priceMode, setPriceMode] = useState<PriceMode>('INSTANT');

  async function fetch() {
    setLoading(true);
    try {
      const { items, meta } = await searchProducts({ keyword, page, per_page: perPage });
      setRows(items);
      setTotal(meta.total || 0);
    } finally { setLoading(false); }
  }

  useEffect(() => { if (open && tab === 'catalog') fetch(); }, [open, tab, keyword, page]);

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_primary_url',
      render: (v: string, r: Product) => <ImageWithFallback src={v} alt={r.ten_san_pham} />,
      width: 80,
    },
    { title: 'Mã', dataIndex: 'ma_san_pham', width: 120 },
    { title: 'Tên', dataIndex: 'ten_san_pham' },
    {
      title: 'Đặt trước 3 ngày',
      dataIndex: 'gia_chinh',
      align: 'right',
      render: (v: number) => v?.toLocaleString(),
      width: 150
    },
    {
      title: 'Đặt ngay',
      dataIndex: 'gia_dat_ngay',
      align: 'right',
      render: (v: number) => v?.toLocaleString(),
      width: 150
    },
    {
      title: '% chênh',
      dataIndex: 'discount_percent',
      align: 'right',
      width: 90,
      render: (v: number | null) => (v ? `${v}%` : '-'),
    },
    {
      title: 'Chọn',
      key: 'act',
      width: 120,
      render: (_: any, r: Product) => (
        <Space>
          <Button type="primary" onClick={() => handlePickCatalog(r)}>Thêm</Button>
        </Space>
      ),
    },
  ];

  async function handlePickCatalog(p: Product) {
    // === SERVER MODE: đã có orderId -> gọi API tạo dòng trên server ===
    if (orderId && orderId > 0) {
      const payload: any = { product_id: p.id, qty: defaultQty, price_mode: priceMode };
      if (priceMode === 'CUSTOM') {
        // tùy chỉnh: tạm dùng giá đặt ngay làm mặc định, NV sẽ chỉnh tiếp ở dòng
        payload.price_snapshot = p.gia_dat_ngay || p.gia_chinh || 0;
      }
      await addCatalogLine(orderId, payload);
      onAdded?.();
      onClose();
      return;
    }

    // === LOCAL MODE: chưa có orderId -> trả object cho Form.List ===
    const snapshot =
      priceMode === 'PREORDER' ? (p.gia_chinh || 0) :
      priceMode === 'INSTANT'  ? (p.gia_dat_ngay || 0) :
                                 (p.gia_dat_ngay || p.gia_chinh || 0); // CUSTOM → mặc định = giá đặt ngay

    onPick?.({
      // mapping theo form hiện tại của bạn
      san_pham_id: p.id,
      ten_san_pham: p.ten_san_pham,
      so_luong: defaultQty,
      price_mode: priceMode,     // metadata để khi lưu gửi đúng lên server
      don_gia: snapshot,         // ⚠️ form của bạn đang tính tổng theo 'don_gia'
      price_snapshot: snapshot,  // để BE nhận snapshot đúng khi submit
      is_custom: false,
    });
    onClose();
  }

  return (
    <Modal open={open} onCancel={onClose} width={900} title="Chọn sản phẩm" footer={null} destroyOnClose>
      <Tabs activeKey={tab} onChange={setTab}>
        <Tabs.TabPane tab="Danh mục" key="catalog">
          <Space style={{ marginBottom: 12 }} align="baseline">
            <Input.Search
              placeholder="Tìm theo tên/mã"
              allowClear
              onSearch={(v) => { setKeyword(v); setPage(1); }}
              style={{ width: 320 }}
            />
            <PriceModeToggle value={priceMode} onChange={setPriceMode} />
          </Space>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={rows}
            columns={columns as any}
            pagination={{
              current: page,
              pageSize: perPage,
              total,
              onChange: (p) => setPage(p),
            }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Mẫu khách" key="custom">
          <Form
            layout="vertical"
            onFinish={async (values) => {
              const payload = {
                custom_name: values.custom_name,
                qty: values.qty ?? 1,
                price_snapshot: values.price_snapshot,
                custom_image_url: values.custom_image_url,
                custom_desc: values.custom_desc,
              };

              // SERVER MODE
              if (orderId && orderId > 0) {
                await addCustomLine(orderId, payload);
                onAdded?.();
                onClose();
                return;
              }

              // LOCAL MODE
              onPick?.({
                san_pham_id: null,
                ten_san_pham: values.custom_name,
                so_luong: values.qty ?? 1,
                price_mode: 'CUSTOM',
                don_gia: values.price_snapshot,        // giữ tương thích công thức hiện tại
                price_snapshot: values.price_snapshot, // để submit BE chuẩn
                is_custom: true,
                custom_name: values.custom_name,
                custom_image_url: values.custom_image_url,
                custom_desc: values.custom_desc,
              });
              onClose();
            }}
            initialValues={{ qty: defaultQty, price_snapshot: 0 }}
          >
            <Form.Item label="Tên mẫu (bắt buộc)" name="custom_name" rules={[{ required: true, message: 'Nhập tên mẫu' }]}>
              <Input placeholder="VD: Mẫu KH - Bouquet xanh 45cm" />
            </Form.Item>
            <Form.Item label="Giá chốt (bắt buộc)" name="price_snapshot" rules={[{ required: true, message: 'Nhập giá' }, { type: 'number', min: 1 }]}>
              <MoneyInput />
            </Form.Item>
            <Form.Item label="Số lượng" name="qty" rules={[{ type: 'number', min: 1 }]}>
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item label="Ảnh URL" name="custom_image_url">
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item label="Ghi chú" name="custom_desc">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Space>
              <Button onClick={onClose}>Hủy</Button>
              <Button type="primary" htmlType="submit">Thêm dòng CUSTOM</Button>
            </Space>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
}
