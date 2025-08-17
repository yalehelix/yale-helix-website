#!/usr/bin/env node

/**
 * Test script to verify Supabase connection and setup
 * Run with: node scripts/test-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log('🧪 Testing Supabase connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    console.error('\nPlease create a .env.local file with these variables.');
    process.exit(1);
  }

  console.log('✅ Environment variables found');

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created with service role key');

    // Test database connection
    console.log('\n🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('applications')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      if (testError.message.includes('relation "applications" does not exist')) {
        console.error('   Make sure you have run the SQL setup commands to create the tables.');
      }
    } else {
      console.log('✅ Database connection successful');
    }

    // Test storage connection
    console.log('\n📁 Testing storage connection...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Storage connection failed:', bucketsError.message);
    } else {
      console.log('✅ Storage connection successful');
      console.log('   Total buckets found:', buckets.length);
      
      if (buckets.length > 0) {
        console.log('   Available buckets:');
        buckets.forEach(bucket => {
          console.log(`     - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
      } else {
        console.log('   No buckets found');
      }
      
      // Check if student-files bucket exists
      const studentFilesBucket = buckets.find(bucket => bucket.name === 'student-files');
      if (studentFilesBucket) {
        console.log('\n✅ student-files bucket found');
        console.log(`   Bucket details: ${studentFilesBucket.name} (${studentFilesBucket.public ? 'public' : 'private'})`);
      } else {
        console.log('\n⚠️  student-files bucket not found');
        console.log('   Please check:');
        console.log('   1. Bucket name is exactly "student-files" (lowercase, with hyphen)');
        console.log('   2. Bucket is created in the correct Supabase project');
        console.log('   3. You have proper permissions to view buckets');
      }
    }

    // Test file upload using the actual PDF file
    console.log('\n📤 Testing file upload with real PDF...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Check if the test PDF file exists
    const testPdfPath = path.join(__dirname, '..', '3-mb-sample-pdf-file.pdf');
    
    if (!fs.existsSync(testPdfPath)) {
      console.error('❌ Test PDF file not found at:', testPdfPath);
      console.error('   Please ensure 3-mb-sample-pdf-file.pdf is in the project root directory');
      return;
    }
    
    // Read the actual PDF file
    const testPdfBuffer = fs.readFileSync(testPdfPath);
    const testFileName = `test-${Date.now()}.pdf`;
    
    console.log(`   Using real PDF file: 3-mb-sample-pdf-file.pdf`);
    console.log(`   File size: ${(testPdfBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Uploading as: ${testFileName}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student-files')
      .upload(`test/${testFileName}`, testPdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ File upload test failed:', uploadError.message);
      if (uploadError.message.includes('bucket not found')) {
        console.error('   Make sure the student-files bucket exists and is properly configured.');
      } else if (uploadError.message.includes('row-level security policy')) {
        console.error('   RLS policy issue - check storage policies for the student-files bucket.');
      } else if (uploadError.message.includes('permission')) {
        console.error('   Permission issue - check if the API key has storage upload permissions.');
      } else if (uploadError.message.includes('file size')) {
        console.error('   File size issue - check if the bucket allows files this large.');
      }
    } else {
      console.log('✅ File upload test successful');
      console.log(`   Uploaded file path: ${uploadData.path}`);
      console.log(`   File ID: ${uploadData.id}`);
      
      // List files in the test directory to verify upload
      console.log('\n🔍 Verifying file upload...');
      const { data: files, error: listError } = await supabase.storage
        .from('student-files')
        .list('test');
      
      if (listError) {
        console.error('❌ Failed to list files:', listError.message);
      } else {
        console.log(`   Files in test directory: ${files.length}`);
        files.forEach(file => {
          const sizeMB = file.metadata?.size ? (file.metadata.size / (1024 * 1024)).toFixed(2) : 'unknown';
          console.log(`     - ${file.name} (${sizeMB} MB)`);
        });
      }
      
      // Clean up test file
      console.log('\n🧹 Cleaning up test file...');
      const { error: removeError } = await supabase.storage
        .from('student-files')
        .remove([`test/${testFileName}`]);
      
      if (removeError) {
        console.error('❌ Failed to clean up test file:', removeError.message);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    console.log('\n🎉 Supabase setup test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Ensure your database tables are created with the SQL commands');
    console.log('2. Set up RLS policies for security');
    console.log('3. Test the application form submission');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the test
testSupabase().catch(console.error);
