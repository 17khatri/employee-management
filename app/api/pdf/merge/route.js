import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: "Please upload at least 2 PDF files" },
        { status: 400 },
      );
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each file
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const pageCount = pdf.getPageCount();

      // Copy all pages from this PDF to the merged document
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Create response with PDF
    return new NextResponse(mergedPdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF Merge Error:", error);
    return NextResponse.json(
      { error: "Failed to merge PDFs: " + error.message },
      { status: 500 },
    );
  }
}
