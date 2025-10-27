import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Modal, Table } from 'antd'
import { toast } from 'sonner'
import { adminCreateProductApi, getAllProductApi } from '@/services/api'

const AdminProducts = () => {
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchProducts = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      const res = await getAllProductApi({ page, limit })
      if (res?.success) {
        setProducts(res.data?.products || [])
        const p = res.data?.pagination || {}
        setPagination({ current: p.currentPage || page, pageSize: p.limit || limit, total: p.totalProducts || 0 })
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts(pagination.current, pagination.pageSize) }, [])

  const onCreate = async () => {
    try {
      const values = form.getFieldsValue(true)
      const res = await adminCreateProductApi(values)
      if (res?.success) {
        toast.success('Tạo sản phẩm thành công')
        form.resetFields()
        setOpen(false)
        fetchProducts(pagination.current, pagination.pageSize)
      } else {
        toast.error(res?.message || 'Tạo sản phẩm thất bại')
      }
    } catch (e) {
      toast.error(e?.message || 'Tạo sản phẩm thất bại')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold">Sản phẩm</div>
        <Button type="primary" onClick={() => setOpen(true)}>Tạo sản phẩm</Button>
      </div>
      <Table
        rowKey={(r) => r.id}
        loading={loading}
        dataSource={products}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: (c, s) => fetchProducts(c, s) }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          { title: 'Tên', dataIndex: 'productName' },
          { title: 'Giá', dataIndex: 'productPrice', render: (v) => Number(v||0).toLocaleString() + ' đ' },
          { title: 'SL', dataIndex: 'productQuantity', width: 80 },
          { title: 'KM (%)', dataIndex: 'productPromotion', width: 90 },
          { title: 'Tạo lúc', dataIndex: 'createdAt', render: (v) => v ? new Date(v).toLocaleString() : '' },
        ]}
      />

      <Modal title="Tạo sản phẩm" open={open} onCancel={() => setOpen(false)} onOk={onCreate} okText="Tạo" cancelText="Hủy">
        <Form layout="vertical" form={form}>
          <Form.Item name="productName" label="Tên" rules={[{required:true, message:'Nhập tên sản phẩm'}]}>
            <Input />
          </Form.Item>
          <Form.Item name="productDescription" label="Mô tả" rules={[{required:true, message:'Nhập mô tả'}]}>
            <Input />
          </Form.Item>
          <Form.Item name="productPrice" label="Giá" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="productQuantity" label="Số lượng" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="productPromotion" label="Khuyến mãi (%)" initialValue={0}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminProducts


