import React, { useEffect, useState } from 'react'
import { Input, Button, Form, message } from 'antd'
import { useSelector } from 'react-redux'
import { adminCreateProductApi } from '@/services/api'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true })

const Admin = () => {
  const { user } = useSelector((s) => s.auth)
  const [form] = Form.useForm()

  useEffect(() => {
    socket.on('notification:new_product', (payload) => {
      message.info(`${payload.title}: ${payload.message}`)
    })
    return () => {
      socket.off('notification:new_product')
    }
  }, [])

  const onCreate = async () => {
    try {
      const values = form.getFieldsValue(true)
      const res = await adminCreateProductApi(values)
      if (res?.success) {
        message.success('Tạo sản phẩm thành công')
        form.resetFields()
      } else {
        message.error(res?.message || 'Tạo sản phẩm thất bại')
      }
    } catch (e) {
      message.error(e?.message || 'Tạo sản phẩm thất bại')
    }
  }

  if ((user?.role || '').toUpperCase() !== 'ADMIN') {
    return <div className="py-10">Bạn không có quyền truy cập</div>
  }

  return (
    <div className="py-10">
      <div className="text-xl font-semibold mb-4">Admin: Tạo sản phẩm</div>
      <Form layout="vertical" form={form} className="max-w-xl">
        <Form.Item name="productName" label="Tên" rules={[{required:true}]}>
          <Input />
        </Form.Item>
        <Form.Item name="productDescription" label="Mô tả" rules={[{required:true}]}>
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
        <div className="flex gap-2">
          <Button type="primary" onClick={onCreate}>Tạo</Button>
        </div>
      </Form>
    </div>
  )
}

export default Admin


