import { NextRequest, NextResponse } from "next/server";

// Google Apps Script Web App URL - you'll need to replace this with your actual Apps Script URL
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxLelRGrAxsf0rFaNYTeNyhQF7eAApDKdHEWPHpw6wBMazuG7xIeU5Oe4T2TTBLAUrl/exec";

export async function POST(request: NextRequest) {
  try {
    // Check if this is a FormData upload
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const fileName = formData.get('fileName') as string;
      const fileType = formData.get('fileType') as string;
      const folderName = formData.get('folderName') as string || 'Startup Applications';
      
      if (!file || !fileName || !fileType) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Convert file to base64 for Google Apps Script compatibility
      const arrayBuffer = await file.arrayBuffer();
      const fileData = Buffer.from(arrayBuffer).toString('base64');

      // Forward the request to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileType,
          fileData,
          folderName: folderName,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Apps Script responded with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        driveLink: result.driveLink,
        fileId: result.fileId,
      });
    }

    // Handle JSON uploads (backward compatibility)
    const body = await request.json();
    const { fileName, fileType, fileData } = body;

    if (!fileName || !fileType || !fileData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Forward the request to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType,
        fileData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Apps Script responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      driveLink: result.driveLink,
      fileId: result.fileId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
