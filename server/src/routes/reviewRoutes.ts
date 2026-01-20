import { Router, Request, Response } from "express";
import { storage } from "../../storage";
import { insertReviewSchema } from "../../../shared/schema";
import { z } from "zod";

const router = Router();

// Get reviews by product
router.get("/products/:id/reviews", async (req: Request, res: Response) => {
  try {
    const reviews = await storage.getReviewsByProduct(req.params.id);
    // Optionally fetch user details for each review if needed, but schema says userId is stored.
    // Ideally we want to return user name/avatar with reviews.
    // For now, let's just return reviews.
    // Enhancement: Parallel fetch users for reviews (or join if DB support).
    // Let's do a quick map to inject user details if possible or just return as is.

    // Fetch user details for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await storage.getUser(review.userId);
        return {
          ...review,
          user: user
            ? {
                username: user.username,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
              }
            : null,
        };
      }),
    );

    res.json(reviewsWithUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Create review
router.post("/products/:id/reviews", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if user already reviewed this product? (optional rule)
    // For now, allow multiple reviews.

    const validatedData = insertReviewSchema.parse({
      ...req.body,
      productId: req.params.id,
      userId: req.user!.id,
      rating: Number(req.body.rating),
    });

    const review = await storage.createReview(validatedData);

    // Should populate user details for consistency in response
    const user = await storage.getUser(req.user!.id);
    const reviewWithUser = {
      ...review,
      user: user
        ? {
            username: user.username,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
          }
        : null,
    };

    res.status(201).json(reviewWithUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create review" });
  }
});

// Delete review
router.delete("/reviews/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Get review to check ownership
    // Need getReviewById but currently we only have getReviewsByProduct.
    // We added deleteReview by ID.
    // We should ideally check if user owns it or is admin.
    // For now, assuming only admin or owner can delete, but without getReviewById we can't check owner easily.
    // Let's implement simple delete for now, maybe only allow if it returns true.

    // If stricter check needed, we need `getReview(id)` in storage.
    // Assuming for now simple deletion succcess.

    // Check ownership
    const review = await storage.getReview(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId !== req.user!.id && !req.user!.isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this review" });
    }

    const success = await storage.deleteReview(req.params.id);
    if (success) {
      res.json({ message: "Review deleted" });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

export default router;
