import { NextRequest, NextResponse } from 'next/server';

// Google Apps Script Web App URL - you'll need to replace this with your actual Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvftXDupq0o0gGhDU5KYiWW2biddWsW3nQ6zTO-KyLr7SfWwmpmZYwnhMJg3LAzitR/exec';

// In-memory storage for chunks (in production, use Redis or similar)
const chunkStorage = new Map<string, { chunks: Map<number, string>, metadata: any }>();

export async function POST(request: NextRequest) {
  try {
    // Check if this is a chunked upload
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Check if this is a chunk
      const chunk = formData.get('chunk');
      if (chunk) {
        return await handleChunkUpload(formData);
      }
      
      // Check if this is a complete request
      const action = formData.get('action');
      if (action === 'complete') {
        return await handleCompleteUpload(formData);
      }
      
      // Handle single file upload (existing functionality)
      return await handleSingleFileUpload(formData);
    }

    // Handle JSON requests (existing functionality)
    const body = await request.json();
    
    // Check if this is a complete request
    if (body.action === 'complete') {
      return await handleCompleteUpload(body);
    }
    
    // Handle existing JSON uploads
    return await handleJsonUpload(body);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 },
    );
  }
}

async function handleChunkUpload(formData: FormData) {
  const chunk = formData.get('chunk') as Blob;
  const chunkIndex = parseInt(formData.get('chunkIndex') as string);
  const totalChunks = parseInt(formData.get('totalChunks') as string);
  const uploadId = formData.get('uploadId') as string;
  const fileName = formData.get('fileName') as string;
  const fileType = formData.get('fileType') as string;
  const folderName = formData.get('folderName') as string || 'Default';

  if (!chunk || chunkIndex === undefined || totalChunks === undefined || !uploadId || !fileName || !fileType) {
    return NextResponse.json(
      { error: 'Missing required chunk fields' },
      { status: 400 }
    );
  }

  try {
    // Convert chunk to base64
    const arrayBuffer = await chunk.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Store chunk in memory
    if (!chunkStorage.has(uploadId)) {
      chunkStorage.set(uploadId, {
        chunks: new Map(),
        metadata: { fileName, fileType, folderName, totalChunks }
      });
    }

    const uploadData = chunkStorage.get(uploadId)!;
    uploadData.chunks.set(chunkIndex, base64);

    // Clean up old uploads (older than 1 hour)
    setTimeout(() => {
      chunkStorage.delete(uploadId);
    }, 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      chunkReceived: chunkIndex + 1,
      totalChunks,
      message: `Chunk ${chunkIndex + 1} received successfully`
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process chunk' },
      { status: 500 }
    );
  }
}

async function handleCompleteUpload(data: FormData | any) {
  const uploadId = data.uploadId || data.get('uploadId');
  const fileName = data.fileName || data.get('fileName');
  const fileType = data.fileType || data.get('fileType');
  const folderName = data.folderName || data.get('folderName') || 'Default';

  if (!uploadId || !fileName || !fileType) {
    return NextResponse.json(
      { error: 'Missing required completion fields' },
      { status: 400 }
    );
  }

  const uploadData = chunkStorage.get(uploadId);
  if (!uploadData) {
    return NextResponse.json(
      { error: 'Upload session not found or expired' },
      { status: 404 }
    );
  }

  const { chunks, metadata } = uploadData;
  
  // Verify all chunks are present
  if (chunks.size !== metadata.totalChunks) {
    return NextResponse.json(
      { error: `Missing chunks. Expected ${metadata.totalChunks}, got ${chunks.size}` },
      { status: 400 }
    );
  }

  try {
    // Reassemble file from chunks
    const reassembledChunks: string[] = [];
    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunk = chunks.get(i);
      if (!chunk) {
        throw new Error(`Missing chunk ${i}`);
      }
      reassembledChunks.push(chunk);
    }

    // Combine all chunks into one base64 string
    const completeFileData = reassembledChunks.join('');

    // Forward to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType,
        fileData: completeFileData,
        folderName,
        timestamp: new Date().toISOString(),
        uploadMethod: 'chunked',
        totalChunks: metadata.totalChunks,
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

    // Clean up chunks after successful upload
    chunkStorage.delete(uploadId);

    return NextResponse.json({
      success: true,
      driveLink: result.driveLink,
      fileId: result.fileId,
      message: 'File reassembled and uploaded successfully'
    });

  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}

async function handleSingleFileUpload(formData: FormData) {
  const file = formData.get('file') as File;
  const fileName = formData.get('fileName') as string;
  const fileType = formData.get('fileType') as string;
  const folderName = formData.get('folderName') as string || 'Default';
  
  if (!file || !fileName || !fileType) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Convert file to base64 for Google Apps Script compatibility
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  // Forward the request to Google Apps Script
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName,
      fileType,
      fileData: base64,
      folderName: folderName,
      timestamp: new Date().toISOString(),
      uploadMethod: 'single',
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

async function handleJsonUpload(body: any) {
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
        uploadMethod: 'json',
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
        uploadMethod: 'batch',
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
}
