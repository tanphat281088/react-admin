import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import FormKhachHang from "./FormKhachHang";
import { Button, Form, Modal, Row, Space, Spin, message } from "antd";
import { useDispatch } from "react-redux";
import { getDataById } from "../../services/getData.api";
import { setReload } from "../../redux/slices/main.slice";
import { putData } from "../../services/updateData";

const SuaKhachHang = ({
  path,
  id,
  title,
}: {
  path: string;
  id: number;
  title: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);       // loading khi fetch bản ghi
  const [isSubmitting, setIsSubmitting] = useState(false); // loading khi lưu
  const [isRecalc, setIsRecalc] = useState(false);         // loading khi tính lại
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const loadRecord = async () => {
    setIsLoading(true);
    try {
      const data = await getDataById(id, path);
      form.setFieldsValue({ ...data });
    } catch (e: any) {
      message.error(e?.message || "Lỗi tải dữ liệu khách hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const showModal = async () => {
    setIsModalOpen(true);
    await loadRecord();
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const onUpdate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const closeModel = () => {
        handleCancel();
        dispatch(setReload());
      };
      await putData(path, id, values, closeModel);
      message.success("Cập nhật thành công");
    } catch (e: any) {
      message.error(e?.message || "Lỗi cập nhật");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Ép tính lại doanh thu/điểm/hạng & reload form ===
  const onRecalc = async () => {
    setIsRecalc(true);
    try {
      const res = await fetch(`/api/khach-hang/${id}/recalc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(await res.text());
      message.success("Đã tính lại tổng/điểm/hạng");
      await loadRecord(); // nạp lại dữ liệu vào form
    } catch (e: any) {
      message.error(e?.message || "Lỗi tính lại");
    } finally {
      setIsRecalc(false);
    }
  };

  return (
    <>
      <Button
        onClick={showModal}
        type="primary"
        size="small"
        title={`Sửa ${title}`}
        icon={<EditOutlined />}
      />
      <Modal
        title={`Sửa ${title}`}
        open={isModalOpen}
        onCancel={handleCancel}
        maskClosable={false}
        centered
        width={1000}
        footer={
          <Row justify="space-between" style={{ width: "100%" }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={onRecalc}
                loading={isRecalc}
              >
                Tính lại
              </Button>
            </Space>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button
                key="submit"
                form={`formSuaKhachHang-${id}`}
                type="primary"
                htmlType="submit"
                size="large"
                loading={isSubmitting}
              >
                Lưu
              </Button>
            </Space>
          </Row>
        }
      >
        <Spin spinning={isLoading}>
          <Form
            id={`formSuaKhachHang-${id}`}
            form={form}
            layout="vertical"
            onFinish={onUpdate}
          >
            <FormKhachHang form={form} />
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default SuaKhachHang;
