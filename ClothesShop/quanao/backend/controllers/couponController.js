import couponModel from "../models/couponModel.js";
import promotionScoreModel from "../models/promotionScore.js";
import couponTemplateModel from "../models/couponTemplateModel.js";

// GET /api/v1/coupon - list my coupons (valid and not expired)
export const getMyCoupons = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    

    const now = new Date();
    const coupons = await couponModel.findAll({
      where: {
        ownerUserId: userId,
      },
      order: [["createdAt", "DESC"]],
    });

    const data = coupons.map((c) => c.toJSON());
    return res.json({ success: true, data });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/coupon/redeem - redeem coupon by promotionScore
// body: { type: 'FIXED'|'PERCENT', value: number, minOrder?: number, maxDiscount?: number, costPoints: number, expiresInDays?: number }
export const redeemCouponByPoints = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { type, value, minOrder, maxDiscount, costPoints, expiresInDays } =
      req.body || {};

    const parsedType = (type || "").toUpperCase();
    if (!["FIXED", "PERCENT"].includes(parsedType)) {
      return res
        .status(400)
        .json({ success: false, message: "Loại phiếu không hợp lệ" });
    }

    const v = Number(value || 0);
    const cost = Math.max(1, Number(costPoints || 0));
    if (parsedType === "PERCENT" && (v <= 0 || v > 100)) {
      return res
        .status(400)
        .json({ success: false, message: "Phần trăm giảm phải trong 1-100" });
    }
    if (parsedType === "FIXED" && v <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Mệnh giá giảm không hợp lệ" });
    }

    const ps = await promotionScoreModel.findOne({
      where: { promotionScoreUserId: userId },
    });
    const available = Number(ps?.totalPromotionScore || 0);
    if (available < cost) {
      return res
        .status(400)
        .json({ success: false, message: "Điểm không đủ để đổi phiếu" });
    }

    // Generate simple code
    const code = `CP${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000
    )}`;

    const expiresAt = expiresInDays
      ? new Date(Date.now() + Number(expiresInDays) * 86400000)
      : null;

    const newCoupon = await couponModel.create({
      code,
      ownerUserId: userId,
      type: parsedType,
      value: Math.floor(v),
      minOrder: Math.max(0, Number(minOrder || 0)),
      maxDiscount: Math.max(0, Number(maxDiscount || 0)),
      expiresAt,
      usesRemaining: 1,
    });

    if (ps) {
      await ps.update({
        totalPromotionScore: Math.max(0, available - cost),
      });
    } else {
      await promotionScoreModel.create({
        promotionScoreUserId: userId,
        totalPromotionScore: 0,
      });
    }

    return res.json({ success: true, data: newCoupon });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/coupon/validate - validate a coupon code against subtotal
// body: { code, subtotal }
export const validateCoupon = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { code, subtotal } = req.body || {};
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã phiếu" });
    }
    const coupon = await couponModel.findOne({ where: { code } });
    if (!coupon || coupon.ownerUserId !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu" });
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

    const sub = Math.max(0, Number(subtotal || 0));
    if (sub < Number(coupon.minOrder || 0)) {
      return res.status(400).json({
        success: false,
        message: "Chưa đạt giá trị tối thiểu để áp dụng phiếu",
      });
    }

    let discount = 0;
    if (coupon.type === "FIXED") {
      discount = Number(coupon.value || 0);
    } else {
      // percent
      discount = Math.floor((sub * Number(coupon.value || 0)) / 100);
      const cap = Number(coupon.maxDiscount || 0);
      if (cap > 0) discount = Math.min(discount, cap);
    }
    discount = Math.max(0, Math.min(discount, sub));

    return res.json({ success: true, data: { discount } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// ========== Templates ==========
// POST /api/v1/coupon/templates - create template (for testing via Postman)
export const createCouponTemplate = async (req, res) => {
  try {
    const {
      name,
      type,
      value,
      minOrder,
      maxDiscount,
      costPoints,
      expiresInDays,
      usesPerCoupon,
    } = req.body || {};

    const parsedType = (type || "").toUpperCase();
    if (!["FIXED", "PERCENT"].includes(parsedType)) {
      return res
        .status(400)
        .json({ success: false, message: "Loại phiếu không hợp lệ" });
    }
    const v = Number(value || 0);
    if (parsedType === "PERCENT" && (v <= 0 || v > 100)) {
      return res
        .status(400)
        .json({ success: false, message: "Phần trăm giảm phải trong 1-100" });
    }
    if (parsedType === "FIXED" && v <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Mệnh giá giảm không hợp lệ" });
    }

    const tmpl = await couponTemplateModel.create({
      name: name || "Unnamed",
      type: parsedType,
      value: Math.floor(v),
      minOrder: Math.max(0, Number(minOrder || 0)),
      maxDiscount: Math.max(0, Number(maxDiscount || 0)),
      costPoints: Math.max(1, Number(costPoints || 0)),
      expiresInDays: Math.max(1, Number(expiresInDays || 7)),
      usesPerCoupon: Math.max(1, Number(usesPerCoupon || 1)),
    });

    return res.json({ success: true, data: tmpl });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/coupon/templates - list templates
export const listCouponTemplates = async (_req, res) => {
  try {
    const list = await couponTemplateModel.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: list });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/coupon/redeem-template - user redeems a templateId using points
export const redeemCouponFromTemplate = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { templateId } = req.body || {};
    const tmpl = await couponTemplateModel.findByPk(templateId);
    if (!tmpl) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy template" });
    }

    const ps = await promotionScoreModel.findOne({
      where: { promotionScoreUserId: userId },
    });
    const available = Number(ps?.totalPromotionScore || 0);
    const cost = Number(tmpl.costPoints || 0);
    if (available < cost) {
      return res
        .status(400)
        .json({ success: false, message: "Điểm không đủ để đổi phiếu" });
    }

    // Generate coupon from template
    const code = `CP${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000
    )}`;
    const expiresAt = new Date(
      Date.now() + Number(tmpl.expiresInDays || 7) * 86400000
    );
    const newCoupon = await couponModel.create({
      code,
      ownerUserId: userId,
      type: tmpl.type,
      value: tmpl.value,
      minOrder: tmpl.minOrder,
      maxDiscount: tmpl.maxDiscount,
      expiresAt,
      usesRemaining: Number(tmpl.usesPerCoupon || 1),
    });

    if (ps) {
      await ps.update({ totalPromotionScore: Math.max(0, available - cost) });
    } else {
      await promotionScoreModel.create({
        promotionScoreUserId: userId,
        totalPromotionScore: 0,
      });
    }

    return res.json({ success: true, data: newCoupon });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};
