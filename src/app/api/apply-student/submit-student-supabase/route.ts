import { NextRequest, NextResponse } from "next/server";
import { supabase, StudentApplication } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const data = await request.json();

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "classYear", "intendedMajor", "areasOfInterest"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Map the form data to the Supabase schema
    const applicationData: StudentApplication = {
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      class_year: parseInt(data.classYear),
      intended_major: data.intendedMajor.trim(),
      linkedin_url: data.linkedin?.trim() || null,
      areas_of_interest: data.areasOfInterest || [],
      q1: data.whyHelix?.trim() || "",
      q2: data.building?.trim() || "",
      q3: data.goals?.trim() || "",
      longform_choice: mapLongFormChoice(data.longFormOption, data.submissionMethod),
      longform_portfolio_link: data.longFormOption === "option1" && data.submissionMethod === "link" ? data.longForm?.trim() : null,
      longform_portfolio_desc: data.longFormDescription?.trim() || null,
      longform_graphical_caption: data.longFormOption === "option2" ? data.longFormDescription?.trim() : null,
      longform_video_url: data.longFormOption === "option3" ? data.longFormFile?.trim() : null,
    };

    // Validate longform choice consistency
    if (!validateLongFormConsistency(applicationData)) {
      return NextResponse.json({ 
        error: "Long form submission is incomplete. Please fill in all required fields for your selected option." 
      }, { status: 400 });
    }

    // Insert the application into Supabase
    const { data: insertedApplication, error: insertError } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ 
        error: "Failed to submit application to database" 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      applicationId: insertedApplication.id,
      refCode: insertedApplication.ref_code,
      message: "Application submitted successfully to Supabase",
    });

  } catch (error) {
    console.error('Supabase submission error:', error);
    return NextResponse.json({ 
      error: "Internal server error during Supabase submission" 
    }, { status: 500 });
  }
}

// Helper function to map the frontend long form option to the database enum
function mapLongFormChoice(option: string, submissionMethod?: string): StudentApplication['longform_choice'] {
  switch (option) {
    case 'option1':
      // Check if it's file upload or link
      return submissionMethod === 'file' ? 'portfolio_pdf' : 'portfolio_link';
    case 'option2':
      return 'graphical_abstract';
    case 'option3':
      return 'slide_deck';
    default:
      throw new Error(`Invalid long form option: ${option}`);
  }
}

// Helper function to validate long form consistency
function validateLongFormConsistency(application: StudentApplication): boolean {
  switch (application.longform_choice) {
    case 'portfolio_link':
      return !!(application.longform_portfolio_link && application.longform_portfolio_desc);
    case 'portfolio_pdf':
      return !!application.longform_portfolio_desc; // File will be uploaded separately
    case 'graphical_abstract':
      return !!application.longform_graphical_caption; // File will be uploaded separately
    case 'slide_deck':
      return !!application.longform_video_url; // File will be uploaded separately
    default:
      return false;
  }
}
