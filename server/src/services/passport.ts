import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "../../storage";
import { comparePasswords } from "../utils";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupPassport(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "shopease-secret-key";

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
    }
  };

  if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'username' }, // Frontend sends 'username' field name, but we treat it as email or username
      async (email, password, done) => {
        try {
          // Try to find by email first (as per recent change)
          const user = await storage.getUserByEmail(email);

          if (!user) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }

          const isMatch = await comparePasswords(user.password, password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }

          if (!user.emailVerified) {
            return done(null, false, { message: 'EMAIL_NOT_VERIFIED' });
          }

          return done(null, user as Express.User);
        } catch (err) {
          console.error("LocalStrategy error:", err);
          return done(err);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => {
    if (user && 'id' in user) {
      done(null, user.id);
    } else {
      console.error("Serialization error: User object missing id", user);
      done(new Error('User object missing id for serialization'));
    }
  });

  passport.deserializeUser(async (id: unknown, done) => {
    if (typeof id !== 'number') {
        console.error(`Deserialization error: Expected ID to be a number, but received ${typeof id}`, id);
        return done(new Error('Invalid user ID type in session'));
    }

    try {
      const user = await storage.getUser(id);

      if (!user) {
        console.warn(`User with ID ${id} not found during deserialization.`);
        return done(null, false);
      }

      done(null, user as Express.User);
    } catch (err) {
      console.error(`Failed to deserialize user with ID ${id}:`, err);
      done(err);
    }
  });
}
