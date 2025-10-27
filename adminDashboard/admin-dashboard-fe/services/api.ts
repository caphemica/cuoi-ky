import axios from '@/services/axios.customize';

// Auth APIs
export const loginAPI = (email: string, password: string) => {
    return axios.post('/auth/login', { email, password });
}

export const getProfileAPI = () => {
    return axios.get('/auth/profile');
}

// Product APIs
export interface Product {
    id: number;
    productName: string;
    productDescription: string;
    productPrice: number;
    productQuantity: number;
    productImage: string[];
    productCountSell: number;
    productClickView: number;
    productPromotion: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    message: string;
    meta: {
        current: number;
        pageSize: number;
        total: number;
        page: number;
    };
    data: Product[];
}

export interface ProductParams {
    search?: string;
    current?: number;
    pageSize?: number;
}

export const getProductsAPI = (params: ProductParams = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.current) searchParams.append('current', params.current.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/product?${queryString}` : '/product';
    
    return axios.get(url);
}

export const createProductAPI = (productData: FormData) => {
    return axios.post('/product', productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export const updateProductAPI = (id: number, productData: FormData) => {
    return axios.patch(`/product/${id}/product`, productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export const deleteProductAPI = (id: number) => {
    return axios.delete(`/product/${id}/product`);
}

// Order APIs
export interface Order {
    id: number;
    orderUserId: number;
    items: any; // JSON field
    totalOrderPrice: number;
    totalOrderQuantity: number;
    shippingAddress: any; // JSON field
    cancelRequested: boolean;
    status: 'NEW' | 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
}

export interface OrdersResponse {
    message: string;
    meta: {
        current: number;
        pageSize: number;
        total: number;
        page: number;
    };
    data: Order[];
}

export interface OrderParams {
    search?: string;
    status?: string;
    current?: number;
    pageSize?: number;
}

export const getOrdersAPI = (params: OrderParams = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.current) searchParams.append('current', params.current.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/order?${queryString}` : '/order';
    
    return axios.get(url);
}

export const getOrderByIdAPI = (id: number) => {
    return axios.get(`/order/${id}/order`);
}

export const updateOrderStatusAPI = (id: number, status: string) => {
    return axios.patch(`/order/${id}/order`, { status });
}

// User APIs
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UsersResponse {
    message: string;
    meta: {
        current: number;
        pageSize: number;
        total: number;
        page: number;
    };
    data: User[];
}

export interface UsersParams {
    search?: string;
    current?: number;
    pageSize?: number;
}

export const getUsersAPI = (params: UsersParams = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.current) searchParams.append('current', params.current.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/user?${queryString}` : '/user';
    
    return axios.get(url);
}

export const verifyUserAPI = (userId: number) => {
    return axios.patch(`/user/${userId}/verify`);
}