export default function requireAdmin(req, res, next) {
  try {
    const role = (req.user?.role || "").toUpperCase();
    if (role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}
