"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.initFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// INIT
const initFirebase = (key) => {
    if (!firebase_admin_1.default.apps.length) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(key),
        });
    }
};
exports.initFirebase = initFirebase;
const authMiddleware = (cb = () => { }) => async (req, res, next) => {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
    }
    try {
        const claims = await firebase_admin_1.default.auth().verifyIdToken(token);
        if (!claims) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Unauthorized" }));
            return;
        }
        await cb({ claims, ctx: res.locals ?? {}, token });
        res.locals = res.locals || {};
        res.locals.user = claims;
        res.locals.token = token;
        next();
    }
    catch (error) {
        if (error.code === "auth/id-token-expired") {
            res.writeHead(401, {
                "Content-Type": "application/json",
                "x-firebase-token-refresh": "true",
            });
            res.end(JSON.stringify({ error: "Token expired. Please refresh your token." }));
            return;
        }
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
    }
};
exports.authMiddleware = authMiddleware;
