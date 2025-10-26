import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./services/socket.js";
import "dotenv/config";
import connectDB from "./config/mysql.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter from "./routes/orderRoute.js";
import couponRouter from "./routes/couponRoute.js";
import userModel from "./models/userModel.js";
import productModel from "./models/productModel.js";
import cartModel from "./models/cartModel.js";
import cartRouter from "./routes/cartRoute.js";
import orderModel from "./models/orderModel.js";
import promotionScoreModel from "./models/promotionScore.js";
import promotionScoreRouter from "./routes/promotionScoreRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import favoriteRouter from "./routes/favoriteRoute.js";

// App Config
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.1.9:8081",
      "https://c-mart-shop-fe.vercel.app",
      "https://fe-mart-4e3l.vercel.app",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  // Handle admin join room
  socket.on("join_admin_room", (data) => {
    const { userId, userRole } = data;

    // Kiểm tra nếu user là admin thì cho join vào room admin
    if (userRole === "ADMIN") {
      socket.join("admin");
      console.log(`Admin ${userId} joined admin room`);

      // Gửi confirmation cho admin
      socket.emit("admin_room_joined", {
        message: "Đã tham gia phòng admin thành công",
        room: "admin",
      });
    } else {
      socket.emit("admin_room_error", {
        message: "Không có quyền truy cập phòng admin",
      });
    }
  });

  // Handle admin leave room
  socket.on("leave_admin_room", (data) => {
    const { userId } = data;
    socket.leave("admin");
    console.log(`Admin ${userId} left admin room`);

    socket.emit("admin_room_left", {
      message: "Đã rời khỏi phòng admin",
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  });
});

setIO(io);
const port = process.env.PORT || 4000;

// kết nối db
connectDB.connect((err) => {
  if (err) {
    console.error("Can not connect to database: ", err.stack);
    return;
  }
  console.log("DB connected.");
});

connectCloudinary();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.1.9:8081",
      "https://c-mart-shop-fe.vercel.app",
      "https://fe-mart-4e3l.vercel.app",
    ],
    credentials: true,
  })
);

// api endpoints
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/promotionScore", promotionScoreRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/favorite", favoriteRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

server.listen(port, () => {
  console.log("Server started on PORT: " + port);
});
