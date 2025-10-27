import React from "react";
import Hero from "../components/Hero";
import Title from "../components/Title";
import { useState } from "react";
import { useEffect } from "react";
import ProductItem from "./ProductItem";
import { getHomepageProductApi } from "../services/api";

const MostPromotionProducts = () => {
  const [mostPromotionProducts, setMostPromotionProducts] = useState([]);

  useEffect(() => {
    const fetchMostPromotionProducts = async () => {
      const response = await getHomepageProductApi();
      setMostPromotionProducts(response.data.highestPromotionProducts);
    };
    fetchMostPromotionProducts();
   
  }, []);

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"HIGHEST PROMOTION"} text2={"PRODUCTS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the.
        </p>
      </div>

      {/* rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {mostPromotionProducts.map((item, index) => (
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

export default MostPromotionProducts;
