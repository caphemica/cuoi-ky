"use client";

import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Input,
  Row,
  Col,
  Modal,
  Descriptions,
  Select,
  message,
  Spin,
  App,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrdersAPI,
  getOrderByIdAPI,
  updateOrderStatusAPI,
  Order,
  OrderParams,
} from "@/services/api";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function OrdersPage() {
  const { modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch orders with React Query
  const {
    data: ordersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", searchText, statusFilter, currentPage, pageSize],
    queryFn: () =>
      getOrdersAPI({
        search: searchText,
        status: statusFilter === "all" ? undefined : statusFilter,
        current: currentPage,
        pageSize: pageSize,
      }),
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateOrderStatusAPI(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      message.success("Cập nhật trạng thái đơn hàng thành công!");
    },
    onError: (error: any) => {
      message.error(error.message || "Cập nhật trạng thái đơn hàng thất bại");
    },
  });

  const orders = (ordersResponse as any)?.data || [];
  const meta = (ordersResponse as any)?.meta;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "orange";
      case "CONFIRMED":
        return "blue";
      case "PREPARING":
        return "purple";
      case "SHIPPING":
        return "cyan";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NEW":
        return <ClockCircleOutlined />;
      case "CONFIRMED":
        return <ClockCircleOutlined />;
      case "PREPARING":
        return <ClockCircleOutlined />;
      case "SHIPPING":
        return <CheckCircleOutlined />;
      case "COMPLETED":
        return <CheckCircleOutlined />;
      case "CANCELLED":
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id: number) => `#${id}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalOrderPrice",
      key: "totalOrderPrice",
      render: (total: number) => `${total.toLocaleString()} VND`,
    },
    {
      title: "Số lượng",
      dataIndex: "totalOrderQuantity",
      key: "totalOrderQuantity",
      render: (quantity: number) => `${quantity} sản phẩm`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleUpdateStatus(record)}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  console.log(orders);

  const handleUpdateStatus = (order: Order) => {
    modal.confirm({
      title: "Cập nhật trạng thái đơn hàng",
      content: (
        <Select
          defaultValue={order.status}
          style={{ width: "100%", marginTop: 16 }}
          onChange={(value) => {
            updateStatusMutation.mutate({ id: order.id, status: value });
          }}
        >
          <Option value="NEW">Mới</Option>
          <Option value="CONFIRMED">Đã xác nhận</Option>
          <Option value="PREPARING">Đang chuẩn bị</Option>
          <Option value="SHIPPING">Đang giao</Option>
          <Option value="COMPLETED">Hoàn thành</Option>
          <Option value="CANCELLED">Đã hủy</Option>
        </Select>
      ),
      onOk() {
        // Status update is handled in the onChange above
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Quản lý đơn hàng
        </Title>
        <Text type="secondary">Theo dõi và quản lý đơn hàng khách hàng</Text>
      </div>

      {/* Actions Bar */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Search
                placeholder="Tìm kiếm đơn hàng..."
                allowClear
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
                onSearch={handleSearch}
                loading={isLoading}
              />
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả</Option>
                <Option value="NEW">Mới</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="PREPARING">Đang chuẩn bị</Option>
                <Option value="SHIPPING">Đang giao</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Text type="secondary">Tổng đơn hàng: {meta?.total || 0}</Text>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: meta?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trong ${total} đơn hàng`,
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={`Chi tiết đơn hàng - #${selectedOrder?.id}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions title="Thông tin đơn hàng" bordered>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                #{selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                {selectedOrder.totalOrderPrice.toLocaleString()} VND
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {selectedOrder.totalOrderQuantity} sản phẩm
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
