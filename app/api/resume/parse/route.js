import { fail, ok } from "@/utils/server/http";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function extractPdfText(buffer) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.warn("pdf-parse failed, falling back to pdfjs-dist:", error?.message || error);
    // Fall through to pdf.js. Some PDFs parse better through one engine than the other.
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    useSystemFonts: true,
  }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join("\n\n");
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return fail("Upload a resume file", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return fail("Resume file must be 5MB or smaller", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "resume";
    const extension = fileName.split(".").pop()?.toLowerCase();
    let text = "";

    if (extension === "pdf" || file.type === "application/pdf") {
      try {
        text = await extractPdfText(buffer);
      } catch (error) {
        console.warn("PDF resume parsing failed:", error?.message || error);
        return fail("Could not read this PDF. Try exporting it as DOCX or TXT and upload again.", 422);
      }
    } else if (
      extension === "docx" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const parsed = await mammoth.extractRawText({ buffer });
      text = parsed.value || "";
    } else if (["txt", "md"].includes(extension)) {
      text = buffer.toString("utf8");
    } else {
      return fail("Supported resume formats: PDF, DOCX, TXT, MD", 400);
    }

    const cleaned = text
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleaned.length < 40) {
      return fail("Could not extract enough text from this resume", 400);
    }

    return ok({
      fileName,
      text: cleaned.slice(0, 12000),
    });
  } catch (error) {
    return fail(error.message || "Failed to parse resume", 500);
  }
}
