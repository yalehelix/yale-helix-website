const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test RLS policies for applications and application_files tables
async function testRLSPolicies() {
  console.log('🧪 Testing RLS Policies with Anon Key...\n');

  // Create client with anon key
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables:');
    console.error('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
    return;
  }

  console.log('🔑 Using anon key (not service role)');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('');

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Insert into applications table
    console.log('📝 Test 1: Insert into applications table');
    const testApplication = {
      first_name: 'RLS',
      last_name: 'Test',
      email: 'rls-test@example.com',
      class_year: 2025,
      intended_major: 'Computer Science',
      areas_of_interest: ['AI', 'Testing'],
      q1: 'Testing RLS policies',
      q2: 'Building test applications',
      q3: 'Learn about security',
      longform_choice: 'portfolio_pdf',
      longform_portfolio_desc: 'Will upload PDF portfolio'
    };

    console.log('   Inserting test application...');
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .insert([testApplication])
      .select()
      .single();

    if (appError) {
      console.error('   ❌ Failed to insert application:', appError.message);
      console.error('   Error details:', appError);
    } else {
      console.log('   ✅ Successfully inserted application');
      console.log('   Application ID:', appData.id);
      console.log('   Ref Code:', appData.ref_code);
    }

    console.log('');

    // Test 2: Select from applications table
    console.log('📖 Test 2: Select from applications table');
    const { data: selectData, error: selectError } = await supabase
      .from('applications')
      .select('id, first_name, last_name, email')
      .eq('email', 'rls-test@example.com')
      .limit(1);

    if (selectError) {
      console.error('   ❌ Failed to select application:', selectError.message);
    } else {
      console.log('   ✅ Successfully selected application');
      console.log('   Found:', selectData.length, 'records');
      if (selectData.length > 0) {
        console.log('   First record:', selectData[0]);
      }
    }

    console.log('');

    // Test 3: Insert into application_files table (if we have an application ID)
    if (appData?.id) {
      console.log('📁 Test 3: Insert into application_files table');
      const testFile = {
        application_id: appData.id,
        role: 'resume',
        storage_path: 'test/resume_test.pdf',
        original_filename: 'resume_test.pdf',
        mime_type: 'application/pdf',
        size_bytes: 1024
      };

      console.log('   Inserting test file record...');
      const { data: fileData, error: fileError } = await supabase
        .from('application_files')
        .insert([testFile])
        .select()
        .single();

      if (fileError) {
        console.error('   ❌ Failed to insert file record:', fileError.message);
        console.error('   Error details:', fileError);
      } else {
        console.log('   ✅ Successfully inserted file record');
        console.log('   File ID:', fileData.id);
      }
    } else {
      console.log('📁 Test 3: Skipped (no application ID available)');
    }

    console.log('');

    // Test 4: Update application (test update policy)
    if (appData?.id) {
      console.log('✏️  Test 4: Update application');
      const { data: updateData, error: updateError } = await supabase
        .from('applications')
        .update({ intended_major: 'Updated Computer Science' })
        .eq('id', appData.id)
        .select()
        .single();

      if (updateError) {
        console.error('   ❌ Failed to update application:', updateError.message);
      } else {
        console.log('   ✅ Successfully updated application');
        console.log('   Updated major:', updateData.intended_major);
      }
    } else {
      console.log('✏️  Test 4: Skipped (no application ID available)');
    }

    console.log('');

    // Test 5: Check current user context
    console.log('👤 Test 5: Check current user context');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('   ℹ️  User context error (expected for anon):', userError.message);
    } else if (user) {
      console.log('   ℹ️  Authenticated user:', user.email);
    } else {
      console.log('   ✅ Anonymous user (expected)');
    }

    console.log('');

    // Summary
    console.log('🎯 RLS Policy Test Summary:');
    console.log('   - If all tests passed: RLS policies are working correctly');
    console.log('   - If any test failed: Check the specific error messages above');
    console.log('   - Make sure you\'re using the anon key, not service role key');
    console.log('   - Verify RLS policies are properly configured in Supabase dashboard');

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error);
  }
}

// Run the test
testRLSPolicies().catch(console.error);