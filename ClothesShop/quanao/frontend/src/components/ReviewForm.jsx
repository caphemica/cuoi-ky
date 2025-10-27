import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Rate, Button, message, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, fetchEligibleOrdersForReview } from '@/store/slices/reviewSlice';

const { TextArea } = Input;
const { Option } = Select;

const ReviewForm = ({ visible, onCancel, productId, onSuccess }) => {
  const dispatch = useDispatch();
  const { eligibleOrders, loading } = useSelector((state) => state.review);
  const [form] = Form.useForm();
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (visible && productId) {
      dispatch(fetchEligibleOrdersForReview(productId));
    }
  }, [dispatch, visible, productId]);

  const handleSubmit = async (values) => {
    if (!selectedOrder) {
      message.error('Vui lòng chọn đơn hàng');
      return;
    }

    try {
      const payload = {
        productId,
        orderId: selectedOrder.orderId,
        rating: values.rating,
        comment: values.comment || '',
        images: [], // Có thể thêm upload ảnh sau
      };

      const result = await dispatch(createReview(payload));
      if (result.type.endsWith('fulfilled')) {
        message.success(result.payload.message || 'Đánh giá thành công!');
        form.resetFields();
        setSelectedOrder(null);
        onSuccess?.();
        onCancel();
      } else {
        message.error(result.payload || 'Đánh giá thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedOrder(null);
    onCancel();
  };

  return (
    <Modal
      title="Đánh giá sản phẩm"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ rating: 5 }}
      >
        <Form.Item
          label="Chọn đơn hàng"
          required
          tooltip="Chỉ có thể đánh giá sản phẩm từ đơn hàng đã hoàn thành"
        >
          <Select
            placeholder="Chọn đơn hàng để đánh giá"
            value={selectedOrder?.orderId}
            onChange={(orderId) => {
              const order = eligibleOrders.find(o => o.orderId === orderId);
              setSelectedOrder(order);
            }}
            loading={loading}
          >
            {eligibleOrders.map((order) => (
              <Option key={order.orderId} value={order.orderId}>
                Đơn hàng #{order.orderId} - {new Date(order.orderDate).toLocaleDateString('vi-VN')} - {order.product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {eligibleOrders.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            Bạn chưa có đơn hàng hoàn thành nào chứa sản phẩm này
          </div>
        )}

        <Form.Item
          label="Đánh giá"
          name="rating"
          rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          label="Bình luận"
          name="comment"
        >
          <TextArea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!selectedOrder || eligibleOrders.length === 0}
          >
            Gửi đánh giá
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ReviewForm;
