import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Pagination, Empty, Spin, message } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { fetchMyFavorites, removeFromFavorites } from "@/store/slices/favoriteSlice";
import { addToCart } from "@/store/slices/cartSlice";

const MyFavorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { favorites, loading } = useSelector((state) => state.favorite);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(fetchMyFavorites({ page: currentPage, limit: 12 }));
  }, [dispatch, isAuthenticated, navigate, currentPage]);

  console.log(favorites);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      const result = await dispatch(removeFromFavorites(productId));
      if (result.type.endsWith("fulfilled")) {
        message.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        message.error(result.payload || "Không thể xóa khỏi yêu thích");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      message.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      message.error(error?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const getProductImage = (product) => {
    if (!product?.productImage) return "";
    if (Array.isArray(product.productImage)) {
      return product.productImage[0] || "";
    }
    return product.productImage;
  };

  if (loading && favorites.favorites?.length === 0) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm yêu thích</h1>
        <p className="text-gray-600">
          {favorites.pagination?.totalItems || 0} sản phẩm trong danh sách yêu thích
        </p>
      </div>

      {!favorites.favorites || favorites.favorites.length === 0 ? (
        <div className="py-20">
          <Empty
            description="Chưa có sản phẩm yêu thích nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link
              to="/collection"
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </Empty>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.favorites?.map((favorite) => {
              const product = favorite.product;
              const image = getProductImage(product);

              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.productImage[0] || "https://res.cloudinary.com/dbxotojek/image/upload/v1756965917/p_img10_hjfeea.png"}
                        alt={product.productName}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(product.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                      title="Xóa khỏi yêu thích"
                    >
                      <HeartOutlined className="text-red-500 text-lg" />
                    </button>
                  </div>

                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {product.productName}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-red-600">
                        ₫{product.productPrice?.toLocaleString("vi-VN")}
                      </span>
                      <div className="text-sm text-gray-500">
                        Đã bán {product.productCountSell || 0}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCartOutlined />
                        Thêm vào giỏ
                      </button>
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:border-gray-400 transition-colors text-center"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {favorites.pagination?.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                total={favorites.pagination?.totalItems || 0}
                pageSize={favorites.pagination?.itemsPerPage || 12}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyFavorites;
