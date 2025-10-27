import React, { useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
import { loginApi } from '@/services/api';
import { toast } from 'sonner'
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { fetchMyCart } from "../store/slices/cartSlice";

const Login = () => {
  //const [currenState, setCurrentState] = useState("Sign Up");
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    
    try {
      const response = await loginApi(email, password);
      
      if (response.success) {
        // Lưu token vào localStorage
        localStorage.setItem("access_token", response.token);
        
        // Lưu thông tin user nếu có
        if (response.user) {
          localStorage.setItem("user_info", JSON.stringify(response.user));
          dispatch(setUser(response.user));
        }

        dispatch(fetchMyCart());

        toast.success("Đăng nhập thành công!");
        
        // Chuyển hướng về trang chủ
        navigate("/");
      } else {
        toast.error(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">Log In</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <Link to='/forgot-password'>
            <p className="cursor-pointer">Forgot your password?</p>
          </Link>

          <Link to="/register">
            <p className="cursor-pointer">Create account</p>
          </Link>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang đăng nhập..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
