import { WalkEntry } from "@std/fs/walk";
import { createWriteStream } from "node:fs";
import PDFDocument from "pdfkit-table";

export function generateReport(args: {
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

  const doc = new PDFDocument();
  doc.pipe(createWriteStream(args.path));
  doc
    .font("Helvetica")
    .fontSize(25)
    .text("Scan Report", { align: "center" })
    .fontSize(12)
    .lineGap(4)
    .text(`Investigator: ${args.investigator}`)
    .text(`Start of the investigation: ${dateTimeFormat.format(args.startTime)}`)
    .text(`End of the investigation: ${dateTimeFormat.format(args.endTime)}`)
    .text("\n");

  const headers = ["Hash", "Typ", "Size (Bytes)", "Path"];
  const rows = [...args.foundFiles.entries()].flatMap((
    [hash, { type, info, files }],
  ) =>
    files.map((entry) => [
      hash,
      type,
      "" + info.size,
      entry.path.replace(args.evidencePath, ""),
    ])
  );

  doc.fontSize(8);
  const cols = rows[0].map((_, colIndex) => rows.map((row) => row[colIndex]));
  const sizes = cols.map((col) =>
    Math.min(col.map((text) => doc.widthOfString(text)).sort((a, b) => b - a)[0] + 15, 200)
  );
  doc.table({ title: "", headers, rows }, {
    divider: {
      horizontal: {
        disabled: false,
        width: 0.5,
        opacity: 0.5
      }
    },
    columnsSize: sizes,
    columnSpacing: 5,
    padding: [5],
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {

      const {x, y, width, height} = rectCell!;

      // first line 
      if(indexColumn === 0){
        doc
        .lineWidth(.5)
        .moveTo(x, y)
        .lineTo(x, y + height)
        .stroke();  
      }

      doc
      .lineWidth(.5)
      .moveTo(x + width, y)
      .lineTo(x + width, y + height)
      .stroke();


      return doc.font("Helvetica").fontSize(8);
    }, // {Function}
  });

  doc.end();
}
