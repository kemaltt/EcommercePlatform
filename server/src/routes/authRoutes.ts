import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/apple", authController.appleLogin);
router.post("/logout", authController.logout);
router.get("/user", authController.getCurrentUser);
router.get("/me", authController.getCurrentUser); // Frontend uses /me
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-token", authController.verifyResetToken);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-email-code", authController.verifyEmailCode);
router.post("/resend-verification-code", authController.resendVerificationCode);
router.post("/change-password-request", authController.requestPasswordChange);

// Note: /verify-email is a GET request usually handled at root or specific path,
// but here it was mounted on app directly. Let's keep it here but route path might need adjustment if mounted under /api/auth
// The original code had app.get('/verify-email', ...) which is root level.
// If we mount this router at /api/auth, then it becomes /api/auth/verify-email.
// We should check where the email link points to.
// Usually verification links are like /verify-email?token=...
// If we want to keep it at root, we might need a separate route file or mount it differently.
// For now, let's assume we will mount this router at /api/auth and the link in email needs to match.
// However, the original code had `app.get('/verify-email')` which is NOT under `/api/auth`.
// So I will NOT include it here, but in a separate root router or handle it in index.ts or a separate file.
// Wait, to be clean, let's put it in a separate router or just here and update the email link generation?
// The email link generation uses `${process.env.FRONTEND_URL}/email-verified?token=${token}` (client side route)
// Wait, the backend route was `app.get('/verify-email')`.
// This backend route handles the verification logic and redirects to frontend.
// So it IS a backend route.
// I will put it in a separate `verificationRoutes.ts` or just `index.ts` of routes.

export default router;
