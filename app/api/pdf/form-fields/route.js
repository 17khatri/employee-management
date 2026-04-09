import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "PDF does not contain fillable form fields" },
        { status: 400 },
      );
    }

    const fieldInfos = fields
      .map((field) => {
        const name = typeof field.getName === "function" ? field.getName() : "";
        return {
          name,
          type: field.constructor?.name || "Unknown",
        };
      })
      .filter((field) => field.name);

    return NextResponse.json({ fields: fieldInfos });
  } catch (error) {
    console.error("PDF Form Fields Error:", error);
    return NextResponse.json(
      { error: "Failed to read PDF form fields: " + error.message },
      { status: 500 },
    );
  }
}
