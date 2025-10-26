import promotionScoreModel from "../models/promotionScore.js";

export const getMyPromotionScore = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const promotionScore = await promotionScoreModel.findOne({
      where: { promotionScoreUserId: userId },
    });
    if (!promotionScore) {
      return res
        .status(404)
        .json({ success: false, message: "Promotion score not found" });
    }
    return res.status(200).json({ success: true, data: promotionScore });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
