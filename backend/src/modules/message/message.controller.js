import { getMessages, sendMessage } from "./message.service.js";

export async function getMessagesController(req, res) {
  try {
    const messages = await getMessages(req.user.id, req.params.userId);
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function sendMessageController(req, res) {
  try {
    const message = await sendMessage(req.user.id, req.body.receiverId, String(req.body.body || ""));
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
