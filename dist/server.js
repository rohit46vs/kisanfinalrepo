"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const centre_routes_1 = __importDefault(require("./routes/centre.routes"));
const slot_routes_1 = __importDefault(require("./routes/slot.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const rateLimit_1 = require("./middleware/rateLimit");
const requestId_1 = require("./middleware/requestId");
const errorHandler_1 = require("./middleware/errorHandler");
const queue_routes_1 = __importDefault(require("./routes/queue.routes"));
const adminQueue_routes_1 = __importDefault(require("./routes/adminQueue.routes"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT ?? 4000);
app.disable("x-powered-by");
app.use((0, helmet_1.default)());
app.use(requestId_1.requestId);
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
}));
app.use(express_1.default.json({
    limit: "100kb",
}));
app.use(rateLimit_1.apiRateLimiter);
app.get("/health", (_req, res) => {
    res.json({
        success: true,
        service: "kisanqueue-api",
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/auth", rateLimit_1.authRateLimiter, auth_routes_1.default);
app.use("/api/test", test_routes_1.default);
app.use("/api/centres", centre_routes_1.default);
app.use("/api/slots", slot_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/queue", queue_routes_1.default);
app.use("/api/admin/queue", adminQueue_routes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`KisanQueue API running on http://localhost:${PORT}`);
});
