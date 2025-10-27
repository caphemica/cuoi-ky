import React from "react";
import BestSeller from "../components/BestSeller";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import NewsletterBox from "../components/NewsletterBox";
import OurPolicy from "../components/OurPolicy";
import MostViewCollection from "../components/MostViewCollection";
import MostPromotionProducts from "../components/MostPromotionProducts";

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <MostViewCollection />
      <MostPromotionProducts />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;
