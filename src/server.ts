import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import testRoutes from "./routes/test.routes";
import centreRoutes from "./routes/centre.routes";
import slotRoutes from "./routes/slot.routes";
import bookingRoutes from "./routes/booking.routes";
import authRoutes from "./routes/auth.routes";
import { apiRateLimiter, authRateLimiter } from "./middleware/rateLimit";
import { requestId } from "./middleware/requestId";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import queueRoutes from "./routes/queue.routes";
import adminQueueRoutes from "./routes/adminQueue.routes";

const app = express();

const PORT = Number(process.env.PORT ?? 4000);

app.disable("x-powered-by");

app.use(helmet());

app.use(requestId);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "100kb",
  }),
);

app.use(apiRateLimiter);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "kisanqueue-api",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/centres", centreRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/queue", queueRoutes); 
app.use(
  "/api/admin/queue",
  adminQueueRoutes
);
app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`KisanQueue API running on http://localhost:${PORT}`);
});
