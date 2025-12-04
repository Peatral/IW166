import { createHash } from "node:crypto";

export function getHash(data: BufferSource, algo: string = "SHA-1") {
  if (algo === "MD5") {
    return Promise.resolve(
      createHash("md5").update(data as Uint8Array).digest("hex").toString(),
    );
  }
  return crypto.subtle.digest({ name: algo }, data).then((digest) =>
    Array.from(
      new Uint8Array(digest),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function getHashes(data: BufferSource) {
  return Promise.all([
    getHash(data, "SHA-512"),
    getHash(data, "SHA-384"),
    getHash(data, "SHA-256"),
    getHash(data, "SHA-1"),
    getHash(data, "MD5"),
  ]).then(([sha512, sha384, sha256, sha1, md5]) => ({
    sha512,
    sha384,
    sha256,
    sha1,
    md5,
  }));
}

export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export function generateRSAKey() {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256",
    },
    true,
    ["wrapKey", "unwrapKey"],
  );
}

export function generateSymmetricKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export function encryptData(
  data: BufferSource,
  key: CryptoKey,
  iv: BufferSource,
) {
  return crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv,
    },
    key,
    data,
  );
}

export function decryptData(
  data: BufferSource,
  key: CryptoKey,
  iv: BufferSource,
) {
  return crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv,
    },
    key,
    data,
  );
}

export function wrapSymmetricKey(
  symmetricKey: CryptoKey,
  rsaKey: CryptoKey,
) {
  return crypto.subtle.wrapKey("raw", symmetricKey, rsaKey, {
    name: "RSA-OAEP",
  });
}

export function unwrapSymmetricKey(
  symmetricKey: BufferSource,
  rsaKey: CryptoKey,
) {
  return crypto.subtle.unwrapKey(
    "raw",
    symmetricKey,
    rsaKey,
    {
      name: "RSA-OAEP",
    },
    {
      name: "AES-CBC",
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function exportPublicKeyToPem(
  publicKey: CryptoKey,
): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", publicKey);

  const base64Key = btoa(
    String.fromCharCode(...new Uint8Array(exported)),
  );

  const pem = `-----BEGIN PUBLIC KEY-----\n${
    base64Key.match(/.{1,64}/g)!.join("\n")
  }\n-----END PUBLIC KEY-----`;
  return pem;
}

export async function exportPrivateKeyToPem(
  publicKey: CryptoKey,
): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", publicKey);

  const base64Key = btoa(
    String.fromCharCode(...new Uint8Array(exported)),
  );

  const pem = `-----BEGIN PRIVATE KEY-----\n${
    base64Key.match(/.{1,64}/g)!.join("\n")
  }\n-----END PRIVATE KEY-----`;
  return pem;
}

function parsePem(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN (PUBLIC|PRIVATE) KEY-----/, "")
    .replace(/-----END (PUBLIC|PRIVATE) KEY-----/, "")
    .replace(/\s/g, "");
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function importPublicKeyFromPem(pem: string) {
  const keyData = parsePem(pem);

  const publicKey = await crypto.subtle.importKey(
    "spki",
    keyData,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["wrapKey"],
  );

  return publicKey;
}

export async function importPrivateKeyFromPem(pem: string) {
  const keyData = parsePem(pem);

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["unwrapKey"],
  );

  return privateKey;
}
