import { DatabaseSync } from "node:sqlite";

export function loadDB(path: string) {
  const db = new DatabaseSync(path);
  const search = db.prepare(
    `select hash_value from VIC_HASHES where hash_value is ?`,
  );
  return (hash: string) => !!search.get(hash);
}
