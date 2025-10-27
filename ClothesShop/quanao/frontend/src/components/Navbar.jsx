import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMe, logout } from "../store/slices/authSlice";
import { fetchMyCart } from "../store/slices/cartSlice";
import { io } from "socket.io-client";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalCartQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log("user", user);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    });
    const handler = (payload) => {
      setNotifications((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random()}`,
            title: payload?.title || "Thông báo",
            message: payload?.message || "",
            productId: payload?.productId,
            createdAt: payload?.createdAt || new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 20)
      );
    };
    socket.on("notification:new_product", handler);
    return () => {
      socket.off("notification:new_product", handler);
      socket.close();
    };
  }, []);

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <img src={assets.logo} className="w-36" alt="" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="{flex flex-col item-center gap-1}">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="{flex flex-col item-center gap-1}">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="{flex flex-col item-center gap-1}">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="{flex flex-col item-center gap-1}">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        {/* <img src={assets.search_icon} className="w-5  cursor-pointer" alt="" /> */}

        {/* Notification bell */}
        <div className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} className="relative">
            <span
              role="img"
              aria-label="bell"
              className="text-xl cursor-pointer"
            >
              🔔
            </span>
            {notifications.length > 0 && (
              <span className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-auto bg-white border rounded shadow z-20">
              <div className="px-3 py-2 font-semibold border-b">Thông báo</div>
              {notifications.length === 0 && (
                <div className="px-3 py-3 text-sm text-gray-500">
                  Chưa có thông báo
                </div>
              )}
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-3 py-2 text-sm ${
                      n.productId ? "cursor-pointer hover:bg-gray-50" : ""
                    }`}
                    onClick={() => {
                      if (n.productId) {
                        setNotifOpen(false);
                        navigate(`/product/${n.productId}`);
                      }
                    }}
                  >
                    <div className="font-medium">{n.title}</div>
                    <div className="text-gray-600">{n.message}</div>
                  </li>
                ))}
              </ul>
              {notifications.length > 0 && (
                <div className="px-3 py-2 text-right">
                  <button
                    className="text-xs text-gray-500 hover:text-black"
                    onClick={() => setNotifications([])}
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="group relative">
          <Link to={isAuthenticated ? "/profile" : "/login"}>
            <img
              className="w-5 cursor-pointer"
              src={assets.profile_icon}
              alt=""
            />
          </Link>

          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 ">
            <div className="flex flex-col gap-2 w-35 py-3 px-5 bg-slate-100 text-gray-500 rounded">
              {isAuthenticated ? (
                <>
                  <p className="text-gray-700">Hello, {user?.name}</p>
                  {(user?.role || "").toUpperCase() === "ADMIN" && (
                    <Link to="/admin">
                      <p className="cursor-pointer hover:text-black">Admin</p>
                    </Link>
                  )}
                  <Link to="/profile">
                    <p className="cursor-pointer hover:text-black">
                      My Profile
                    </p>
                  </Link>
                  <Link to="/orders">
                    <p className="cursor-pointer hover:text-black">Orders</p>
                  </Link>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      navigate("/");
                    }}
                    className="text-left hover:text-black cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <p className="cursor-pointer hover:text-black">Login</p>
                  </Link>
                  <Link to="/register">
                    <p className="cursor-pointer hover:text-black">Register</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {totalCartQuantity || 0}
          </p>
        </Link>
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt=""
        />
      </div>

      {/* Sidebar menu for small screens */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex item-center gap-4 p-3 cursor-pointer"
          >
            <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="" />
            <p>Back</p>
          </div>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/contact"
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
