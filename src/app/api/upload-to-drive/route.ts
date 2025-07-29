import { NextRequest, NextResponse } from 'next/server';

// Google Apps Script Web App URL - you'll need to replace this with your actual Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXaKK8kpmvUuMbZEyAKpd4Vnef3LYdDOFugqbPrU4azVyiDLqmgOTaf_oVGzEw1Pz_/exec';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileData } = body;

    if (!fileName || !fileType || !fileData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward the request to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      driveLink: result.driveLink,
      fileId: result.fileId,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
} 