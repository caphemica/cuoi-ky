import productModel from "../models/productModel.js";
import { getIO } from "../services/socket.js";
import { Op } from "sequelize";

const getHomepageData = async (req, res) => {
  try {
    // Lấy 8 sản phẩm mới nhất
    const newestProducts = await productModel.findAll({
      order: [["createdAt", "DESC"]],
      limit: 8,
    });

    // Lấy 6 sản phẩm bán chạy nhất
    const bestSellingProducts = await productModel.findAll({
      order: [["productCountSell", "DESC"]],
      limit: 6,
    });

    // Lấy 8 sản phẩm được xem nhiều nhất
    const mostViewedProducts = await productModel.findAll({
      order: [["productClickView", "DESC"]],
      limit: 8,
    });

    // Lấy 4 sản phẩm khuyến mãi cao nhất
    const highestPromotionProducts = await productModel.findAll({
      where: {
        productPromotion: {
          [Op.gt]: 0, // Lấy sản phẩm có khuyến mãi > 0
        },
      },
      order: [["productPromotion", "DESC"]],
      limit: 4,
    });

    res.json({
      success: true,
      data: {
        newestProducts,
        bestSellingProducts,
        mostViewedProducts,
        highestPromotionProducts,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findByPk(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    await productModel.update(
      { productClickView: (product.productClickView || 0) + 1 },
      { where: { id } }
    );

    return res.json({ success: true, data: product });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "DESC";

    const search = req.query.search || "";

    const whereCondition = search
      ? {
          [Op.or]: [
            { productName: { [Op.like]: `%${search}%` } },
            { productDescription: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const totalProducts = await productModel.count({ where: whereCondition });

    const products = await productModel.findAll({
      where: whereCondition,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          limit,
          hasNextPage,
          hasPreviousPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPreviousPage ? page - 1 : null,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getHomepageData, getProductById, getAllProduct };

// Admin create product
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productPrice,
      productQuantity,
      productImage,
      productPromotion,
    } = req.body || {};
    if (!productName || !productDescription) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu tên/mô tả" });
    }
    const doc = await productModel.create({
      productName,
      productDescription,
      productPrice: Number(productPrice || 0),
      productQuantity: Number(productQuantity || 0),
      productImage: Array.isArray(productImage) ? productImage : [],
      productCountSell: 0,
      productClickView: 0,
      productPromotion: Number(productPromotion || 0),
    });

    // Emit socket notification to all clients
    const io = getIO();
    io &&
      io.emit("notification:new_product", {
        title: "Sản phẩm mới",
        message: `Đã có sản phẩm mới: ${doc.productName}`,
        productId: doc.id,
        createdAt: new Date().toISOString(),
      });

    return res.json({
      success: true,
      data: doc,
      message: "Tạo sản phẩm thành công",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};
