import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupPassport } from "./src/services/passport";
import routes from "./src/routes/index";
import { verifyEmail } from "./src/controllers/authController";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Setup authentication (Passport)
setupPassport(app);

// Register all API routes
app.use("/api", routes);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Verify email route
app.get("/verify-email", verifyEmail);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});

// Export app for Vercel
export default app;

// Only start server if running directly
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const server = createServer(app);
  const port = process.env.PORT || 5002;
  server.listen(
    {
      port: Number(port),
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.log(`API server running on port ${port}`);
    }
  );
}
