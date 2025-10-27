import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";
import { getHomepageProductApi } from "../services/api";

const BestSeller = () => {
  const [newestProducts, setNewestProducts] = useState([]);


  useEffect(() => {
    const fetchNewestProducts = async () => {
      const response = await getHomepageProductApi();
      setNewestProducts(response.data.newestProducts);
      console.log("check response", response);
    }
    fetchNewestProducts();
    console.log(newestProducts);
  },[])

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"NEWEST"} text2={"PRODUCTS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {newestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item?.id}
            name={item?.productName}
            image={item?.productImage}
            price={item?.productPrice}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;