"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const config_2 = require("../config");
const crypto_1 = __importDefault(require("crypto"));
const usersData = new Map();
// Make sure to update the map entry as Maps hold references and do not auto-update.
function initializeUserData(userId) {
    if (!usersData.has(userId)) {
        usersData.set(userId, { lastReceivedMessage: null, lastSentMessage: null });
    }
}
function updateLastReceivedMessage(userId, message) {
    if (usersData.has(userId)) {
        const userData = usersData.get(userId);
        userData.lastReceivedMessage = message;
        usersData.set(userId, userData);
    }
}
function updateLastSentMessage(userId, message) {
    if (usersData.has(userId)) {
        const userData = usersData.get(userId);
        userData.lastSentMessage = message;
        usersData.set(userId, userData);
    }
}
function getLastReceivedMessage(userId) {
    if (usersData.has(userId)) {
        const userData = usersData.get(userId);
        return userData.lastReceivedMessage;
    }
}
function getLastSentMessage(userId) {
    if (usersData.has(userId)) {
        const userData = usersData.get(userId);
        return userData.lastSentMessage;
    }
}
function decryptMessage(encryptedMessage) {
    const decipher = crypto_1.default.createDecipheriv(config_2.ENCRYPTION_ALGORITHM, config_2.KEY, config_2.IV);
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
async function user(userId) {
    initializeUserData(userId);
    const _user = (0, express_1.default)();
    _user.use(express_1.default.json());
    _user.use(body_parser_1.default.json());
    _user.get("/status", (req, res) => {
        res.send("live");
    });
    _user.get("/getLastReceivedMessage", (req, res) => {
        console.log(usersData);
        const lastReceived = getLastReceivedMessage(userId);
        res.json({ result: lastReceived });
    });
    _user.get("/getLastSentMessage", (req, res) => {
        console.log(usersData);
        const lastSent = getLastSentMessage(userId);
        res.json({ result: lastSent });
    });
    _user.post('/message', (req, res) => {
        console.log(usersData);
        const { message } = req.body;
        updateLastReceivedMessage(userId, message);
        res.send("success");
    });
    _user.post("/sendMessage", async (req, res) => {
        console.log(usersData);
        const { userPort, message, destinationUserId } = req.body;
        updateLastSentMessage(userId, message);
        const RECIPIENT_PORT = config_1.BASE_USER_PORT + destinationUserId;
        try {
            await fetch(`http://localhost:${RECIPIENT_PORT}/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message
                })
            });
            res.json({ status: 'Message sent successfully' });
        }
        catch (error) {
            console.error("Error forwarding message:", error);
            res.status(500).json({ error: "Failed to forward message" });
        }
    });
    const server = _user.listen(config_1.BASE_USER_PORT + userId, () => {
        console.log(`User ${userId} is listening on port ${config_1.BASE_USER_PORT + userId}`);
    });
    return server;
}
exports.user = user;
