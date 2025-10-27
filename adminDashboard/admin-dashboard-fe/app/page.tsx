"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Divider,
  Row,
  Col,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useAuthStore, useHydration } from "@/store/useStores";
import { useRouter } from "next/navigation";
import { message } from "antd";

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const isHydrated = useHydration();
  const { loginAPI, setLoading, isLoading, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string>("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isHydrated, isAuthenticated, router]);

  const onFinish = async (values: LoginForm) => {
    setError("");
    try {
      await loginAPI(values.email, values.password);
      message.success("Đăng nhập thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Đăng nhập thất bại");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Row justify="center" style={{ width: "100%", maxWidth: "1200px" }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <Title
                  level={2}
                  style={{ marginBottom: "8px", color: "#1890ff" }}
                >
                  Admin Dashboard
                </Title>
                <Text type="secondary">Sign in to your account</Text>
              </div>

              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError("")}
                />
              )}

              <Form
                form={form}
                name="login"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Email"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              <div style={{ textAlign: "center" }}>
                <Space direction="vertical" size="small">
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
