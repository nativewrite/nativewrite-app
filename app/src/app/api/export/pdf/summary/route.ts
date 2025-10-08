import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const { title, transcriptText, chatMessages } = await request.json();

    if (!chatMessages || !Array.isArray(chatMessages)) {
      return NextResponse.json(
        { error: "Chat messages are required" },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { height, width } = page.getSize();

    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const margin = 50;
    const maxWidth = width - 2 * margin;
    let y = height - margin;

    // Helper to add text with wrapping
    const drawText = (text: string, fontSize = 12, font = helvetica, color = rgb(0.2, 0.2, 0.2)) => {
      const words = text.split(' ');
      let line = '';
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && line) {
          page.drawText(line, { x: margin, y, size: fontSize, font, color });
          y -= fontSize + 4;
          line = word;
          
          // Check if we need a new page
          if (y < margin + 50) {
            page = pdfDoc.addPage([595, 842]);
            y = height - margin;
          }
        } else {
          line = testLine;
        }
      }
      
      if (line) {
        page.drawText(line, { x: margin, y, size: fontSize, font, color });
        y -= fontSize + 4;
      }
      
      y -= 10; // Add spacing after paragraph
    };

    // Header
    page.drawText(title || "NativeWrite Summary Sheet", {
      x: margin,
      y,
      size: 20,
      font: helveticaBold,
      color: rgb(0.12, 0.23, 0.54), // Tesla navy blue
    });
    y -= 30;

    // Timestamp
    page.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: margin,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 30;

    // Divider
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 20;

    // Transcript snippet (if available)
    if (transcriptText) {
      page.drawText("📄 Original Transcript:", {
        x: margin,
        y,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      y -= 20;

      const snippet = transcriptText.length > 600 
        ? transcriptText.slice(0, 600) + "..." 
        : transcriptText;
      drawText(snippet, 11, helvetica, rgb(0.3, 0.3, 0.3));
      y -= 10;
    }

    // Chat conversation
    page.drawText("🧠 AI Conversation:", {
      x: margin,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // Render messages
    for (const msg of chatMessages) {
      if (msg.role === "system") continue;
      
      const prefix = msg.role === "user" ? "👤 You: " : "🤖 NativeGPT: ";
      const messageColor = msg.role === "user" ? rgb(0.2, 0.2, 0.6) : rgb(0, 0.4, 0.6);
      
      // Check if we need a new page
      if (y < margin + 100) {
        page = pdfDoc.addPage([595, 842]);
        y = height - margin;
      }
      
      page.drawText(prefix, {
        x: margin,
        y,
        size: 11,
        font: helveticaBold,
        color: messageColor,
      });
      y -= 16;
      
      drawText(msg.content, 10, helvetica, rgb(0.2, 0.2, 0.2));
      y -= 5;
    }

    // Footer on last page
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    lastPage.drawText("Powered by NativeWrite AI", {
      x: margin,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // Serialize to bytes
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="NativeWrite_Summary_${Date.now()}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

