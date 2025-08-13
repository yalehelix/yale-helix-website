// Google Apps Script for File Upload to Google Drive
// Deploy this as a web app with "Execute as: Me" and "Who has access: Anyone"

// Replace this with your specific Google Drive folder ID
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'

function doPost(e) {
  try {
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    
    // Handle batch file upload
    if (data.files && Array.isArray(data.files)) {
      return handleBatchUpload(data);
    }
    
    // Handle single file upload (backward compatibility)
    if (data.fileName && data.fileType && data.fileData) {
      return handleSingleUpload(data);
    }
    
    // Invalid request
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid request format' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Upload error:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Upload failed: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleBatchUpload(data) {
  try {
    const { files, folderName, timestamp } = data;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No files provided' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the main folder by ID
    let mainFolder;
    try {
      mainFolder = DriveApp.getFolderById(FOLDER_ID);
    } catch (error) {
      console.error('Main folder not found:', error);
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Upload folder not found. Please check the folder ID.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Create or get student-specific subfolder (ONCE for all files)
    let studentFolder;
    if (folderName && folderName !== 'Default') {
      try {
        // Try to find existing student folder
        const existingFolders = mainFolder.getFoldersByName(folderName);
        let folderFound = false;
        
        // Check if we already have a folder with this name
        while (existingFolders.hasNext()) {
          const existingFolder = existingFolders.next();
          // Use the first folder we find with this name
          if (!folderFound) {
            studentFolder = existingFolder;
            folderFound = true;
            console.log(`Using existing student folder: ${folderName}`);
          } else {
            // If we find multiple folders with the same name, log it for debugging
            console.log(`Found duplicate folder: ${folderName} - ID: ${existingFolder.getId()}`);
          }
        }
        
        // If no existing folder was found, create a new one
        if (!folderFound) {
          studentFolder = mainFolder.createFolder(folderName);
          console.log(`Created new student folder: ${folderName}`);
        }
      } catch (error) {
        console.error('Error creating student folder:', error);
        // Fallback to main folder if subfolder creation fails
        studentFolder = mainFolder;
      }
    } else {
      studentFolder = mainFolder;
    }
    
    // Upload all files to the same student folder
    const uploadedFiles = [];
    
    for (const fileData of files) {
      const { fileName, fileType, fileData: base64Data } = fileData;
      
      if (!fileName || !fileType || !base64Data) {
        console.error('Missing file data for:', fileName);
        continue;
      }
      
      try {
        // Decode base64 data
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), fileType, fileName);
        
        // Create the file in the student folder
        const file = studentFolder.createFile(blob);
        
        // Set file permissions to "Anyone with the link can view"
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Get the sharing URL
        const driveLink = file.getUrl();
        
        uploadedFiles.push({
          fileName: fileName,
          driveLink: driveLink,
          fileId: file.getId()
        });
        
        console.log(`File uploaded: ${fileName} (${fileType}) to student folder: ${folderName} - ${driveLink}`);
        
      } catch (error) {
        console.error(`Error uploading file ${fileName}:`, error);
      }
    }
    
    // Return success response with all uploaded files
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        uploadedFiles: uploadedFiles,
        folderName: folderName || 'Default',
        timestamp: timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Batch upload error:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Batch upload failed: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSingleUpload(data) {
  try {
    const { fileName, fileType, fileData, timestamp, folderName } = data;
    
    // Validate required fields
    if (!fileName || !fileType || !fileData) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Decode base64 data
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), fileType, fileName);
    
    // Get the main folder by ID
    let mainFolder;
    try {
      mainFolder = DriveApp.getFolderById(FOLDER_ID);
    } catch (error) {
      console.error('Main folder not found:', error);
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Upload folder not found. Please check the folder ID.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Create or get student-specific subfolder
    let studentFolder;
    if (folderName && folderName !== 'Default') {
      try {
        // Try to find existing student folder
        const existingFolders = mainFolder.getFoldersByName(folderName);
        let folderFound = false;
        
        // Check if we already have a folder with this name
        while (existingFolders.hasNext()) {
          const existingFolder = existingFolders.next();
          // Use the first folder we find with this name
          if (!folderFound) {
            studentFolder = existingFolder;
            folderFound = true;
            console.log(`Using existing student folder: ${folderName}`);
          } else {
            // If we find multiple folders with the same name, log it for debugging
            console.log(`Found duplicate folder: ${folderName} - ID: ${existingFolder.getId()}`);
          }
        }
        
        // If no existing folder was found, create a new one
        if (!folderFound) {
          studentFolder = mainFolder.createFolder(folderName);
          console.log(`Created new student folder: ${folderName}`);
        }
      } catch (error) {
        console.error('Error creating student folder:', error);
        // Fallback to main folder if subfolder creation fails
        studentFolder = mainFolder;
      }
    } else {
      studentFolder = mainFolder;
    }
    
    // Create the file in the student folder (or main folder if no subfolder)
    const file = studentFolder.createFile(blob);
    
    // Set file permissions to "Anyone with the link can view"
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get the sharing URL
    const driveLink = file.getUrl();
    
    // Log the upload for tracking
    const uploadLocation = studentFolder === mainFolder ? 'main folder' : `student folder: ${folderName}`;
    console.log(`File uploaded: ${fileName} (${fileType}) to ${uploadLocation} - ${driveLink}`);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        driveLink: driveLink,
        fileId: file.getId(),
        fileName: fileName,
        folderName: folderName || 'Default',
        timestamp: timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Single upload error:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Upload failed: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}