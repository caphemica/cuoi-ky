// src/pages/Register.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../services/api";
import { toast } from 'sonner'

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Logic và state của form đăng ký ở đây
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    
    try {
      const response = await registerApi(name, email, password);
      
      if (response.success) {
        // Lưu token vào localStorage
        localStorage.setItem("userId", response.userId);
        toast.success(response.message);
        
        // Chuyển hướng về trang verify account
        navigate("/verify-account");
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
      <form onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">Sign Up</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>
        
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
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
          <p>Have an account?</p>
          
          <Link to="/login">
            <p className="cursor-pointer">Login Here</p>
          </Link>
          
        </div>
        
        <button type="submit"  disabled={loading} className="bg-black text-white font-light px-8 py-2 mt-4">
          {loading ? "Đang đăng ký..." : "Sign Up"}
        </button>
        
      </form>
      
    </div>
  );
};

export default Register;
