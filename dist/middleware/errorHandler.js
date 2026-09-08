"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        error: "Resource not found",
    });
}
function errorHandler(error, _req, res, _next) {
    console.error("Unhandled API error:", error);
    if (res.headersSent) {
        return;
    }
    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
}
