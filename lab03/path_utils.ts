import { walk, type WalkEntry } from "@std/fs/walk";
import { getHashes } from "./crypto.ts";

export async function runForFiles(
  dir: string,
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
    const hashes = await getHashes(data);
    promises.push(callback(fileEntry, hashes, data));
  }
  await Promise.all(promises);
}
