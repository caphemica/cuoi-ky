import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

const computeTotals = (items = []) => {
  const totalCartQuantity = items.reduce(
    (s, i) => s + (Number(i.quantity) || 0),
    0
  );
  const totalCartPrice = items.reduce(
    (s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0),
    0
  );
  return { totalCartQuantity, totalCartPrice };
};

// GET /api/v1/cart - lấy giỏ hàng của user hiện tại
export const getMyCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let cart = await cartModel.findOne({ where: { cartUserId: userId } });
    if (!cart) {
      cart = await cartModel.create({
        cartUserId: userId,
        items: [],
        totalCartPrice: 0,
        totalCartQuantity: 0,
      });
    }

    return res.json({ success: true, data: cart });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/cart/add - thêm sản phẩm vào giỏ
// body: { productId: number, quantity?: number }
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId, quantity } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    // Lấy thông tin sản phẩm để lưu snapshot (name, price, image)
    const product = await productModel.findByPk(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let cart = await cartModel.findOne({ where: { cartUserId: userId } });
    if (!cart) {
      cart = await cartModel.create({
        cartUserId: userId,
        items: [],
        totalCartPrice: 0,
        totalCartQuantity: 0,
      });
    }

    const items = Array.isArray(cart.items) ? [...cart.items] : [];
    const idx = items.findIndex(
      (it) => Number(it.productId) === Number(productId)
    );

    const currentQtyInCart = idx > -1 ? Number(items[idx].quantity) || 0 : 0;

    // Kiểm tra tồn kho trước khi cộng vào giỏ
    const desiredTotal = currentQtyInCart + qty;
    const stock = Number(product.productQuantity) || 0;
    if (desiredTotal > stock) {
      return res.status(400).json({
        success: false,
        message: `Số lượng vượt quá tồn kho. Hiện còn ${
          stock - currentQtyInCart
        } sản phẩm`,
      });
    }

    if (idx > -1) {
      items[idx].quantity = desiredTotal;
    } else {
      items.push({
        productId: productId,
        name: product.productName,
        price: product.productPrice,
        image: product.productImage,
        quantity: qty,
      });
    }

    const totals = computeTotals(items);

    await cart.update({
      items,
      totalCartPrice: totals.totalCartPrice,
      totalCartQuantity: totals.totalCartQuantity,
    });

    return res.json({ success: true, message: "Added to cart", data: cart });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// PATCH /api/v1/cart/decrease - giảm số lượng sản phẩm trong giỏ
// body: { productId: number, quantity?: number }
export const decreaseFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId, quantity } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    let cart = await cartModel.findOne({ where: { cartUserId: userId } });
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or empty",
      });
    }

    const items = [...cart.items];
    const idx = items.findIndex(
      (it) => Number(it.productId) === Number(productId)
    );

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const currentQty = Number(items[idx].quantity) || 0;
    const newQty = Math.max(1, currentQty - qty);

    items[idx].quantity = newQty;

    const totals = computeTotals(items);

    await cart.update({
      items,
      totalCartPrice: totals.totalCartPrice,
      totalCartQuantity: totals.totalCartQuantity,
    });

    return res.json({
      success: true,
      message: "Quantity decreased",
      data: cart,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/v1/cart/remove - xóa sản phẩm khỏi giỏ
// body: { productId: number }
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    let cart = await cartModel.findOne({ where: { cartUserId: userId } });
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or empty",
      });
    }

    const items = [...cart.items];
    const idx = items.findIndex(
      (it) => Number(it.productId) === Number(productId)
    );

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Xóa item khỏi giỏ
    items.splice(idx, 1);

    const totals = computeTotals(items);

    await cart.update({
      items,
      totalCartPrice: totals.totalCartPrice,
      totalCartQuantity: totals.totalCartQuantity,
    });

    return res.json({
      success: true,
      message: "Product removed from cart",
      data: cart,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: e.message });
  }
};
