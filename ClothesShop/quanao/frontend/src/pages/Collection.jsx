import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { Pagination, Select, Input } from "antd";
import { getAllProductApi } from "../services/api";

const { Option } = Select;

const Collection = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProductApi({
        page,
        limit,
        sortBy,
        sortOrder,
        search: search.trim(),
      });
      const data = res?.data;
      setProducts(data?.products || []);
      setTotalProducts(data?.pagination?.totalProducts || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder]);

  const handleSortChange = (value) => {
    switch (value) {
      case "low-high":
        setSortBy("productPrice");
        setSortOrder("ASC");
        setPage(1);
        break;
      case "high-low":
        setSortBy("productPrice");
        setSortOrder("DESC");
        setPage(1);
        break;
      default:
        setSortBy("createdAt");
        setSortOrder("DESC");
        setPage(1);
        break;
    }
  };

  console.log("products", products);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="flex flex-col gap-6 pt-10 border-t">
      <div className="flex justify-between items-center">
        <Title text1={"ALL"} text2={"COLLECTIONS"} />
        <div className="flex gap-3">
          <Input.Search
            allowClear
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
            loading={loading}
            style={{ width: 240 }}
          />
          <Select
            defaultValue="relavent"
            onChange={handleSortChange}
            style={{ width: 200 }}
          >
            <Option value="relavent">Sort by: Relevant</Option>
            <Option value="low-high">Sort by: Low to High</Option>
            <Option value="high-low">Sort by: High to Low</Option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 min-h-48">
        {products.map((item) => (
          <ProductItem
            key={item.id}
            id={item.id}
            name={item.productName}
            price={item.productPrice}
            image={item.productImage}
          />
        ))}
        {!loading && products.length === 0 && (
          <div className="col-span-4 text-center text-gray-500">
            No products found
          </div>
        )}
      </div>

      <div className="flex justify-center sm:justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={totalProducts}
          showSizeChanger
          pageSizeOptions={["8", "12", "16", "24", "36"]}
          onChange={(p, ps) => {
            setPage(p);
            setLimit(ps);
          }}
        />
      </div>
    </div>
  );
};

export default Collection;