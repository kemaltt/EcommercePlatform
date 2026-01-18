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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userData = req.body;

    const updatedUser = await storage.updateUser(userId, userData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user" });
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
