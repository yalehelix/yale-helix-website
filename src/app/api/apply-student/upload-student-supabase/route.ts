import { NextRequest, NextResponse } from "next/server";
import { supabase, ApplicationFile } from "@/lib/supabase";
import crypto from 'crypto';

const BUCKET_NAME = 'student-files';
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const role = formData.get('role') as ApplicationFile['role'];
    const fileName = formData.get('fileName') as string;
    
    if (!file || !applicationId || !role || !fileName) {
      return NextResponse.json({ 
        error: 'Missing required fields: file, applicationId, role, or fileName' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
      }, { status: 400 });
    }

    // Validate file type based on role
    if (!validateFileType(file, role)) {
      return NextResponse.json({ 
        error: 'File type not allowed for this role' 
      }, { status: 400 });
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${applicationId}/${role}_${timestamp}.${fileExtension}`;
    
    // Calculate SHA256 hash for integrity
    const arrayBuffer = await file.arrayBuffer();
    const sha256Hash = crypto.createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex');

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file to storage' 
      }, { status: 500 });
    }

    // Get the public URL (or signed URL for private buckets)
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueFileName);

    // Create file record in the database
    const fileRecord: Omit<ApplicationFile, 'id' | 'uploaded_at'> = {
      application_id: applicationId,
      role,
      storage_path: uniqueFileName,
      original_filename: fileName,
      mime_type: file.type,
      size_bytes: file.size,
      sha256_hex: sha256Hash,
    };

    const { data: insertedFile, error: insertError } = await supabase
      .from('application_files')
      .insert([fileRecord])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Try to clean up the uploaded file if database insert fails
      await supabase.storage.from(BUCKET_NAME).remove([uniqueFileName]);
      
      return NextResponse.json({ 
        error: 'Failed to create file record in database' 
      }, { status: 500 });
    }

    // Update the application if this is a portfolio PDF (change longform_choice)
    if (role === 'portfolio_pdf') {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ longform_choice: 'portfolio_pdf' })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Failed to update application longform_choice:', updateError);
        // Don't fail the upload for this, just log it
      }
    }

    return NextResponse.json({
      success: true,
      fileId: insertedFile.id,
      storagePath: uniqueFileName,
      publicUrl: urlData.publicUrl,
      message: 'File uploaded successfully to Supabase',
    });

  } catch (error) {
    console.error('Supabase upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during file upload' 
    }, { status: 500 });
  }
}

// Helper function to validate file types based on role
function validateFileType(file: File, role: ApplicationFile['role']): boolean {
  const allowedTypes = {
    resume: ['.pdf', '.doc', '.docx', '.zip'],
    portfolio_pdf: ['.pdf', '.zip'],
    graphical_abstract: ['.pdf', '.png', '.jpg', '.jpeg', '.zip'],
    slide_deck: ['.pdf', '.zip'],
  };

  const allowedExtensions = allowedTypes[role] || [];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  return allowedExtensions.includes(fileExtension);
}
