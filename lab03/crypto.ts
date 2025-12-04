import { createHash } from "node:crypto";

export function getHash(data: BufferSource, algo: string) {
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
