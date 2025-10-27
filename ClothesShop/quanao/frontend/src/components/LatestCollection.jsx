import React from "react";
import { useContext } from "react";
import Hero from "../components/Hero";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { useState } from "react";
import { useEffect } from "react";
import ProductItem from "./ProductItem";
import { getHomepageProductApi } from "../services/api";

const LatestCollection = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      const response = await getHomepageProductApi();
      setBestSellingProducts(response.data.bestSellingProducts);
      
    };
    fetchBestSellingProducts();
  }, []);

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"BEST SELLING"} text2={"PRODUCTS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the.
        </p>
      </div>

      {/* rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestSellingProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item?.id}
            image={item?.productImage}
            name={item?.productName}
            price={item?.productPrice}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
