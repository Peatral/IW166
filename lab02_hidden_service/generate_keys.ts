import {
  exportPrivateKeyToPem,
  exportPublicKeyToPem,
  generateRSAKey,
} from "@iw166/utils/crypto";
import express from "express";

export async function generateKeys() {
  const { privateKey, publicKey } = await generateRSAKey();
  const [privateData, publicData] = await Promise.all([
    exportPrivateKeyToPem(privateKey),
    exportPublicKeyToPem(publicKey),
  ]);
  return {
    privateData,
    publicData,
  } as const;
}

export async function serveKeys(app: express.Application) {
  const keys = await generateKeys();

  app.get("/private_key.pem", (req, res) => {
    res.type("application/x-pem-file");
    res.send(keys.privateData);
  });

  app.get("/public_key.pem", (req, res) => {
    res.type("application/x-pem-file");
    res.send(keys.publicData);
  });

  return keys;
}
