import axios from "axios";



const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});


// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});



instance.interceptors.response.use(
    (response) => {
        if (response && response.data) return response.data;
    },
    (error) => {
        // Nếu token hết hạn hoặc không hợp lệ, chuyển về trang login
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        // Trả về lỗi từ server
        if (error.response?.data) return Promise.reject(error.response.data);
        return Promise.reject(error);
    }
);

export default instance;