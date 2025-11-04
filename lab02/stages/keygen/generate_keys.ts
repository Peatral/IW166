import {
  exportPrivateKeyToPem,
  exportPublicKeyToPem,
  generateRSAKey,
} from "../../utils/crypto.ts";

export async function generateKeys() {
  const { privateKey, publicKey } = await generateRSAKey();
  const [privateData, publicData] = await Promise.all([
    exportPrivateKeyToPem(privateKey),
    exportPublicKeyToPem(publicKey),
  ]);
  Deno.writeTextFileSync("./private_key.pem", privateData);
  Deno.writeTextFileSync("./public_key.pem", publicData);
}
