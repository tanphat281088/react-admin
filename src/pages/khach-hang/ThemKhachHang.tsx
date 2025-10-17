import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { postData } from "../../services/postData.api";
import { useState } from "react";
import { Button, Form, Modal, Row, Space, message } from "antd";
import FormKhachHang from "./FormKhachHang";
import { useDispatch } from "react-redux";
import { setReload } from "../../redux/slices/main.slice";

const ThemKhachHang = ({ path, title }: { path: string; title: string }) => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLookup, setIsLookup] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onCreate = async (values: any) => {
    setIsLoading(true);
    const closeModel = () => {
      handleCancel();
      dispatch(setReload());
    };
    await postData(path, values, closeModel);
    setIsLoading(false);
  };

  // ===== Tra cứu SĐT (CRM) =====
  const handleLookupPhone = async () => {
    const phone = form.getFieldValue("so_dien_thoai");
    if (!phone) {
      message.warning("Vui lòng nhập số điện thoại trước khi tra cứu");
      return;
    }

    try {
      setIsLookup(true);
      const res = await fetch(
        `/api/khach-hang/lookup/phone?phone=${encodeURIComponent(phone)}`
      );
      const payload = await res.json();
      const data = payload?.data ?? payload;

      if (data?.found) {
        message.info(`Đã tồn tại: ${data.name} (${data.code})`);

        // Prefill các field nếu FormKhachHang có các tên trường tương ứng
        form.setFieldsValue({
          ten_khach_hang: data.name,
          so_dien_thoai: data.phone,
          ma_khach_hang: data.code, // nếu trong form có field read-only này
          hang_thanh_vien: data.tier,
          doanh_thu_tich_luy: data.total,
        });
      } else {
        message.success("Chưa có khách này, bạn có thể lưu tạo mới.");
      }
    } catch (e: any) {
      message.error(e?.message || "Lỗi tra cứu số điện thoại");
    } finally {
      setIsLookup(false);
    }
  };

  return (
    <>
      <Button
        onClick={showModal}
        type="primary"
        title={`Thêm ${title}`}
        icon={<PlusOutlined />}
      >
        Thêm {title}
      </Button>

      <Modal
        title={`Thêm ${title}`}
        open={isModalOpen}
        width={1000}
        onCancel={handleCancel}
        maskClosable={false}
        centered
        footer={[
          <Row justify="space-between" key="footer" style={{ width: "100%" }}>
            <Space>
              <Button
                icon={<SearchOutlined />}
                onClick={handleLookupPhone}
                loading={isLookup}
              >
                Tra cứu SĐT
              </Button>
            </Space>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button
                key="submit"
                form="formKhachHang"
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
              >
                Lưu
              </Button>
            </Space>
          </Row>,
        ]}
      >
        <Form id="formKhachHang" form={form} layout="vertical" onFinish={onCreate}>
          <FormKhachHang form={form} />
        </Form>
      </Modal>
    </>
  );
};

export default ThemKhachHang;
