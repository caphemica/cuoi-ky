import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCartApi, getProductByIdApi } from "../services/api";
import { toast } from 'sonner'
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { addToFavorites, removeFromFavorites, checkFavorite } from "../store/slices/favoriteSlice";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import { Rate, message } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

const Product = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("S");
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { favoriteStatus } = useSelector((state) => state.favorite);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductByIdApi(productId);
        if (res?.success) {
          setProduct(res.data);
        } else {
          setError(res?.message || "Không thể tải sản phẩm");
        }
      } catch (e) {
        setError(e?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    if (isAuthenticated && productId) {
      dispatch(checkFavorite(productId));
    }
  }, [dispatch, isAuthenticated, productId]);

  const images = useMemo(() => {
    if (!product?.productImage) return [];
    return Array.isArray(product.productImage)
      ? product.productImage
      : [product.productImage];
  }, [product]);

  const activeImage = images[activeImageIdx] || "https://res.cloudinary.com/dbxotojek/image/upload/v1756965917/p_img10_hjfeea.png";

  if (loading) return <div className="py-10 text-center">Đang tải...</div>;
  if (error) return <div className="py-10 text-center text-red-600">{error}</div>;
  if (!product) return null;

  const handleAddToCart = async () => {
    if (!product?.id) return;
    try {
      await dispatch(addToCart({ productId: productId, quantity: quantity })).unwrap();
      toast.success("Thêm vào giỏ thành công");
    } catch (e) {
      const msg = e?.message || e || "Không thể thêm vào giỏ";
      toast.error(msg);
    }
  };

  const handleBuyNow = async () => {
    if (!product?.id) return;
    navigate("/place-order", {
      replace: false,
      state: {
        buyNow: {
          productId: product.id,
          quantity,
          price: product.productPrice,
          name: product.productName,
          image: product.productImage,
        },
      },
    });
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    try {
      const isFavorite = favoriteStatus[productId];
      if (isFavorite) {
        await dispatch(removeFromFavorites(productId)).unwrap();
        message.success("Đã xóa khỏi danh sách yêu thích");
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await dispatch(addToFavorites(productId)).unwrap();
        message.success("Đã thêm vào danh sách yêu thích");
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      message.error(error?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Gallery */}
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-1 flex flex-col gap-3 max-h-[520px] overflow-auto pr-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`border ${
                activeImageIdx === idx ? "border-black" : "border-transparent"
              } rounded overflow-hidden`}
            >
              <img src={img || "https://res.cloudinary.com/dbxotojek/image/upload/v1756965889/p_img2_l8dl3c.png"} alt="thumb" className="w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="col-span-5 border rounded overflow-hidden">
          {activeImage && (
            <img src={activeImage} alt={product.productName} className="w-full object-contain" />
          )}
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold">
          {product.productName}
        </h1>
        <div className="text-gray-600 text-sm">Đã bán {product.productCountSell || 0} • Lượt xem {product.productClickView || 0}</div>
        
        {/* Rating display */}
        <div className="flex items-center gap-2">
          <Rate disabled value={4.5} style={{ fontSize: 16 }} />
          <span className="text-sm text-gray-600">(4.5) • 12 đánh giá</span>
        </div>
        
        <div className="text-2xl text-red-600 font-semibold">
          ₫{product.productPrice?.toLocaleString("vi-VN")}
        </div>
        <div className="text-gray-700 leading-relaxed">
          {product.productDescription}
        </div>

        {/* Size */}
        <div className="mt-2">
          <div className="mb-2 font-medium">SIZE</div>
          <div className="flex gap-2">
            {["S", "M", "L", "XL"].map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-4 py-2 border rounded ${
                  selectedSize === sz ? "border-black" : "border-gray-300"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mt-2">
          <div className="mb-2 font-medium">Số lượng</div>
          <div className="inline-flex items-center border rounded">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2"
            >
              -
            </button>
            <div className="px-4 py-2 min-w-12 text-center">{quantity}</div>
            <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2">
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button className="bg-black text-white px-6 py-3 rounded" onClick={handleAddToCart}>
            Thêm vào giỏ
          </button>
          <button className="border border-black px-6 py-3 rounded" onClick={handleBuyNow}>
            Mua ngay
          </button>
          <button
            className={`px-6 py-3 rounded border transition-colors ${
              favoriteStatus[productId]
                ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                : "border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500"
            }`}
            onClick={handleToggleFavorite}
            title={favoriteStatus[productId] ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            {favoriteStatus[productId] ? (
              <HeartFilled className="text-lg" />
            ) : (
              <HeartOutlined className="text-lg" />
            )}
          </button>
          {isAuthenticated && (
            <button 
              className="border border-gray-300 px-6 py-3 rounded hover:border-gray-400"
              onClick={() => setShowReviewForm(true)}
            >
              Đánh giá
            </button>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="col-span-full mt-12">
        <ReviewList productId={productId} />
      </div>
      
      {/* Review Form Modal */}
      <ReviewForm
        visible={showReviewForm}
        onCancel={() => setShowReviewForm(false)}
        productId={productId}
        onSuccess={() => {
          // Refresh reviews after successful submission
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Product;