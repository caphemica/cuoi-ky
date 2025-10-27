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
  Form,
  InputNumber,
  Upload,
  Image,
  Spin,
  App,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductsAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
  Product,
} from "@/services/api";

const { Title, Text } = Typography;
const { Search } = Input;

export default function ProductsPage() {
  const { message, modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fileList, setFileList] = useState<any[]>([]);

  const queryClient = useQueryClient();

  // Fetch products with React Query
  const {
    data: productsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", searchText, currentPage, pageSize],
    queryFn: () =>
      getProductsAPI({
        search: searchText,
        current: currentPage,
        pageSize: pageSize,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FormData) => createProductAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Tạo sản phẩm thành công!");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    },
    onError: (error: any) => {
      message.error(error.message || "Tạo sản phẩm thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      updateProductAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Cập nhật sản phẩm thành công!");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    },
    onError: (error: any) => {
      message.error(error.message || "Cập nhật sản phẩm thất bại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Xóa sản phẩm thành công!");
    },
    onError: (error: any) => {
      message.error(error.message || "Xóa sản phẩm thất bại");
    },
  });

  const products = (productsResponse as any)?.data || [];
  const meta = (productsResponse as any)?.meta;

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Giá",
      dataIndex: "productPrice",
      key: "productPrice",
      render: (price: number) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Tồn kho",
      dataIndex: "productQuantity",
      key: "productQuantity",
      render: (quantity: number) => (
        <Tag color={quantity > 10 ? "green" : quantity > 0 ? "orange" : "red"}>
          {quantity} đơn vị
        </Tag>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "productImage",
      key: "productImage",
      render: (images: string[]) => (
        <Space>
          {images.slice(0, 2).map((image, index) => (
            <Image
              key={index}
              width={40}
              height={40}
              src={image}
              style={{ objectFit: "cover", borderRadius: 4 }}
            />
          ))}
          {images.length > 2 && (
            <Text type="secondary">+{images.length - 2}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Khuyến mãi",
      dataIndex: "productPromotion",
      key: "productPromotion",
      render: (promotion: number) => (
        <Tag color={promotion > 0 ? "blue" : "default"}>{promotion}%</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      productName: product.productName,
      productDescription: product.productDescription,
      productPrice: product.productPrice,
      productQuantity: product.productQuantity,
      productPromotion: product.productPromotion,
    });

    // Set existing images
    const existingImages =
      product.productImage?.map((img, index) => ({
        uid: `-${index}`,
        name: `image${index + 1}.jpg`,
        status: "done",
        url: img,
      })) || [];
    setFileList(existingImages);

    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content:
        "Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
      onOk() {
        deleteMutation.mutate(Number(id));
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();

      // Add form fields to FormData
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          // Convert values to string for FormData
          formData.append(key, String(values[key]));
        }
      });

      // Add the first image file if exists
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("productImage", fileList[0].originFileObj);
      }

      if (editingProduct) {
        updateMutation.mutate({
          id: Number(editingProduct.id),
          data: formData,
        });
      } else {
        createMutation.mutate(formData);
      }
    });
  };

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
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
          Quản lý sản phẩm
        </Title>
        <Text type="secondary">Quản lý kho sản phẩm và thông tin chi tiết</Text>
      </div>

      {/* Actions Bar */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              onSearch={handleSearch}
              loading={isLoading}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: meta?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trong ${total} sản phẩm`,
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ productPromotion: 0 }}
        >
          <Form.Item
            name="productName"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="productDescription"
            label="Mô tả sản phẩm"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả sản phẩm" },
            ]}
          >
            <Input.TextArea placeholder="Nhập mô tả sản phẩm" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productPrice"
                label="Giá (VND)"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0"
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="productQuantity"
                label="Số lượng tồn kho"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng tồn kho" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="productPromotion"
            label="Khuyến mãi (%)"
            rules={[{ required: true, message: "Vui lòng nhập khuyến mãi" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="0"
              min={0}
              max={100}
              formatter={(value) => `${value}%`}
            />
          </Form.Item>

          <Form.Item
            name="productImage"
            label="Hình ảnh sản phẩm"
            valuePropName="fileList"
            getValueFromEvent={handleFileChange}
          >
            <Upload
              beforeUpload={() => false}
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              maxCount={1}
              accept="image/*"
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
