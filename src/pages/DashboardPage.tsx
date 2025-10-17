// import Heading from "../components/heading";

// const DashboardPage = () => {
//     return <Heading title="Dashboard" />;
// };

// export default DashboardPage;



import React, { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    Statistic,
    Spin,
    Alert,
    List,
    Avatar,
    Tag,
    Progress,
    Typography,
    Space,
    Divider,
    Table,
} from "antd";
import {
    ShoppingCartOutlined,
    UserOutlined,
    InboxOutlined,
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    WarningOutlined,
    TruckOutlined,
    ShopOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const { Title, Text } = Typography;

const Heading = ({ title }) => (
    <Title level={2} style={{ marginBottom: 24 }}>
        {title}
    </Title>
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

const formatNumber = (number) => {
    return new Intl.NumberFormat("vi-VN").format(number || 0);
};

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch dashboard statistics
                // const statsResponse = await fetch(
                //     "http://127.0.0.1:8000/api/dashboard/statistics"
                // );
                // const statsData = await statsResponse.json();

                const statsResponse = await fetch(
                    `${API_URL}/dashboard/statistics`
                );
                const statsData = await statsResponse.json();

                if (!statsData.success) {
                    throw new Error(
                        statsData.message || "Không thể lấy dữ liệu thống kê"
                    );
                }

                // Fetch recent activities
                // const activitiesResponse = await fetch(
                //     "http://127.0.0.1:8000/api/dashboard/activities"
                // );
                // const activitiesData = await activitiesResponse.json();

                const activitiesResponse = await fetch(
                    `${API_URL}/dashboard/activities`
                );
                const activitiesData = await activitiesResponse.json();

                if (!activitiesData.success) {
                    throw new Error(
                        activitiesData.message ||
                            "Không thể lấy dữ liệu hoạt động"
                    );
                }

                setDashboardData(statsData.data);
                setActivities(activitiesData.data);
            } catch (err) {
                setError(err.message || "Không thể tải dữ liệu dashboard");
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <Heading title="Dashboard" />
                <div style={{ textAlign: "center", padding: "100px 0" }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <Heading title="Thống kê" />
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    const { overview, revenue, inventory, orders, suppliers, charts } =
        dashboardData;

    // Prepare chart colors
    const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"];

    // Prepare low stock table data
    const lowStockColumns = [
        {
            title: "Mã sản phẩm",
            dataIndex: "ma_san_pham",
            key: "ma_san_pham",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "ten_san_pham",
            key: "ten_san_pham",
        },
        {
            title: "Tồn kho",
            dataIndex: "so_luong_ton",
            key: "so_luong_ton",
            render: (value, record) => (
                <Tag
                    color={value <= record.so_luong_canh_bao ? "red" : "orange"}
                >
                    {formatNumber(value)}
                </Tag>
            ),
        },
        {
            title: "Cảnh báo",
            dataIndex: "so_luong_canh_bao",
            key: "so_luong_canh_bao",
            render: (value) => formatNumber(value),
        },
        {
            title: "Tỷ lệ",
            key: "ratio",
            render: (_, record) => {
                const ratio =
                    (record.so_luong_ton / record.so_luong_canh_bao) * 100;
                return (
                    <Progress
                        percent={Math.min(ratio, 100)}
                        status={
                            ratio <= 50
                                ? "exception"
                                : ratio <= 80
                                ? "active"
                                : "success"
                        }
                        size="small"
                        showInfo={false}
                    />
                );
            },
        },
    ];

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <Heading title="Thống kê" />

            {/* Overview Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={overview.total_products}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                            formatter={(value) => formatNumber(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng khách hàng"
                            value={overview.total_customers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                            formatter={(value) => formatNumber(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={overview.total_orders}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: "#722ed1" }}
                            formatter={(value) => formatNumber(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Sản phẩm sắp hết"
                            value={overview.low_stock_products}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: "#f5222d" }}
                            formatter={(value) => formatNumber(value)}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Revenue Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={revenue.today_revenue}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Doanh thu tháng này"
                            value={revenue.month_revenue}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                            formatter={(value) => formatCurrency(value)}
                        />
                        {/* <Text type="secondary" style={{ fontSize: 12 }}>
                            Chi phí: {formatCurrency(revenue.month_expenses)}
                        </Text> */}
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Lợi nhuận tháng"
                            value={revenue.month_profit}
                            prefix={
                                revenue.month_profit >= 0 ? (
                                    <RiseOutlined />
                                ) : (
                                    <FallOutlined />
                                )
                            }
                            valueStyle={{
                                color:
                                    revenue.month_profit >= 0
                                        ? "#52c41a"
                                        : "#f5222d",
                            }}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Inventory & Value */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic
                            title="Tổng giá trị kho"
                            value={overview.total_inventory_value}
                            prefix={<ShopOutlined />}
                            valueStyle={{ color: "#faad14" }}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic
                            title="Tổng tồn kho"
                            value={inventory.total_stock}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                            formatter={(value) => formatNumber(value)}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Doanh thu theo tháng" size="small">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={charts.revenue_chart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis
                                    tickFormatter={(value) =>
                                        `${(value / 1000000).toFixed(0)}M`
                                    }
                                />
                                <Tooltip
                                    formatter={(value) => [
                                        formatCurrency(value),
                                        "Doanh thu",
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Nhập - Xuất kho" size="small">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={charts.inventory_chart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis
                                    tickFormatter={(value) =>
                                        `${(value / 1000000).toFixed(0)}M`
                                    }
                                />
                                <Tooltip
                                    formatter={(value) => [
                                        formatCurrency(value),
                                    ]}
                                />
                                <Legend />
                                <Bar
                                    dataKey="imports"
                                    fill="#52c41a"
                                    name="Nhập kho"
                                />
                                <Bar
                                    dataKey="exports"
                                    fill="#1890ff"
                                    name="Xuất kho"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Additional Info */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={8}>
                    <Card title="Phân bố sản phẩm theo danh mục" size="small">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={charts.category_chart}
                                    dataKey="count"
                                    nameKey="ten_danh_muc"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                >
                                    {charts.category_chart.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        )
                                    )}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Top sản phẩm tồn kho" size="small">
                        <List
                            dataSource={inventory.top_stock_products}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar icon={<InboxOutlined />} />
                                        }
                                        title={item.ten_san_pham}
                                        description={`Mã: ${item.ma_san_pham}`}
                                    />
                                    <Tag color="blue">
                                        {formatNumber(item.total_stock)}
                                    </Tag>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Hoạt động gần đây" size="small">
                        <List
                            dataSource={activities}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                icon={
                                                    item.type === "order" ? (
                                                        <ShoppingCartOutlined />
                                                    ) : (
                                                        <TruckOutlined />
                                                    )
                                                }
                                                style={{
                                                    backgroundColor:
                                                        item.type === "order"
                                                            ? "#52c41a"
                                                            : "#1890ff",
                                                }}
                                            />
                                        }
                                        title={item.title}
                                        description={
                                            <Space
                                                direction="vertical"
                                                size={0}
                                            >
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {item.description}
                                                </Text>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 11 }}
                                                >
                                                    <CalendarOutlined />{" "}
                                                    {item.time}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Top Suppliers */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card title="Top nhà cung cấp" size="small">
                        <Row gutter={[16, 16]}>
                            {suppliers.top_suppliers.map((supplier, index) => (
                                <Col xs={24} md={12} lg={8} key={index}>
                                    <Card type="inner" size="small">
                                        <Statistic
                                            title={supplier.ten_nha_cung_cap}
                                            value={supplier.total_value}
                                            formatter={(value) =>
                                                formatCurrency(value)
                                            }
                                            prefix={`#${index + 1}`}
                                        />
                                        <Text type="secondary">
                                            {supplier.total_orders} đơn hàng •{" "}
                                            {supplier.ma_nha_cung_cap}
                                        </Text>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Low Stock Alert */}
            {inventory.low_stock_products &&
                inventory.low_stock_products.length > 0 && (
                    <Row>
                        <Col span={24}>
                            <Card
                                title={
                                    <Space>
                                        <WarningOutlined
                                            style={{ color: "#f5222d" }}
                                        />
                                        <Text strong>
                                            Cảnh báo sản phẩm sắp hết hàng
                                        </Text>
                                    </Space>
                                }
                                size="small"
                            >
                                <Table
                                    dataSource={inventory.low_stock_products}
                                    columns={lowStockColumns}
                                    pagination={false}
                                    size="small"
                                    rowKey="ma_san_pham"
                                />
                            </Card>
                        </Col>
                    </Row>
                )}
        </div>
    );
};

export default DashboardPage;