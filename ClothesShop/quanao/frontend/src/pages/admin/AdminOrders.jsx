import React, { useEffect, useState } from 'react'
import { Table, Tag } from 'antd'
import { adminListOrdersApi } from '@/services/api'

const statusColor = (s) => {
  switch ((s||'').toUpperCase()) {
    case 'NEW': return 'blue'
    case 'CONFIRMED': return 'geekblue'
    case 'PREPARING': return 'gold'
    case 'SHIPPING': return 'cyan'
    case 'COMPLETED': return 'green'
    case 'CANCELLED': return 'red'
    default: return 'default'
  }
}

const AdminOrders = () => {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      const res = await adminListOrdersApi({ page, limit })
      if (res?.success) {
        setOrders(res.data?.orders || [])
        const p = res.data?.pagination || {}
        setPagination({ current: p.currentPage || page, pageSize: p.limit || limit, total: p.total || 0 })
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders(pagination.current, pagination.pageSize) }, [])

  return (
    <div>
      <div className="text-xl font-semibold mb-4">Đơn hàng</div>
      <Table
        rowKey={(r)=>r.id}
        loading={loading}
        dataSource={orders}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: (c,s)=>fetchOrders(c,s) }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          { title: 'User', dataIndex: 'orderUserId', width: 90 },
          { title: 'Số lượng', dataIndex: 'totalOrderQuantity', width: 100 },
          { title: 'Thành tiền', dataIndex: 'totalOrderPrice', render: (v)=>Number(v||0).toLocaleString()+' đ' },
          { title: 'Trạng thái', dataIndex: 'status', render: (s)=> <Tag color={statusColor(s)}>{s}</Tag> },
          { title: 'Tạo lúc', dataIndex: 'createdAt', render: (v)=> v ? new Date(v).toLocaleString() : '' },
        ]}
      />
    </div>
  )
}

export default AdminOrders


