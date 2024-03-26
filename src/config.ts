import crypto from "crypto";

export const REGISTRY_PORT = 8080;
export const BASE_ONION_ROUTER_PORT = 4000;
export const BASE_USER_PORT = 3000;

export const ENCRYPTION_ALGORITHM='aes_256-cbc';

export const IV = crypto.randomBytes(12).toString('base64');

export const KEY = crypto.randomBytes(32).toString('base64');

export function generateKeyPair() {
    const {publicKey,privateKey}= crypto.generateKeyPairSync('rsa', {
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
