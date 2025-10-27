"use client";

import { useQuery } from "@tanstack/react-query";
import { Row, Col } from "antd";
import Chart from "./Chart";
import { getOrdersAPI, getProductsAPI } from "@/services/api";

export default function DashboardStats() {
  // Fetch orders data
  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrdersAPI({ current: 1, pageSize: 1000 }), // Get all orders
  });

  // Fetch products data
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProductsAPI({ current: 1, pageSize: 1000 }), // Get all products
  });

  const orders = (ordersResponse as any)?.data || [];
  const products = (productsResponse as any)?.data || [];
  const isLoading = ordersLoading || productsLoading;

  if (!orders.length && !products.length) return null;

  // Process orders data for charts
  const processOrdersData = () => {
    // Group orders by month
    const ordersByMonth: { [key: string]: { count: number; revenue: number } } =
      {};

    orders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!ordersByMonth[monthKey]) {
        ordersByMonth[monthKey] = { count: 0, revenue: 0 };
      }

      ordersByMonth[monthKey].count += 1;
      ordersByMonth[monthKey].revenue += order.totalOrderPrice || 0;
    });

    // Convert to arrays for chart
    const sortedMonths = Object.keys(ordersByMonth).sort();

    return {
      labels: sortedMonths.map((month) => {
        const [year, monthNum] = month.split("-");
        return `${monthNum}/${year}`;
      }),
      ordersData: sortedMonths.map((month) => ordersByMonth[month].count),
      revenueData: sortedMonths.map((month) => ordersByMonth[month].revenue),
    };
  };

  const chartData = processOrdersData();

  // Prepare data for orders chart (by month)
  const ordersChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Số đơn hàng",
        data: chartData.ordersData,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for revenue chart (by month)
  const revenueChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: chartData.revenueData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={12}>
        <Chart
          title="Tổng số đơn hàng theo tháng"
          data={ordersChartData}
          type="bar"
          loading={isLoading}
        />
      </Col>
      <Col xs={24} lg={12}>
        <Chart
          title="Tổng doanh thu theo tháng"
          data={revenueChartData}
          type="line"
          loading={isLoading}
        />
      </Col>
    </Row>
  );
}
