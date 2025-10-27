import React, { useEffect, useState } from 'react'
import { Layout, Menu, Dropdown, Space, Button, Result, message, Badge } from 'antd'
import { AppstoreOutlined, ExceptionOutlined, DollarCircleOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined, ShoppingCartOutlined, TagOutlined, StarOutlined } from '@ant-design/icons'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

const { Content, Sider, Header } = Layout
const socket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true })

const AdminLayout = () => {
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [collapsed, setCollapsed] = useState(false)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const location = useLocation()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    socket.on('notification:new_product', (payload) => {
      message.info(`${payload.title}: ${payload.message}`)
      setNotifications((prev) => [{
        id: `${Date.now()}-${Math.random()}`,
        title: payload?.title || 'Thông báo',
        message: payload?.message || '',
        productId: payload?.productId,
        type: 'product',
        createdAt: payload?.createdAt || new Date().toISOString()
      }, ...prev].slice(0, 50))
    })
    socket.on('notification:new_order', (payload) => {
      message.info(`${payload.title}: ${payload.message}`)
      setNotifications((prev) => [{
        id: `${Date.now()}-${Math.random()}`,
        title: payload?.title || 'Thông báo',
        message: payload?.message || '',
        orderId: payload?.orderId,
        type: 'order',
        createdAt: payload?.createdAt || new Date().toISOString()
      }, ...prev].slice(0, 50))
    })
    // Lắng nghe thông báo review mới từ server
    socket.on('new_review_notification', (payload) => {
      const title = 'Đánh giá mới'
      const messageText = payload?.message || 'Có đánh giá mới từ khách hàng'
      message.info(`${title}: ${messageText}`)
      setNotifications((prev) => [{
        id: `${Date.now()}-${Math.random()}`,
        title,
        message: messageText,
        productId: payload?.product?.id,
        productName: payload?.product?.productName,
        reviewId: payload?.review?.id,
        rating: payload?.review?.rating,
        userName: payload?.user?.userName || payload?.user?.name,
        type: 'review',
        createdAt: payload?.review?.createdAt || new Date().toISOString()
      }, ...prev].slice(0, 50))
    })
    return () => {
      socket.off('notification:new_product')
      socket.off('notification:new_order')
      socket.off('new_review_notification')
    }
  }, [])

  // Join admin room khi admin đăng nhập
  useEffect(() => {
    const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN'
    if (isAuthenticated && isAdmin && user?.id) {
      socket.emit('join_admin_room', { userId: user.id, userRole: 'ADMIN' })
      // optional: xác nhận join
      const onJoined = (data) => {
        // console.log('Joined admin room:', data)
      }
      const onError = (data) => {
        message.error(data?.message || 'Không thể tham gia phòng admin')
      }
      socket.on('admin_room_joined', onJoined)
      socket.on('admin_room_error', onError)
      return () => {
        socket.emit('leave_admin_room', { userId: user.id })
        socket.off('admin_room_joined', onJoined)
        socket.off('admin_room_error', onError)
      }
    }
  }, [isAuthenticated, user?.role, user?.id])

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      if (!isAuthenticated) navigate('/login')
    }
  }, [isAuthenticated, location.pathname, navigate])

  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN'
  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này"
        extra={<Button type="primary"><Link to="/">Về trang chủ</Link></Button>}
      />
    )
  }

  const items = [
    { label: <Link to="/admin">Dashboard</Link>, key: 'dashboard', icon: <AppstoreOutlined /> },
    { label: <Link to="/admin/products">Sản phẩm</Link>, key: 'products', icon: <ExceptionOutlined /> },
    { label: <Link to="/admin/orders">Đơn hàng</Link>, key: 'orders', icon: <DollarCircleOutlined /> },
    { label: <Link to="/admin/users">Người dùng</Link>, key: 'users', icon: <UserOutlined /> },
  ]

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return ''
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>Admin</div>
        <Menu defaultSelectedKeys={[activeMenu]} mode="inline" items={items} onClick={(e) => setActiveMenu(e.key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: 16 }}>
          <span>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
          </span>
          <Space size={16}>
            {/* Notification icon for admin with dropdown */}
            <div style={{ position: 'relative' }}>
              <Badge count={notifications.length} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => setNotifOpen(o=>!o)} />
              </Badge>
              {notifOpen && (
                <div style={{ position:'absolute', right:0, top:28, width:360, maxHeight:360, overflow:'auto', background:'#fff', border:'1px solid #f0f0f0', borderRadius:12, boxShadow:'0 12px 24px rgba(0,0,0,0.12)', zIndex:1000 }}>
                  <div style={{ padding:'10px 14px', fontWeight:700, borderBottom:'1px solid #f5f5f5', display:'flex', alignItems:'center', gap:8 }}>
                    <BellOutlined /> Thông báo
                  </div>
                  {notifications.length === 0 && (
                    <div style={{ padding:16, color:'#999', fontSize:12 }}>Chưa có thông báo</div>
                  )}
                  <ul style={{ listStyle:'none', margin:0, padding:0 }}>
                    {notifications.map(n => (
                      <li key={n.id} onClick={() => {
                        setNotifOpen(false)
                        if (n.type === 'product' && n.productId) navigate(`/product/${n.productId}`)
                        if (n.type === 'order' && n.orderId) navigate('/admin/orders')
                        if (n.type === 'review' && n.productId) navigate(`/product/${n.productId}`)
                      }} style={{ padding:'16px', cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start', borderBottom:'1px solid #f0f0f0' }} className="hover:bg-gray-50">
                        {/* Avatar/Product Image */}
                        <div style={{
                          width:48,height:48,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',
                          background: n.type==='order' ? '#E6F4FF' : (n.type==='review' ? '#FEF3C7' : '#FFF1F0'),
                          color: n.type==='order' ? '#1677FF' : (n.type==='review' ? '#D97706' : '#FF4D4F'),
                          flexShrink: 0
                        }}>
                          {n.type==='order' ? <ShoppingCartOutlined style={{ fontSize: 20 }} /> : (n.type==='review' ? <StarOutlined style={{ fontSize: 20 }} /> : <TagOutlined style={{ fontSize: 20 }} />)}
                        </div>
                        
                        {/* Content */}
                        <div style={{ flex:1, minWidth:0 }}>
                          {/* Main content line */}
                          <div style={{ marginBottom:4 }}>
                            <span style={{ fontWeight:600, color:'#111', fontSize:14 }}>{n.userName || 'Khách hàng'}</span>
                            <span style={{ color:'#666', fontSize:14, margin:'0 4px' }}>
                              {n.type==='review' ? 'đã đánh giá' : n.type==='order' ? 'đã đặt hàng' : 'đã tương tác với'}
                            </span>
                            <span style={{ fontWeight:600, color:'#111', fontSize:14 }}>
                              {n.type==='review' ? n.productName : n.type==='order' ? 'đơn hàng' : 'sản phẩm'}
                            </span>
                          </div>
                          
                          {/* Secondary info */}
                          <div style={{ color:'#999', fontSize:13, marginBottom:4 }}>
                            {n.type==='review' && typeof n.rating === 'number' ? (
                              <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                                <StarOutlined style={{ fontSize: 12 }} /> {n.rating} sao
                              </span>
                            ) : (
                              n.message
                            )}
                          </div>
                          
                          {/* Time */}
                          <div style={{ color:'#999', fontSize:12 }}>
                            {formatTime(n.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {notifications.length > 0 && (
                    <div style={{ padding:'10px 12px', textAlign:'right', borderTop:'1px solid #f5f5f5' }}>
                      <button onClick={() => setNotifications([])} className="text-xs text-gray-500 hover:text-black">Xóa tất cả</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Dropdown menu={{ items: [{ key: 'home', label: <Link to='/'>Trang chủ</Link> }] }}>
              <Space style={{ cursor: 'pointer' }}>{user?.name}</Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout


