import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import cartModel from "../models/cartModel.js";
import promotionScoreModel from "../models/promotionScore.js";
import { getIO } from "../services/socket.js";
import couponModel from "../models/couponModel.js";

// GET /api/v1/order - Lấy danh sách đơn hàng của user
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await orderModel.findAll({
      where: { orderUserId: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/order - Tạo đơn hàng
// body: { items: [{ productId, quantity }], shippingAddress: {...} }
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { items, shippingAddress, redeemScore, couponCode } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Danh sách sản phẩm không hợp lệ" });
    }
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Địa chỉ giao hàng không hợp lệ" });
    }

    const snapshotItems = [];
    let totalOrderQuantity = 0;
    let totalOrderPrice = 0;
    let totalOrderPromotionScore = 0;

    for (const it of items) {
      const qty = Math.max(1, parseInt(it?.quantity) || 0);
      const pid = Number(it?.productId);
      if (!pid || qty <= 0) continue;

      const product = await productModel.findByPk(pid);
      if (!product) continue;

      // Kiểm tra tồn kho
      const stock = Number(product.productQuantity) || 0;
      if (qty > stock) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.productName} chỉ còn ${stock} sản phẩm trong kho`,
        });
      }

      const price = Number(product.productPrice || 0);
      const snapshot = {
        productId: pid,
        name: product.productName,
        price,
        image: product.productImage,
        quantity: qty,
      };
      snapshotItems.push(snapshot);
      totalOrderQuantity += qty;
      totalOrderPrice += price * qty;
      totalOrderPromotionScore += product.productPromotion;
    }

    if (snapshotItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Không có sản phẩm hợp lệ" });
    }

    // Tính giảm giá theo điểm quy đổi: 1 điểm = 100 đ (có thể cấu hình)
    const pointValue = 100;
    const requestedRedeem = Math.max(0, parseInt(redeemScore) || 0);

    // Lấy điểm hiện có của user
    const currentPromotion = await promotionScoreModel.findOne({
      where: { promotionScoreUserId: userId },
    });

    const availablePoints = Number(currentPromotion?.totalPromotionScore || 0);
    const maxRedeemBySubtotal = Math.floor(totalOrderPrice / pointValue);
    const actualRedeem = Math.min(
      requestedRedeem,
      availablePoints,
      maxRedeemBySubtotal
    );
    let discount = actualRedeem * pointValue;

    // Áp dụng phiếu giảm giá nếu có
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await couponModel.findOne({ where: { code: couponCode } });
      if (!coupon || coupon.ownerUserId !== userId) {
        return res
          .status(400)
          .json({ success: false, message: "Phiếu giảm giá không hợp lệ" });
      }
      if (coupon.usesRemaining <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Phiếu đã sử dụng" });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Phiếu đã hết hạn" });
      }
      if (totalOrderPrice < Number(coupon.minOrder || 0)) {
        return res.status(400).json({
          success: false,
          message: "Chưa đạt giá trị tối thiểu để áp dụng phiếu",
        });
      }

      let couponDiscount = 0;
      if (coupon.type === "FIXED") {
        couponDiscount = Number(coupon.value || 0);
      } else {
        couponDiscount = Math.floor(
          (totalOrderPrice * Number(coupon.value || 0)) / 100
        );
        const cap = Number(coupon.maxDiscount || 0);
        if (cap > 0) couponDiscount = Math.min(couponDiscount, cap);
      }
      couponDiscount = Math.max(0, Math.min(couponDiscount, totalOrderPrice));
      discount += couponDiscount;
      appliedCoupon = coupon;
    }

    const order = await orderModel.create({
      orderUserId: userId,
      items: snapshotItems,
      totalOrderPrice: Math.max(0, totalOrderPrice - discount),
      totalOrderQuantity,
      shippingAddress,
    });

    const promotionScore = await promotionScoreModel.findOne({
      where: { promotionScoreUserId: userId },
    });

    if (order) {
      // Cập nhật điểm: cộng điểm tích lũy và trừ điểm đã dùng
      if (currentPromotion) {
        await currentPromotion.update({
          totalPromotionScore:
            Number(currentPromotion.totalPromotionScore || 0) -
            actualRedeem +
            totalOrderPromotionScore,
        });
      } else {
        await promotionScoreModel.create({
          promotionScoreUserId: userId,
          totalPromotionScore: Math.max(
            0,
            totalOrderPromotionScore - actualRedeem
          ),
        });
      }

      // Nếu có coupon, trừ lượt sử dụng
      if (appliedCoupon) {
        await appliedCoupon.update({
          usesRemaining: Math.max(
            0,
            Number(appliedCoupon.usesRemaining || 0) - 1
          ),
        });
      }

      // Emit socket notification: new order created
      const io = getIO();
      io &&
        io.emit("notification:new_order", {
          title: "Đơn hàng mới",
          message: `User #${userId} vừa đặt đơn #${order.id}`,
          orderId: order.id,
          total: Math.max(0, totalOrderPrice - discount),
          createdAt: new Date().toISOString(),
        });
    }

    return res.json({
      success: true,
      data: {
        ...order.toJSON(),
        discount,
        usedPromotionScore: actualRedeem,
        usedCouponCode: appliedCoupon ? appliedCoupon.code : null,
      },
      message: "Tạo đơn hàng thành công",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// PATCH /api/v1/order/:id/cancel-request
export const requestCancelOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const order = await orderModel.findByPk(id);
    if (!order || order.orderUserId !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn" });
    }

    const createdAt = new Date(order.createdAt).getTime();
    const diffMin = (Date.now() - createdAt) / (1000 * 60);
    const allowedStatus = ["NEW", "CONFIRMED"];
    if (diffMin > 30 || !allowedStatus.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy ở trạng thái hiện tại",
      });
    }

    await order.update({ cancelRequested: true });
    return res.json({ success: true, message: "Đã gửi yêu cầu hủy đơn" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// PATCH /api/v1/order/:id/status - Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = [
      "NEW",
      "CONFIRMED",
      "PREPARING",
      "SHIPPING",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!allowed.includes((status || "").toUpperCase())) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const order = await orderModel.findByPk(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn" });
    }

    if (
      ["COMPLETED", "CANCELLED"].includes((order.status || "").toUpperCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Đơn đã kết thúc, không thể cập nhật",
      });
    }

    await order.update({ status: status.toUpperCase() });
    return res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Admin: GET /api/v1/order/admin - list all orders
export const adminListOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const total = await orderModel.count();
    const orders = await orderModel.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/order/admin/stats - KPIs and chart data
export const adminOrderStats = async (req, res) => {
  try {
    // Successful orders for revenue stats
    const all = await orderModel.findAll({ order: [["createdAt", "DESC"]] });
    const completed = all.filter(
      (o) => (o.status || "").toUpperCase() === "COMPLETED"
    );

    const totalRevenue = completed.reduce(
      (s, o) => s + Number(o.totalOrderPrice || 0),
      0
    );
    const totalOrders = all.length;
    const completedOrders = completed.length;
    const shippingOrders = all.filter(
      (o) => (o.status || "").toUpperCase() === "SHIPPING"
    ).length;
    const newOrders = all.filter(
      (o) => (o.status || "").toUpperCase() === "NEW"
    ).length;

    // Group by day revenue (last 14 days)
    const days = {};
    for (const o of completed) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      days[key] = (days[key] || 0) + Number(o.totalOrderPrice || 0);
    }
    const last14 = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      last14.push({ date: key, revenue: days[key] || 0 });
    }

    // Top 10 products by quantity from order snapshots
    const productQty = {};
    for (const o of all) {
      const items = Array.isArray(o.items) ? o.items : [];
      for (const it of items) {
        const name = it?.name || `#${it?.productId}`;
        productQty[name] = (productQty[name] || 0) + Number(it?.quantity || 0);
      }
    }
    const topProducts = Object.entries(productQty)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalOrders,
          completedOrders,
          shippingOrders,
          newOrders,
        },
        revenueByDay: last14,
        topProducts,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};
