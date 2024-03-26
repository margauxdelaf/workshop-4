"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symDecrypt = exports.symEncrypt = exports.importSymKey = exports.exportSymKey = exports.createRandomSymmetricKey = exports.rsaDecrypt = exports.rsaEncrypt = exports.importPrvKey = exports.importPubKey = exports.exportPrvKey = exports.exportPubKey = exports.generateRsaKeyPair = void 0;
const crypto_1 = require("crypto");
// #############
// ### Utils ###
// #############
// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString("base64");
}
// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    var buff = Buffer.from(base64, "base64");
    return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}
async function generateRsaKeyPair() {
    const { publicKey, privateKey } = await crypto_1.webcrypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
    }, true, ["encrypt", "decrypt"]);
    return { publicKey, privateKey };
}
exports.generateRsaKeyPair = generateRsaKeyPair;
// Export a crypto public key to a base64 string format
async function exportPubKey(key) {
    const exported = await crypto_1.webcrypto.subtle.exportKey("spki", key);
    const base64 = Buffer.from(exported).toString('base64');
    return base64;
}
exports.exportPubKey = exportPubKey;
// Export a crypto private key to a base64 string format
async function exportPrvKey(key) {
    if (!key)
        return null;
    const exported = await crypto_1.webcrypto.subtle.exportKey("pkcs8", key);
    const base64 = Buffer.from(exported).toString('base64');
    return base64;
}
exports.exportPrvKey = exportPrvKey;
// Import a base64 string public key to its native format
async function importPubKey(strKey) {
    const buff = Buffer.from(strKey, 'base64');
    return await crypto_1.webcrypto.subtle.importKey("spki", buff, {
        name: "RSA-OAEP",
        hash: "SHA-256"
    }, true, ["encrypt"]);
}
exports.importPubKey = importPubKey;
// Import a base64 string private key to its native format
async function importPrvKey(strKey) {
    const buff = Buffer.from(strKey, 'base64');
    return await crypto_1.webcrypto.subtle.importKey("pkcs8", buff, {
        name: "RSA-OAEP",
        hash: "SHA-256",
    }, true, ["decrypt"]);
}
exports.importPrvKey = importPrvKey;
// Encrypt a message using an RSA public key
async function rsaEncrypt(b64Data, strPublicKey) {
    const data = base64ToArrayBuffer(b64Data);
    const publicKey = await crypto_1.webcrypto.subtle.importKey("spki", base64ToArrayBuffer(strPublicKey), {
        name: "RSA-OAEP",
        hash: "SHA-256",
    }, true, ["encrypt"]);
    const encrypted = await crypto_1.webcrypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
    return Buffer.from(encrypted).toString('base64');
}
exports.rsaEncrypt = rsaEncrypt;
// Decrypts a message using an RSA private key
async function rsaDecrypt(data, privateKey) {
    const encryptedData = base64ToArrayBuffer(data);
    const decrypted = await crypto_1.webcrypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedData);
    return Buffer.from(decrypted).toString('base64');
}
exports.rsaDecrypt = rsaDecrypt;
// ######################
// ### Symmetric keys ###
// ######################
// Generates a random symmetric key
async function createRandomSymmetricKey() {
    const key = await crypto_1.webcrypto.subtle.generateKey({
        name: "AES-CBC",
        length: 256,
    }, true, ["encrypt", "decrypt"]);
    return key;
}
exports.createRandomSymmetricKey = createRandomSymmetricKey;
// Export a crypto symmetric key to a base64 string format
async function exportSymKey(key) {
    const exportedKey = await crypto_1.webcrypto.subtle.exportKey("raw", key);
    const keyBytes = new Uint8Array(exportedKey);
    const base64Key = Buffer.from(keyBytes).toString('base64');
    return base64Key;
}
exports.exportSymKey = exportSymKey;
// Import a base64 string format to its crypto native format
async function importSymKey(strKey) {
    const keyBytes = Buffer.from(strKey, 'base64');
    const key = await crypto_1.webcrypto.subtle.importKey("raw", keyBytes, {
        name: "AES-CBC",
        length: 256,
    }, true, ["encrypt", "decrypt"]);
    return key;
}
exports.importSymKey = importSymKey;
// Encrypt a message using a symmetric key
async function symEncrypt(key, data) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const iv = crypto_1.webcrypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto_1.webcrypto.subtle.encrypt({
        name: "AES-CBC",
        iv: iv
    }, key, encodedData);
    const combinedData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
    combinedData.set(iv, 0);
    combinedData.set(new Uint8Array(encryptedData), iv.byteLength);
    const base64EncryptedData = Buffer.from(combinedData).toString('base64');
    return base64EncryptedData;
}
exports.symEncrypt = symEncrypt;
// Decrypt a message using a symmetric key
async function symDecrypt(strKey, encryptedData) {
    const secretKey = await importSymKey(strKey);
    const encryptedBytes = Buffer.from(encryptedData, 'base64');
    const iv = encryptedBytes.slice(0, 16);
    const data = encryptedBytes.slice(16);
    const decryptedData = await crypto_1.webcrypto.subtle.decrypt({
        name: "AES-CBC",
        iv: new Uint8Array(iv)
    }, secretKey, data);
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedData);
    return decryptedString;
}
exports.symDecrypt = symDecrypt;
