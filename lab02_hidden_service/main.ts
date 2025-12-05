import express from "express";
import ReactPDF from "@react-pdf/renderer";
import { Instructions } from "./Instructions.tsx";

const app = express();
const port = 8000;

app.use(express.static("public"));

app.get("/instructions.pdf", async (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="instructions.pdf"',
  );
  const pdf = await ReactPDF.renderToStream(Instructions());
  pdf.pipe(res);
});

app.listen(port, () => {
  console.log(`listening under port ${port}`);
});
