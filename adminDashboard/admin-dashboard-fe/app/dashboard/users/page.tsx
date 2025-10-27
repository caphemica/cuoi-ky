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
  App,
  Spin,
  Avatar,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsersAPI, verifyUserAPI } from "@/services/api";

const { Title, Text } = Typography;
const { Search } = Input;

export default function UsersPage() {
  const { message, modal } = App.useApp();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch users with React Query
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", searchText, currentPage, pageSize],
    queryFn: () =>
      getUsersAPI({
        search: searchText,
        current: currentPage,
        pageSize: pageSize,
      }),
  });

  const users = (usersResponse as any)?.data || [];
  const meta = (usersResponse as any)?.meta;

  // Verify user mutation
  const verifyMutation = useMutation({
    mutationFn: verifyUserAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Xác minh người dùng thành công!");
    },
    onError: (error: any) => {
      message.error(error.message || "Xác minh người dùng thất bại");
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "USER":
        return "green";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_: any, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color={getRoleColor(role)}>{role}</Tag>,
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified: boolean) => (
        <Tag
          color={isVerified ? "green" : "default"}
          icon={isVerified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isVerified ? "Verified" : "Not Verified"}
        </Tag>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {!record.isVerified && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleVerify(record.id)}
              loading={verifyMutation.isPending}
            >
              Xác minh
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleVerify = (userId: number) => {
    modal.confirm({
      title: "Xác nhận xác minh người dùng",
      content: "Bạn có chắc chắn muốn xác minh tài khoản này không?",
      okText: "Xác minh",
      okType: "primary",
      cancelText: "Hủy",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      onOk() {
        verifyMutation.mutate(userId);
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
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
          Quản lý người dùng
        </Title>
        <Text type="secondary">
          Quản lý tài khoản người dùng và quyền truy cập
        </Text>
      </div>

      {/* Actions Bar */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Search
              placeholder="Tìm kiếm người dùng..."
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
              loading={isLoading}
            />
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: meta?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trong ${total} người dùng`,
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>
    </div>
  );
}
