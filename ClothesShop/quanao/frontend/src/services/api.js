import axios from "@/services/axios.customize";

export const loginApi = (email, password) => {
  const urlBackend = "/api/v1/user/login";
  return axios.post(urlBackend, { email, password });
};

export const registerApi = (name, email, password) => {
  const urlBackend = "/api/v1/user/register";
  return axios.post(urlBackend, { name, email, password });
};

export const verifyAccountApi = (userId, otpCode) => {
  const urlBackend = "/api/v1/user/verify-otp";
  return axios.post(urlBackend, { userId, otpCode });
};

export const getHomepageProductApi = () => {
  const urlBackend = "/api/v1/product/homepage";
  return axios.get(urlBackend);
};

export const adminCreateProductApi = (payload) => {
  const urlBackend = "/api/v1/product";
  return axios.post(urlBackend, payload);
};

export const getProductByIdApi = (id) => {
  const urlBackend = `/api/v1/product/${id}`;
  return axios.get(urlBackend);
};

// Forgot password
export const requestPasswordResetApi = (email) => {
  const urlBackend = "/api/v1/user/password/request-reset";
  return axios.post(urlBackend, { email });
};

export const verifyResetOtpApi = (email, otpCode) => {
  const urlBackend = "/api/v1/user/password/verify-otp";
  return axios.post(urlBackend, { email, otpCode });
};

export const resetPasswordApi = (email, otpCode, newPassword) => {
  const urlBackend = "/api/v1/user/password/reset";
  return axios.post(urlBackend, { email, otpCode, newPassword });
};

// Get current user info
export const getMeApi = () => {
  const urlBackend = "/api/v1/user/me";
  return axios.get(urlBackend);
};

// Update user name
export const updateNameApi = (name) => {
  const urlBackend = "/api/v1/user/me";
  return axios.patch(urlBackend, { name });
};

export const getAllProductApi = (query) => {
  const urlBackend = "/api/v1/product";
  return axios.get(urlBackend, { params: query });
};

export const getMyCartApi = () => {
  const urlBackend = "/api/v1/cart";
  return axios.get(urlBackend);
};

export const addToCartApi = (productId, quantity) => {
  const urlBackend = "/api/v1/cart/add";
  return axios.post(urlBackend, { productId, quantity });
};

export const decreaseFromCartApi = (productId, quantity) => {
  const urlBackend = "/api/v1/cart/decrease";
  return axios.patch(urlBackend, { productId, quantity });
};

export const removeFromCartApi = (productId) => {
  const urlBackend = "/api/v1/cart/remove";
  return axios.delete(urlBackend, { data: { productId } });
};

// Orders
export const createOrderApi = (payload) => {
  const urlBackend = "/api/v1/order";
  return axios.post(urlBackend, payload);
};

export const getMyOrdersApi = () => {
  const urlBackend = "/api/v1/order";
  return axios.get(urlBackend);
};

export const adminListOrdersApi = (query) => {
  const urlBackend = "/api/v1/order/admin";
  return axios.get(urlBackend, { params: query });
};

export const adminOrderStatsApi = () => {
  const urlBackend = "/api/v1/order/admin/stats";
  return axios.get(urlBackend);
};

export const requestCancelOrderApi = (orderId) => {
  const urlBackend = `/api/v1/order/${orderId}/cancel-request`;
  return axios.patch(urlBackend);
};

// Promotion Score
export const getMyPromotionScoreApi = () => {
  const urlBackend = "/api/v1/promotionScore";
  return axios.get(urlBackend);
};

// Coupons
export const getMyCouponsApi = () => {
  const urlBackend = "/api/v1/coupon";
  return axios.get(urlBackend);
};

export const redeemCouponByPointsApi = (payload) => {
  const urlBackend = "/api/v1/coupon/redeem";
  return axios.post(urlBackend, payload);
};

export const validateCouponApi = (code, subtotal) => {
  const urlBackend = "/api/v1/coupon/validate";
  return axios.post(urlBackend, { code, subtotal });
};

// Coupon templates (for redeem by points)
export const getCouponTemplatesApi = () => {
  const urlBackend = "/api/v1/coupon/templates";
  return axios.get(urlBackend);
};

export const redeemCouponFromTemplateApi = (templateId) => {
  const urlBackend = "/api/v1/coupon/redeem-template";
  return axios.post(urlBackend, { templateId });
};

// Reviews
export const getProductReviewsApi = (productId, query) => {
  const urlBackend = `/api/v1/review/product/${productId}`;
  return axios.get(urlBackend, { params: query });
};

export const createReviewApi = (payload) => {
  const urlBackend = "/api/v1/review";
  return axios.post(urlBackend, payload);
};

export const getMyReviewsApi = (query) => {
  const urlBackend = "/api/v1/review/my-reviews";
  return axios.get(urlBackend, { params: query });
};

export const getEligibleOrdersForReviewApi = (productId) => {
  const urlBackend = `/api/v1/review/eligible-orders/${productId}`;
  return axios.get(urlBackend);
};

// Favorites
export const addToFavoritesApi = (productId) => {
  const urlBackend = "/api/v1/favorite";
  return axios.post(urlBackend, { productId });
};

export const removeFromFavoritesApi = (productId) => {
  const urlBackend = `/api/v1/favorite/${productId}`;
  return axios.delete(urlBackend);
};

export const getMyFavoritesApi = (query) => {
  const urlBackend = "/api/v1/favorite";
  return axios.get(urlBackend, { params: query });
};

export const checkFavoriteApi = (productId) => {
  const urlBackend = `/api/v1/favorite/check/${productId}`;
  return axios.get(urlBackend);
};
