import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../services/emailService.js";
import { generateCode, generateCodeExpired } from "../utils/helpers.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ where: { email: email } });

    if (!user) {
      return res.json({ success: false, message: "User does not exists." });
    }

    // Kiểm tra tài khoản đã được xác thực chưa
    if (!user.isVerified) {
      return res.json({
        success: false,
        message:
          "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.",
        userId: user.id,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user.id);
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" }); // thông tin đăng nhập không hợp lệ
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ where: { email: email } });
    if (exists) {
      return res.json({ success: false, message: "User already exists." });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email.",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password.",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo mã OTP 6 số
    const otpCode = generateCode();
    const otpExpired = generateCodeExpired();

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      codeID: otpCode,
      codeExpired: otpExpired,
      isVerified: false,
    });

    const user = await newUser.save();

    // Gửi mã OTP qua email
    const emailResult = await sendOTPEmail(email, otpCode);

    if (emailResult.success) {
      res.json({
        success: true,
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.",
        userId: user.id,
      });
    } else {
      // Nếu gửi email thất bại, xóa user đã tạo
      await userModel.destroy({ where: { id: user.id } });
      res.json({
        success: false,
        message: "Đăng ký thất bại. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials." });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for OTP verification
const verifyOTP = async (req, res) => {
  try {
    const { userId, otpCode } = req.body;

    const user = await userModel.findOne({ where: { id: userId } });

    if (!user) {
      return res.json({ success: false, message: "User không tồn tại." });
    }

    if (user.isVerified) {
      return res.json({
        success: false,
        message: "Tài khoản đã được xác thực.",
      });
    }

    // Kiểm tra mã OTP
    if (user.codeID !== parseInt(otpCode)) {
      return res.json({ success: false, message: "Mã OTP không đúng." });
    }

    // Kiểm tra thời gian hết hạn
    if (new Date() > user.codeExpired) {
      return res.json({ success: false, message: "Mã OTP đã hết hạn." });
    }

    // Cập nhật trạng thái xác thực
    await userModel.update({ isVerified: true }, { where: { id: userId } });

    const token = createToken(user.id);

    res.json({
      success: true,
      message: "Xác thực thành công!",
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findOne({ where: { id: userId } });

    if (!user) {
      return res.json({ success: false, message: "User không tồn tại." });
    }

    if (user.isVerified) {
      return res.json({
        success: false,
        message: "Tài khoản đã được xác thực.",
      });
    }

    // Tạo mã OTP mới
    const otpCode = generateCode();
    const otpExpired = generateCodeExpired();

    // Cập nhật mã OTP mới
    await userModel.update(
      { codeID: otpCode, codeExpired: otpExpired },
      { where: { id: userId } }
    );

    // Gửi mã OTP mới qua email
    const emailResult = await sendOTPEmail(user.email, otpCode);

    if (emailResult.success) {
      res.json({
        success: true,
        message: "Đã gửi lại mã OTP. Vui lòng kiểm tra email.",
      });
    } else {
      res.json({
        success: false,
        message: "Gửi email thất bại. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Forgot password - request reset (send OTP)
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Email không hợp lệ" });
    }

    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: "User không tồn tại." });
    }

    // tạo OTP mới cho reset password (tái sử dụng codeID/codeExpired)
    const otpCode = generateCode();
    const otpExpired = generateCodeExpired();

    await userModel.update(
      { codeID: otpCode, codeExpired: otpExpired },
      { where: { id: user.id } }
    );

    const emailResult = await sendOTPEmail(email, otpCode);
    if (!emailResult.success) {
      return res.json({ success: false, message: "Gửi email thất bại." });
    }

    return res.json({ success: true, message: "Đã gửi mã OTP đến email." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Forgot password - verify OTP
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: "User không tồn tại." });
    }

    if (user.codeID !== parseInt(otpCode)) {
      return res.json({ success: false, message: "Mã OTP không đúng." });
    }

    if (new Date() > user.codeExpired) {
      return res.json({ success: false, message: "Mã OTP đã hết hạn." });
    }

    return res.json({ success: true, message: "OTP hợp lệ." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Forgot password - reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Mật khẩu tối thiểu 8 ký tự.",
      });
    }

    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: "User không tồn tại." });
    }

    if (user.codeID !== parseInt(otpCode)) {
      return res.json({ success: false, message: "Mã OTP không đúng." });
    }

    if (new Date() > user.codeExpired) {
      return res.json({ success: false, message: "Mã OTP đã hết hạn." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.update(
      { password: hashedPassword, codeID: null, codeExpired: null },
      { where: { id: user.id } }
    );

    return res.json({ success: true, message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get current user info
const getMe = async (req, res) => {
  try {
    // User info đã được thêm vào req.user bởi middleware
    const user = req.user;

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user name
const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    if (!name || name.trim().length === 0) {
      return res.json({
        success: false,
        message: "Tên không được để trống.",
      });
    }

    await userModel.update({ name: name.trim() }, { where: { id: user.id } });

    const updatedUser = await userModel.findOne({ where: { id: user.id } });

    res.json({
      success: true,
      message: "Cập nhật tên thành công.",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  verifyOTP,
  resendOTP,
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
  getMe,
  updateName,
};
