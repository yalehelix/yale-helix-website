// Google Apps Script for File Upload to Google Drive
// Deploy this as a web app with "Execute as: Me" and "Who has access: Anyone"

// Replace this with your specific Google Drive folder ID
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'

function doPost(e) {
  try {
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    const { fileName, fileType, fileData, timestamp } = data;
    
    // Validate required fields
    if (!fileName || !fileType || !fileData) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Decode base64 data
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), fileType, fileName);
    
    // Get the specific folder by ID
    let folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (error) {
      console.error('Folder not found:', error);
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Upload folder not found. Please check the folder ID.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Create the file in the specified Google Drive folder
    const file = folder.createFile(blob);
    
    // Set file permissions to "Anyone with the link can view"
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get the sharing URL
    const driveLink = file.getUrl();
    
    // Log the upload for tracking
    console.log(`File uploaded: ${fileName} (${fileType}) - ${driveLink}`);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        driveLink: driveLink,
        fileId: file.getId(),
        fileName: fileName,
        timestamp: timestamp
      }))
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

// Optional: Add a doGet function for testing
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'File upload service is running',
      timestamp: new Date().toISOString(),
      folderId: FOLDER_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional: Function to clean up old files (run periodically)
function cleanupOldFiles() {
  const maxAgeDays = 365; // Keep files for 1 year
  
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    while (files.hasNext()) {
      const file = files.next();
      if (file.getDateCreated() < cutoffDate) {
        file.setTrashed(true);
        console.log(`Deleted old file: ${file.getName()}`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
} 