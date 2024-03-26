"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = exports.restNodeRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
let nodes = [];
function restNodeRegistry() {
    nodes.length = 0;
}
exports.restNodeRegistry = restNodeRegistry;
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    _registry.get("/status", (req, res) => {
        res.send("live");
    });
    _registry.get("/getNodeRegistry", (req, res) => {
        const registryBody = {
            nodes: nodes
        };
        res.json(registryBody);
    });
    _registry.post("/registerNode", (req, res) => {
        const { nodeId, pubKey } = req.body;
        const newNode = { nodeId, pubKey };
        nodes.push(newNode);
        console.log("length nodes : ", nodes.length);
        res.status(200).send(`Node ${nodeId} registered successfully`);
    });
    const server = _registry.listen(config_1.REGISTRY_PORT, () => {
        console.log(`registry is listening on port ${config_1.REGISTRY_PORT}`);
    });
    return server;
}
exports.launchRegistry = launchRegistry;
