import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    const normalized = users.map((user) => ({
      ...user.toObject(),
      username: user.name,
      profilePic: user.profilePic || "",
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/search", async (req, res) => {
  const query = (req.query.q || "").trim();
  const excludeId = req.query.excludeId;

  if (!query) {
    return res.json([]);
  }

  const regex = new RegExp(query, "i");

  try {
    const users = await User.find(
      {
        _id: { $ne: excludeId },
        $or: [{ name: regex }, { email: regex }],
      },
      "-password"
    );

    const normalized = users.map((user) => ({
      _id: user._id.toString(),
      username: user.name,
      email: user.email,
      profilePic: user.profilePic || "",
    }));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/profile-picture", async (req, res) => {
  const { profilePic } = req.body;

  if (!profilePic) {
    return res.status(400).json({ message: "Profile picture data is required." });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      _id: updatedUser._id,
      username: updatedUser.name,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic || "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;