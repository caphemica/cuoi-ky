import React, { useEffect, useState } from 'react'
import { Steps, Form, Input, Button, message, Modal, Select } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyCart } from '@/store/slices/cartSlice'
import { createOrderApi, getMyCouponsApi, validateCouponApi, getCouponTemplatesApi, redeemCouponFromTemplateApi } from '@/services/api'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { fetchMyPromotionScore } from '@/store/slices/promotionScoreSlice'

const { Step } = Steps

const PlaceOrder = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const buyNow = location.state?.buyNow
  const { items, totalCartPrice, totalCartQuantity } = useSelector((s) => s.cart)
  const { isAuthenticated } = useSelector((s) => s.auth)
  const { totalPromotionScore } = useSelector((s) => s.promotionScore)

  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()
  const [redeem, setRedeem] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [coupons, setCoupons] = useState([])
  const [redeemModalOpen, setRedeemModalOpen] = useState(false)
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [redeemingId, setRedeemingId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!buyNow) dispatch(fetchMyCart())
  }, [dispatch, buyNow])

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyPromotionScore())
  }, [dispatch, isAuthenticated])

  console.log(totalPromotionScore)

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await getMyCouponsApi()
        if (res?.success) setCoupons(res.data || [])
      } catch {}
    }
    if (isAuthenticated) fetchCoupons()
  }, [isAuthenticated])

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true)
        const res = await getCouponTemplatesApi()
        if (res?.success) setTemplates(res.data || [])
      } catch {}
      finally { setLoadingTemplates(false) }
    }
    if (redeemModalOpen) fetchTemplates()
  }, [redeemModalOpen])

  const next = async () => {
    try {
      if (current === 0) {
        await form.validateFields()
      }
      setCurrent((c) => c + 1)
    } catch {}
  }

  const prev = () => setCurrent((c) => c - 1)

  const onFinishOrder = async () => {
    try {
      const shippingAddress = form.getFieldsValue(true)
      const payload = buyNow
        ? {
            shippingAddress,
            items: [{ productId: buyNow.productId, quantity: buyNow.quantity }],
            redeemScore: Number(redeem || 0),
            couponCode: couponCode || undefined,
          }
        : {
            shippingAddress,
            items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
            redeemScore: Number(redeem || 0),
            couponCode: couponCode || undefined,
          }
      const res = await createOrderApi(payload)
      if (res?.success) {
        message.success('Đặt hàng thành công')
        setTimeout(() => {
          navigate('/orders')
        }, 2000)
      } else {
        message.error(res?.message || 'Đặt hàng thất bại')
      }
    } catch (e) {
      message.error(e?.message || 'Đặt hàng thất bại')
    }
  }

  const subtotal = Number(buyNow ? (buyNow.price * buyNow.quantity) : (totalCartPrice || 0))
  const pointValue = 100
  const maxRedeemBySubtotal = Math.floor(subtotal / pointValue)
  const maxRedeem = Math.min(Number(totalPromotionScore || 0), maxRedeemBySubtotal)
  const validRedeem = Math.max(0, Math.min(Number(redeem || 0), maxRedeem))
  const discount = validRedeem * pointValue + Number(couponDiscount || 0)
  const grandTotal = Math.max(0, subtotal - discount)

  const handleSelectCoupon = async (code) => {
    setCouponCode(code)
    if (!code) {
      setCouponDiscount(0)
      return
    }
    try {
      const res = await validateCouponApi(code, subtotal)
      if (res?.success) {
        setCouponDiscount(Number(res.data?.discount || 0))
      } else {
        setCouponDiscount(0)
        message.error(res?.message || 'Phiếu không hợp lệ')
      }
    } catch (e) {
      setCouponDiscount(0)
      message.error(e?.message || 'Không thể kiểm tra phiếu')
    }
  }

  const handleRedeemFromTemplate = async (templateId) => {
    try {
      setRedeemingId(templateId)
      const res = await redeemCouponFromTemplateApi(templateId)
      if (res?.success) {
        message.success('Đổi phiếu thành công')
        setCoupons((prev) => [res.data, ...prev])
        setRedeemModalOpen(false)
      } else {
        message.error((res && res.message) ? res.message : 'Đổi phiếu thất bại')
      }
    } catch (e) {
      message.error((e && e.message) ? e.message : 'Đổi phiếu thất bại')
    }
    finally { setRedeemingId(null) }
  }

  return (
    <div className="py-10">
      <Steps current={current} responsive className="mb-8">
        <Step title="Địa chỉ giao hàng" />
        <Step title="Xác nhận" />
        <Step title="Hoàn tất" />
      </Steps>

      {current === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          <div className="lg:col-span-2 p-5 border rounded-xl bg-white">
            <Form form={form} layout="vertical">
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                <Input placeholder="Nguyen Van A" />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
                <Input placeholder="0900000000" />
              </Form.Item>
              <Form.Item name="street" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
                <Input placeholder="Số nhà, đường" />
              </Form.Item>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="city" label="Tỉnh/Thành" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </div>
            </Form>
          </div>

          <div className="lg:col-span-1 p-5 border rounded-xl bg-white h-fit">
            <div className="text-lg font-semibold mb-4">Tóm tắt</div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tổng số lượng</span>
              <span>{buyNow ? buyNow.quantity : (totalCartQuantity || 0)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString()} đ</span>
            </div>
            <div className="mb-3 p-3 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span>Điểm hiện có</span>
                <span className="font-semibold">{Number(totalPromotionScore||0).toLocaleString()} điểm</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={maxRedeem}
                  value={redeem}
                  onChange={(e) => {
                    const raw = Number(e.target.value || 0)
                    const clamped = Math.max(0, Math.min(raw, maxRedeem))
                    setRedeem(Math.floor(isNaN(clamped) ? 0 : clamped))
                  }}
                  placeholder={`Tối đa ${maxRedeem} điểm`}
                />
                <Button onClick={() => setRedeem(maxRedeem)}>Dùng tối đa</Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">1 điểm = {pointValue.toLocaleString()} đ</div>
            </div>
            <div className="mb-3 p-3 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span>Phiếu giảm giá</span>
                <Button type="link" onClick={() => setRedeemModalOpen(true)}>Đổi phiếu bằng điểm</Button>
              </div>
              <Select
                className="w-full"
                allowClear
                placeholder="Chọn phiếu giảm giá"
                value={couponCode || undefined}
                onChange={handleSelectCoupon}
                options={coupons.map((c) => ({
                  label: `${c.code} - ${c.type === 'FIXED' ? `${Number(c.value).toLocaleString()} đ` : `${c.value}%`} ${c.minOrder ? `(đơn tối thiểu ${Number(c.minOrder).toLocaleString()} đ)` : ''}`,
                  value: c.code,
                }))}
              />
              <div className="text-xs text-gray-500 mt-1">Giảm từ phiếu: {Number(couponDiscount||0).toLocaleString()} đ</div>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Giảm giá từ điểm</span>
              <span className="text-green-600">- {discount.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span>Vận chuyển</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            <div className="flex justify-between text-base font-semibold mb-4">
              <span>Thành tiền</span>
              <span>{grandTotal.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-end">
              <Button type="primary" onClick={next}>Tiếp tục</Button>
            </div>
          </div>
        </div>
      )}

      {current === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          <div className="lg:col-span-2 p-5 border rounded-xl bg-white">
            <div className="text-lg font-semibold mb-4">Xác nhận đơn hàng</div>
            <ul className="divide-y">
              {(buyNow ? [buyNow] : items).map((it, idx) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {Array.isArray(it.image) && it.image[0] && (
                      <img src={it.image[0]} alt={it.name} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-500">x{it.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold">{(Number(it.price||0)*Number(it.quantity||0)).toLocaleString()} đ</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-1 p-5 border rounded-xl bg-white h-fit">
            <div className="flex justify-between text-base font-semibold mb-2">
              <span>Tổng cộng</span>
              <span>{subtotal.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Giảm giá từ điểm ({validRedeem} điểm)</span>
              <span className="text-green-600">- {discount.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-base font-semibold mb-4">
              <span>Thành tiền</span>
              <span>{grandTotal.toLocaleString()} đ</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button onClick={prev}>Quay lại</Button>
              <Button type="primary" onClick={() => setCurrent(2) || onFinishOrder()}>Đặt hàng</Button>
            </div>
          </div>
        </div>
      )}

      

      {current === 2 && (
        <div className="py-16 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <div className="text-gray-700 mb-6">Đơn hàng của bạn đã được tạo!</div>
          <Link to="/orders" className="underline">Xem đơn mua</Link>
        </div>
      )}

      <Modal
        title="Đổi phiếu giảm giá bằng điểm"
        open={redeemModalOpen}
        onCancel={() => setRedeemModalOpen(false)}
        footer={null}
      >
        <div className="font-semibold mb-2">Các phiếu đang có</div>
        <div className="space-y-2 max-h-64 overflow-auto border rounded p-2">
          {loadingTemplates && <div className="text-sm text-gray-500">Đang tải...</div>}
          {!loadingTemplates && templates.length === 0 && (
            <div className="text-sm text-gray-500">Chưa có template phiếu</div>
          )}
          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between border rounded p-2">
              <div className="text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-gray-600">
                  {t.type === 'FIXED' ? `Giảm ${Number(t.value).toLocaleString()} đ` : `Giảm ${t.value}%`}
                  {t.minOrder ? ` • Đơn tối thiểu ${Number(t.minOrder).toLocaleString()} đ` : ''}
                  {t.type === 'PERCENT' && t.maxDiscount ? ` • Tối đa ${Number(t.maxDiscount).toLocaleString()} đ` : ''}
                  {t.costPoints ? ` • Tốn ${t.costPoints} điểm` : ''}
                  {t.expiresInDays ? ` • Hạn ${t.expiresInDays} ngày` : ''}
                </div>
              </div>
              <Button type="primary" loading={redeemingId===t.id} onClick={() => handleRedeemFromTemplate(t.id)}>Đổi</Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default PlaceOrder