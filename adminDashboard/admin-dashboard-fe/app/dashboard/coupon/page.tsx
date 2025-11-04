"use client";

import React, { useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CouponTemplate,
  CouponParams,
  getCouponsAPI,
  createCouponAPI,
  updateCouponAPI,
  deleteCouponAPI,
  getCouponByIdAPI,
} from "@/services/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

export default function CouponPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CouponTemplate | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [form] = Form.useForm<CouponTemplate>();

  const { data, isLoading } = useQuery({
    queryKey: ["coupons", nameFilter, typeFilter, currentPage, pageSize],
    queryFn: () =>
      getCouponsAPI({
        name: nameFilter || undefined,
        type: typeFilter as CouponParams["type"],
        current: currentPage,
        pageSize,
      }),
  });

  const coupons: CouponTemplate[] = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
        type: "FIXED",
        value: 0,
        minOrder: 0,
        maxDiscount: 0,
        costPoints: 0,
        expiresInDays: 7,
      } as any);
    }, 0);
  };

  const openEdit = (record: CouponTemplate) => {
    setEditing(record);
    setIsModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        name: record.name,
        type: record.type,
        value: record.value,
        minOrder: record.minOrder,
        maxDiscount: record.maxDiscount,
        costPoints: record.costPoints,
        expiresInDays: record.expiresInDays,
      } as any);
    }, 0);
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => createCouponAPI(payload),
    onSuccess: () => {
      message.success("Tạo coupon thành công");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updateCouponAPI(id, payload),
    onSuccess: () => {
      message.success("Cập nhật coupon thành công");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCouponAPI(id),
    onSuccess: () => {
      message.success("Xoá coupon thành công");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.name,
      type: values.type,
      value: Number(values.value),
      minOrder: Number(values.minOrder || 0),
      maxDiscount: Number(values.maxDiscount || 0),
      costPoints: Number(values.costPoints),
      expiresInDays: Number(values.expiresInDays || 7),
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const numberFormat = (n: number) =>
    typeof n === "number" ? n.toLocaleString("vi-VN") : n;

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 70 },
      { title: "Tên", dataIndex: "name", key: "name" },
      { title: "Loại", dataIndex: "type", key: "type" },
      {
        title: "Giá trị",
        dataIndex: "value",
        key: "value",
        render: (_: any, record: CouponTemplate) =>
          record.type === "PERCENT"
            ? `${numberFormat(record.value)}%`
            : `${numberFormat(record.value)}`,
      },
      {
        title: "ĐH tối thiểu",
        dataIndex: "minOrder",
        key: "minOrder",
        render: (v: number) => numberFormat(v),
      },
      {
        title: "Giảm tối đa",
        dataIndex: "maxDiscount",
        key: "maxDiscount",
        render: (v: number) => numberFormat(v),
      },
      {
        title: "Điểm tiêu",
        dataIndex: "costPoints",
        key: "costPoints",
        render: (v: number) => numberFormat(v),
      },
      {
        title: "Hết hạn (ngày)",
        dataIndex: "expiresInDays",
        key: "expiresInDays",
      },
      { title: "Lượt dùng", dataIndex: "usesPerCoupon", key: "usesPerCoupon" },
      {
        title: "Thao tác",
        key: "actions",
        render: (_: any, record: CouponTemplate) => (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              Sửa
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                modal.confirm({
                  title: "Xác nhận xoá",
                  content: `Bạn có chắc muốn xoá coupon "${record.name}"?`,
                  onOk: () => deleteMutation.mutate(record.id),
                });
              }}
            >
              Xoá
            </Button>
          </Space>
        ),
      },
    ],
    [modal, deleteMutation]
  );

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Quản lý coupon
        </Title>
        <Text type="secondary">Danh sách mẫu coupon</Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space>
              <Search
                placeholder="Tìm theo tên..."
                allowClear
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
                onSearch={(v) => {
                  setNameFilter(v);
                  setCurrentPage(1);
                }}
                loading={isLoading}
              />
              <Select
                placeholder="Loại"
                allowClear
                style={{ width: 160 }}
                value={typeFilter}
                onChange={(v) => {
                  setTypeFilter(v);
                  setCurrentPage(1);
                }}
              >
                <Option value="FIXED">FIXED</Option>
                <Option value="PERCENT">PERCENT</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Tạo coupon
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={coupons}
          pagination={{
            current: currentPage,
            pageSize,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editing ? "Cập nhật coupon" : "Tạo coupon"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} preserve={false}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
                <Select>
                  <Option value="FIXED">FIXED</Option>
                  <Option value="PERCENT">PERCENT</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá trị"
                name="value"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(val) =>
                    `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Đơn hàng tối thiểu" name="minOrder">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(val) =>
                    `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giảm tối đa" name="maxDiscount">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(val) =>
                    `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Điểm tiêu"
                name="costPoints"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(val) =>
                    `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Hết hạn (ngày)" name="expiresInDays">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          {/* Lượt dùng mỗi coupon không cho sửa */}
        </Form>
      </Modal>
    </div>
  );
}
