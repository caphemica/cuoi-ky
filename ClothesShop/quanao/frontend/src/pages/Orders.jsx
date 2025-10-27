import React, { useEffect, useState } from 'react'
import { getMyOrdersApi, requestCancelOrderApi } from '@/services/api'
import { Empty, Tag, Steps, Button, message } from 'antd'
import { useSelector } from 'react-redux'

const Orders = () => {
  const { isAuthenticated } = useSelector((s)=>s.auth)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetchOrders = async () => {
      try {
        const res = await getMyOrdersApi()
        if (res?.success) setOrders(res.data || [])
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated) fetchOrders()
  },[isAuthenticated])

  const statusColor = (s) => {
    switch ((s||'').toUpperCase()) {
      case 'NEW': return 'orange'
      case 'CONFIRMED': return 'blue'
      case 'PREPARING': return 'gold'
      case 'SHIPPING': return 'geekblue'
      case 'COMPLETED': return 'green'
      case 'CANCELLED': return 'red'
      default: return 'default'
    }
  }

  if (loading) return <div className='py-10 text-center'>Đang tải đơn hàng...</div>

  return (
    <div className='py-10'>
      <h2 className='text-2xl font-semibold mb-6'>Đơn hàng của tôi</h2>
      {(!orders || orders.length === 0) ? (
        <Empty description='Chưa có đơn hàng' />
      ) : (
        <div className='flex flex-col gap-4'>
          {orders.map((o)=> (
            <div key={o.id} className='p-4 border rounded-xl bg-white'>
              <div className='flex items-center justify-between mb-3'>
                <div className='font-semibold'>Mã đơn: #{o.id}</div>
                <Tag color={statusColor(o.status)}>{o.status || 'NEW'}</Tag>
              </div>
              <div className='mb-3'>
                <Steps
                  size='small'
                  current={['NEW','CONFIRMED','PREPARING','SHIPPING','COMPLETED'].indexOf((o.status||'NEW').toUpperCase())}
                  items={[
                    { title: 'Đơn mới' },
                    { title: 'Đã xác nhận' },
                    { title: 'Chuẩn bị hàng' },
                    { title: 'Đang giao' },
                    { title: 'Hoàn thành' },
                  ]}
                />
              </div>
              <ul className='divide-y'>
                {(o.items||[]).map((it,idx)=> (
                  <li key={idx} className='py-2 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {Array.isArray(it.image) && it.image[0] && (
                        <img src={it.image[0]} alt={it.name} className='w-10 h-10 object-cover rounded'/>
                      )}
                      <div>
                        <div className='font-medium'>{it.name}</div>
                        <div className='text-gray-500 text-sm'>x{it.quantity}</div>
                      </div>
                    </div>
                    <div className='font-semibold'>
                      {(Number(it.price||0)*Number(it.quantity||0)).toLocaleString()} đ
                    </div>
                  </li>
                ))}
              </ul>
              <div className='flex items-center justify-between mt-3'>
                <div className='text-sm text-gray-500'>
                  Tổng: {Number(o.totalOrderPrice||0).toLocaleString()} đ
                </div>
                <div className='flex items-center gap-2'>
                  {(() => {
                    const createdAt = new Date(o.createdAt).getTime()
                    const diffMin = (Date.now() - createdAt) / (1000*60)
                    const canCancel = diffMin <= 30 && ['NEW','CONFIRMED'].includes((o.status||'').toUpperCase()) && !o.cancelRequested
                    if (!canCancel) return null
                    return (
                      <Button
                        size='small'
                        danger
                        onClick={async ()=>{
                          try {
                            const res = await requestCancelOrderApi(o.id)
                            if (res?.success) {
                              message.success('Đã gửi yêu cầu hủy đơn')
                              const fresh = await getMyOrdersApi()
                              if (fresh?.success) setOrders(fresh.data||[])
                            } else {
                              message.error(res?.message || 'Không thể hủy')
                            }
                          } catch (e) {
                            message.error(e?.message || 'Không thể hủy')
                          }
                        }}
                      >
                        Yêu cầu hủy
                      </Button>
                    )
                  })()}
                  {o.cancelRequested && <Tag color='orange'>Đã yêu cầu hủy</Tag>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders