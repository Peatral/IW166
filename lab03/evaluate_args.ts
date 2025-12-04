import { parseArgs } from "@std/cli";

const EVIDENCE_KEY = "evidence";
const HASH_DB_KEY = "hash-db";
const INVESTIGATOR_KEY = "investigator";
const OUTPUT_KEY = "output";
const KEY_ERRORS = {
  [EVIDENCE_KEY]: "Please specify a path to the evidence using '--evidence'",
  [HASH_DB_KEY]: "Please specify a path to the hash database using '--hash-db'",
  [INVESTIGATOR_KEY]: "Please specify an investagor using '--investigator'",
  [OUTPUT_KEY]: "Please specify an output path using '--output'",
};
const REQUIRED_KEYS = [
  EVIDENCE_KEY,
  HASH_DB_KEY,
  INVESTIGATOR_KEY,
  OUTPUT_KEY,
] as const;
const KNOWN_KEYS = REQUIRED_KEYS;

type Args = {
  [EVIDENCE_KEY]: string;
  [HASH_DB_KEY]: string;
  [INVESTIGATOR_KEY]: string;
  [OUTPUT_KEY]: string;
};

export function evaluateArgs(args: string[]) {
  const parsedArgs = parseArgs(args, {
    unknown: (arg, key) => {
      if (key && (KNOWN_KEYS as readonly string[]).includes(key)) {
        return true;
      }
      console.log(
        `%cWarning: '${arg}' is not a valid argument, ignoring`,
        "color: yellow",
      );
      return false;
    },
  });

  REQUIRED_KEYS.forEach((key) => {
    if (!parsedArgs[key]) {
      throw new Error(KEY_ERRORS[key]);
    }
  });
  const {
    evidence: evidencePath,
    "hash-db": hashDbPath,
    investigator,
    output: outputPath,
  } = parsedArgs as unknown as Args;
  return {
    evidencePath,
    hashDbPath,
    investigator,
    outputPath,
  };
}
