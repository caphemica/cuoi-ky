"use client";

import { Card, Typography, Space, Button, Avatar, Tag } from "antd";
import {
  UserOutlined,
  MailOutlined,
  CrownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/useStores";
import { useState } from "react";

const { Title, Text } = Typography;

export default function UserInfoCard() {
  const { user, refreshUserProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  if (!user) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {user.name}
              </Title>
              <Space>
                <Tag color="blue" icon={<CrownOutlined />}>
                  {user.role.toUpperCase()}
                </Tag>
                <Space>
                  <MailOutlined />
                  <Text type="secondary">{user.email}</Text>
                </Space>
              </Space>
            </div>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
            type="text"
          >
            Refresh
          </Button>
        </div>
      </Space>
    </Card>
  );
}
