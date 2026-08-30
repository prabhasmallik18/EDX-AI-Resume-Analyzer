const fs = require("fs");
const pdfParse = require("pdf-parse");

const normalizeExtractedText = (text) => {
  return text
    .replace(/\r/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
};

const extractedTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = normalizeExtractedText(data.text || "");

  if (!text) {
    throw new Error(
      "No readable text was found in the PDF. Please upload a text-based resume PDF."
    );
  }

  return text;
};

module.exports = extractedTextFromPDF;
