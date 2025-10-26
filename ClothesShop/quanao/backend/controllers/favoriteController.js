import favoriteModel from "../models/favoriteModel.js";
import productModel from "../models/productModel.js";

// POST /api/v1/favorite - Thêm sản phẩm vào yêu thích
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin sản phẩm",
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await productModel.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Kiểm tra đã yêu thích chưa
    const existingFavorite = await favoriteModel.findOne({
      where: {
        favoriteUserId: userId,
        favoriteProductId: productId,
      },
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm đã có trong danh sách yêu thích",
      });
    }

    // Thêm vào yêu thích
    const favorite = await favoriteModel.create({
      favoriteUserId: userId,
      favoriteProductId: productId,
    });

    return res.json({
      success: true,
      data: favorite,
      message: "Đã thêm vào danh sách yêu thích",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/favorite/:productId - Xóa sản phẩm khỏi yêu thích
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId } = req.params;

    // Tìm và xóa khỏi yêu thích
    const favorite = await favoriteModel.findOne({
      where: {
        favoriteUserId: userId,
        favoriteProductId: productId,
      },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không có trong danh sách yêu thích",
      });
    }

    await favorite.destroy();

    return res.json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/favorite - Lấy danh sách sản phẩm yêu thích
export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const favorites = await favoriteModel.findAndCountAll({
      where: { favoriteUserId: userId },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Manually fetch product data for each favorite
    const favoritesWithProducts = await Promise.all(
      favorites.rows.map(async (favorite) => {
        const product = await productModel.findByPk(
          favorite.favoriteProductId,
          {
            attributes: [
              "id",
              "productName",
              "productPrice",
              "productImage",
              "productDescription",
              "productQuantity",
              "productCountSell",
              "productClickView",
            ],
          }
        );
        return {
          ...favorite.toJSON(),
          product: product || null,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        favorites: favoritesWithProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(favorites.count / limit),
          totalItems: favorites.count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/favorite/check/:productId - Kiểm tra sản phẩm có trong yêu thích không
export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId } = req.params;

    const favorite = await favoriteModel.findOne({
      where: {
        favoriteUserId: userId,
        favoriteProductId: productId,
      },
    });

    return res.json({
      success: true,
      data: {
        isFavorite: !!favorite,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
