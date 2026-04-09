import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const fieldsJson = formData.get("fields");

    if (!file) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 },
      );
    }

    if (!fieldsJson) {
      return NextResponse.json(
        { error: "Please provide form fields to fill" },
        { status: 400 },
      );
    }

    const fieldValues = JSON.parse(fieldsJson.toString());
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

    for (const entry of fieldValues) {
      if (!entry || !entry.name) continue;
      try {
        const field = form.getField(entry.name);
        if (typeof field.setText === "function") {
          field.setText(entry.value || "");
        } else if (typeof field.check === "function") {
          const value = String(entry.value || "").toLowerCase();
          if (
            value === "true" ||
            value === "yes" ||
            value === "on" ||
            value === "1"
          ) {
            field.check();
          } else if (typeof field.uncheck === "function") {
            field.uncheck();
          }
        } else if (typeof field.select === "function") {
          field.select(entry.value || "");
        }
      } catch (ex) {
        // ignore unknown field names or unsupported field types
        continue;
      }
    }

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(helveticaFont);

    const filledBytes = await pdfDoc.save();
    return new NextResponse(filledBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="filled-form.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF Fill Form Error:", error);
    return NextResponse.json(
      { error: "Failed to fill PDF form: " + error.message },
      { status: 500 },
    );
  }
}
