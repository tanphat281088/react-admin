/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Divider,
  type FormInstance,
  message,
} from "antd";
import { formatter, parser } from "../../utils/utils";
import { phonePattern } from "../../utils/patterns";
import { getListData } from "../../services/getData.api";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";

type Staff  = { id: number; name: string };
type LKH    = { id: number; ten_loai_khach_hang: string };

const FormKhachHang = ({ form }: { form: FormInstance }) => {
  const [loadingOpts, setLoadingOpts] = React.useState(false);
  const [statuses, setStatuses]   = React.useState<string[]>([]); // Tình trạng khách (tên mới của pipeline)
  const [channels, setChannels]   = React.useState<string[]>([]);
  const [staff, setStaff]         = React.useState<Staff[]>([]);
  const [types, setTypes]         = React.useState<LKH[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingOpts(true);
        // Lấy options từ API (đã sửa backend trả {statuses, pipelines, channels, staff, types})
        const res = await getListData(`${API_ROUTE_CONFIG.KHACH_HANG}/options`, {});
        const data = (res?.data?.data) ?? (res?.data) ?? res ?? {};

        if (!mounted) return;
        setStatuses(data?.statuses ?? data?.pipelines ?? []); // tương thích ngược
        setChannels(data?.channels ?? []);
        setStaff(data?.staff ?? []);
        setTypes(data?.types ?? []);
      } catch (e: any) {
        message.error(e?.message || "Lỗi tải danh mục (tình trạng/kênh/nhân sự/loại KH)");
      } finally {
        if (mounted) setLoadingOpts(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Row gutter={[10, 10]}>
      {/* ===== Thông tin cơ bản ===== */}
      <Col span={12}>
        <Form.Item
          name="ten_khach_hang"
          label="Tên khách hàng"
          rules={[{ required: true, message: "Tên khách hàng không được bỏ trống!" }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: "email", message: "Email không hợp lệ!" }, // KHÔNG bắt buộc
          ]}
        >
          <Input placeholder="Nhập email (không bắt buộc)" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="so_dien_thoai"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Số điện thoại không được bỏ trống!" },
            { pattern: phonePattern, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="dia_chi"
          label="Địa chỉ"
        >
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item name="ghi_chu" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
        </Form.Item>
      </Col>

      {/* ===== CRM: Tình trạng khách / Kênh liên hệ / Nhân sự / Loại KH ===== */}
      <Col span={12}>
        <Form.Item name="tinh_trang_khach" label="Tình trạng khách">
          <Select
            allowClear
            loading={loadingOpts}
            placeholder="Chọn tình trạng"
            options={statuses.map((s) => ({ value: s, label: s }))}
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="kenh_lien_he" label="Kênh liên hệ">
          <Select
            allowClear
            loading={loadingOpts}
            placeholder="Chọn kênh liên hệ"
            options={channels.map((c) => ({ value: c, label: c }))}
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="staff_id" label="Nhân viên phụ trách">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            loading={loadingOpts}
            placeholder="Chọn nhân viên"
            options={staff.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="loai_khach_hang_id" label="Loại khách hàng (tính theo doanh thu)">
          <Select
            allowClear
            loading={loadingOpts}
            placeholder="Chọn loại khách hàng"
            options={types.map((t) => ({ value: t.id, label: t.ten_loai_khach_hang }))}
          />
        </Form.Item>
      </Col>

      {/* ===== Chỉ đọc (nếu có dữ liệu khi Sửa / sau khi recalc) ===== */}
      <Col span={24}>
        <Divider style={{ margin: "8px 0" }} />
      </Col>

      <Col span={12}>
        <Form.Item name="ma_khach_hang" label="Mã khách hàng">
          <Input disabled placeholder="Tự sinh khi tạo" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="doanh_thu_tich_luy" label="Doanh thu tích lũy">
          <InputNumber
            disabled
            style={{ width: "100%" }}
            formatter={formatter}
            parser={parser}
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="diem_tich_luy" label="Điểm tích lũy">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item name="ngay_cap_nhat_hang" label="Ngày cập nhật loại khách">
          <Input disabled placeholder="Tự cập nhật khi tính lại" />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default FormKhachHang;
