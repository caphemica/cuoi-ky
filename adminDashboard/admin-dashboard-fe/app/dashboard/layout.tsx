"use client";

import AdminLayout from "@/components/Layout/AdminLayout";
import {
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/dashboard"),
    },
    {
      key: "/dashboard/products",
      icon: <ShoppingOutlined />,
      label: "Products",
      onClick: () => router.push("/dashboard/products"),
    },
    {
      key: "/dashboard/orders",
      icon: <FileTextOutlined />,
      label: "Orders",
      onClick: () => router.push("/dashboard/orders"),
    },
    {
      key: "/dashboard/users",
      icon: <TeamOutlined />,
      label: "Users",
      onClick: () => router.push("/dashboard/users"),
    },
  ];

  return (
    <AdminLayout
      menuItems={menuItems}
      title="Admin Dashboard"
      subtitle="Manage your business"
    >
      {children}
    </AdminLayout>
  );
}
