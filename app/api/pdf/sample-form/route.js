import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";

export async function GET() {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Set up fonts
    const font = await pdfDoc.embedFont("Helvetica");
    const boldFont = await pdfDoc.embedFont("Helvetica-Bold");

    // Add title
    page.drawText("Sample Fillable Form", {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Add subtitle
    page.drawText("Test form for PDF filling functionality", {
      x: 50,
      y: height - 80,
      size: 12,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Create form
    const form = pdfDoc.getForm();

    // Add text fields
    const nameField = form.createTextField("name");
    nameField.setText("John Doe");
    nameField.addToPage(page, {
      x: 150,
      y: height - 130,
      width: 200,
      height: 20,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    const emailField = form.createTextField("email");
    emailField.setText("john@example.com");
    emailField.addToPage(page, {
      x: 150,
      y: height - 160,
      width: 200,
      height: 20,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    const phoneField = form.createTextField("phone");
    phoneField.setText("(555) 123-4567");
    phoneField.addToPage(page, {
      x: 150,
      y: height - 190,
      width: 200,
      height: 20,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    const addressField = form.createTextField("address");
    addressField.setText("123 Main St, City, State 12345");
    addressField.addToPage(page, {
      x: 150,
      y: height - 220,
      width: 200,
      height: 20,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    // Add checkbox field
    const agreeField = form.createCheckBox("agree");
    agreeField.check();
    agreeField.addToPage(page, {
      x: 150,
      y: height - 250,
      width: 15,
      height: 15,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    // Add radio group
    const genderGroup = form.createRadioGroup("gender");
    genderGroup.addOptionToPage("Male", page, {
      x: 200,
      y: height - 280,
      width: 15,
      height: 15,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });
    genderGroup.addOptionToPage("Female", page, {
      x: 250,
      y: height - 280,
      width: 15,
      height: 15,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });
    genderGroup.select("Male");

    // Add dropdown
    const countryField = form.createDropdown("country");
    countryField.addOptions(["USA", "Canada", "UK", "Australia", "Other"]);
    countryField.select("USA");
    countryField.addToPage(page, {
      x: 150,
      y: height - 310,
      width: 150,
      height: 20,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    // Add labels
    page.drawText("Name:", { x: 50, y: height - 125, size: 12, font: font });
    page.drawText("Email:", { x: 50, y: height - 155, size: 12, font: font });
    page.drawText("Phone:", { x: 50, y: height - 185, size: 12, font: font });
    page.drawText("Address:", { x: 50, y: height - 215, size: 12, font: font });
    page.drawText("I agree to terms:", {
      x: 50,
      y: height - 245,
      size: 12,
      font: font,
    });
    page.drawText("Gender:", { x: 50, y: height - 275, size: 12, font: font });
    page.drawText("Male", { x: 220, y: height - 275, size: 12, font: font });
    page.drawText("Female", { x: 270, y: height - 275, size: 12, font: font });
    page.drawText("Country:", { x: 50, y: height - 305, size: 12, font: font });

    // Add instructions at bottom
    page.drawText("Form Field Names (for testing):", {
      x: 50,
      y: height - 350,
      size: 14,
      font: boldFont,
    });

    const fieldNames = [
      "name",
      "email",
      "phone",
      "address",
      "agree (checkbox)",
      "gender (radio)",
      "country (dropdown)",
    ];

    fieldNames.forEach((name, index) => {
      page.drawText(`• ${name}`, {
        x: 50,
        y: height - 375 - index * 15,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="sample-fillable-form.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating sample PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate sample PDF" },
      { status: 500 },
    );
  }
}
