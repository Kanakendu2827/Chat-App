import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/recent/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId format." });
  }

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate({ path: "sender", select: "name email profilePic" })
      .populate({ path: "receiver", select: "name email profilePic" })
      .lean();

    const peersMap = new Map();

    for (const msg of messages) {
      const sender = msg.sender && typeof msg.sender === "object" ? msg.sender : null;
      const receiver = msg.receiver && typeof msg.receiver === "object" ? msg.receiver : null;
      const peer = sender?._id?.toString() === userId ? receiver : sender;

      if (!peer || !peer._id) continue;

      const peerId = peer._id.toString();
      if (!peersMap.has(peerId)) {
        peersMap.set(peerId, {
          _id: peerId,
          username: peer.name || peer.username || "Unknown",
          email: peer.email || "",
          profilePic: peer.profilePic || "",
          lastMessage:
            msg.text ||
            (msg.attachment?.name ? `[Attachment] ${msg.attachment.name}` : ""),
          lastMessageAt: msg.createdAt,
        });
      }
    }

    res.json(Array.from(peersMap.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching recent chats." });
  }
});

// Get messages between two users (both directions)
router.get("/:userId/:otherId", async (req, res) => {
  const { userId, otherId } = req.params;

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(otherId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const msgs = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    const normalized = msgs.map((m) => ({
      sender: m.sender.toString(),
      receiver: m.receiver.toString(),
      text: m.text,
      attachment: m.attachment || null,
      createdAt: m.createdAt,
    }));

    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching messages." });
  }
});

// Send message
router.post("/send", async (req, res) => {
  console.log("Message send body:", req.body);
  const { senderId, receiverId, text = "", attachment } = req.body;

  if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
    return res.status(400).json({ message: "Invalid senderId or receiverId format." });
  }

  const hasAttachment = Boolean(
    attachment &&
      typeof attachment.url === "string" &&
      attachment.url.trim().length > 0
  );

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "senderId and receiverId are required." });
  }

  if (!text.trim() && !hasAttachment) {
    return res.status(400).json({ message: "A message text or image/video attachment is required." });
  }

  try {
    const sanitizedAttachment = hasAttachment
      ? {
          type:
            attachment.type === "video" || attachment.type === "image"
              ? attachment.type
              : "other",
          url: attachment.url,
          name: attachment.name || "",
        }
      : null;

    const msg = new Message({
      sender: senderId,
      receiver: receiverId,
      text: text.trim(),
      attachment: sanitizedAttachment,
    });
    const saved = await msg.save();
    res.status(201).json({
      message: "Message sent.",
      messageObj: {
        _id: saved._id.toString(),
        sender: saved.sender.toString(),
        receiver: saved.receiver.toString(),
        text: saved.text,
        attachment: saved.attachment || null,
        createdAt: saved.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending message." });
  }
});

export default router;
