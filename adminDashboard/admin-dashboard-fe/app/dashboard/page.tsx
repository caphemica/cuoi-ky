"use client";

import { Card, Row, Col, Statistic, Typography, Space, Button } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DollarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import UserInfoCard from "@/components/UserInfoCard";
import DashboardStats from "@/components/DashboardStats";
import { getOrdersAPI, getProductsAPI } from "@/services/api";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const router = useRouter();

  // Fetch data for statistics
  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrdersAPI({ current: 1, pageSize: 1000 }),
  });

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProductsAPI({ current: 1, pageSize: 1000 }),
  });

  const orders = (ordersResponse as any)?.data || [];
  const products = (productsResponse as any)?.data || [];
  const isLoading = ordersLoading || productsLoading;

  // Calculate statistics
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + (order.totalOrderPrice || 0),
    0
  );
  const totalUsers = 1128; // Mock data for now

  const handleQuickAction = (path: string) => {
    router.push(path);
  };

  return (
    <div>
      {/* User Info Card */}
      <UserInfoCard />

      {/* Charts Section */}
      <DashboardStats />

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Tổng quan Dashboard
        </Title>
        <Text type="secondary">
          Chào mừng trở lại! Đây là những gì đang diễn ra với doanh nghiệp của
          bạn hôm nay.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={totalUsers}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ArrowUpOutlined />}
              suffix=""
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              prefix={<ArrowDownOutlined />}
              suffix=""
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={totalProducts}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ArrowUpOutlined />}
              suffix=""
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix="₫"
              suffix=""
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            onClick={() => handleQuickAction("/dashboard/products")}
            style={{ textAlign: "center" }}
          >
            <Space direction="vertical" size="middle">
              <ShoppingOutlined
                style={{ fontSize: "32px", color: "#1890ff" }}
              />
              <Title level={4} style={{ margin: 0 }}>
                Quản lý sản phẩm
              </Title>
              <Text type="secondary">Thêm, chỉnh sửa hoặc xóa sản phẩm</Text>
              <Button type="primary" icon={<PlusOutlined />}>
                Thêm sản phẩm
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            onClick={() => handleQuickAction("/dashboard/orders")}
            style={{ textAlign: "center" }}
          >
            <Space direction="vertical" size="middle">
              <FileTextOutlined
                style={{ fontSize: "32px", color: "#52c41a" }}
              />
              <Title level={4} style={{ margin: 0 }}>
                Xem đơn hàng
              </Title>
              <Text type="secondary">Theo dõi và quản lý đơn hàng</Text>
              <Button type="default">Xem đơn hàng</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            onClick={() => handleQuickAction("/dashboard/users")}
            style={{ textAlign: "center" }}
          >
            <Space direction="vertical" size="middle">
              <UserOutlined style={{ fontSize: "32px", color: "#fa8c16" }} />
              <Title level={4} style={{ margin: 0 }}>
                Quản lý người dùng
              </Title>
              <Text type="secondary">Quản lý người dùng và vai trò</Text>
              <Button type="default">Quản lý người dùng</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      {/* <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Hoạt động gần đây" variant="outlined">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Người dùng mới đăng ký</Text>
                <Text type="secondary">2 phút trước</Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Đơn hàng #1234 hoàn thành</Text>
                <Text type="secondary">5 phút trước</Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Sản phẩm "iPhone 15" đã thêm</Text>
                <Text type="secondary">10 phút trước</Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Thanh toán nhận được cho đơn hàng #1233</Text>
                <Text type="secondary">15 phút trước</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thống kê nhanh" variant="outlined">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Doanh thu hôm nay</Text>
                <Text strong style={{ color: "#3f8600" }}>
                  ₫2,450,000
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Đơn hàng chờ xử lý</Text>
                <Text strong style={{ color: "#fa8c16" }}>
                  12
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Sản phẩm sắp hết hàng</Text>
                <Text strong style={{ color: "#cf1322" }}>
                  3
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Người dùng mới hôm nay</Text>
                <Text strong style={{ color: "#1890ff" }}>
                  8
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
}
