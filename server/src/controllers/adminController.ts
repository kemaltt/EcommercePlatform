import { Request, Response } from "express";
import { storage } from "../../storage";

export const getStats = async (req: Request, res: Response) => {
  try {
    const allUsers = await storage.getUsers();
    const allProducts = await storage.getProducts();
    const allOrders = await storage.getAllOrders();

    res.json({
      totalUsers: allUsers.length,
      totalProducts: allProducts.length,
      totalOrders: allOrders.length,
      activeSessions: 0,
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await storage.getUsers();
    res.json(allUsers);
  } catch (err) {
    console.error("Detailed error in /api/admin/users:", {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      message: "Error fetching users",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user details" });
  }
};

import { sendEmail } from "../services/email";
import { comparePasswords } from "../utils";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const currentUser = req.user as any;

    // Strict check: Only Super Admin can update users
    if (!currentUser.isSuperAdmin) {
      return res.status(403).json({
        message: "Unauthorized: Only Super Admin can modify user accounts",
      });
    }

    const previousUser = await storage.getUser(userId);
    if (!previousUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await storage.updateUser(userId, userData);

    if (updatedUser) {
      // Send email if status changed or important details changed
      if (
        userData.status &&
        userData.status !== previousUser.status &&
        previousUser.status !== "deleted"
      ) {
        // Don't email if previously deleted (unlikely)
        await sendEmail({
          to: updatedUser.email,
          subject: "Account Status Update",
          text: `Your account status has been updated to: ${userData.status}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Account Update</h2>
              <p>Hello ${updatedUser.fullName || updatedUser.username},</p>
              <p>Your account status has been changed to: <strong>${userData.status}</strong></p>
              <p>Start Date: ${new Date().toLocaleDateString()}</p>
            </div>
          `,
        });
      } else if (
        (userData.fullName && userData.fullName !== previousUser.fullName) ||
        (userData.username && userData.username !== previousUser.username)
      ) {
        await sendEmail({
          to: updatedUser.email,
          subject: "Account Details Updated",
          text: `Your account details have been updated by an administrator.`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Account Details Updated</h2>
              <p>Hello ${updatedUser.fullName || updatedUser.username},</p>
              <p>Your account information has been updated by an administrator.</p>
            </div>
          `,
        });
      }
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;
    const currentUser = req.user as any;

    if (!currentUser.isSuperAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Super Admin access required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const isMatch = await comparePasswords(currentUser.password, password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password confirmation" });
    }

    const userToDelete = await storage.getUser(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Soft delete
    await storage.updateUser(userId, { status: "deleted" });

    // Send email
    await sendEmail({
      to: userToDelete.email,
      subject: "Account Deleted",
      text: "Your account has been deleted.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Account Deleted</h2>
          <p>Hello ${userToDelete.fullName || userToDelete.username},</p>
          <p>Your account has been successfully deleted.</p>
          <p>If this was a mistake, please contact support.</p>
        </div>
      `,
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await storage.getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = await storage.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch user details to get customer name/email
    const user = await storage.getUser(order.userId);

    // Fetch address details if stored separately, but typically address snapshot might be needed
    // For now assuming we rely on current user address or if order stores a specific address snapshot.
    // Based on schema, Order doesn't link directly to an Address ID, so we might need to rely on User's address
    // or if the checkout flow stored it. Checking schema...

    res.json({
      ...order,
      customer: user
        ? {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
          }
        : null,
    });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ message: "Error fetching order details" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, trackingNumber, shippingCarrier, shippedAt } = req.body;

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined)
      updateData.trackingNumber = trackingNumber;
    if (shippingCarrier !== undefined)
      updateData.shippingCarrier = shippingCarrier;
    if (shippedAt) updateData.shippedAt = new Date(shippedAt);
    updateData.updatedAt = new Date();

    const updatedOrder = await storage.updateOrder(orderId, updateData);

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Error updating order status" });
  }
};
