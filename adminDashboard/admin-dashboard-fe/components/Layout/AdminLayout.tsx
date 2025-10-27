"use client";

import React from "react";
import { Layout, Typography, Space, Button, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAppStore, useAuthStore } from "@/store/useStores";
import { useRouter, usePathname } from "next/navigation";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
  menuItems?: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({
  children,
  menuItems = [],
  title = "Admin Dashboard",
  subtitle = "Manage your application",
}: AdminLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Default menu items if none provided
  const defaultMenuItems = [
    {
      key: "/dashboard",
      icon: <UserOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/dashboard"),
    },
    {
      key: "/dashboard/products",
      icon: <UserOutlined />,
      label: "Products",
      onClick: () => router.push("/dashboard/products"),
    },
    {
      key: "/dashboard/orders",
      icon: <UserOutlined />,
      label: "Orders",
      onClick: () => router.push("/dashboard/orders"),
    },
    {
      key: "/dashboard/users",
      icon: <UserOutlined />,
      label: "Users",
      onClick: () => router.push("/dashboard/users"),
    },
  ];

  const finalMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems;

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/dashboard/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        logout();
        router.push("/");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: "8px",
          }}
        >
          <Text
            strong
            style={{
              fontSize: sidebarCollapsed ? "16px" : "18px",
              color: "#1890ff",
            }}
          >
            {sidebarCollapsed ? "AD" : title}
          </Text>
        </div>

        {/* Navigation Menu */}
        <div style={{ padding: "0 8px" }}>
          {finalMenuItems.map((item) => (
            <div
              key={item.key}
              onClick={item.onClick}
              style={{
                padding: "12px 16px",
                margin: "4px 0",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor:
                  pathname === item.key ? "#e6f7ff" : "transparent",
                border:
                  pathname === item.key
                    ? "1px solid #91d5ff"
                    : "1px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.key) {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.key) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span style={{ fontSize: "14px" }}>{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {/* Toggle Button */}
          <Button
            type="text"
            icon={
              sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={toggleSidebar}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />

          {/* User Info & Actions */}
          <Space>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: "pointer", padding: "8px" }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <Text strong>{user?.name || "Admin"}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
