import React, { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic } from 'antd'
import { adminOrderStatsApi } from '@/services/api'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [kpis, setKpis] = useState({ totalRevenue: 0, totalOrders: 0, completedOrders: 0, shippingOrders: 0, newOrders: 0 })
  const [revenueByDay, setRevenueByDay] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await adminOrderStatsApi()
        if (res?.success) {
          setKpis(res.data?.kpis || kpis)
          setRevenueByDay(res.data?.revenueByDay || [])
          setTopProducts(res.data?.topProducts || [])
        }
      } finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  const revenueData = {
    labels: revenueByDay.map(d => d.date),
    datasets: [
      {
        label: 'Doanh thu mỗi ngày',
        data: revenueByDay.map(d => d.revenue),
        borderColor: '#1677FF',
        backgroundColor: 'rgba(22,119,255,0.15)'
      }
    ]
  }

  const topProductsData = {
    labels: topProducts.map(t => t.name),
    datasets: [
      {
        label: 'Số lượng bán',
        data: topProducts.map(t => t.qty),
        backgroundColor: 'rgba(5,150,105,0.6)'
      }
    ]
  }

  return (
    <div>
      <div className="text-xl font-semibold mb-4">Tổng quan</div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}><Card loading={loading}><Statistic title="Tổng đơn" value={kpis.totalOrders} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={6}><Card loading={loading}><Statistic title="Đơn hoàn tất" value={kpis.completedOrders} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={6}><Card loading={loading}><Statistic title="Đang giao" value={kpis.shippingOrders} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={6}><Card loading={loading}><Statistic title="Đơn mới" value={kpis.newOrders} /></Card></Col>
        <Col xs={24}><Card loading={loading}><Statistic title="Tổng doanh thu" value={(kpis.totalRevenue||0).toLocaleString()+ ' đ'} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}><Card title="Doanh thu 14 ngày gần nhất" loading={loading}><Line data={revenueData} /></Card></Col>
        <Col xs={24} lg={10}><Card title="Top 10 sản phẩm bán chạy" loading={loading}><Bar data={topProductsData} /></Card></Col>
      </Row>
    </div>
  )
}

export default AdminDashboard


