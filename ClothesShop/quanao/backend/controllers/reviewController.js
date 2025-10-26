import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import promotionScoreModel from "../models/promotionScore.js";
import userModel from "../models/userModel.js";
import { getIO } from "../services/socket.js";

// GET /api/v1/review/product/:productId - Lấy danh sách đánh giá của sản phẩm
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      reviewProductId: productId,
      status: "APPROVED",
    };

    if (rating) {
      whereClause.rating = rating;
    }

    const reviews = await reviewModel.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Tính thống kê rating
    const ratingStats = await reviewModel.findAll({
      where: { reviewProductId: productId, status: "APPROVED" },
      attributes: [
        [
          reviewModel.sequelize.fn("AVG", reviewModel.sequelize.col("rating")),
          "averageRating",
        ],
        [
          reviewModel.sequelize.fn("COUNT", reviewModel.sequelize.col("id")),
          "totalReviews",
        ],
      ],
      raw: true,
    });

    const ratingCounts = await reviewModel.findAll({
      where: { reviewProductId: productId, status: "APPROVED" },
      attributes: [
        "rating",
        [
          reviewModel.sequelize.fn("COUNT", reviewModel.sequelize.col("id")),
          "count",
        ],
      ],
      group: ["rating"],
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        reviews: reviews.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(reviews.count / limit),
          totalItems: reviews.count,
          itemsPerPage: parseInt(limit),
        },
        stats: {
          averageRating: parseFloat(ratingStats[0]?.averageRating || 0).toFixed(
            1
          ),
          totalReviews: parseInt(ratingStats[0]?.totalReviews || 0),
          ratingCounts: ratingCounts,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/review - Tạo đánh giá sản phẩm
export const createReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId, orderId, rating, comment, images } = req.body;

    // Validate input
    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Đánh giá phải từ 1 đến 5 sao",
      });
    }

    // Kiểm tra đơn hàng có tồn tại và thuộc về user không
    const order = await orderModel.findByPk(orderId);
    if (!order || order.orderUserId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Kiểm tra đơn hàng đã hoàn thành chưa
    if (order.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đánh giá sản phẩm từ đơn hàng đã hoàn thành",
      });
    }

    // Kiểm tra sản phẩm có trong đơn hàng không
    const productInOrder = order.items.find(
      (item) => item.productId === parseInt(productId)
    );
    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm không có trong đơn hàng này",
      });
    }

    // Kiểm tra đã đánh giá sản phẩm này từ đơn hàng này chưa
    const existingReview = await reviewModel.findOne({
      where: {
        reviewUserId: userId,
        reviewProductId: productId,
        reviewOrderId: orderId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này từ đơn hàng này rồi",
      });
    }

    // Tạo đánh giá
    const review = await reviewModel.create({
      reviewUserId: userId,
      reviewProductId: productId,
      reviewOrderId: orderId,
      rating,
      comment: comment || null,
      images: images || [],
      isVerified: true, // Đánh dấu đã xác minh vì có order
      status: "APPROVED", // Tự động approve vì đã xác minh
    });

    // Tặng điểm cho user (ví dụ: 10 điểm cho mỗi đánh giá)
    const pointsToAdd = 10;
    const promotionScore = await promotionScoreModel.findOne({
      where: { promotionScoreUserId: userId },
    });

    if (promotionScore) {
      await promotionScore.update({
        totalPromotionScore: promotionScore.totalPromotionScore + pointsToAdd,
      });
    } else {
      await promotionScoreModel.create({
        promotionScoreUserId: userId,
        totalPromotionScore: pointsToAdd,
      });
    }

    // Lấy thông tin user và product để gửi thông báo
    const user = await userModel.findByPk(userId, {
      attributes: ["id", "name", "email"],
    });

    const product = await productModel.findByPk(productId, {
      attributes: ["id", "productName", "productImage"],
    });

    // Emit socket event để thông báo cho admin
    const io = getIO();
    if (io) {
      const notificationData = {
        type: "NEW_REVIEW",
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        },
        user: {
          id: user.id,
          userName: user.name,
          userEmail: user.email,
        },
        product: {
          id: product.id,
          productName: product.productName,
          productImage: product.productImage,
        },
        message: `Có đánh giá mới từ ${user.name} cho sản phẩm "${product.productName}"`,
      };

      io.to("admin").emit("new_review_notification", notificationData);
    }

    return res.json({
      success: true,
      data: review,
      message: `Đánh giá thành công! Bạn nhận được ${pointsToAdd} điểm thưởng`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/review/my-reviews - Lấy đánh giá của user
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await reviewModel.findAndCountAll({
      where: { reviewUserId: userId },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Manually fetch product data for each review
    const reviewsWithProducts = await Promise.all(
      reviews.rows.map(async (review) => {
        const product = await productModel.findByPk(review.reviewProductId, {
          attributes: ["id", "productName", "productImage"],
        });
        return {
          ...review.toJSON(),
          product: product || null,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        reviews: reviewsWithProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(reviews.count / limit),
          totalItems: reviews.count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/review/eligible-orders/:productId - Lấy danh sách đơn hàng có thể đánh giá sản phẩm
export const getEligibleOrdersForReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId } = req.params;

    // Lấy các đơn hàng đã hoàn thành có chứa sản phẩm này
    const orders = await orderModel.findAll({
      where: {
        orderUserId: userId,
        status: "COMPLETED",
      },
      order: [["createdAt", "DESC"]],
    });

    // Lọc các đơn hàng có chứa sản phẩm và chưa được đánh giá
    const eligibleOrders = [];

    for (const order of orders) {
      const productInOrder = order.items.find(
        (item) => item.productId === parseInt(productId)
      );
      if (productInOrder) {
        // Kiểm tra đã đánh giá chưa
        const existingReview = await reviewModel.findOne({
          where: {
            reviewUserId: userId,
            reviewProductId: productId,
            reviewOrderId: order.id,
          },
        });

        if (!existingReview) {
          eligibleOrders.push({
            orderId: order.id,
            orderDate: order.createdAt,
            product: productInOrder,
            orderTotal: order.totalOrderPrice,
          });
        }
      }
    }

    return res.json({
      success: true,
      data: eligibleOrders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
