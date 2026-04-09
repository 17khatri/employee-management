import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const startPage = parseInt(formData.get("startPage") || "1");
    const endPage = parseInt(formData.get("endPage") || "0");

    if (!file) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer);
    const totalPages = pdf.getPageCount();

    // Validate page numbers
    if (startPage < 1 || startPage > totalPages) {
      return NextResponse.json(
        { error: `Start page must be between 1 and ${totalPages}` },
        { status: 400 },
      );
    }

    const finalEndPage =
      endPage === 0 ? totalPages : Math.min(endPage, totalPages);

    if (startPage > finalEndPage) {
      return NextResponse.json(
        { error: "Start page cannot be greater than end page" },
        { status: 400 },
      );
    }

    // If splitting into individual pages
    if (formData.get("splitType") === "individual") {
      const pages = [];

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        pages.push({
          pageNum: i + 1,
          data: Buffer.from(pdfBytes).toString("base64"),
        });
      }

      return NextResponse.json(
        {
          success: true,
          totalPages: pages.length,
          pages: pages,
          type: "individual",
        },
        { status: 200 },
      );
    }

    // If extracting specific page range
    const newPdf = await PDFDocument.create();
    const pageIndices = [];

    for (let i = startPage - 1; i < finalEndPage; i++) {
      pageIndices.push(i);
    }

    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();

    return new NextResponse(newPdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pages_${startPage}_to_${finalEndPage}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Split Error:", error);
    return NextResponse.json(
      { error: "Failed to split PDF: " + error.message },
      { status: 500 },
    );
  }
}
