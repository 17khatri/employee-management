import { NextResponse } from "next/server";

export const runtime = "nodejs";

let pdfjsLib = null;

async function getPdfLib() {
  if (!pdfjsLib) {
    const [pdfModule, workerModule] = await Promise.all([
      import("pdfjs-dist/legacy/build/pdf.mjs"),
      import("pdfjs-dist/legacy/build/pdf.worker.mjs"),
    ]);

    if (!globalThis.pdfjsWorker) {
      globalThis.pdfjsWorker = workerModule;
    }

    pdfjsLib = pdfModule;
  }
  return pdfjsLib;
}

async function extractTextFromPage(page) {
  const textContent = await page.getTextContent();
  const strings = textContent.items.map((item) => item.str || "");
  return strings.join(" ");
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const extractType = formData.get("extractType")?.toString() || "text";

    if (!file) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const { getDocument } = await getPdfLib();
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      disableWorker: true,
    }).promise;
    const totalPages = pdf.numPages;

    if (extractType === "metadata") {
      const metadata = await pdf.getMetadata();
      return NextResponse.json({
        totalPages,
        metadata: metadata.info || {},
        metadataRaw: metadata.metadata || null,
      });
    }

    if (extractType === "pages") {
      const pages = [];
      for (let i = 1; i <= totalPages; i += 1) {
        const page = await pdf.getPage(i);
        const text = await extractTextFromPage(page);
        pages.push({ pageNum: i, text });
      }
      return NextResponse.json({ totalPages, pages });
    }

    let text = "";
    for (let i = 1; i <= totalPages; i += 1) {
      const page = await pdf.getPage(i);
      text += await extractTextFromPage(page);
      if (i < totalPages) text += "\n\n";
    }

    return NextResponse.json({ totalPages, text });
  } catch (error) {
    console.error("PDF Extract Error:", error);
    return NextResponse.json(
      { error: "Failed to extract data: " + error.message },
      { status: 500 },
    );
  }
}
