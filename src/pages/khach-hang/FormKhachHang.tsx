/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Row, Col, Form, Input, InputNumber, Select, type FormInstance, Divider, message,
} from "antd";
import { formatter, parser } from "../../utils/utils";
import { phonePattern } from "../../utils/patterns";
import { getListData } from "../../services/getData.api";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";

type Staff = { id: number; name: string };
type TypeItem = { id: number; ten_loai_khach_hang: string };

const FormKhachHang = ({ form }: { form: FormInstance }) => {
  const [pipelines, setPipelines] = React.useState<string[]>([]);
  const [channels, setChannels] = React.useState<string[]>([]);
  const [staff, setStaff]       = React.useState<Staff[]>([]);
  const [types, setTypes]       = React.useState<TypeItem[]>([]);
  const [loadingOpts, setLoadingOpts] = React.useState<boolean>(false);

  // chỉ áp dụng dữ liệu hợp lệ 1 lần đầu; không ghi đè bằng rỗng
  const appliedOnce = React.useRef(false);

  // Chuẩn hoá mọi kiểu payload: res.data.data | res.data | res
  const parseOptions = (raw: any) => {
    const root = raw?.data ?? raw;
    const data = root?.data ?? root;
    // eslint-disable-next-line no-console
    console.log("[KH options][parsed]", { raw, root, data });
    return {
      pipelines: Array.isArray(data?.pipelines) ? data.pipelines : [],
      channels : Array.isArray(data?.channels)  ? data.channels  : [],
      staff    : Array.isArray(data?.staff)     ? data.staff     : [],
      types    : Array.isArray(data?.types)     ? data.types     : [],
    };
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingOpts(true);

        // Gọi endpoint CHUẨN có JWT (axios service của bạn)
        const res = await getListData(`${API_ROUTE_CONFIG.KHACH_HANG}/options`, {});
        if (!mounted) return;
        const ok = parseOptions(res);

        // Nếu có dữ liệu hợp lệ => set state + đánh dấu đã áp dụng
        const hasData =
          ok.pipelines.length || ok.channels.length || ok.staff.length || ok.types.length;
        if (hasData) {
          setPipelines(ok.pipelines);
          setChannels(ok.channels);
          setStaff(ok.staff);
          setTypes(ok.types);
          appliedOnce.current = true;
          return;
        }

        // Fallback (tuỳ chọn): nếu rỗng thì thử route public để bạn vẫn thấy dropdown
        try {
          const pub = await getListData(`http://localhost:8000/api/public/options`, {});
          if (!mounted) return;
          const alt = parseOptions(pub);
          const altHas = alt.pipelines.length || alt.channels.length || alt.staff.length || alt.types.length;
          if (altHas) {
            setPipelines(alt.pipelines);
            setChannels(alt.channels);
            setStaff(alt.staff);
            setTypes(alt.types);
            appliedOnce.current = true;
          }
        } catch (_) { /* ignore */ }
      } catch (e: any) {
        message.error(e?.message || "Lỗi tải danh mục (pipelines/channels/staff/types)");
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
          name="ten_khach_hang" label="Tên khách hàng"
          rules={[{ required: true, message: "Tên khách hàng không được bỏ trống!" }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="email" label="Email"
          rules={[
            { required: true, message: "Email không được bỏ trống!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="so_dien_thoai" label="Số điện thoại"
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
          name="dia_chi" label="Địa chỉ"
          rules={[{ required: true, message: "Địa chỉ không được bỏ trống!" }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item name="ghi_chu" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
        </Form.Item>
      </Col>

      {/* ===== CRM fields ===== */}
      <Col span={12}>
        <Form.Item name="pipeline" label="Pipeline">
          <Select
            allowClear
            loading={loadingOpts}
            placeholder="Chọn pipeline"
            options={pipelines.map((p) => ({ value: p, label: p }))}
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
        <Form.Item name="loai_khach_hang_id" label="Loại khách hàng (VIP)">
          <Select
            allowClear
            loading={loadingOpts}
            placeholder="Chọn loại khách hàng"
            options={types.map((t) => ({ value: t.id, label: t.ten_loai_khach_hang }))}
          />
        </Form.Item>
      </Col>

      {/* ===== Readonly ===== */}
      <Col span={24}><Divider style={{ margin: "8px 0" }} /></Col>

      <Col span={12}>
        <Form.Item name="ma_khach_hang" label="Mã khách hàng">
          <Input disabled placeholder="Tự sinh khi tạo" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="hang_thanh_vien" label="Hạng thành viên">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="doanh_thu_tich_luy" label="Doanh thu tích lũy">
          <InputNumber disabled style={{ width: "100%" }} formatter={formatter} parser={parser} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="diem_tich_luy" label="Điểm tích lũy">
          <InputNumber disabled style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="ngay_cap_nhat_hang" label="Ngày cập nhật hạng">
          <Input disabled placeholder="Tự cập nhật khi tính lại" />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default FormKhachHang;
