import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { WalkEntry } from "@std/fs/walk";
import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "white",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    fontSize: 12,
  },
});

export default function Report({
  investigator,
  startTime,
  endTime,
  foundFiles,
  foundFileCount,
  checkedFiles,
  evidencePath,
}: {
  path: string;
  evidencePath: string;
  investigator: string;
  startTime: Date;
  endTime: Date;
  checkedFiles: number;
  foundFileCount: number;
  foundFiles: Map<
    string,
    { type: string; info: Deno.FileInfo; files: WalkEntry[] }
  >;
}) {
  const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZoneName: "short",
  });

  const headers = ["ID", "Hash", "Typ", "Size (Bytes)", "Path"];
  const rows = [...foundFiles.entries()].flatMap((
    [hash, { type, info, files }],
  ) =>
    files.map((entry) => [
      hash,
      type,
      "" + info.size,
      entry.path.replace(evidencePath, ""),
    ])
  ).map((entry, id) => ["" + (id + 1), ...entry]);

  const cols = rows[0].map((_, colIndex) => rows.map((row) => row[colIndex]));
  const sizes = cols.map((col) =>
    Math.min(col.map((text) => text.length).sort((a, b) => b - a)[0], 30)
  );
  const totalSize = sizes.reduce((sum, value) => sum + value, 0);
  const weightings = sizes.map((size) => size / totalSize);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ alignSelf: "center", fontSize: 25 }}>
            Asservatenauswertung von {investigator}
          </Text>
          <View style={{ marginTop: 25 }}>
            <Text>
              <Text style={{ fontWeight: "600" }}>Start der Untersuchung:</Text>
              {" "}
              {dateTimeFormat.format(startTime)}
            </Text>
            <Text>
              <Text style={{ fontWeight: "600" }}>Ende der Untersuchung:</Text>
              {" "}
              {dateTimeFormat.format(endTime)}
            </Text>
            <Text style={{ marginTop: 10 }}>
              Insgesamt wurden {foundFileCount} Dateien gefunden in{" "}
              {checkedFiles} gescannten Dateien.
            </Text>
          </View>
          <Table
            weightings={weightings}
            style={{ marginTop: 10, fontSize: 12 }}
          >
            <TH>
              {headers.map((title, idx) => (
                <TD key={idx} style={{ padding: 4, minWidth: 15 }}>{title}</TD>
              ))}
            </TH>
            {rows.map((row, rowIdx) => (
              <TR
                key={rowIdx}
                style={{
                  backgroundColor: !(rowIdx % 2) ? "lightgrey" : "white",
                }}
              >
                {row.map((text, colIdx) => (
                  <TD
                    key={colIdx}
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      padding: 4,
                      minWidth: 15,
                    }}
                  >
                    {colIdx === 1
                      ? text.split("").map((letter, letterIdx) => (
                        <View key={letterIdx}>
                          <Text>{letter}</Text>
                        </View>
                      ))
                      : colIdx === 4
                      ? text.split("/").filter((t) => !!t).map((
                        part,
                        partIdx,
                      ) => (
                        <View key={partIdx}>
                          <Text>/{part}</Text>
                        </View>
                      ))
                      : <Text>{text}</Text>}
                  </TD>
                ))}
              </TR>
            ))}
          </Table>
        </View>
      </Page>
    </Document>
  );
}
