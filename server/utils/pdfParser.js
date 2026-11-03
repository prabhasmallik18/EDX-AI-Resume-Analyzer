const fs = require("fs");

const userError = (message) => Object.assign(new Error(message), { statusCode: 400 });

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

/**
 * Reads the text of a PDF with pdf.js (the PDF engine used by Firefox).
 *
 * We used "pdf-parse" before, but it bundles a very old pdf.js and is unreliable
 * on modern Node: the same file could fail with "bad XRef entry" or even return
 * the text of a different PDF. pdf.js below is deterministic and safe for many
 * users uploading at the same time.
 *
 * pdf.js gives small text pieces; pieces at the same height are joined into one line.
 */
const readWithPdfJs = async (buffer) => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;

  try {
    const pages = [];

    for (let number = 1; number <= doc.numPages; number += 1) {
      const page = await doc.getPage(number);
      const content = await page.getTextContent();

      const lines = [];
      let line = "";
      let lastY = null;

      content.items.forEach((item) => {
        if (typeof item.str !== "string") return;

        const y = item.transform ? item.transform[5] : lastY;
        const tolerance = Math.max(2, (item.height || 10) * 0.5);

        if (lastY !== null && Math.abs(y - lastY) > tolerance) {
          lines.push(line);
          line = "";
        }

        line += item.str;

        if (item.hasEOL) {
          lines.push(line);
          line = "";
        }

        lastY = y;
      });

      if (line) lines.push(line);
      pages.push(lines.join("\n"));
    }

    return pages.join("\n");
  } finally {
    await doc.destroy();
  }
};

const extractedTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);

  let rawText;

  try {
    rawText = await readWithPdfJs(buffer);
  } catch (error) {
    if (/password/i.test(`${error?.name} ${error?.message}`)) {
      throw userError("This PDF is password protected. Please remove the password and upload again.");
    }
    throw userError("This PDF could not be read. It may be damaged. Try exporting it again as a PDF.");
  }

  const text = normalizeExtractedText(rawText);

  if (!text) {
    throw userError(
      "No readable text was found in the PDF. Please upload a text-based resume PDF (not a scanned photo)."
    );
  }

  return text;
};

module.exports = extractedTextFromPDF;
