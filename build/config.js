"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeyPair = exports.KEY = exports.IV = exports.ENCRYPTION_ALGORITHM = exports.BASE_USER_PORT = exports.BASE_ONION_ROUTER_PORT = exports.REGISTRY_PORT = void 0;
const crypto_1 = __importDefault(require("crypto"));
exports.REGISTRY_PORT = 8080;
exports.BASE_ONION_ROUTER_PORT = 4000;
exports.BASE_USER_PORT = 3000;
exports.ENCRYPTION_ALGORITHM = 'aes_256-cbc';
exports.IV = crypto_1.default.randomBytes(12).toString('base64');
exports.KEY = crypto_1.default.randomBytes(32).toString('base64');
function generateKeyPair() {
    const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'Decentralization Technologies TD4'
        }
    });
    const publicKeyBase64 = publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\r?\n|\r/g, '');
    const privateKeyBase64 = publicKey
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\r?\n|\r/g, '');
    return { publicKey: publicKeyBase64, privateKey };
}
exports.generateKeyPair = generateKeyPair;
