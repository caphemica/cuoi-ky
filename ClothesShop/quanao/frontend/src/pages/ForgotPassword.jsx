import React from 'react'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { requestPasswordResetApi, verifyResetOtpApi, resetPasswordApi } from '../services/api';
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (step === 1) {
        const res = await requestPasswordResetApi(email);
        if (res.success) {
          toast.success('Đã gửi mã OTP đến email');
          setStep(2);
        } else {
          toast.error(res.message || 'Gửi OTP thất bại');
        }
      } else if (step === 2) {
        const res = await verifyResetOtpApi(email, otpCode);
        if (res.success) {
          toast.success('OTP hợp lệ');
          setStep(3);
        } else {
          toast.error(res.message || 'OTP không hợp lệ');
        }
      } else if (step === 3) {
        if (!newPassword || newPassword.length < 8) {
          toast.error('Mật khẩu tối thiểu 8 ký tự');
          return;
        }
        const res = await resetPasswordApi(email, otpCode, newPassword);
        if (res.success) {
          toast.success('Đổi mật khẩu thành công');
          navigate('/login');
        } else {
          toast.error(res.message || 'Đổi mật khẩu thất bại');
        }
      }
    } catch (e) {
      toast.error(e?.message || 'Có lỗi xảy ra');
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
          <p className="prata-regular text-3xl">Forgot Your Password</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        {step === 1 && (
          <>
            <p className="w-full text-center text-sm px-2">Enter email enrolled for this account</p>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}

        {step === 2 && (
          <>
            <p className="w-full text-center text-sm px-2">Nhập mã OTP đã gửi đến email của bạn</p>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="OTP 6 số"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          </>
        )}

        {step === 3 && (
          <>
            <p className="w-full text-center text-sm px-2">Nhập mật khẩu mới</p>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Mật khẩu mới (>= 8 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </>
        )}

        <button
          className="bg-black text-white font-light px-8 py-2 mt-4 w-full"
          type="submit"
          disabled={loading}
        >
          {step === 1 && (loading ? 'Đang gửi OTP...' : 'Gửi OTP')}
          {step === 2 && (loading ? 'Đang xác minh...' : 'Xác minh OTP')}
          {step === 3 && (loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu')}
        </button>

        <Link to="/login">
          <p className="cursor-pointer text-sm underline text-gray-600 mt-2">
            Go back to login
          </p>
        </Link>
      </form>
    </div>
  );
}

export default ForgotPassword