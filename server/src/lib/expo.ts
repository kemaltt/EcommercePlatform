import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { storage } from "../../storage";

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Sends a push notification to a specific user.
 * It fetches the user's push token from storage and sends the message via Expo.
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any,
) {
  const user = await storage.getUser(userId);
  if (!user || !user.pushToken) {
    console.log(`[Push] User ${userId} has no push token. Skipping.`);
    return;
  }

  // Create the notification record in history
  await storage.createNotification({
    userId,
    title,
    body,
    data: data || null,
  });

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(user.pushToken)) {
    console.error(
      `[Push] Push token ${user.pushToken} is not a valid Expo push token`,
    );
    return;
  }

  // Construct the message
  const messages: ExpoPushMessage[] = [
    {
      to: user.pushToken,
      sound: "default",
      title,
      body,
      data,
    },
  ];

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log(`[Push] Notification sent to user ${userId}:`, ticketChunk);
    // NOTE: In a production app, you should handle receipts (ticketChunk)
    // to detect and remove invalid/expired tokens.
  } catch (error) {
    console.error(
      `[Push] Error sending notification to user ${userId}:`,
      error,
    );
  }
}
