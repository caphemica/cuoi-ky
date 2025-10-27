import React, { useState, useEffect } from 'react';
import { Rate, Pagination, Select, Empty, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductReviews } from '@/store/slices/reviewSlice';

const { Option } = Select;

const ReviewList = ({ productId }) => {
  const dispatch = useDispatch();
  const { productReviews, loading } = useSelector((state) => state.review);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews({
        productId,
        page: currentPage,
        limit: 5,
        rating: ratingFilter || undefined,
      }));
    }
  }, [dispatch, productId, currentPage, ratingFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRatingFilterChange = (value) => {
    setRatingFilter(value);
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    return <Rate disabled value={rating} style={{ fontSize: 14 }} />;
  };

  const renderRatingStats = () => {
    const { stats } = productReviews;
    if (!stats || stats.totalReviews === 0) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">
              {stats.averageRating}
            </div>
            <div className="text-sm text-gray-600">
              {renderStars(parseFloat(stats.averageRating))}
            </div>
            <div className="text-sm text-gray-500">
              {stats.totalReviews} đánh giá
            </div>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingCounts.find(r => r.rating === star)?.count || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-4">{star}</span>
                  <Rate disabled value={1} style={{ fontSize: 12 }} />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading && productReviews.reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {renderRatingStats()}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Đánh giá sản phẩm</h3>
        <Select
          placeholder="Lọc theo sao"
          value={ratingFilter}
          onChange={handleRatingFilterChange}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="5">5 sao</Option>
          <Option value="4">4 sao</Option>
          <Option value="3">3 sao</Option>
          <Option value="2">2 sao</Option>
          <Option value="1">1 sao</Option>
        </Select>
      </div>

      {productReviews.reviews.length === 0 ? (
        <Empty description="Chưa có đánh giá nào" />
      ) : (
        <>
          <div className="space-y-4">
            {productReviews.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {review.reviewUserId?.toString().slice(-2) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Người dùng {review.reviewUserId}</span>
                      {review.isVerified && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          Đã xác minh
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review ${index + 1}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {productReviews.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={productReviews.pagination.totalItems}
                pageSize={productReviews.pagination.itemsPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;
