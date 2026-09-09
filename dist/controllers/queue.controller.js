"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyQueueController = getMyQueueController;
const queue_service_1 = require("../services/queue.service");
async function getMyQueueController(req, res) {
    if (!req.userId) {
        return res.status(401).json({
            success: false,
            error: "Authentication required",
        });
    }
    try {
        const queue = await (0, queue_service_1.getMyQueueStatus)(req.userId);
        if (!queue) {
            return res.status(404).json({
                success: false,
                error: "No active booking found",
            });
        }
        return res.status(200).json({
            success: true,
            data: queue,
        });
    }
    catch (error) {
        console.error("Get my queue error:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to load queue status",
        });
    }
}
