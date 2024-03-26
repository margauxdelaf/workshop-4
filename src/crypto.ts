import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const {publicKey,privateKey}= await webcrypto.subtle.generateKey(
      {
        name:"RSA-OAEP",
        modulusLength:2048,
        publicExponent:new Uint8Array([1,0,1]),
        hash:"SHA-256"
      },
      true,
      ["encrypt","decrypt"]
  );


  return {publicKey,privateKey};
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported= await webcrypto.subtle.exportKey("spki",key);
  const base64= Buffer.from(exported).toString('base64');
  return base64;
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(
  key: webcrypto.CryptoKey | null
): Promise<string | null> {
  if(!key) return null;
  const exported = await webcrypto.subtle.exportKey("pkcs8", key);
  const base64 = Buffer.from(exported).toString('base64');
  return base64;
}

// Import a base64 string public key to its native format
export async function importPubKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  const buff= Buffer.from(strKey,'base64');
  return await webcrypto.subtle.importKey(
      "spki",
      buff,
      {
        name:"RSA-OAEP",
        hash:"SHA-256"
      },
      true,
      ["encrypt"]
  );
}

// Import a base64 string private key to its native format
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  const buff = Buffer.from(strKey, 'base64');
  return await webcrypto.subtle.importKey(
      "pkcs8",
      buff,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
  );
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  const data = base64ToArrayBuffer(b64Data);

  const publicKey = await webcrypto.subtle.importKey(
      "spki",
      base64ToArrayBuffer(strPublicKey),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
  );

  const encrypted = await webcrypto.subtle.encrypt(
      {name: "RSA-OAEP"},
      publicKey,
      data
  );

  return Buffer.from(encrypted).toString('base64');
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  const encryptedData = base64ToArrayBuffer(data);

  const decrypted = await webcrypto.subtle.decrypt(
      {name: "RSA-OAEP"},
      privateKey,
      encryptedData
  );

  return Buffer.from(decrypted).toString('base64');
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
    const key = await webcrypto.subtle.generateKey(
        {
            name: "AES-CBC",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );

    return key;
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
    const exportedKey = await webcrypto.subtle.exportKey("raw", key);
    const keyBytes = new Uint8Array(exportedKey);
    const base64Key = Buffer.from(keyBytes).toString('base64');
    return base64Key;
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
    const keyBytes = Buffer.from(strKey, 'base64');
    const key = await webcrypto.subtle.importKey(
        "raw",
        keyBytes,
        {
            name: "AES-CBC",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
    return key;
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const iv = webcrypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await webcrypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: iv
        },
        key,
        encodedData
    );

    const combinedData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
    combinedData.set(iv, 0);
    combinedData.set(new Uint8Array(encryptedData), iv.byteLength);
    const base64EncryptedData = Buffer.from(combinedData).toString('base64');

    return base64EncryptedData;
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
    const secretKey=await importSymKey(strKey);
    const encryptedBytes = Buffer.from(encryptedData, 'base64');

    const iv = encryptedBytes.slice(0, 16)
    const data = encryptedBytes.slice(16);

    const decryptedData = await webcrypto.subtle.decrypt(
        {
            name: "AES-CBC",
            iv: new Uint8Array(iv)
        },
        secretKey,
        data
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedData);

    return decryptedString;
}
