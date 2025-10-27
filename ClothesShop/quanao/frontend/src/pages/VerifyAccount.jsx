// src/pages/Register.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyAccountApi } from "../services/api";
import { toast } from 'sonner'

const VerifyAccount = () => {
  const [codeID, setCodeID] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!codeID) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const response = await verifyAccountApi(userId, codeID);

      if (response.success) {
        toast.success(response.message);
        navigate("/login");
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
          <p className="prata-regular text-3xl">Verify Account</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="CodeID"
          required
          value={codeID}
          onChange={(e) => setCodeID(e.target.value)}
        />
        <button type="submit" disabled={loading} className="bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer">
          {loading ? "Đang xác thực..." : "Verify Account"}
        </button>
      </form>
    </div>
  );
};

export default VerifyAccount;
