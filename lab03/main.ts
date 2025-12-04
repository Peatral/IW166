import { WalkEntry } from "@std/fs/walk";
import { evaluateArgs } from "./evaluate_args.ts";
import { loadDB } from "./hashdb.ts";
import { runForFiles } from "./path_utils.ts";
import { Spinner } from "@std/cli/unstable-spinner";
import ReactPDF from "@react-pdf/renderer";
import Report from "./Report.tsx";

if (import.meta.main) {
  const params = Deno.args;
  try {
    const { evidencePath, hashDbPath, investigator, outputPath } = evaluateArgs(
      params,
    );

    const startDate = new Date(Date.now());
    console.log("%cStarting investigation...", "font-weight: bold");
    console.log(`Investigator: ${investigator}`);
    console.log(`Started at ${startDate.toLocaleTimeString()}`);
    console.log("");

    const checkHash = loadDB(hashDbPath);
    console.log("Loaded database...\n");

    console.log(`Scanning evidence under ${evidencePath}\n`);

    let checkedFiles = 0;
    let foundFileCount = 0;
    const spinner = new Spinner({
      message: "Checking files...",
      color: "yellow",
    });
    const updateSpinner = () => {
      spinner.message =
        `${checkedFiles} files checked, ${foundFileCount} files found`;
    };

    updateSpinner();
    spinner.start();

    const foundFiles = new Map<
      string,
      { type: string; info: Deno.FileInfo; files: WalkEntry[] }
    >();
    await runForFiles(evidencePath, (entry, hashes) => {
      let any = false;
      for (const key of Object.keys(hashes)) {
        const hash = hashes[key as keyof typeof hashes];
        if (checkHash(hash)) {
          if (!foundFiles.has(hash)) {
            foundFiles.set(hash, {
              type: key,
              info: Deno.statSync(entry.path),
              files: [],
            });
          }
          foundFiles.get(hash)?.files.push(entry);
          any = true;
          break;
        }
      }
      if (any) {
        foundFileCount++;
      }
      checkedFiles++;
      updateSpinner();
      return Promise.resolve();
    });

    spinner.stop();

    console.log(`Checked ${checkedFiles} files in total`);

    if (foundFiles.size === 0) {
      console.log("Found no files...");
    } else {
      console.log(
        `Found the following %c${foundFileCount}%c files:`,
        "color: red; font-weight: bold",
        "",
      );

      const longestHashLength = [...foundFiles.keys()].sort((a, b) =>
        b.length - a.length
      )[0].length;
      const longestSizeLength = [...foundFiles.values()].map((f) =>
        `${f.info.size}`
      ).sort((a, b) => b.length - a.length)[0].length;

      foundFiles.entries().forEach(([hash, { type, info, files }]) => {
        files.forEach((entry) => {
          console.log(
            `%c${hash.padEnd(longestHashLength)} %c${type.padEnd(6)} ${
              `${info.size}`.padEnd(longestSizeLength)
            } ${entry.path.replace(evidencePath, "")}`,
            "color: blue",
            "",
          );
        });
      });
    }

    const endDate = new Date(Date.now());

    ReactPDF.render(Report({
      path: outputPath,
      evidencePath,
      investigator,
      checkedFiles,
      foundFileCount,
      foundFiles,
      startTime: startDate,
      endTime: endDate,
    }), outputPath);

    // TODO: The type definitions are still missing
    // deno-lint-ignore no-explicit-any
    const formattedDuration = new (Intl as any).DurationFormat("en", { style: "long" })
      .format(
        endDate.toTemporalInstant().since(startDate.toTemporalInstant()).round(
          "second",
        ),
      );
    console.log(
      `%c\nInvestigation finished at ${endDate.toLocaleTimeString()} after a total of ${formattedDuration}`,
      "font-weight: bold; color: lime",
    );
  } catch (message) {
    console.log(`\n${message}\nAborting...`);
  }
}
