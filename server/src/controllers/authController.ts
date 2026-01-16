import { Request, Response, NextFunction } from "express";
import { storage } from "../../storage";
import {
  insertUserSchema,
  passwordResets,
  users,
  type User,
} from "@shared/schema";
import { sendVerificationEmail, sendEmail } from "../services/email";
import { generatePasswordResetEmail } from "../templates/passwordResetEmail";
import { generateChangePasswordEmail } from "../templates/changePasswordEmail";
import crypto from "crypto";
import { db } from "../config/db";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import passport from "passport";
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }
    const { username, email, password, fullName, address } =
      validationResult.data;

    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    // Generate 6-digit OTP
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      fullName,
      address,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      verificationTokenExpiresAt: tokenExpiry,
      isAdmin: false,
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration process error:", error);
    next(error);
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (
      err: any,
      user: Express.User | false | null,
      info: { message: string } | undefined
    ) => {
      if (err) {
        console.error("Login authentication error:", err);
        return next(err);
      }
      if (!user) {
        if (info && info.message === "EMAIL_NOT_VERIFIED") {
          return res.status(403).json({
            message: "Please verify your email address before logging in.",
          });
        }
        return res.status(401).json({
          message: info?.message || "Incorrect username or password.",
        });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session establishment error:", loginErr);
          return next(loginErr);
        }

        const userObj = user as any;
        const userResponse = {
          id: userObj.id,
          username: userObj.username,
          email: userObj.email,
          isAdmin: userObj.isAdmin,
          fullName: userObj.fullName,
          address: userObj.address,
          emailVerified: userObj.emailVerified,
          createdAt: userObj.createdAt,
        };
        return res
          .status(200)
          .json({ message: "Login successful", user: userResponse });
      });
    }
  )(req, res, next);
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid ID Token" });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with this googleId
    let user = await db.query.users.findFirst({
      where: eq(users.googleId, googleId),
    });

    if (!user) {
      // Check if user exists with this email
      user = await storage.getUserByEmail(email);

      if (user) {
        // Link googleId to existing user
        await db
          .update(users)
          .set({ googleId, avatarUrl: picture || user.avatarUrl })
          .where(eq(users.id, user.id));

        // Refresh user object
        user = await storage.getUser(user.id);
      } else {
        // Create new user
        let username = email.split("@")[0];
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          username = `${username}_${Math.floor(Math.random() * 1000)}`;
        }

        const [newUser] = await db
          .insert(users)
          .values({
            username,
            email,
            fullName: name || username,
            googleId,
            avatarUrl: picture,
            emailVerified: true,
            password: null, // Allow login without password
          })
          .returning();

        user = newUser;
      }
    }

    if (!user) {
      return res.status(500).json({ message: "Failed to create or find user" });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Google login session error:", err);
        return next(err);
      }

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        address: user.address,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      };

      return res
        .status(200)
        .json({ message: "Login successful", user: userResponse });
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google credentials" });
  }
};

