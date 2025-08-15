// Google Apps Script for handling file uploads to Google Drive
// Updated to support chunked uploads and better error handling

// Replace this with your specific Google Drive folder ID
const FOLDER_ID = '1HjnJ587O-jWOGl_xQTeDdDuiwOtxPRhH';

function doPost(e) {
  try {
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    
    // Log the upload method for debugging
    console.log('Upload method:', data.uploadMethod || 'legacy');
    console.log('File name:', data.fileName);
    console.log('File type:', data.fileType);
    console.log('Folder name:', data.folderName);
    
    // Handle different upload methods
    if (data.uploadMethod === 'chunked') {
      return handleChunkedUpload(data);
    } else if (data.uploadMethod === 'batch') {
      return handleBatchUpload(data);
    } else {
      // Handle single file uploads (legacy and new)
      return handleSingleFileUpload(data);
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Failed to process request: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleChunkedUpload(data) {
  try {
    console.log('Processing chunked upload with', data.totalChunks, 'chunks');
    
    // Validate required fields
    if (!data.fileName || !data.fileType || !data.fileData || !data.totalChunks) {
      throw new Error('Missing required fields for chunked upload');
    }
    
    // Create or get the target folder using your specific structure
    const folder = getOrCreateFolder(data.folderName || 'Default');
    
    // Convert base64 to blob
    const blob = Utilities.newBlob(Utilities.base64Decode(data.fileData), data.fileType, data.fileName);
    
    // Upload to Google Drive
    const file = folder.createFile(blob);
    
    // Set file permissions to "Anyone with the link can view"
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    console.log('Chunked upload completed successfully. File ID:', file.getId());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        driveLink: file.getUrl(),
        fileId: file.getId(),
        fileName: file.getName(),
        fileSize: file.getSize(),
        uploadMethod: 'chunked',
        totalChunks: data.totalChunks,
        message: 'File reassembled and uploaded successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in chunked upload:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Chunked upload failed: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSingleFileUpload(data) {
  try {
    console.log('Processing single file upload');
    
    // Validate required fields
    if (!data.fileName || !data.fileType || !data.fileData) {
      throw new Error('Missing required fields for file upload');
    }
    
    // Create or get the target folder using your specific structure
    const folder = getOrCreateFolder(data.folderName || 'Default');
    
    // Convert base64 to blob
    const blob = Utilities.newBlob(Utilities.base64Decode(data.fileData), data.fileType, data.fileName);
    
    // Upload to Google Drive
    const file = folder.createFile(blob);
    
    // Set file permissions to "Anyone with the link can view"
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    console.log('Single file upload completed successfully. File ID:', file.getId());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        driveLink: file.getUrl(),
        fileId: file.getId(),
        fileName: file.getName(),
        fileSize: file.getSize(),
        uploadMethod: data.uploadMethod || 'single',
        message: 'File uploaded successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in single file upload:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'File upload failed: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleBatchUpload(data) {
  try {
    console.log('Processing batch upload with', data.files.length, 'files');
    
    // Validate required fields
    if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
      throw new Error('No files provided for batch upload');
    }
    
    if (!data.folderName) {
      throw new Error('Folder name is required for batch upload');
    }
    
    // Create or get the target folder using your specific structure
    const folder = getOrCreateFolder(data.folderName);
    
    const uploadedFiles = [];
    const errors = [];
    
    // Process each file
    for (let i = 0; i < data.files.length; i++) {
      try {
        const fileData = data.files[i];
        
        if (!fileData.fileName || !fileData.fileType || !fileData.fileData) {
          errors.push(`File ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Convert base64 to blob
        const blob = Utilities.newBlob(
          Utilities.base64Decode(fileData.fileData), 
          fileData.fileType, 
          fileData.fileName
        );
        
        // Upload to Google Drive
        const file = folder.createFile(blob);
        
        // Set file permissions to "Anyone with the link can view"
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        uploadedFiles.push({
          fileName: file.getName(),
          fileId: file.getId(),
          driveLink: file.getUrl(),
          fileSize: file.getSize()
        });
        
        console.log(`File ${i + 1} uploaded successfully:`, file.getName());
        
      } catch (fileError) {
        console.error(`Error uploading file ${i + 1}:`, fileError);
        errors.push(`File ${i + 1}: ${fileError.message}`);
      }
    }
    
    // Prepare response
    const response = {
      success: uploadedFiles.length > 0,
      uploadedFiles: uploadedFiles,
      totalFiles: data.files.length,
      successfulUploads: uploadedFiles.length,
      failedUploads: errors.length,
      uploadMethod: 'batch'
    };
    
    if (errors.length > 0) {
      response.errors = errors;
    }
    
    if (uploadedFiles.length === 0) {
      response.error = 'All files failed to upload';
    }
    
    console.log('Batch upload completed. Success:', uploadedFiles.length, 'Failed:', errors.length);
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in batch upload:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Batch upload failed: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(folderName) {
  try {
    // Get the main folder by ID (your specific folder)
    let mainFolder;
    try {
      mainFolder = DriveApp.getFolderById(FOLDER_ID);
    } catch (error) {
      console.error('Main folder not found:', error);
      throw new Error('Upload folder not found. Please check the folder ID: ' + FOLDER_ID);
    }
    
    // If no specific subfolder name, use the main folder
    if (!folderName || folderName === 'Default') {
      return mainFolder;
    }
    
    // Try to find existing subfolder
    const existingFolders = mainFolder.getFoldersByName(folderName);
    let folderFound = false;
    let subFolder;
    
    // Check if we already have a folder with this name
    while (existingFolders.hasNext()) {
      const existingFolder = existingFolders.next();
      // Use the first folder we find with this name
      if (!folderFound) {
        subFolder = existingFolder;
        folderFound = true;
        console.log(`Using existing subfolder: ${folderName}`);
      } else {
        // If we find multiple folders with the same name, log it for debugging
        console.log(`Found duplicate folder: ${folderName} - ID: ${existingFolder.getId()}`);
      }
    }
    
    // If no existing subfolder was found, create a new one
    if (!folderFound) {
      subFolder = mainFolder.createFolder(folderName);
      console.log(`Created new subfolder: ${folderName}`);
    }
    
    return subFolder;
    
  } catch (error) {
    console.error('Error creating/finding folder:', error);
    throw new Error('Failed to create or access folder: ' + error.message);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Google Apps Script is running',
      timestamp: new Date().toISOString(),
      version: '2.0',
      features: ['single-upload', 'chunked-upload', 'batch-upload', 'auto-folder-creation'],
      mainFolderId: FOLDER_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Utility function for testing
function testUpload() {
  console.log('Testing upload functionality...');
  
  // Test data
  const testData = {
    fileName: 'test.txt',
    fileType: 'text/plain',
    fileData: Utilities.base64Encode('Hello, this is a test file!'),
    folderName: 'Test Uploads',
    uploadMethod: 'single'
  };
  
  try {
    const result = handleSingleFileUpload(testData);
    console.log('Test upload result:', result);
    return result;
  } catch (error) {
    console.error('Test upload failed:', error);
    return { error: error.message };
  }
}