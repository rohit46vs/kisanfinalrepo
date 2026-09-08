"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = requestId;
const node_crypto_1 = require("node:crypto");
function requestId(req, res, next) {
    const incomingId = req.header("x-request-id");
    const id = incomingId && incomingId.length <= 100
        ? incomingId
        : (0, node_crypto_1.randomUUID)();
    res.setHeader("x-request-id", id);
    next();
}