export const appleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identityToken, fullName } = req.body;

    if (!identityToken) {
      return res.status(400).json({ message: "Identity Token is required" });
    }

    // For Expo Go development, we need to allow 'host.exp.Exponent'
    // For standalone builds, we need to allow the actual Bundle ID
    const APPLE_BUNDLE_ID =
      process.env.APPLE_BUNDLE_ID || "com.kemaltt.DeinShop";
    const allowedAudiences = [APPLE_BUNDLE_ID, "host.exp.Exponent"];

    const ticket = await appleSignin.verifyIdToken(identityToken, {
      audience: allowedAudiences,
      ignoreExpiration: false,
    });

    if (!ticket || !ticket.email) {
      return res.status(400).json({ message: "Invalid Apple Token" });
    }

    const { sub: appleId, email } = ticket;

    // Check if user exists with this appleId
    let user = await db.query.users.findFirst({
      where: eq(users.appleId, appleId),
    });

    if (!user) {
      // Check if user exists with this email
      user = await storage.getUserByEmail(email);

      if (user) {
        // Link appleId to existing user
        await db.update(users).set({ appleId }).where(eq(users.id, user.id));

        // Refresh user object
        user = await storage.getUser(user.id);
      } else {
        // Create new user
        let username = email.split("@")[0];
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          username = `${username}_${Math.floor(Math.random() * 1000)}`;
        }

        const nameFromApple = fullName
          ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim()
          : username;

        const [newUser] = await db
          .insert(users)
          .values({
            username,
            email,
            fullName: nameFromApple || username,
            appleId,
            emailVerified: true,
            password: null,
          })
          .returning();

        user = newUser;
      }
    }

    if (!user) {
      return res.status(500).json({ message: "Failed to create or find user" });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Apple login session error:", err);
        return next(err);
      }

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        address: user.address,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      };

      return res
        .status(200)
        .json({ message: "Login successful", user: userResponse });
    });
  } catch (error) {
    console.error("Apple login error:", error);
    res.status(401).json({ message: "Invalid Apple credentials" });
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destruction error during logout:", destroyErr);
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout successful" });
    });
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as User;

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    address: user.address,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
  res.status(200).json(userResponse);
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!token || typeof token !== "string") {
    return res.redirect(`${frontendUrl}/email-verified?error=missing_token`);
  }

  try {
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.emailVerificationToken, token),
        gt(users.verificationTokenExpiresAt, new Date())
      ),
    });

    if (!user) {
      return res.redirect(
        `${frontendUrl}/email-verified?error=invalid_or_expired_token`
      );
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        verificationTokenExpiresAt: null,
      })
      .where(eq(users.id, user.id));

    return res.redirect(`${frontendUrl}/email-verified?success=true`);
  } catch (error) {
    console.error("Email verification process error:", error);
    return res.redirect(
      `${frontendUrl}/email-verified?error=verification_failed`
    );
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await storage.getUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        message: "If the email exists, a reset code has been sent",
      });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.insert(passwordResets).values({
      token: resetCode, // Store code as token
      userId: user.id,
      expiresAt: tokenExpiry,
      createdAt: new Date(),
    });

    // Generate modern email template
    const { html, text } = generatePasswordResetEmail({
      userEmail: user.email,
      resetCode,
      expiryMinutes: 5,
    });

    await sendEmail({
      to: user.email,
      subject: "Passwort zurücksetzen - DeinShop",
      text,
      html,
    });

    res.json({ message: "Password reset code sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const resetRequest = await db.query.passwordResets.findFirst({
      where: eq(passwordResets.token, token),
    });

    if (!resetRequest) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (resetRequest.expiresAt < new Date()) {
      await db.delete(passwordResets).where(eq(passwordResets.token, token));
      return res.status(400).json({ message: "Token has expired" });
    }

    res.json({ message: "Token is valid", userId: resetRequest.userId });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Failed to verify token" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const resetRequest = await db.query.passwordResets.findFirst({
      where: eq(passwordResets.token, token),
    });

    if (!resetRequest) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (resetRequest.expiresAt < new Date()) {
      await db.delete(passwordResets).where(eq(passwordResets.token, token));
      return res.status(400).json({ message: "Token has expired" });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const hashedPassword = await hashPassword(password);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetRequest.userId));

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (user.emailVerificationToken !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        verificationTokenExpiresAt: null,
      })
      .where(eq(users.id, user.id));

    req.login(user, (err) => {
      if (err) {
        return res.status(200).json({
          message:
            "Email verified, but auto-login failed. Please login manually.",
        });
      }
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        fullName: user.fullName,
        address: user.address,
        emailVerified: true,
        createdAt: user.createdAt,
      };
      return res
        .status(200)
        .json({ message: "Email verified successfully", user: userResponse });
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Failed to verify email" });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db
      .update(users)
      .set({
        emailVerificationToken: verificationToken,
        verificationTokenExpiresAt: tokenExpiry,
      })
      .where(eq(users.id, user.id));

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to resend verification email:", emailError);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.json({ message: "Verification code resent successfully" });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({ message: "Failed to resend verification code" });
  }
};

export const requestPasswordChange = async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req.user as User).id;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // We can reuse the passwordResets table for this purpose as it stores a token (code) linked to a user
    await db.insert(passwordResets).values({
      token: verificationCode,
      userId: user.id,
      expiresAt: tokenExpiry,
      createdAt: new Date(),
    });

    // Generate email
    const { html, text } = generateChangePasswordEmail({
      userEmail: user.email,
      verificationCode,
      expiryMinutes: 5,
    });

    await sendEmail({
      to: user.email,
      subject: "Passwort ändern - DeinShop",
      text,
      html,
    });

    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Request password change error:", error);
    res
      .status(500)
      .json({ message: "Failed to process password change request" });
  }
};
