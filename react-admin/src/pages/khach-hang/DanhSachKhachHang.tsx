/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { User } from "../../types/user.type";
import useColumnSearch from "../../hooks/useColumnSearch";
import { getListData } from "../../services/getData.api";
import {
  createFilterQueryFromArray,
  formatVietnameseCurrency,
} from "../../utils/utils";
import { Col, Flex, Row, Space, Tag } from "antd";
import SuaKhachHang from "./SuaKhachHang";
import Delete from "../../components/Delete";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "../../components/CustomTable";
import type { RootState } from "../../redux/store";
import { usePagination } from "../../hooks/usePagination";
import type { Actions } from "../../types/main.type";
import ExportTableToExcel from "../../components/ExportTableToExcel";
import { OPTIONS_STATUS } from "../../utils/constant";
import dayjs from "dayjs";
import ImportExcel from "../../components/ImportExcel";
import { API_ROUTE_CONFIG } from "../../configs/api-route-config";

const DanhSachKhachHang = ({
  path,
  permission,
  title,
}: {
  path: string;
  permission: Actions;
  title: string;
}) => {
  const dispatch = useDispatch();
  const isReload = useSelector((state: RootState) => state.main.isReload);

  const [danhSach, setDanhSach] = useState<
    { data: User[]; total: number } | undefined
  >({ data: [], total: 0 });

  const { filter, handlePageChange, handleLimitChange } = usePagination({
    page: 1,
    limit: 20,
  });

  const {
    inputSearch,
    query,
    dateSearch,
    selectSearch,
    selectSearchWithOutApi,
  } = useColumnSearch();

  const [isLoading, setIsLoading] = useState(false);

  const getDanhSach = async () => {
    setIsLoading(true);
    const params = { ...filter, ...createFilterQueryFromArray(query) };
    const ds = await getListData(path, params);
    if (ds) setIsLoading(false);
    setDanhSach(ds);
  };

  const defaultColumns: any = [
    {
      title: "STT",
      dataIndex: "index",
      align: "right",
      width: 70,
      render: (_: any, __: any, index: number) =>
        filter.limit && (filter.page - 1) * filter.limit + index + 1,
    },
    {
      title: "Thao tác",
      dataIndex: "id",
      align: "center",
      width: 120,
      fixed: "left",
      render: (id: number) => (
        <Space size={4}>
          {permission.edit && <SuaKhachHang path={path} id={id} title={title} />}
          {permission.delete && <Delete path={path} id={id} onShow={getDanhSach} />}
        </Space>
      ),
    },

    // ===== CÁC CỘT CHÍNH =====
    {
      title: "Mã KH",
      dataIndex: "ma_khach_hang",
      width: 110,
      ...inputSearch({
        dataIndex: "ma_khach_hang",
        operator: "contain",
        nameColumn: "Mã KH",
      }),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "ten_khach_hang",
      width: 220,
      ...inputSearch({
        dataIndex: "ten_khach_hang",
        operator: "contain",
        nameColumn: "Tên khách hàng",
      }),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 260,
      ...inputSearch({
        dataIndex: "email",
        operator: "contain",
        nameColumn: "Email",
      }),
    },
    {
      title: "Số điện thoại",
      dataIndex: "so_dien_thoai",
      width: 140,
      ...inputSearch({
        dataIndex: "so_dien_thoai",
        operator: "contain",
        nameColumn: "Số điện thoại",
      }),
    },
    {
      title: "Địa chỉ",
      dataIndex: "dia_chi",
      width: 260,
      ...inputSearch({
        dataIndex: "dia_chi",
        operator: "contain",
        nameColumn: "Địa chỉ",
      }),
    },

    // ===== ĐỔI PIPELINE → TÌNH TRẠNG KHÁCH =====
    {
      title: "Tình trạng khách",
      dataIndex: "tinh_trang_khach",
      width: 170,
      ...inputSearch({
        dataIndex: "tinh_trang_khach",
        operator: "contain",
        nameColumn: "Tình trạng khách",
      }),
    },

    // ===== KÊNH & NHÂN SỰ =====
    {
      title: "Kênh liên hệ",
      dataIndex: "kenh_lien_he",
      width: 150,
      ...inputSearch({
        dataIndex: "kenh_lien_he",
        operator: "contain",
        nameColumn: "Kênh liên hệ",
      }),
    },
    {
      title: "Nhân viên phụ trách",
      dataIndex: "staff_name",
      width: 180,
      ...inputSearch({
        dataIndex: "staff_name",
        operator: "contain",
        nameColumn: "Nhân viên phụ trách",
      }),
    },

    // ===== LOẠI KHÁCH HÀNG (hạng theo doanh thu) =====
    {
      title: "Loại khách hàng",
      dataIndex: "loai_khach_hang",
      width: 200,
      ...selectSearch({
        dataIndex: "loai_khach_hang_id",
        path: API_ROUTE_CONFIG.LOAI_KHACH_HANG + "/options",
        operator: "equal",
        nameColumn: "Loại khách hàng",
      }),
      render: (record: any) => record?.ten_loai_khach_hang || "Chưa có",
      exportData: (record: any) =>
        record?.loai_khach_hang?.ten_loai_khach_hang || "Chưa có",
    },

    // ===== TÀI CHÍNH & TÍCH LŨY =====
    {
      title: "Công nợ",
      dataIndex: "cong_no",
      align: "right",
      width: 140,
      ...inputSearch({
        dataIndex: "cong_no",
        operator: "contain",
        nameColumn: "Công nợ",
      }),
      render: (val: any) => formatVietnameseCurrency(val),
    },
    {
      title: "Doanh thu tích lũy",
      dataIndex: "doanh_thu_tich_luy",
      align: "right",
      width: 170,
      ...inputSearch({
        dataIndex: "doanh_thu_tich_luy",
        operator: "contain",
        nameColumn: "Doanh thu tích lũy",
      }),
      render: (val: any) => formatVietnameseCurrency(val),
    },
    {
      title: "Điểm tích lũy",
      dataIndex: "diem_tich_luy",
      align: "right",
      width: 150,
      ...inputSearch({
        dataIndex: "diem_tich_luy",
        operator: "contain",
        nameColumn: "Điểm tích lũy",
      }),
    },
    {
      title: "Ngày cập nhật loại KH",
      dataIndex: "ngay_cap_nhat_hang",
      width: 180,
      render: (v: string) => (v ? dayjs(v).format("DD/MM/YYYY") : ""),
      ...dateSearch({
        dataIndex: "ngay_cap_nhat_hang",
        nameColumn: "Ngày cập nhật loại KH",
      }),
    },

    // ===== HỆ THỐNG =====
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      width: 140,
      render: (trang_thai: number) => (
        <Tag color={trang_thai === 1 ? "green" : "red"}>
          {trang_thai === 1 ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
      ...selectSearchWithOutApi({
        dataIndex: "trang_thai",
        operator: "equal",
        nameColumn: "Trạng thái",
        options: OPTIONS_STATUS,
      }),
    },
    {
      title: "Người tạo",
      dataIndex: "ten_nguoi_tao",
      width: 180,
      ...inputSearch({
        dataIndex: "ten_nguoi_tao",
        operator: "contain",
        nameColumn: "Người tạo",
      }),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      width: 150,
      ...dateSearch({ dataIndex: "created_at", nameColumn: "Ngày tạo" }),
    },
    {
      title: "Người cập nhật",
      dataIndex: "ten_nguoi_cap_nhat",
      width: 180,
      ...inputSearch({
        dataIndex: "ten_nguoi_cap_nhat",
        operator: "contain",
        nameColumn: "Người cập nhật",
      }),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      width: 150,
      ...dateSearch({
        dataIndex: "updated_at",
        nameColumn: "Ngày cập nhật",
      }),
    },
  ];

  useEffect(() => {
    getDanhSach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReload, filter, query]);

  return (
    <Row>
      <Col span={24}>
        <Flex vertical gap={10}>
          <Row justify="end" align="middle" style={{ marginBottom: 5, gap: 10 }}>
            {permission.export && (
              <ExportTableToExcel
                columns={defaultColumns}
                path={path}
                params={{}}
              />
            )}
            {permission.create && <ImportExcel path={path} />}
          </Row>
          <CustomTable
            rowKey="id"
            dataTable={danhSach?.data}
            defaultColumns={defaultColumns}
            filter={filter}
            scroll={{ x: 3600 }}
            handlePageChange={handlePageChange}
            handleLimitChange={handleLimitChange}
            total={danhSach?.total}
            loading={isLoading}
          />
        </Flex>
      </Col>
    </Row>
  );
};

export default DanhSachKhachHang;
