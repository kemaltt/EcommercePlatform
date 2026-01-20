import { Router } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../middleware/authMiddleware";
import { sendPushNotification } from "../lib/expo";

const router = Router();

// Mark all notification routes as authenticated
router.use(isAuthenticated);

/**
 * POST /api/notifications/register
 * Registers or updates the current user's push token.
 */
router.post("/register", async (req, res) => {
  try {
    const { token } = req.body;
    console.log(
      `[Push Server] Registration request from user ${req.user!.id}, token:`,
      token,
    );

    if (!token) {
      console.log("[Push Server] Registration failed: No token provided");
      return res.status(400).json({ message: "Push token is required" });
    }

    await storage.updatePushToken(req.user!.id, token);
    console.log(
      `[Push Server] Token registered successfully for user ${req.user!.id}`,
    );
    res.json({ success: true, message: "Push token registered successfully" });
  } catch (error) {
    console.error("[Push Server] Error registering push token:", error);
    res.status(500).json({ message: "Failed to register push token" });
  }
});

/**
 * GET /api/notifications
 * Fetches the notification history for the current user.
 */
router.get("/", async (req, res) => {
  try {
    const notifications = await storage.getUserNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read.
 */
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await storage.markNotificationAsRead(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Marks all notifications for the current user as read.
 */
router.patch("/mark-all-read", async (req, res) => {
  try {
    await storage.markAllNotificationsAsRead(req.user!.id);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({ message: "Failed to mark all notifications as read" });
  }
});

/**
 * DELETE /api/notifications/unregister
 * Removes the push token for the current user (e.g., on logout).
 */
router.delete("/unregister", async (req, res) => {
  try {
    await storage.updatePushToken(req.user!.id, null);
    res.json({ success: true, message: "Push token removed successfully" });
  } catch (error) {
    console.error("Error unregistering push token:", error);
    return res.status(500).json({ message: "Failed to unregister push token" });
  }
});

/**
 * POST /api/notifications/test-me
 * Sends a test push notification to the current user.
 */
router.post("/test-me", async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.pushToken) {
      return res.status(400).json({
        message:
          "No push token found. Please register for notifications first.",
      });
    }

    await sendPushNotification(
      user.id,
      "Test Push",
      "Bu bir test bildirimdir!",
      { type: "test", timestamp: new Date().toISOString() },
    );

    res.json({ success: true, message: "Test notification sent" });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ message: "Failed to send test notification" });
  }
});

export default router;
