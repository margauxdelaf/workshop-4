"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleOnionRouter = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = __importDefault(require("crypto"));
const config_2 = require("../config");
let lastReceivedEncryptedMessage = null;
let lastMessageDestination = null;
const REGISTRY_URL = `http://localhost:${config_1.REGISTRY_PORT}/registerNode`;
function decryptMessage(encryptedMessage) {
    const decipher = crypto_1.default.createDecipheriv(config_1.ENCRYPTION_ALGORITHM, config_1.KEY, config_1.IV);
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
async function registerNode(nodeId, publicKey) {
    try {
        const response = await fetch(REGISTRY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nodeId: nodeId,
                pubKey: publicKey
            })
        });
    }
    catch (error) {
        console.error("Error registering node : ", error);
    }
}
async function simpleOnionRouter(nodeId) {
    const { publicKey, privateKey } = (0, config_2.generateKeyPair)();
    await registerNode(nodeId, publicKey);
    const onionRouter = (0, express_1.default)();
    onionRouter.use(express_1.default.json());
    onionRouter.use(body_parser_1.default.json());
    onionRouter.get("/status", (req, res) => {
        res.send("live");
    });
    onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
        res.json({ result: lastReceivedEncryptedMessage });
    });
    onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
        const lastReceivedDecryptedMessage = lastReceivedEncryptedMessage ? decryptMessage(lastReceivedEncryptedMessage) : null;
        res.json({ result: lastReceivedDecryptedMessage });
    });
    onionRouter.get("/getLastMessageDestination", (req, res) => {
        res.send({ result: lastMessageDestination });
    });
    onionRouter.get("/getPrivateKey", (req, res) => {
        console.log(privateKey);
        res.json(privateKey);
    });
    const server = onionRouter.listen(config_1.BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(`Onion router ${nodeId} is listening on port ${config_1.BASE_ONION_ROUTER_PORT + nodeId}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
