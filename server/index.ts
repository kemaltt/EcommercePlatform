import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupPassport } from "./src/services/passport";
import routes from "./src/routes/index"; // Explicitly point to the index file in routes directory

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

(async () => {
  // Setup authentication (Passport)
  setupPassport(app);

  // Register all API routes
  app.use("/api", routes);

  // Mount verify-email at root level to match existing behavior/links
  // We need to dynamically import it or just import it at top if possible.
  // Dynamic import is fine to avoid circular deps if any, but top level is better.
  const { verifyEmail } = await import("./src/controllers/authController");
  app.get("/verify-email", verifyEmail);

  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // API server - frontend ayrı çalışacak
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
})();
