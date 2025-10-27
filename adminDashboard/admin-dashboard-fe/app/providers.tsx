"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntdApp } from "antd";
import { useState, useEffect } from "react";
import { useAuthStore, useAppStore } from "@/store/useStores";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Initialize Zustand stores
  const initializeStores = () => {
    // This ensures stores are hydrated properly
    useAuthStore.getState();
    useAppStore.getState();
  };

  useEffect(() => {
    initializeStores();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#1890ff",
            borderRadius: 6,
            fontFamily:
              'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
          components: {
            Layout: {
              headerBg: "#fff",
              siderBg: "#fff",
            },
            Button: {
              borderRadius: 6,
            },
            Input: {
              borderRadius: 6,
            },
            Card: {
              borderRadius: 8,
            },
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
