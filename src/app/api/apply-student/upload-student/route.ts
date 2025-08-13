import { NextRequest, NextResponse } from 'next/server';

// Google Apps Script Web App URL - you'll need to replace this with your actual Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-I9cNUbsX_1P2uJhOzGseeOfRJo5mXV1TWukN4HyNZMf42e3-FjbEnDjpkNxrUXIv/exec';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, folderName } = body;

    // Handle single file upload (backward compatibility)
    if (body.fileName && body.fileType && body.fileData) {
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
          folderName: folderName || 'Default',
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
    }

    // Handle batch file upload
    if (files && Array.isArray(files) && files.length > 0) {
      if (!folderName) {
        return NextResponse.json(
          { error: 'Missing folderName for batch upload' },
          { status: 400 }
        );
      }

      // Forward the batch request to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files,
          folderName,
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
        uploadedFiles: result.uploadedFiles,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 },
    );
  }
}
